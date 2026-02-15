/**
 * SummarIQ Backend Server
 * AI-Powered Study Assistant
 * 
 * This is the main entry point for the backend application.
 * It sets up Express server, middleware, routes, and error handling.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Security headers
app.use(helmet());

// CORS configuration - Allow frontend to communicate with backend
// CORS configuration - MUST be before body parser
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files - serve uploaded files if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware (simple version)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// CREATE UPLOADS DIRECTORY
// ============================================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(' Created uploads directory');
}

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SummarIQ Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    aiProvider: process.env.AI_PROVIDER || 'openai'
  });
});

// API Routes - Will be implemented step by step
// TODO: Uncomment these as we build each route

// const uploadRoute = require('./routes/upload');
// const notesRoute = require('./routes/notes');
// //  const keywordsRoute = require('./routes/keywords');
// //  const flashcardsRoute = require('./routes/flashcards');
// //  const quizRoute = require('./routes/quiz');
// //  const examQuestionsRoute = require('./routes/examQuestions');
// //  const chatRoute = require('./routes/chat');

// app.use('/api/upload', uploadRoute);
//  app.use('/api/notes', notesRoute);
// //  app.use('/api/keywords', keywordsRoute);
// //  app.use('/api/flashcards', flashcardsRoute);
// //  app.use('/api/quiz', quizRoute);
// //  app.use('/api/exam-questions', examQuestionsRoute);
// //  app.use('/api/chat', chatRoute);

// API Routes - Testing one by one
console.log('Loading routes...');

try {
  const uploadRoute = require('./routes/upload');
  app.use('/api/upload', uploadRoute);
  console.log('✅ Upload route loaded');
} catch (error) {
  console.error('❌ Upload route error:', error.message);
}

try {
  const notesRoute = require('./routes/notes');
  app.use('/api/notes', notesRoute);
  console.log('✅ Notes route loaded');
} catch (error) {
  console.error('❌ Notes route error:', error.message);
}

try {
  const keywordsRoute = require('./routes/keywords');
  app.use('/api/keywords', keywordsRoute);
  console.log('✅ Keywords route loaded');
} catch (error) {
  console.error('❌ Keywords route error:', error.message);
}

try {
  const flashcardsRoute = require('./routes/flashcards');
  app.use('/api/flashcards', flashcardsRoute);
  console.log('✅ Flashcards route loaded');
} catch (error) {
  console.error('❌ Flashcards route error:', error.message);
}

try {
  const quizRoute = require('./routes/quiz');
  app.use('/api/quiz', quizRoute);
  console.log('✅ Quiz route loaded');
} catch (error) {
  console.error('❌ Quiz route error:', error.message);
}

try {
  const examQuestionsRoute = require('./routes/examQuestions');
  app.use('/api/exam-questions', examQuestionsRoute);
  console.log('✅ Exam Questions route loaded');
} catch (error) {
  console.error('❌ Exam Questions route error:', error.message);
}

try {
  const chatRoute = require('./routes/chat');
  app.use('/api/chat', chatRoute);
  console.log('✅ Chat route loaded');
} catch (error) {
  console.error('❌ Chat route error:', error.message);
}

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 Handler - Route not found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(' Error:', err);
  
  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large',
      message: `File size exceeds ${process.env.MAX_FILE_SIZE_MB || 25}MB limit`
    });
  }
  
  // Multer file type error
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      message: 'Only PDF, PPT, PPTX, and DOCX files are allowed'
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'Server Error',
    message: err.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// DATABASE CONNECTION (Optional - MongoDB)
// ============================================

// Uncomment if you want to use MongoDB for storing history
/*
const mongoose = require('mongoose');

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));
} else {
  console.log('ℹ️  Running without MongoDB (history storage disabled)');
}
*/

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log(' SummarIQ Backend Server Started');
  console.log('='.repeat(50));
  console.log(` Server running on: http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` AI Provider: ${process.env.AI_PROVIDER || 'openai'}`);
  console.log(` Uploads directory: ${uploadsDir}`);
  console.log('='.repeat(50) + '\n');
  
  // Validate environment variables
  if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
    console.warn('  WARNING: No AI API key configured!');
    console.warn('   Please set OPENAI_API_KEY or GEMINI_API_KEY in .env file');
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n SIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;