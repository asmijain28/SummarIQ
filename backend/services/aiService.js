const OpenAI = require('openai');
const fetch = require('node-fetch');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const groq = process.env.GROQ_API_KEY ? new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
}) : null;

const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';

const GEMINI_API_KEYS = process.env.GEMINI_API_KEY 
  ? process.env.GEMINI_API_KEY.split(',').map(key => key.trim())
  : [];

let currentKeyIndex = 0;

function getNextGeminiKey() {
  if (GEMINI_API_KEYS.length === 0) {
    throw new Error('No Gemini API keys configured');
  }
  const key = GEMINI_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  return key;
}

async function generate(prompt, options = {}) {
  if (AI_PROVIDER === 'groq') {
    if (!groq) {
      throw new Error('Groq API key not configured');
    }
    
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: options.systemPrompt || 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4000
    });
    return response.choices[0].message.content;
    
  } else if (AI_PROVIDER === 'gemini') {
    const GEMINI_API_KEY = getNextGeminiKey();
    const systemPrompt = options.systemPrompt || 'You are a helpful assistant.';
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;
    
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
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
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
    
  } else {
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }
    
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
  }
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

module.exports = { generate, generateNotes, extractKeywords, generateFlashcards, generateQuiz, generateExamQuestions, answerQuestion };
