const express = require('express');
const router = express.Router();
const { generateFlashcards } = require('../services/aiService');
const { findUploadedFilePath, extractDocumentTextWithOCR } = require('../services/documentService');

router.post('/', async (req, res, next) => {
  try {
    const { fileId, count = 20 } = req.body;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'Missing fileId',
        message: 'Please provide a fileId'
      });
    }
    
    const flashcardCount = parseInt(count);
    if (isNaN(flashcardCount) || flashcardCount < 1 || flashcardCount > 50) {
      return res.status(400).json({
        success: false,
        error: 'Invalid count',
        message: 'Count must be between 1 and 50'
      });
    }
    
    console.log(`\n🎴 Generating ${flashcardCount} flashcards for file: ${fileId}`);
    
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
    
    console.log('Step 2: Generating flashcards...');
    const flashcards = await generateFlashcards(documentText, flashcardCount);
    
    console.log(`✅ Flashcards generated: ${flashcards.length} cards\n`);
    
    res.status(200).json({
      success: true,
      message: 'Flashcards generated successfully',
      data: {
        flashcards: flashcards,
        totalCards: flashcards.length,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Flashcards generation error:', error);
    next(error);
  }
});

module.exports = router;