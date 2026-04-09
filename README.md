# SummarIQ - AI-Powered Study Assistant

SummarIQ turns uploaded study material into exam-ready outputs: notes, keywords, flashcards, quizzes, predicted exam questions, and document-grounded AI chat.

This project was developed as part of a Project-Based Learning (PBL) academic requirement.

## Live Demo

- Frontend demo (UI only): [https://asmijain28.github.io/SummarIQ/](https://asmijain28.github.io/SummarIQ/)
- Backend features (upload + AI generation) run locally.

## Key Features

- Detailed notes generation (`short`, `medium`, `detailed`)
- Keyword extraction with definitions and context
- Flashcard generation
- Quiz generation (MCQs)
- Predicted exam question generation
- Interactive AI assistant grounded in uploaded document content
- Visual Mode with generated step images

## Supported Inputs

- PDF (text-based and scanned)
- PPTX (slide text extraction)
- DOCX (text extraction)
- PPT/DOC accepted at upload level; extraction quality depends on file content/format

## OCR and Extraction Pipeline

The backend now uses a shared extraction flow for **all major features** (Notes, Keywords, Flashcards, Quiz, Exam Questions, Chat):

1. Native text extraction (PDF/PPTX/DOCX)
2. Low-text detection
3. OCR fallback for scanned PDFs (`pdfjs-dist` + `canvas` + `tesseract.js`)
4. Cleaned text passed to AI generation routes

This means scanned/low-text PDFs are no longer limited to Notes only.

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Motion / Framer Motion

### Backend

- Node.js + Express
- Multer (uploads)
- `pdf-parse` (PDF text)
- `mammoth` (DOCX text)
- `jszip` (PPTX slide XML text extraction)
- `pdfjs-dist` + `canvas` + `tesseract.js` (OCR)

### AI Providers

- Groq, Gemini, OpenAI (text provider fallback chain)
- ComfyUI / Gemini Imagen / Pixazo / Pollinations for visual image generation

## Local Setup

### 1) Install dependencies

```bash
# project root (frontend)
npm install

# backend
cd backend
npm install
```

### 2) Configure environment

Create/update `backend/.env`:

```env
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Text AI providers
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key_1,your_gemini_key_2
OPENAI_API_KEY=your_openai_key

# Upload limits
MAX_FILE_SIZE_MB=50
MAX_SCANNED_FILE_SIZE_MB=75

# OCR tuning (optional)
OCR_MAX_PAGES=6
OCR_SCALE=1.8

# Visual image providers
COMFYUI_URL=http://127.0.0.1:8188
POLLINATIONS_FIRST=true
POLLINATIONS_MODEL=flux

# Optional Pixazo async endpoints
PIXAZO_API_URL=
PIXAZO_STATUS_URL=
PIXAZO_API_KEY=
PIXAZO_MODEL=flux-schnell
```

### 3) Run app

```bash
# backend
cd backend
npm run start

# frontend (new terminal, project root)
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

## Notes

- `npm run start` and `node server.js` are equivalent for backend startup.
- For auto-reload during development, use `npm run dev` in `backend`.
- If ComfyUI/Pixazo are unavailable, image generation falls back to Pollinations/free flow.

## Privacy and Security

- Uploaded files are processed server-side for extraction/generation.
- API keys are managed through environment variables.
- File type and size validation are enforced at upload.

## License

MIT License