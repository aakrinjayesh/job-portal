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




// npm install pdf2json tesseract.js pdf-poppler

// import PDFParser from "pdf2json";
// import * as Tesseract from "tesseract.js";
// import { poppler } from "pdf-poppler";

// // A single function to handle all PDF types
// const extractTextFromBase64 = async (base64Buffer) => {
//   // First, try standard text extraction with pdf2json
//   try {
//     const text = await extractTextFromStandardPDF(base64Buffer);
//     if (text && text.length > 0) {
//       console.log("Extracted text using pdf2json.");
//       return text;
//     }
//   } catch (error) {
//     console.error("pdf2json failed, likely due to an image-based PDF. Trying OCR...");
//   }

//   // If pdf2json fails or finds no text, try OCR
//   console.log("No embedded text found. Attempting OCR.");
//   try {
//     const ocrText = await extractTextFromImagePDF(base64Buffer);
//     return ocrText;
//   } catch (error) {
//     console.error("OCR extraction failed:", error);
//     throw new Error("Failed to extract text from PDF.");
//   }
// };

// // Original pdf2json logic
// const extractTextFromStandardPDF = (buffer) => {
//   return new Promise((resolve, reject) => {
//     const pdfParser = new PDFParser();

//     pdfParser.on("pdfParser_dataError", (errData) => reject(errData.parserError));
//     pdfParser.on("pdfParser_dataReady", (pdfData) => {
//       let text = "";
//       const pages = pdfData?.formImage?.Pages || pdfData?.Pages || [];
//       pages.forEach((page) => {
//         page.Texts.forEach((t) => {
//           if (t.R && t.R[0] && t.R[0].T) {
//             text += decodeURIComponent(t.R[0].T) + " ";
//           }
//         });
//       });
//       resolve(text.trim());
//     });

//     pdfParser.parseBuffer(buffer);
//   });
// };

// // New OCR logic
// const extractTextFromImagePDF = async (buffer) => {
//   let allText = "";
//   // Poppler requires a temporary file
//   const tempPdfPath = `./temp_${Date.now()}.pdf`;
//   const tempImgPath = `./temp_${Date.now()}`;

//   try {
//     // 1. Save the buffer to a temporary PDF file
//     await require('fs').promises.writeFile(tempPdfPath, buffer);

//     // 2. Convert the PDF pages to images
//     await poppler.pdfToPng(tempPdfPath, tempImgPath, { antialias: true });

//     const files = await require('fs').promises.readdir('.');
//     const imageFiles = files.filter(f => f.startsWith(`temp_${Date.now()}-`));

//     // 3. Run OCR on each image page
//     for (const imageFile of imageFiles) {
//       const { data: { text } } = await Tesseract.recognize(
//         imageFile,
//         'eng', // Set language to English
//         { logger: m => console.log(m) } // Optional logger to see progress
//       );
//       allText += text + " ";
//       // Clean up the temporary image file
//       await require('fs').promises.unlink(imageFile);
//     }
//   } finally {
//     // 4. Clean up the temporary PDF file
//     await require('fs').promises.unlink(tempPdfPath);
//   }

//   return allText.trim();
// };

// export default extractTextFromBase64;

