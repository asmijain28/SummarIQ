const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const JSZip = require('jszip');

async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  const words = pdfData.text ? pdfData.text.split(/\s+/).filter(Boolean).length : 0;
  const wordsPerPage = words / Math.max(1, pdfData.numpages || 1);
  return {
    text: pdfData.text,
    numPages: pdfData.numpages,
    // Use a lower threshold to avoid false positives on short PDFs.
    isScanned: wordsPerPage < 10
  };
}

async function extractTextFromDOCX(filePath) {
  const mammoth = require('mammoth');
  const result = await mammoth.extractRawText({ path: filePath });
  return { text: result.value, isScanned: false };
}

async function extractTextFromPPT(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  // Legacy .ppt extraction is not implemented without external binaries.
  if (ext === '.ppt') {
    return { text: '', isScanned: false, isPPT: true };
  }

  // Basic PPTX extraction by reading slide XML text nodes.
  const buf = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(buf);
  const slideFiles = Object.keys(zip.files)
    .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))
    .sort((a, b) => {
      const na = Number((a.match(/slide(\d+)\.xml$/) || [])[1] || 0);
      const nb = Number((b.match(/slide(\d+)\.xml$/) || [])[1] || 0);
      return na - nb;
    });

  const allSlides = [];
  for (const sf of slideFiles) {
    const xml = await zip.files[sf].async('string');
    // Extract text in <a:t>...</a:t>
    const matches = [...xml.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g)];
    const texts = matches.map((m) =>
      String(m[1] || '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim()
    ).filter(Boolean);
    if (texts.length) allSlides.push(texts.join(' '));
  }

  return {
    text: allSlides.join('\n\n'),
    isScanned: false,
    isPPT: true,
  };
}

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') return await extractTextFromPDF(filePath);
  if (ext === '.docx' || ext === '.doc') return await extractTextFromDOCX(filePath);
  if (ext === '.ppt' || ext === '.pptx') return await extractTextFromPPT(filePath);
  throw new Error('Unsupported file type');
}

function cleanText(text) {
  return text ? text.replace(/\s+/g, ' ').trim() : '';
}

module.exports = { extractText, cleanText, extractTextFromPDF, extractTextFromDOCX, extractTextFromPPT };