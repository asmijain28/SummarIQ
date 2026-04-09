const express = require('express');
const router = express.Router();
const { generateStepSlideImageFromText } = require('../services/aiService');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

function isDataUrl(s) {
  return typeof s === 'string' && s.startsWith('data:');
}

function safeExtFromMime(mime) {
  const m = String(mime || '').toLowerCase();
  if (m.includes('png')) return 'png';
  if (m.includes('jpeg') || m.includes('jpg')) return 'jpg';
  if (m.includes('webp')) return 'webp';
  return 'png';
}

function persistDataUrlToUploads(dataUrl, { stepId = 'step', prefix = 'visualmode_step' } = {}) {
  // data:[<mime>][;base64],<data>
  const match = String(dataUrl).match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  if (!match) return null;

  const mime = match[1] || 'image/png';
  const isB64 = !!match[2];
  const payload = match[3] || '';
  if (!payload) return null;

  const ext = safeExtFromMime(mime);
  const bytes = isB64 ? Buffer.from(payload, 'base64') : Buffer.from(decodeURIComponent(payload), 'utf8');

  const uploadsDir = path.join(__dirname, '..', 'uploads', 'visualmode');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const hash = crypto.createHash('sha1').update(bytes).digest('hex').slice(0, 12);
  const filename = `${prefix}_${String(stepId).replace(/[^\w-]/g, '_')}_${hash}.${ext}`;
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, bytes);

  return { filename, relPath: `/uploads/visualmode/${filename}`, mime };
}

router.post('/', async (req, res) => {
  try {
    const { step, topic } = req.body;

    if (!step || typeof step !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Missing step',
        message: 'Please provide `step` object.',
      });
    }

    let imageUrl = await generateStepSlideImageFromText(step, { topic, width: 512, height: 512, steps: 14 });

    // If we got a base64 data URL, persist it to disk and return a stable URL.
    if (isDataUrl(imageUrl)) {
      const saved = persistDataUrlToUploads(imageUrl, { stepId: step?.id || step?.title || 'step' });
      if (saved?.relPath) {
        const base = `${req.protocol}://${req.get('host')}`;
        imageUrl = `${base}${saved.relPath}`;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Step image generated',
      data: { imageUrl },
    });
  } catch (error) {
    const message = String(error?.message || 'Step image generation failed');
    return res.status(500).json({
      success: false,
      error: 'Step image generation failed',
      message,
    });
  }
});

module.exports = router;

