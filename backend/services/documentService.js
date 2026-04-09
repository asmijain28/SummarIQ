const path = require('path');
const fs = require('fs');
const { extractText, cleanText } = require('./pdfService');
const { needsOCR, processScannedPDF } = require('./ocrService');

function findUploadedFilePath(fileId) {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const files = fs.readdirSync(uploadsDir);
  const targetFile = files.find((file) => file.includes(fileId));
  if (!targetFile) return null;
  return path.join(uploadsDir, targetFile);
}

async function extractDocumentTextWithOCR(filePath, options = {}) {
  const minChars = Number(options.minChars || 20);
  const ocrTriggerChars = Number(options.ocrTriggerChars || 40);

  let extractedData = await extractText(filePath);
  let rawText = String(extractedData?.text || '');

  if (needsOCR(extractedData)) {
    const ext = path.extname(filePath).toLowerCase();
    const canRunPdfOCR = ext === '.pdf' && rawText.length < ocrTriggerChars;

    if (canRunPdfOCR) {
      try {
        const ocrText = await processScannedPDF(filePath, extractedData.numPages || 1);
        if (ocrText && ocrText.length > rawText.length) {
          rawText = ocrText;
          extractedData = { ...extractedData, text: rawText, isScanned: false };
        }
      } catch (ocrError) {
        console.warn('OCR attempt failed:', String(ocrError?.message || ocrError));
      }
    }
  }

  const cleanedText = cleanText(rawText);
  if (cleanedText.length < minChars) {
    const err = new Error(
      'Could not extract enough text from this file, even after OCR. Try a clearer scan or a text-based file.'
    );
    err.statusCode = 400;
    err.status = 400;
    err.code = 'INSUFFICIENT_TEXT';
    throw err;
  }

  return {
    filePath,
    extractedData,
    rawText,
    cleanedText,
  };
}

module.exports = {
  findUploadedFilePath,
  extractDocumentTextWithOCR,
};
