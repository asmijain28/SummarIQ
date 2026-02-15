const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { extractText, cleanText } = require('../services/pdfService');
const { needsOCR } = require('../services/ocrService');
const { generateNotes } = require('../services/aiService');
const { smartChunk } = require('../services/chunker');

router.post('/', async (req, res, next) => {
  try {
    const { fileId, length = 'detailed' } = req.body;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'Missing fileId',
        message: 'Please provide a fileId'
      });
    }
    
    const validLengths = ['short', 'medium', 'detailed'];
    if (!validLengths.includes(length)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid length',
        message: 'Length must be one of: short, medium, detailed'
      });
    }
    
    console.log(`\n📝 Generating ${length} notes for file: ${fileId}`);
    
    let documentText;
    
    
    if (fileId.startsWith('yt-')) {
      global.youtubeTranscripts = global.youtubeTranscripts || {};
      const transcript = global.youtubeTranscripts[fileId];
      
      if (!transcript) {
        return res.status(404).json({
          success: false,
          error: 'Transcript not found',
          message: 'The YouTube transcript does not exist or has expired'
        });
      }
      
      documentText = transcript.text;
      console.log('Using YouTube transcript');
    } else {
     
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
      let extractedData = await extractText(filePath);
      documentText = extractedData.text;
      
      if (needsOCR(extractedData)) {
        console.log('⚠️ Document requires OCR (not fully implemented)');
        if (documentText.length < 100) {
          return res.status(400).json({
            success: false,
            error: 'OCR required',
            message: 'This appears to be a scanned document. Please use a text-based PDF.'
          });
        }
      }
      
      console.log('Step 2: Cleaning text...');
      documentText = cleanText(documentText);
    }
    
    console.log(`Text extracted: ${documentText.length} characters`);
    
    let notes;
    const maxChunkSize = 10000;
    
    if (documentText.length > maxChunkSize) {
      console.log('Step 3: Processing in chunks...');
      const chunks = smartChunk(documentText, maxChunkSize);
      console.log(`Split into ${chunks.length} chunks`);
      
      const chunkNotes = [];
      for (let i = 0; i < chunks.length; i++) {
        console.log(`Processing chunk ${i + 1}/${chunks.length}...`);
        const chunkNote = await generateNotes(chunks[i].text, length);
        chunkNotes.push(chunkNote);
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      notes = chunkNotes.join('\n\n---\n\n');
    } else {
      console.log('Step 3: Generating notes...');
      notes = await generateNotes(documentText, length);
    }
    
    console.log('✅ Notes generation complete!\n');
    
    res.status(200).json({
      success: true,
      message: 'Notes generated successfully',
      data: {
        notes: notes,
        length: length,
        metadata: {
          originalTextLength: documentText.length,
          notesLength: notes.length,
          wordCount: notes.split(/\s+/).length,
          generatedAt: new Date().toISOString()
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Notes generation error:', error);
    next(error);
  }
});

router.get('/:fileId', async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Not implemented',
    message: 'Note retrieval requires database integration'
  });
});

module.exports = router;