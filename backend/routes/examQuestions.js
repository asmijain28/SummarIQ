const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { extractText, cleanText } = require('../services/pdfService');
const { generateExamQuestions } = require('../services/aiService');

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
    if (isNaN(questionCount) || questionCount < 1 || questionCount > 20) {
      return res.status(400).json({
        success: false,
        error: 'Invalid count',
        message: 'Count must be between 1 and 20'
      });
    }
    
    console.log(`\n📋 Generating ${questionCount} exam questions for file: ${fileId}`);
    
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
    
    console.log('Step 2: Generating exam questions...');
    const examQuestions = await generateExamQuestions(documentText, questionCount);
    
    console.log(`✅ Exam questions generated: ${examQuestions.length} questions\n`);
    
    res.status(200).json({
      success: true,
      message: 'Exam questions generated successfully',
      data: {
        questions: examQuestions,
        totalQuestions: examQuestions.length,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Exam questions generation error:', error);
    next(error);
  }
});

module.exports = router;