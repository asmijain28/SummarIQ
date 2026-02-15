function smartChunk(text, targetSize = 2000) {
  const chunks = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + targetSize, text.length);
    chunks.push({
      index: chunks.length,
      text: text.substring(start, end),
      length: end - start,
      wordCount: text.substring(start, end).split(/\s+/).length
    });
    start += targetSize;
  }
  
  return chunks;
}

module.exports = { smartChunk };