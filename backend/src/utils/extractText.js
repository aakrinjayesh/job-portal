import PDFParser from "pdf2json";

const extractTextFromBase64 = (buffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData) => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      let text = "";

      // Fallback handling
      const pages = pdfData?.formImage?.Pages || pdfData?.Pages || [];

      pages.forEach((page) => {
        page.Texts.forEach((t) => {
          if (t.R && t.R[0] && t.R[0].T) {
            text += decodeURIComponent(t.R[0].T) + " ";
          }
        });
      });

      resolve(text.trim());
    });

    pdfParser.parseBuffer(buffer);
  });
};

export default extractTextFromBase64;
