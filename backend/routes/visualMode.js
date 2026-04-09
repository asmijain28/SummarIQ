const express = require('express');
const router = express.Router();
const { generateVisualLearningFlowFromNotes, generateVisualSlidesFromNotes } = require('../services/aiService');

router.post('/', async (req, res, next) => {
  try {
    const { notes, topic, generateImages = false } = req.body;

    if (!notes || typeof notes !== 'string' || notes.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Missing notes',
        message: 'Please provide generated notes text (min 50 chars) in `notes`.',
      });
    }

    console.log(
      `\n🧩 Generating Visual Learning Mode ${generateImages ? 'slides' : 'flow'}${topic ? ` for: ${topic}` : ''}`
    );

    const flow = generateImages
      ? await generateVisualSlidesFromNotes(notes, { topic })
      : await generateVisualLearningFlowFromNotes(notes, { topic });

    res.status(200).json({
      success: true,
      message: generateImages ? 'Visual slides generated successfully' : 'Visual Learning Mode generated successfully',
      data: {
        flow,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Visual Mode generation error:', error);
    // Provide clearer client-facing errors (especially for rate limits)
    const message = String(error?.message || 'Visual Mode generation failed');
    const status = error?.status || error?.statusCode;
    if (status === 429 || /rate limit|too many requests|429/i.test(message)) {
      return res.status(429).json({
        success: false,
        error: 'Rate limited',
        message: message,
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Visual Mode generation failed',
      message: message,
    });
  }
});

module.exports = router;

