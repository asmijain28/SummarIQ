const OpenAI = require('openai');
const fetch = require('node-fetch');
const crypto = require('crypto');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const groq = process.env.GROQ_API_KEY ? new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
}) : null;

const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';
const COMFYUI_URL = process.env.COMFYUI_URL || '';
const PIXAZO_API_URL = process.env.PIXAZO_API_URL || '';
const PIXAZO_STATUS_URL = process.env.PIXAZO_STATUS_URL || '';
const PIXAZO_API_KEY = process.env.PIXAZO_API_KEY || '';
const PIXAZO_MODEL = process.env.PIXAZO_MODEL || 'flux-schnell';
const POLLINATIONS_FIRST = String(process.env.POLLINATIONS_FIRST || 'false').toLowerCase() === 'true';
const POLLINATIONS_MODEL = process.env.POLLINATIONS_MODEL || 'flux';

const GEMINI_API_KEYS = process.env.GEMINI_API_KEY 
  ? process.env.GEMINI_API_KEY.split(',').map(key => key.trim())
  : [];

let currentKeyIndex = 0;
let __geminiImagenBlockedUntil = 0;

function getNextGeminiKey() {
  if (GEMINI_API_KEYS.length === 0) {
    throw new Error('No Gemini API keys configured');
  }
  const key = GEMINI_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  return key;
}

// Simple in-memory cache to avoid re-generating visuals for same notes
// (helps a lot with free-tier rate limits).
const __cache = new Map();
function cacheGet(key) {
  const v = __cache.get(key);
  if (!v) return null;
  if (v.expiresAt && Date.now() > v.expiresAt) {
    __cache.delete(key);
    return null;
  }
  return v.value;
}
function cacheSet(key, value, ttlMs = 30 * 60 * 1000) {
  __cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}
function hashText(text) {
  return crypto.createHash('sha256').update(String(text || '')).digest('hex');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(err) {
  const message = String(err?.message || '');
  const status = err?.status || err?.statusCode;
  return status === 429 || /rate limit|too many requests|429/i.test(message);
}

function isHardLimitError(err) {
  const message = String(err?.message || '');
  // Groq/OpenAI SDKs don't always expose status codes consistently.
  // Detect by message content.
  return /billing hard limit|hard limit|insufficient[_\s-]?quota|quota exceeded|payment required/i.test(message);
}

function isImagenPaidPlanError(message) {
  return /imagen\s*\d+.*only available on paid plans|only available on paid plans/i.test(String(message || ''));
}

function looksLikeUrl(s) {
  return typeof s === 'string' && /^https?:\/\//i.test(s);
}

function parseImageUrlFromProviderResponse(json = {}) {
  if (typeof json?.imageUrl === 'string') return json.imageUrl;
  if (typeof json?.url === 'string') return json.url;
  if (typeof json?.image_url === 'string') return json.image_url;
  if (typeof json?.output === 'string') return json.output;
  if (typeof json?.data?.imageUrl === 'string') return json.data.imageUrl;
  if (typeof json?.data?.url === 'string') return json.data.url;
  if (typeof json?.data?.[0]?.url === 'string') return json.data[0].url;
  if (typeof json?.result?.url === 'string') return json.result.url;

  // Sometimes APIs return raw base64 without data URL prefix.
  const b64 =
    json?.image_base64 ||
    json?.b64 ||
    json?.data?.b64 ||
    json?.result?.b64 ||
    json?.result?.base64;
  if (typeof b64 === 'string' && b64.length > 100) {
    return `data:image/png;base64,${b64}`;
  }

  return null;
}

function buildPollinationsUrl(prompt, { width = 1024, height = 1024, seed } = {}) {
  // Keep prompt compact for URL reliability.
  const compact = String(prompt || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 320);
  const encoded = encodeURIComponent(compact || 'simple educational infographic');
  const finalSeed = typeof seed === 'number' ? seed : Math.floor(Math.random() * 1_000_000);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${finalSeed}&nologo=true&model=${encodeURIComponent(POLLINATIONS_MODEL)}`;
}

async function generateSlideImageWithPixazo(prompt, { width = 1024, height = 1024 } = {}) {
  if (!looksLikeUrl(PIXAZO_API_URL)) return null;

  const headers = { 'Content-Type': 'application/json' };
  if (PIXAZO_API_KEY) {
    // Pixazo API gateway commonly expects subscription key header.
    headers['Ocp-Apim-Subscription-Key'] = PIXAZO_API_KEY;
    headers.Authorization = `Bearer ${PIXAZO_API_KEY}`;
  }

  const body = { prompt, model: PIXAZO_MODEL, width, height, num_images: 1 };

  const response = await withRetries(
    async () =>
      fetch(PIXAZO_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }),
    { retries: 2, baseDelayMs: 700 }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Pixazo error (${response.status}): ${errText.substring(0, 220)}`);
  }

  const json = await response.json();
  const immediateImageUrl = parseImageUrlFromProviderResponse(json);
  if (immediateImageUrl) return immediateImageUrl;

  const requestId = json?.request_id || json?.requestId || json?.id;
  if (!requestId) {
    throw new Error('Pixazo response did not include image URL or request_id');
  }

  if (!looksLikeUrl(PIXAZO_STATUS_URL)) {
    throw new Error('Pixazo request is async but PIXAZO_STATUS_URL is not configured');
  }

  const statusBody = { request_id: requestId };
  const startedAt = Date.now();
  while (Date.now() - startedAt < 90000) {
    await sleep(1700);
    const statusResp = await fetch(PIXAZO_STATUS_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(statusBody),
    });
    if (!statusResp.ok) continue;
    const statusJson = await statusResp.json();
    const statusImageUrl = parseImageUrlFromProviderResponse(statusJson);
    if (statusImageUrl) return statusImageUrl;

    const s = String(
      statusJson?.status ||
      statusJson?.state ||
      statusJson?.result?.status ||
      ''
    ).toLowerCase();
    if (/failed|error|cancelled/.test(s)) {
      throw new Error(`Pixazo request failed with status: ${s}`);
    }
  }

  throw new Error('Pixazo request timed out while polling result');
}

async function withRetries(fn, { retries = 3, baseDelayMs = 800 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRateLimitError(err) || attempt === retries) throw err;
      const jitter = Math.floor(Math.random() * 250);
      const delay = baseDelayMs * Math.pow(2, attempt) + jitter;
      console.warn(`⚠️ Rate limited. Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  throw lastErr;
}

function pickIcon(title = '') {
  const t = title.toLowerCase();
  if (/(coffee|cook|recipe|kitchen|boil|brew)/.test(t)) return '☕';
  if (/(vision|image|camera|photo)/.test(t)) return '👁️';
  if (/(security|privacy|attack)/.test(t)) return '🛡️';
  if (/(health|medical|disease)/.test(t)) return '🩺';
  if (/(math|equation|formula)/.test(t)) return '🧮';
  if (/(history|timeline|year|era)/.test(t)) return '🗓️';
  if (/(important|key|benefit)/.test(t)) return '⭐';
  if (/(challenge|problem|limitation|risk)/.test(t)) return '⚠️';
  if (/(future|next|direction|trend)/.test(t)) return '🔮';
  if (/(example|case|application|use)/.test(t)) return '🧩';
  return '📌';
}

function buildVisualPromptFromStep({ title = '', explanation = '', topic = '' } = {}) {
  const t = `${title} ${explanation} ${topic}`.toLowerCase();

  if (/(computer vision|vision|object detection|image processing|opencv|cnn|convolution|segmentation)/i.test(t)) {
    return [
      'computer vision concept',
      'camera scanning an image',
      'bounding boxes on objects',
      'simple neural network nodes',
      'clean flat vector illustration',
      'minimal infographic style',
      'white background',
      'single scene',
    ].join(', ');
  }

  if (/(coffee|brew|boil|kettle|cup|beans|filter)/i.test(t)) {
    return [
      'making coffee step illustration',
      'kettle, cup, spoon, coffee powder',
      'simple arrows showing the step',
      'clean flat vector illustration',
      'minimal infographic style',
      'white background',
      'single scene',
    ].join(', ');
  }

  // Generic fallback: keep it single-scene and not a collage.
  return [
    'simple flat vector illustration',
    `concept: ${title || topic || 'study topic'}`,
    explanation ? `hint: ${explanation}` : null,
    'minimal infographic style',
    'white background',
    'single scene',
    'large main icon + 2-3 small supporting icons',
  ].filter(Boolean).join(', ');
}

function buildFallbackFlowFromNotes(notes, options = {}) {
  const raw = String(notes || '');
  const topic = options.topic || 'Visual Mode';

  // Split by markdown headings; if none, split by blank lines.
  const sections = raw
    .split(/\n(?=##\s+)/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks = sections.length
    ? sections
    : raw.split(/\n{2,}/g).map((s) => s.trim()).filter((s) => s.length > 40);

  const selected = chunks.slice(0, 6);

  const steps = selected.map((chunk, idx) => {
    const headingMatch = chunk.match(/^##\s+(.+)$/m);
    const title = headingMatch?.[1]?.trim() || `Step ${idx + 1}`;
    const firstLines = chunk
      .replace(/^##\s+.*$/m, '')
      .split('\n')
      .map((l) => l.replace(/^[-*]\s+/, '').trim())
      .filter(Boolean)
      .slice(0, 2);
    const explanation = (firstLines.join(' • ') || 'Key idea from your notes.').slice(0, 220);

    // Simple visual: pictogram for concepts, mermaid for process-ish headings.
    const processy = /(step|process|how to|workflow|method|procedure)/i.test(title);
    const icon = pickIcon(title);
    const visual = processy
      ? {
          type: 'mermaid',
          content: `graph LR\nA[${title.replace(/[\[\]]/g, '')}] --> B[Key point] --> C[Result]`,
        }
      : {
          type: 'pictogram',
          content: `${icon} ${title} → 💡 Learn → ✅ Recall`,
        };

    return {
      id: `step-${idx + 1}`,
      title,
      explanation,
      icon,
      visual,
      uiBlock: {
        type: 'checklist',
        content: `□ read □ understand □ try an example`,
      },
      prev: idx === 0 ? null : `step-${idx}`,
      next: idx === selected.length - 1 ? null : `step-${idx + 2}`,
      choices: [],
    };
  });

  return {
    title: topic,
    description: 'Generated from your notes (fallback mode: no AI).',
    steps: steps.length
      ? steps
      : [
          {
            id: 'step-1',
            title: 'Overview',
            explanation: 'Could not split notes into sections, but you can still remix after enabling an AI provider.',
            icon: '📚',
            visual: { type: 'pictogram', content: '📚 Notes → 🧩 Steps → 🧠 Understand → ✅ Recall' },
            uiBlock: { type: 'tag', content: 'fallback-mode' },
            prev: null,
            next: null,
            choices: [],
          },
        ],
  };
}

async function generate(prompt, options = {}) {
  const tryGroq = async () => {
    if (!groq) throw new Error('Groq API key not configured');
    return await withRetries(async () => {
      const response = await groq.chat.completions.create({
        model: options.model || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: options.systemPrompt || 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000
      });
      return response.choices[0].message.content;
    }, { retries: 4, baseDelayMs: 900 });
  };

  const tryGemini = async () => {
    const GEMINI_API_KEY = getNextGeminiKey();
    const systemPrompt = options.systemPrompt || 'You are a helpful assistant.';
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;
    
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await withRetries(
      async () =>
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: fullPrompt
              }]
            }]
          })
        }),
      { retries: 4, baseDelayMs: 900 }
    );
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  const tryOpenAI = async () => {
    if (!openai) throw new Error('OpenAI API key not configured');
    return await withRetries(async () => {
      const response = await openai.chat.completions.create({
        model: options.model || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: options.systemPrompt || 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000
      });
      return response.choices[0].message.content;
    }, { retries: 4, baseDelayMs: 900 });
  };

  // Try preferred provider first, then automatically fallback to other available providers.
  const ordered = AI_PROVIDER === 'groq'
    ? [
        { name: 'groq', fn: tryGroq },
        { name: 'gemini', fn: tryGemini },
        { name: 'openai', fn: tryOpenAI },
      ]
    : AI_PROVIDER === 'gemini'
      ? [
          { name: 'gemini', fn: tryGemini },
          { name: 'groq', fn: tryGroq },
          { name: 'openai', fn: tryOpenAI },
        ]
      : [
          { name: 'openai', fn: tryOpenAI },
          { name: 'gemini', fn: tryGemini },
          { name: 'groq', fn: tryGroq },
        ];

  let lastError;
  for (const provider of ordered) {
    try {
      return await provider.fn();
    } catch (err) {
      lastError = err;
      console.warn(
        `Text generation via ${provider.name} failed:`,
        String(err?.message || err)
      );
    }
  }

  throw lastError || new Error('All AI providers failed for text generation');
}

async function generateNotes(text, length = 'detailed') {
  const instructions = {
    short: 'Create concise notes (500 words).',
    medium: 'Create comprehensive notes (1500 words).',
    detailed: 'Create detailed notes (3000+ words).'
  };
  
  const prompt = `Create study notes from this document. ${instructions[length]}

Use headings (##), bullet points, and **bold** for key terms.

Document:
${text}

Generate notes:`;
  
  return await generate(prompt, { temperature: 0.5, systemPrompt: 'You are an expert note-taker.' });
}

async function extractKeywords(text) {
  const prompt = `Extract 15-25 important keywords from this document.

Return JSON:
{
  "keywords": ["term1", "term2"],
  "definitions": {"term1": "definition"}
}

Document:
${text.substring(0, 8000)}

Return ONLY JSON:`;
  
  const response = await generate(prompt, { temperature: 0.3 });
  try {
    const clean = response.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return { keywords: [], definitions: {} };
  }
}

async function generateFlashcards(text, count = 20) {
  const prompt = `Create ${count} flashcards.

Return JSON array:
[{"front": "Question", "back": "Answer", "explanation": "..."}]

Document:
${text.substring(0, 10000)}

Return ONLY JSON:`;
  
  const response = await generate(prompt, { temperature: 0.6 });
  try {
    const clean = response.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return [];
  }
}

async function generateQuiz(text, count = 10) {
  const prompt = `Create ${count} multiple choice questions.

Return JSON array where correctAnswer is the INDEX (0, 1, 2, or 3) of the correct option:
[{"question": "...", "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "correctAnswer": 0, "explanation": "..."}]

IMPORTANT: correctAnswer must be a NUMBER (0-3), not a letter!

Document:
${text.substring(0, 10000)}

Return ONLY JSON:`;
  
  const response = await generate(prompt, { temperature: 0.5 });
  try {
    const clean = response.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    
    return parsed.map(q => ({
      ...q,
      correctAnswer: typeof q.correctAnswer === 'string' 
        ? ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer.toUpperCase())
        : q.correctAnswer
    }));
  } catch {
    return [];
  }
}

async function generateExamQuestions(text, count = 10) {
  const prompt = `Create EXACTLY ${count} exam questions with a mix of types.

IMPORTANT RULES:
- Generate EXACTLY ${count} questions total
- Short questions: 1-2 sentence answers, factual/definition-based (e.g., "What is X?", "Define Y")
- Long questions: 4-6 sentence answers, require explanation/analysis (e.g., "Explain how...", "Describe the process...")
- Conceptual questions: 3-4 sentence answers, test understanding of concepts (e.g., "Why does...", "Compare and contrast...")
- Mix the types evenly: aim for equal numbers of each type
- Each question must have a complete answer

Return JSON array (type MUST be exactly "Short", "Long", or "Conceptual"):
[{"question": "...", "type": "Short" or "Long" or "Conceptual", "marks": 5 or 10, "answer": "..."}]

Document:
${text.substring(0, 10000)}

Return ONLY JSON array with ${count} questions:`;
  
  const response = await generate(prompt, { temperature: 0.6, maxTokens: 6000 });
  try {
    const clean = response.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return [];
  }
}

async function answerQuestion(question, context) {
  const prompt = `You are a helpful study assistant. Answer the question based on the provided context from the document.

RULES:
- Use the context to answer the question
- If the exact answer isn't in the context but related information is present, provide a helpful answer based on that information
- Be conversational and helpful
- Only say "I cannot find this information in the document" if the context has absolutely no relevant information
- Keep answers concise but complete (2-4 sentences)

Context from document:
${context}

Question: ${question}

Answer:`;
  
  return await generate(prompt, { temperature: 0.3, maxTokens: 1000 });
}

async function generateVisualExplanations(text) {
  const prompt = `Analyze this document and create 3-5 different visual explanations to help students understand the content better.

For each visual, choose the BEST type:
- "flowchart": For processes, algorithms, step-by-step procedures
- "timeline": For historical events, project phases, chronological information  
- "process": For instructions, how-to guides, recipes
- "comparison": For vs/versus topics, pros/cons, differences
- "mindmap": For concepts with many interconnections

Return ONLY valid JSON array:
[
  {
    "id": "visual-1",
    "type": "process",
    "title": "How to Make Coffee",
    "description": "Step-by-step visual guide",
    "steps": [
      {
        "number": 1,
        "title": "Boil Water",
        "description": "Heat water to 195-205°F",
        "icon": "💧"
      },
      {
        "number": 2,
        "title": "Grind Beans",
        "description": "Use medium-coarse grind",
        "icon": "☕"
      }
    ]
  },
  {
    "id": "visual-2",
    "type": "flowchart",
    "title": "Decision Process",
    "description": "Flow of the brewing method",
    "diagram": "graph TD\\nA[Start] --> B{Hot or Cold?}\\nB -->|Hot| C[Espresso]\\nB -->|Cold| D[Cold Brew]\\nC --> E[Enjoy]\\nD --> E"
  },
  {
    "id": "visual-3",
    "type": "comparison",
    "title": "Espresso vs Drip Coffee",
    "description": "Key differences",
    "comparison": {
      "left": {
        "title": "Espresso",
        "points": ["High pressure", "Concentrated", "1-2 oz serving"]
      },
      "right": {
        "title": "Drip Coffee",
        "points": ["Gravity brewing", "Milder taste", "8-12 oz serving"]
      }
    }
  }
]

IMPORTANT Rules:
1. Use emojis for step icons (☕ 📚 💡 ⚡ 🎯 🔬 etc.)
2. For flowcharts, use Mermaid syntax (graph TD, graph LR, sequenceDiagram, etc.)
3. Keep steps to 3-6 items max
4. Make titles catchy and clear
5. Descriptions should be concise (under 100 characters)

Document:
${text.substring(0, 12000)}

Return ONLY the JSON array, no markdown formatting:`;
  
  const response = await generate(prompt, { temperature: 0.7 });
  
  try {
    const clean = response.replace(/```json|```/g, '').trim();
    const visuals = JSON.parse(clean);
    
    if (!Array.isArray(visuals) || visuals.length === 0) {
      return [{
        id: 'visual-1',
        type: 'process',
        title: 'Key Concepts',
        description: 'Main ideas from the document',
        steps: [
          {
            number: 1,
            title: 'Read the document',
            description: 'Review all content carefully',
            icon: '📖'
          },
          {
            number: 2,
            title: 'Identify main topics',
            description: 'Find the core concepts',
            icon: '🎯'
          },
          {
            number: 3,
            title: 'Create connections',
            description: 'Link related ideas together',
            icon: '🔗'
          }
        ]
      }];
    }
    
    return visuals;
  } catch (error) {
    console.error('Failed to parse visual explanations:', error);
    return [{
      id: 'visual-1',
      type: 'process',
      title: 'Document Overview',
      description: 'Key points from your document',
      steps: [
        {
          number: 1,
          title: 'Main Topic',
          description: 'Primary subject matter',
          icon: '📚'
        },
        {
          number: 2,
          title: 'Supporting Details',
          description: 'Additional context and examples',
          icon: '💡'
        },
        {
          number: 3,
          title: 'Conclusion',
          description: 'Key takeaways',
          icon: '✅'
        }
      ]
    }];
  }
}

async function generateVisualLearningFlowFromNotes(notes, options = {}) {
  const topicHint = options.topic ? `Topic: ${options.topic}\n\n` : '';
  const notesStr = String(notes || '');
  const cacheKey = `visualFlow:${AI_PROVIDER}:${hashText(topicHint + notesStr)}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const prompt = `${topicHint}Convert the following study notes into an interactive, step-by-step "Visual Learning Mode" flow.

You must break the content into logical stages a student can click through sequentially.

Return ONLY valid JSON in this exact schema:
{
  "title": "string",
  "description": "string",
  "steps": [
    {
      "id": "step-1",
      "title": "string",
      "explanation": "string",
      "icon": "emoji",
      "visual": { "type": "mermaid" | "pictogram", "content": "string" },
      "uiBlock": { "type": "tag" | "diagram" | "checklist" | "choice", "content": "string" },
      "next": "step-2" | null,
      "prev": null | "step-0",
      "choices": [
        { "label": "string", "next": "step-x" }
      ]
    }
  ]
}

Rules:
- Steps must be 4-7 (prefer 5-6).
- Keep each explanation under 240 characters (Gen-Z friendly).
- Use emojis for icons (☕ 📌 💡 🧠 ✅ ⚡ 🧪 etc.).
- Each step MUST include a real visual:
  - If the content is a process/sequence, set visual.type="mermaid" and provide a small Mermaid diagram that looks like a picture.
    Use "graph LR" or "graph TD" with 4-8 nodes max. Example:
    graph LR
    A[Boil water] --> B[Add coffee]
    B --> C{Milk?}
    C -->|Yes| D[Add milk]
    C -->|No| E[Skip]
    D --> F[Enjoy]
    E --> F[Enjoy]
  - If it is conceptual, set visual.type="pictogram" and provide a compact pictogram string using arrows, brackets, and emojis.
    Example: "🧠 Input → 🧩 Features → 🤖 Model → ✅ Output"
- If there are options/branches in the notes, include them as "choices" on that step; otherwise "choices" must be [].
- Ensure every step has stable ids (step-1, step-2, ...), and correct next/prev pointers.
- "uiBlock.content" should be a short micro-visual like: "Kettle → steam → timer 3–5 min" or a mini checklist like "□ measure □ pour □ stir".

Notes:
${notesStr.substring(0, 6500)}

Return ONLY JSON (no markdown, no commentary).`;

  let response;
  try {
    response = await generate(prompt, {
      // Use a cheaper/smaller model on Groq to reduce rate-limit pressure.
      model: AI_PROVIDER === 'groq' ? 'llama-3.1-8b-instant' : undefined,
      temperature: 0.5,
      systemPrompt: 'You are a product designer who converts notes into interactive learning flows.',
      maxTokens: 1800,
    });
  } catch (error) {
    // Groq hard billing limits block all calls; fall back to deterministic parsing.
    if (isHardLimitError(error)) {
      const fallback = buildFallbackFlowFromNotes(notesStr, options);
      cacheSet(cacheKey, fallback);
      return fallback;
    }
    throw error;
  }

  try {
    const clean = response.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    if (!parsed || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
      throw new Error('Invalid Visual Learning Mode JSON');
    }

    cacheSet(cacheKey, parsed);
    return parsed;
  } catch (error) {
    console.error('Failed to parse Visual Learning Mode flow:', error);
    return {
      title: options.topic || 'Visual Learning Mode',
      description: 'A step-by-step learning flow generated from your notes.',
      steps: [
        {
          id: 'step-1',
          title: 'Overview',
          explanation: 'We could not structure a full flow, so here is a simple learning path to start.',
          icon: '📚',
          visual: { type: 'pictogram', content: '📚 Notes → 🧩 Steps → 🧠 Understand → ✅ Recall' },
          uiBlock: { type: 'checklist', content: '□ skim headings □ find key steps □ practice once' },
          prev: null,
          next: 'step-2',
          choices: [],
        },
        {
          id: 'step-2',
          title: 'Key Steps',
          explanation: 'Turn the main points into a sequence: action → reason → result.',
          icon: '🧠',
          visual: { type: 'mermaid', content: 'graph LR\nA[Action] --> B[Why]\nB --> C[Outcome]' },
          uiBlock: { type: 'diagram', content: 'Action → Why → Outcome' },
          prev: 'step-1',
          next: 'step-3',
          choices: [],
        },
        {
          id: 'step-3',
          title: 'Quick Check',
          explanation: 'Try explaining it back in 30 seconds. If you can, you learned it.',
          icon: '✅',
          visual: { type: 'pictogram', content: '⏱️ 30s → 🗣️ Explain → 🧠 Recall → ✅ Learned' },
          uiBlock: { type: 'tag', content: '30-sec explain-back' },
          prev: 'step-2',
          next: null,
          choices: [],
        },
      ],
    };
  }
}

async function generateSlideImage(prompt, options = {}) {
  // Prefer a clean, student-friendly infographic style.
  const fullPrompt = `Clean flat vector infographic slide for students.
No logos. No watermarks. Minimal text. High contrast. Simple shapes. Light background.
${prompt}`.trim();

  // Optional: use Pollinations as primary free provider.
  if (POLLINATIONS_FIRST) {
    const width = options.width || 1024;
    const height = options.height || 1024;
    return buildPollinationsUrl(fullPrompt, { width, height, seed: options.seed });
  }

  // Prefer local ComfyUI (free) if configured.
  if (looksLikeUrl(COMFYUI_URL)) {
    try {
      const img = await generateSlideImageWithComfyUI(fullPrompt, {
        baseUrl: COMFYUI_URL,
        width: options.width || 768,
        height: options.height || 768,
        steps: options.steps || 20,
      });
      if (img) return img;
    } catch (e) {
      console.warn('ComfyUI image generation failed, falling back.', String(e?.message || e));
    }
  }

  // Prefer Gemini Imagen (free tier) if available.
  if (GEMINI_API_KEYS.length > 0 && Date.now() > __geminiImagenBlockedUntil) {
    const GEMINI_API_KEY = getNextGeminiKey();
    const width = options.width || 1024;
    const height = options.height || 1024;

    // Imagen REST (Google AI Studio / Gemini API)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict`;
    const body = {
      instances: [{ prompt: fullPrompt }],
      parameters: {
        sampleCount: 1,
        // Note: This Imagen endpoint may reject unknown fields like seed.
        // Some Imagen endpoints accept outputOptions; keep minimal for compatibility.
      },
    };

    const resp = await withRetries(
      async () =>
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY,
          },
          body: JSON.stringify(body),
        }),
      { retries: 3, baseDelayMs: 900 }
    );

    if (resp.ok) {
      const json = await resp.json();
      const pred = json?.predictions?.[0];
      const b64 = pred?.bytesBase64Encoded;
      const mime = pred?.mimeType || 'image/png';
      if (b64) return `data:${mime};base64,${b64}`;
    } else {
      const errText = await resp.text();
      // If Imagen is paid-only for this key, avoid retry spam for a while.
      if (isImagenPaidPlanError(errText)) {
        __geminiImagenBlockedUntil = Date.now() + 60 * 60 * 1000; // 1 hour
        console.warn('Imagen appears to require a paid plan for this key. Falling back to other providers.');
      } else {
        console.warn(`Imagen error (${resp.status}): ${errText.substring(0, 200)}`);
      }
    }
  }

  // Try Pixazo when configured (free-tier friendly provider).
  if (looksLikeUrl(PIXAZO_API_URL)) {
    try {
      const pixazoImage = await generateSlideImageWithPixazo(fullPrompt, {
        width: options.width || 1024,
        height: options.height || 1024,
      });
      if (pixazoImage) return pixazoImage;
    } catch (e) {
      console.warn('Pixazo image generation failed, falling back.', String(e?.message || e));
    }
  }

  // If OpenAI key exists, use it. Otherwise fall back to a free no-key image endpoint.
  if (openai) {
    // OpenAI image models may differ across accounts/versions; try gpt-image-1 first.
    try {
      const result = await openai.images.generate({
        model: options.model || 'gpt-image-1',
        prompt: fullPrompt,
        size: options.size || '1024x1024',
      });

      const b64 = result?.data?.[0]?.b64_json;
      if (!b64) throw new Error('Image generation returned no b64_json');
      return `data:image/png;base64,${b64}`;
    } catch (error) {
      // If the key exists but the account is out of credits / hard-limited,
      // fall back to the free endpoint instead of failing Visual Mode entirely.
      if (isHardLimitError(error) || isRateLimitError(error)) {
        const width = options.width || 1024;
        const height = options.height || 1024;
        return buildPollinationsUrl(fullPrompt, { width, height, seed: options.seed });
      }

      // Fallback attempt for older model naming in some environments
      try {
        const result = await openai.images.generate({
          model: options.modelFallback || 'dall-e-3',
          prompt: fullPrompt,
          size: options.size || '1024x1024',
        });

        const b64 = result?.data?.[0]?.b64_json;
        const url = result?.data?.[0]?.url;
        if (b64) return `data:image/png;base64,${b64}`;
        if (url) return url;
      } catch (error2) {
        if (isHardLimitError(error2) || isRateLimitError(error2)) {
          const width = options.width || 1024;
          const height = options.height || 1024;
          return buildPollinationsUrl(fullPrompt, { width, height, seed: options.seed });
        }
        throw error2;
      }
      throw error;
    }
  }

  // Free fallback (no API key): Pollinations image endpoint.
  // Note: This returns a public URL; generation speed/availability depends on the service.
  const width = options.width || 1024;
  const height = options.height || 1024;
  return buildPollinationsUrl(fullPrompt, { width, height, seed: options.seed });
}

async function generateSlideImageWithComfyUI(prompt, { baseUrl, width = 768, height = 768, steps = 20 } = {}) {
  const root = String(baseUrl || '').replace(/\/$/, '');

  // Minimal txt2img workflow. Requires this checkpoint file in ComfyUI:
  // ComfyUI/models/checkpoints/v1-5-pruned-emaonly.safetensors
  // If you use a different model filename, update ckpt_name below.
  const workflow = {
    "3": {
      "class_type": "KSampler",
      "inputs": {
        "cfg": 7,
        "denoise": 1,
        "latent_image": ["5", 0],
        "model": ["4", 0],
        "negative": ["7", 0],
        "positive": ["6", 0],
        "sampler_name": "euler",
        "scheduler": "normal",
        "seed": Math.floor(Math.random() * 1_000_000),
        "steps": steps
      }
    },
    "4": { "class_type": "CheckpointLoaderSimple", "inputs": { "ckpt_name": "v1-5-pruned-emaonly.safetensors" } },
    "5": { "class_type": "EmptyLatentImage", "inputs": { "batch_size": 1, "height": height, "width": width } },
    "6": { "class_type": "CLIPTextEncode", "inputs": { "clip": ["4", 1], "text": prompt } },
    "7": {
      "class_type": "CLIPTextEncode",
      "inputs": {
        "clip": ["4", 1],
        "text": "blurry, low quality, watermark, logo, heavy text, collage, pattern, wallpaper, repeating icons, dense grid, many small icons, cluttered"
      }
    },
    "8": { "class_type": "VAEDecode", "inputs": { "samples": ["3", 0], "vae": ["4", 2] } },
    "9": { "class_type": "SaveImage", "inputs": { "filename_prefix": "summariq_visual_mode", "images": ["8", 0] } }
  };

  const enqueueResp = await fetch(`${root}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow }),
  });

  if (!enqueueResp.ok) {
    const t = await enqueueResp.text();
    throw new Error(`ComfyUI enqueue failed (${enqueueResp.status}): ${t}`);
  }

  const enqueueJson = await enqueueResp.json();
  const promptId = enqueueJson?.prompt_id;
  if (!promptId) throw new Error('ComfyUI did not return prompt_id');

  // Poll history until output appears (timeout ~3 minutes on Intel iGPU).
  const startedAt = Date.now();
  while (Date.now() - startedAt < 180000) {
    await sleep(1500);
    const histResp = await fetch(`${root}/history/${promptId}`);
    if (!histResp.ok) continue;
    const hist = await histResp.json();
    const item = hist?.[promptId];
    const outputs = item?.outputs;
    if (!outputs) continue;

    for (const out of Object.values(outputs)) {
      const images = out?.images;
      if (Array.isArray(images) && images.length > 0) {
        const img = images[0];
        const filename = img.filename;
        const subfolder = img.subfolder || '';
        const type = img.type || 'output';
        if (!filename) continue;

        const viewUrl = `${root}/view?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder)}&type=${encodeURIComponent(type)}`;
        const imgResp = await fetch(viewUrl);
        if (!imgResp.ok) throw new Error(`ComfyUI view failed (${imgResp.status})`);
        const buf = Buffer.from(await imgResp.arrayBuffer());
        const b64 = buf.toString('base64');
        const mime = imgResp.headers.get('content-type') || 'image/png';
        return `data:${mime};base64,${b64}`;
      }
    }
  }

  throw new Error('ComfyUI generation timed out');
}

async function generateStepSlideImageFromText(stepLike, options = {}) {
  const title = String(stepLike?.title || '');
  const explanation = String(stepLike?.explanation || '');
  const topic = String(options.topic || '');

  // Stable Diffusion struggles with long instructions. Use a tight, visual prompt.
  const visualPrompt = buildVisualPromptFromStep({ title, explanation, topic });
  return await generateSlideImage(visualPrompt, options);
}

async function generateVisualSlidesFromNotes(notes, options = {}) {
  const notesStr = String(notes || '');
  const cacheKey = `visualSlides:${AI_PROVIDER}:${hashText((options.topic || '') + notesStr)}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const flow = await generateVisualLearningFlowFromNotes(notesStr, options);

  const steps = Array.isArray(flow.steps) ? flow.steps : [];
  const limited = steps.slice(0, 8); // keep costs bounded

  const slides = [];
  for (const step of limited) {
    const promptParts = [
      options.topic ? `Topic: ${options.topic}` : null,
      `Step title: ${step.title}`,
      `Explanation: ${step.explanation}`,
      step.visual?.type === 'pictogram' ? `Pictogram idea: ${step.visual.content}` : null,
      step.visual?.type === 'mermaid' ? `Diagram idea: ${step.visual.content}` : null,
      'Make it look like a single slide. Use simple icons + arrows + blocks.',
    ].filter(Boolean);

    // Image generation is independent from Groq/OpenAI text. Uses OpenAI if configured,
    // otherwise falls back to a free endpoint.
    const imageUrl = await generateSlideImage(promptParts.join('\n'), { seed: Number(step.id?.replace(/\D/g, '')) || undefined });
    slides.push({ ...step, imageUrl });
  }

  const result = {
    ...flow,
    steps: slides,
  };

  cacheSet(cacheKey, result);
  return result;
}

module.exports = {
  generate,
  generateNotes,
  extractKeywords,
  generateFlashcards,
  generateQuiz,
  generateExamQuestions,
  answerQuestion,
  generateVisualExplanations,
  generateVisualLearningFlowFromNotes,
  generateVisualSlidesFromNotes,
  generateStepSlideImageFromText,
};

