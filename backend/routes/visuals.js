const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { extractText, cleanText } = require('../services/pdfService');
const { generateVisualExplanations } = require('../services/aiService');

router.post('/', async (req, res, next) => {
  try {
    const { fileId } = req.body;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'Missing fileId',
        message: 'Please provide a fileId'
      });
    }
    
    console.log(`\n🎨 Generating visual explanations for file: ${fileId}`);
    
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
    const documentText = cleanText(extractedData.text);
    
    console.log('Step 2: Generating visual explanations...');
    const visuals = await generateVisualExplanations(documentText);
    
    console.log(`✅ Generated ${visuals.length} visual explanations\n`);
    
    res.status(200).json({
      success: true,
      message: 'Visual explanations generated successfully',
      data: {
        visuals,
        totalVisuals: visuals.length,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Visual generation error:', error);
    next(error);
  }
});

module.exports = router;