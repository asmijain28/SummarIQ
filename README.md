📘 SummarIQ – AI-Powered Study Assistant

SummarIQ is a software-based web application that helps students convert academic documents into structured, exam-oriented study material using modern AI services. It generates detailed notes, highlighted keywords, flashcards, quizzes, exam questions, and provides an interactive document-aware AI assistant.

This project is developed as part of a Project-Based Learning (PBL) academic requirement.

🌐 Live Demo

Frontend (Demo Mode – UI only):
 https://asmijain28.github.io/SummarIQ/

GitHub Pages hosts only the frontend. Backend services are demonstrated locally.

-> Key Features

-> Detailed Notes Generation

Generates structured notes instead of short summaries

Supports Short, Medium, and Detailed modes

Markdown-based formatting with headings and bullet points

Processes full documents without truncation

-> Keyword Extraction & Highlighting

Automatically extracts important terms from documents

Provides definitions and contextual usage

Highlights keywords within generated notes

-> Flashcards

Concept-based question–answer flashcards

Flip interaction with explanations

Number of flashcards adapts to document size

-> Quiz (MCQs)

Multiple-choice questions generated from document content

Instant feedback with correct answers and explanations

Customizable number of questions

-> Exam-Oriented Questions

Short and long descriptive questions

Answers generated based on document context

Designed for exam preparation

-> Interactive AI Chat

Users can ask questions related only to the uploaded document

Context-aware responses

Prevents hallucinated answers outside document scope

-> Customization

Control note length

Adjust quiz and flashcard count

Toggle keyword highlighting

-> Supported File Formats

PDF (text-based and scanned with OCR)

PowerPoint (PPT / PPTX)

Word Documents (DOCX)

Maximum file size: 50 MB per file

-> Technology Stack
Frontend

React 18

TypeScript

Vite

Tailwind CSS

Framer Motion

Radix UI

Backend

Node.js

Express.js

Multer (file uploads)

PDF-Parse (PDF text extraction)

Tesseract.js (OCR for scanned PDFs)

AI / APIs

Groq API (LLaMA 3.3 70B – primary)

Google Gemini (fallback)

OpenAI (backup)

Deployment

GitHub Pages (frontend demo)

Local backend execution for evaluation

-> Running the Project Locally
Prerequisites

Node.js (v16 or above)

npm

API key from Groq / Gemini / OpenAI

Installation
# Clone repository
git clone https://github.com/asmijain28/SummarIQ.git
cd SummarIQ

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
Environment Configuration

Create backend/.env:

PORT=5001
AI_PROVIDER=groq
GROQ_API_KEY=your_api_key_here
MAX_FILE_SIZE_MB=50
Run Application
# Start backend
cd backend
node server.js

# Start frontend (new terminal)
cd ..
npm run dev

Open browser at:
 http://localhost:3000

-> Evaluation Summary

Supports multiple document formats and sizes

Processes full document content without truncation

Generates exam-oriented learning material

Results evaluated through functional testing and manual verification

Designed as a software system, not a trained ML model

-> Privacy & Security

Uploaded files are processed temporarily

No user accounts or permanent storage

API keys secured using environment variables

File type and size validation implemented

-> Future Enhancements

User login and document history

Spaced repetition learning

Mobile application

Multi-language support

Audio and video lecture processing

-> License

This project is licensed under the MIT License.

 Author

My Name
GitHub: https://github.com/asmijain28

 -> Acknowledgements

Groq API

Google Gemini

OpenAI

React & Open-source community