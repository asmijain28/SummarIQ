# SummarIQ - AI-Powered Study Assistant

Transform your study materials into comprehensive notes, flashcards, quizzes, and more with the power of AI.

## 🚀 Live Demo

- **Frontend**: https://summariq.vercel.app *(Update with your URL)*
- **Backend API**: https://summariq-backend.onrender.com *(Update with your URL)*
- **GitHub**: https://github.com/YOUR_USERNAME/summariq *(Update with your repo)*

## ✨ Features

- **📝 AI-Generated Notes** - Three detail levels with markdown formatting
- **🔑 Keyword Extraction** - 15-25 keywords with definitions and context
- **🎴 Interactive Flashcards** - 20 AI-generated flashcards with explanations
- **📊 Multiple Choice Quiz** - Adaptive length with instant feedback
- **📋 Exam Questions** - Short, Long, and Conceptual questions with answers
- **💬 AI Chat Assistant** - Ask questions about your document
- **⚙️ Customization** - Adjust detail levels, highlighting, and quiz length

## 🛠️ Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion  
**Backend:** Node.js, Express, Groq/Gemini/OpenAI APIs  
**Deployment:** Vercel (Frontend) + Render (Backend)

## 📦 Quick Start

### Prerequisites
- Node.js 16+
- Groq API key (free at https://console.groq.com)

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/summariq.git
cd summariq

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Start backend
node server.js

# Start frontend (new terminal)
cd ..
npm run dev
```

Visit `http://localhost:3000`

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide.

**Quick steps:**
1. Push code to GitHub
2. Deploy backend to Render (free)
3. Deploy frontend to Vercel (free)
4. Add environment variables
5. Done! 🎉

## 📚 Documentation

- [FEATURES.md](FEATURES.md) - Complete feature list and roadmap
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment instructions
- Original Figma Design: https://www.figma.com/design/vPpfafjiT9bojFLqzErdEi/SummarIQ-Web-Application-Design

## 🎯 Supported File Types

- PDF documents
- PowerPoint (PPT, PPTX)
- Word documents (DOCX)
- Up to 50MB file size

## 🔑 API Keys

Get free API keys:
- **Groq** (Recommended): https://console.groq.com
- **Google Gemini**: https://aistudio.google.com/apikey
- **OpenAI**: https://platform.openai.com/api-keys

## 📄 License

MIT License - Free to use and modify

## 👨‍💻 Author

[Your Name]  
GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)

---

**Made with ❤️ for students everywhere**
