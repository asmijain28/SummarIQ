# SummarIQ - Feature Documentation

## Current Features (Implemented & Working)

### 1. Document Upload & Processing
- **Supported Formats**: PDF, PPT, PPTX, DOCX
- **File Size Limit**: Up to 50MB
- **Smart Chunking**: Automatically splits large documents for processing
- **Text Extraction**: Handles both text-based and scanned documents

### 2. AI-Powered Notes Generation
- **Three Detail Levels**: Short (500 words), Medium (1500 words), Detailed (3000+ words)
- **Markdown Formatting**: Headings, bullet points, bold keywords
- **Smart Processing**: Handles documents of any size through intelligent chunking
- **Download Option**: Export notes for offline use

### 3. Keyword Extraction & Context
- **Automatic Extraction**: 15-25 important keywords per document
- **Definitions**: AI-generated definitions for each keyword
- **Context Display**: Shows where each keyword appears in the document
- **Visual Design**: Color-coded keyword bubbles with interactive selection

### 4. Interactive Flashcards
- **AI-Generated**: 20 flashcards per document
- **Three-Part Structure**: Question, Answer, Explanation
- **Flip Animation**: Smooth card flip interactions
- **Progress Tracking**: Visual indicators for studied cards

### 5. Multiple Choice Quiz
- **Adaptive Length**: Short (6), Medium (10), Full (15) questions
- **Difficulty Levels**: Easy, Medium, Hard questions
- **Instant Feedback**: Immediate answer validation
- **Detailed Explanations**: Learn from mistakes
- **Score Tracking**: Real-time performance monitoring

### 6. Predicted Exam Questions
- **Three Question Types**:
  - Short Answer (1-2 sentences)
  - Long Answer (4-6 sentences)
  - Conceptual (3-4 sentences)
- **Filtering**: Filter by question type
- **Star System**: Mark important questions
- **Complete Answers**: Detailed model answers provided

### 7. AI Chat Assistant
- **Context-Aware**: Answers based on your uploaded document
- **Natural Conversation**: Ask questions in plain language
- **Smart Search**: Finds relevant information across the entire document
- **Helpful Responses**: Provides answers even for paraphrased questions

### 8. Customization Settings
- **Note Detail Level**: Adjust note length (Short/Medium/Detailed)
- **Note Format**: Choose between paragraph or bulleted format
- **Keyword Highlighting**: Toggle yellow highlighting
- **Quiz Length**: Customize number of quiz questions

### 9. Multi-Provider AI Support
- **Groq API**: Free, fast, high limits (primary)
- **Google Gemini**: Alternative with API key rotation
- **OpenAI**: GPT-3.5-turbo and GPT-4 support
- **API Key Rotation**: Automatic rotation between 3 keys for higher quota

### 10. Responsive Design
- **Mobile-Friendly**: Works on all screen sizes
- **Modern UI**: Clean, professional interface
- **Smooth Animations**: Framer Motion animations
- **Dark Mode Ready**: Prepared for theme switching

---

## Planned Features (Future Enhancements)

### 1. YouTube Video Support 
**Description**: Extract transcripts from YouTube videos and generate study materials

**Planned Capabilities**:
- Paste YouTube URL to generate notes
- Support for videos with captions/subtitles
- Timestamp references in generated content
- Video summary with key moments

**Technical Approach**:
- YouTube Transcript API integration
- Automatic caption extraction
- Same AI processing pipeline as documents
- Store video metadata (title, duration, channel)

**Benefits**:
- Study from video lectures
- Convert educational content to notes
- Create flashcards from video tutorials
- Generate quizzes from video content

**Estimated Implementation**: 2-3 days

---

### 2. Audio File Support 
**Description**: Upload audio recordings and generate study materials

**Planned Capabilities**:
- Support MP3, WAV, M4A formats
- Speech-to-text transcription
- Speaker identification
- Timestamp markers

**Technical Approach**:
- Whisper API for transcription
- Audio preprocessing
- Text extraction pipeline
- Same AI processing as documents

**Benefits**:
- Study from recorded lectures
- Convert voice notes to written notes
- Process podcast episodes
- Transcribe interviews

**Estimated Implementation**: 3-4 days

---

### 3. Collaborative Study Groups 
**Description**: Share documents and study materials with classmates

**Planned Capabilities**:
- Create study groups
- Share uploaded documents
- Collaborative note-taking
- Group quiz competitions
- Shared flashcard decks

**Technical Approach**:
- User authentication system
- MongoDB for data persistence
- Real-time updates with WebSockets
- Permission management

**Benefits**:
- Study together remotely
- Share resources efficiently
- Compete in group quizzes
- Build shared knowledge base

**Estimated Implementation**: 1-2 weeks

---

### 4. Progress Tracking & Analytics 
**Description**: Track your study progress and performance over time

**Planned Capabilities**:
- Study time tracking
- Quiz performance analytics
- Flashcard mastery levels
- Weekly/monthly reports
- Goal setting and reminders

**Technical Approach**:
- Database integration
- Chart.js for visualizations
- Local storage for offline tracking
- Export reports as PDF

**Benefits**:
- Monitor learning progress
- Identify weak areas
- Stay motivated with goals
- Data-driven study planning

**Estimated Implementation**: 1 week

---

### 5. Advanced Export Options 
**Description**: Export study materials in multiple formats

**Planned Capabilities**:
- Export notes as PDF with formatting
- Export flashcards as Anki deck
- Export quiz as Google Forms
- Print-friendly versions
- Share via email/link

**Technical Approach**:
- PDF generation library (jsPDF)
- Anki deck format conversion
- Google Forms API integration
- Email service integration

**Benefits**:
- Use materials offline
- Import to other study tools
- Print physical study guides
- Share with non-users

**Estimated Implementation**: 3-5 days

---

### 6. Multi-Language Support 
**Description**: Support documents and generation in multiple languages

**Planned Capabilities**:
- Detect document language
- Generate notes in same language
- Translate between languages
- Support 20+ languages

**Technical Approach**:
- Language detection API
- Multi-language AI models
- Translation API integration
- Localized UI

**Benefits**:
- Study in native language
- Learn foreign languages
- Access global content
- Inclusive for all users

**Estimated Implementation**: 1-2 weeks

---

### 7. Spaced Repetition System 
**Description**: Intelligent flashcard review scheduling

**Planned Capabilities**:
- SM-2 algorithm implementation
- Review reminders
- Difficulty adjustment
- Mastery tracking
- Daily review queue

**Technical Approach**:
- Spaced repetition algorithm
- Local storage for schedules
- Push notifications
- Performance analytics

**Benefits**:
- Optimize memory retention
- Efficient study sessions
- Long-term knowledge retention
- Scientifically proven method

**Estimated Implementation**: 1 week

---

### 8. OCR for Scanned Documents 
**Description**: Full support for scanned PDFs and images

**Planned Capabilities**:
- Extract text from images
- Process scanned PDFs
- Handwriting recognition
- Image preprocessing

**Technical Approach**:
- Tesseract.js for OCR
- Image enhancement
- Text cleanup algorithms
- Quality validation

**Benefits**:
- Process any document type
- Digitize handwritten notes
- Work with old textbooks
- No format limitations

**Estimated Implementation**: 3-5 days

---

## Technical Stack

### Frontend
- React + TypeScript
- Vite (build tool)
- Tailwind CSS
- Framer Motion (animations)
- Shadcn/ui components

### Backend
- Node.js + Express
- Multer (file uploads)
- PDF-parse (text extraction)
- Groq/Gemini/OpenAI APIs

### Deployment Ready
- Environment-based configuration
- Error handling
- API rate limiting
- CORS configured
- Production optimizations

---

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Groq/Gemini/OpenAI API key

### Installation
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### Configuration
1. Copy `backend/.env.example` to `backend/.env`
2. Add your API keys
3. Configure settings as needed

### Running
```bash
# Start backend (from backend folder)
node server.js

# Start frontend (from root folder)
npm run dev
```

---

## API Documentation

### Upload Document
```
POST /api/upload
Content-Type: multipart/form-data
Body: { file: File }
```

### Generate Notes
```
POST /api/notes
Body: { fileId: string, length: 'short' | 'medium' | 'detailed' }
```

### Extract Keywords
```
POST /api/keywords
Body: { fileId: string }
```

### Generate Flashcards
```
POST /api/flashcards
Body: { fileId: string, count: number }
```

### Generate Quiz
```
POST /api/quiz
Body: { fileId: string, count: number }
```

### Generate Exam Questions
```
POST /api/exam-questions
Body: { fileId: string, count: number }
```

### AI Chat
```
POST /api/chat
Body: { fileId: string, question: string }
```




