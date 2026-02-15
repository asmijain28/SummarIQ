function needsOCR(extractedData) {
  if (extractedData.isScanned) return true;
  if (extractedData.isPPT) return true;
  const wordCount = extractedData.text ? extractedData.text.split(/\s+/).length : 0;
  return wordCount < 100;
}

async function processScannedPDF(pdfPath, numPages) {
  console.log('⚠️  OCR not fully implemented');
  return '';
}

module.exports = { needsOCR, processScannedPDF };