const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { extractText, cleanText } = require('../services/pdfService');
const { extractKeywords } = require('../services/aiService');

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
    
    console.log(`\n🔑 Extracting keywords for file: ${fileId}`);
    
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
    
    if (documentText.length > 8000) {
      documentText = documentText.substring(0, 8000);
    }
    
    console.log('Step 2: Extracting keywords...');
    const keywordsData = await extractKeywords(documentText);
    
   
    console.log('Step 3: Extracting context for keywords...');
    const contexts = {};
    const fullText = extractedData.text; 
    
    if (keywordsData.keywords && Array.isArray(keywordsData.keywords)) {
      keywordsData.keywords.forEach(keyword => {
        
        const regex = new RegExp(`([^.]*\\b${keyword}\\b[^.]*\\.)`, 'i');
        const match = fullText.match(regex);
        
        if (match && match[1]) {
          
          contexts[keyword] = match[1].trim();
        } else {
          
          const index = fullText.toLowerCase().indexOf(keyword.toLowerCase());
          if (index !== -1) {
            const start = Math.max(0, index - 100);
            const end = Math.min(fullText.length, index + keyword.length + 100);
            contexts[keyword] = '...' + fullText.substring(start, end).trim() + '...';
          }
        }
      });
    }
    
    console.log(`✅ Keywords extracted: ${keywordsData.keywords?.length || 0} terms\n`);
    
    res.status(200).json({
      success: true,
      message: 'Keywords extracted successfully',
      data: {
        keywords: keywordsData.keywords || [],
        definitions: keywordsData.definitions || {},
        contexts: contexts || {},
        totalKeywords: keywordsData.keywords?.length || 0,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Keywords extraction error:', error);
    next(error);
  }
});

module.exports = router;