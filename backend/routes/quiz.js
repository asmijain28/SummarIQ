const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { extractText, cleanText } = require('../services/pdfService');
const { generateQuiz } = require('../services/aiService');

router.post('/', async (req, res, next) => {
  try {
    const { fileId, count = 10 } = req.body;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'Missing fileId',
        message: 'Please provide a fileId'
      });
    }
    
    const questionCount = parseInt(count);
    if (isNaN(questionCount) || questionCount < 1 || questionCount > 30) {
      return res.status(400).json({
        success: false,
        error: 'Invalid count',
        message: 'Count must be between 1 and 30'
      });
    }
    
    console.log(`\n📝 Generating ${questionCount} quiz questions for file: ${fileId}`);
    
    const uploadsDir = path.join(__dirname, '../uploads');
    const files = fs.readdirSync(uploadsDir);
    const targetFile = files.find(file => file.includes(fileId));
    
    if (!targetFile) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
        message: 'The requested document does not exist'
      });
    }
    
    const filePath = path.join(uploadsDir, targetFile);
    
    console.log('Step 1: Extracting text...');
    const extractedData = await extractText(filePath);
    let documentText = cleanText(extractedData.text);
    
    if (documentText.length > 10000) {
      documentText = documentText.substring(0, 10000);
    }
    
    console.log('Step 2: Generating quiz...');
    const quiz = await generateQuiz(documentText, questionCount);
    
    console.log(`✅ Quiz generated: ${quiz.length} questions\n`);
    
    res.status(200).json({
      success: true,
      message: 'Quiz generated successfully',
      data: {
        questions: quiz,
        totalQuestions: quiz.length,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Quiz generation error:', error);
    next(error);
  }
});

router.post('/check', async (req, res) => {
  try {
    const { userAnswer, correctAnswer, explanation } = req.body;
    
    if (!userAnswer || !correctAnswer) {
      return res.status(400).json({
        success: false,
        error: 'Missing parameters'
      });
    }
    
    const isCorrect = userAnswer.toUpperCase() === correctAnswer.toUpperCase();
    
    res.status(200).json({
      success: true,
      data: {
        isCorrect: isCorrect,
        correctAnswer: correctAnswer,
        explanation: explanation || 'No explanation provided',
        message: isCorrect ? 'Correct!' : `Wrong. The correct answer is ${correctAnswer}`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;