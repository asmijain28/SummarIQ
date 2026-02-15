const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  const wordsPerPage = pdfData.text.split(/\s+/).length / pdfData.numpages;
  return {
    text: pdfData.text,
    numPages: pdfData.numpages,
    isScanned: wordsPerPage < 50
  };
}

async function extractTextFromDOCX(filePath) {
  const mammoth = require('mammoth');
  const result = await mammoth.extractRawText({ path: filePath });
  return { text: result.value, isScanned: false };
}

async function extractTextFromPPT(filePath) {
  return { text: '', isScanned: true, isPPT: true };
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