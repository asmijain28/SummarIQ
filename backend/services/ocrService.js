function needsOCR(extractedData) {
  if (extractedData.isScanned) return true;
  // PPT/PPTX extraction can work without OCR when slide text exists.
  if (extractedData.isPPT && !(extractedData.text || '').trim()) return true;
  const wordCount = extractedData.text ? extractedData.text.split(/\s+/).length : 0;
  // Keep low to avoid false OCR requirement on short docs (recipes, handouts).
  return wordCount < 20;
}

async function processScannedPDF(pdfPath, numPages = 0) {
  const path = require('path');
  const { getDocument } = require('pdfjs-dist/legacy/build/pdf.js');
  const { createCanvas } = require('canvas');
  const Tesseract = require('tesseract.js');

  const maxPages = Number(process.env.OCR_MAX_PAGES || 6);
  const dpiScale = Number(process.env.OCR_SCALE || 1.8);
  const pageCountHint = Math.max(1, Number(numPages || 0));
  const pagesToProcess = Math.max(1, Math.min(pageCountHint, maxPages));

  console.log(`🔎 OCR started for ${path.basename(pdfPath)} (${pagesToProcess} pages max)`);

  const loadingTask = getDocument(pdfPath);
  const pdf = await loadingTask.promise;
  const totalPages = Math.max(1, Number(pdf.numPages || pagesToProcess));
  const finalPages = Math.min(totalPages, pagesToProcess);

  const worker = await Tesseract.createWorker('eng');
  let fullText = '';

  try {
    for (let p = 1; p <= finalPages; p++) {
      const page = await pdf.getPage(p);
      const viewport = page.getViewport({ scale: dpiScale });

      const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      const ctx = canvas.getContext('2d');

      await page.render({ canvasContext: ctx, viewport }).promise;
      const imgBuffer = canvas.toBuffer('image/png');
      const result = await worker.recognize(imgBuffer);
      const pageText = String(result?.data?.text || '').trim();

      if (pageText) {
        fullText += `${pageText}\n\n`;
      }
      console.log(`🔎 OCR page ${p}/${finalPages} done (${pageText.length} chars)`);
    }
  } finally {
    await worker.terminate();
  }

  return fullText.trim();
}

module.exports = { needsOCR, processScannedPDF };