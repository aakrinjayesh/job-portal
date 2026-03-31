export const chunkText = (text, size = 3000) => {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += size;
  }
  return chunks;
};

export const reduceText = (text, factor = 0.7) => {
  return text.slice(0, Math.floor(text.length * factor));
};
