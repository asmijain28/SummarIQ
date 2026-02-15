const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { extractText, cleanText } = require('../services/pdfService');
const { answerQuestion } = require('../services/aiService');
const { smartChunk } = require('../services/chunker');

const documentChunks = new Map();

router.post('/', async (req, res, next) => {
  try {
    const { fileId, question } = req.body;
    
    if (!fileId || !question) {
      return res.status(400).json({
        success: false,
        error: 'Missing fileId or question'
      });
    }
    
    console.log(`\n💬 Processing chat question for file: ${fileId}`);
    
    const uploadsDir = path.join(__dirname, '../uploads');
    const files = fs.readdirSync(uploadsDir);
    const targetFile = files.find(file => file.includes(fileId));
    
    if (!targetFile) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    const filePath = path.join(uploadsDir, targetFile);
    
    let chunks;
    if (documentChunks.has(fileId)) {
      chunks = documentChunks.get(fileId);
    } else {
      const extractedData = await extractText(filePath);
      const documentText = cleanText(extractedData.text);
      chunks = smartChunk(documentText, 1000);
      documentChunks.set(fileId, chunks);
    }
    
    const questionLower = question.toLowerCase();
    const questionWords = questionLower.split(/\s+/);
    
    const scoredChunks = chunks.map(chunk => {
      const chunkLower = chunk.text.toLowerCase();
      let score = 0;
      questionWords.forEach(word => {
        if (word.length > 3) {
          score += (chunkLower.match(new RegExp(word, 'g')) || []).length;
        }
      });
      return { ...chunk, score };
    });
    
    const topChunks = scoredChunks.sort((a, b) => b.score - a.score).slice(0, 3);
    const context = topChunks.map(c => c.text).join('\n\n');
    
    const answer = await answerQuestion(question, context);
    
    console.log(`✅ Answer generated\n`);
    
    res.status(200).json({
      success: true,
      message: 'Answer generated successfully',
      data: {
        question: question,
        answer: answer,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Chat error:', error);
    next(error);
  }
});

module.exports = router;