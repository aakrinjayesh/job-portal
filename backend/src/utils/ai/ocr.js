import Tesseract from "tesseract.js";
import puppeteer from "puppeteer";
import PDFParser from "pdf2json";
import { pathToFileURL } from "url";
import fs from "fs";
import path from "path";
import os from "os";
import { logger } from "../logger.js";

// ─── Get total page count from PDF buffer ────────────────────────────────────
const getPdfPageCount = (buffer) =>
  new Promise((resolve) => {
    const parser = new PDFParser(null, 1);
    parser.on("pdfParser_dataReady", (d) =>
      resolve(Math.max(d.Pages?.length || 1, 1))
    );
    parser.on("pdfParser_dataError", () => resolve(1));
    parser.parseBuffer(buffer);
  });

// ─── Fast buffer comparison (samples every ~100th byte) ──────────────────────
const buffersLookSame = (a, b) => {
  if (a.length !== b.length) return false;
  const step = Math.max(1, Math.floor(a.length / 100));
  for (let i = 0; i < a.length; i += step) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

// ─── Render each PDF page to a PNG screenshot via Chrome PDF viewer ──────────
const pdfToPageImages = async (buffer) => {
  const pageCount = await getPdfPageCount(buffer);
  logger.info(`PDF page count detected: ${pageCount}`);

  const tempPath = path.join(os.tmpdir(), `ocr_${Date.now()}.pdf`);
  fs.writeFileSync(tempPath, buffer);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const screenshots = [];

  try {
    const fileUrl = pathToFileURL(tempPath).href;
    const limit = Math.min(pageCount, 20); // safety cap

    for (let i = 1; i <= limit; i++) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1240, height: 1754 }); // A4

      // Chrome PDF viewer supports #page=N for direct page navigation
      await page.goto(`${fileUrl}#page=${i}`, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      // Give Chrome's PDF renderer time to fully paint the page
      await new Promise((r) => setTimeout(r, 1500));

      const shot = await page.screenshot({ type: "png" });

      // If screenshot looks identical to previous, Chrome looped to last page — stop
      if (
        screenshots.length > 0 &&
        buffersLookSame(shot, screenshots[screenshots.length - 1])
      ) {
        logger.info(`Duplicate screenshot detected at page ${i} — stopping`);
        await page.close();
        break;
      }

      screenshots.push(shot);
      await page.close();
      logger.info(`Captured page ${i}/${limit}`);
    }
  } finally {
    await browser.close();
    try {
      fs.unlinkSync(tempPath);
    } catch {}
  }

  return screenshots;
};

// ─── Main export: OCR all pages and return combined text ─────────────────────
export const extractTextWithOCR = async (buffer) => {
  logger.info("OCR fallback triggered for scanned PDF");

  let pageImages;
  try {
    pageImages = await pdfToPageImages(buffer);
    logger.info(`Rendered ${pageImages.length} page(s) via puppeteer`);
  } catch (renderErr) {
    logger.error("PDF render failed:", renderErr.message);
    return "";
  }

  if (pageImages.length === 0) return "";

  const texts = [];

  for (let i = 0; i < pageImages.length; i++) {
    logger.info(`OCR processing page ${i + 1}/${pageImages.length}`);

    const {
      data: { text },
    } = await Tesseract.recognize(pageImages[i], "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          logger.info(
            `Page ${i + 1} OCR: ${Math.round(m.progress * 100)}%`
          );
        }
      },
    });

    if (text?.trim()) texts.push(text.trim());
  }

  const combined = texts.join("\n\n");
  logger.info(
    `OCR complete. Pages: ${pageImages.length}, Characters: ${combined.length}`
  );
  return combined;
};
