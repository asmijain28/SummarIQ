const express = require('express');
const router = express.Router();
const { generateExamQuestions } = require('../services/aiService');
const { findUploadedFilePath, extractDocumentTextWithOCR } = require('../services/documentService');

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
    
    const filePath = findUploadedFilePath(fileId);
    
    if (!filePath) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
        message: 'The requested document does not exist'
      });
    }

    console.log('Step 1: Extracting text...');
    const extracted = await extractDocumentTextWithOCR(filePath);
    let documentText = extracted.cleanedText;
    
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