import { PDFDocument, PageSizes } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import type { ConversionOptions, TargetFormat } from '../types';
import { loadImage } from './imageConverter';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker || 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

/**
 * Converts a single or multiple images to a single PDF document
 */
export async function imagesToPdf(
  files: (File | Blob)[],
  options: ConversionOptions
): Promise<{ blob: Blob; fileName: string }> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const img = await loadImage(file);

    // Convert image to PNG / JPEG buffer for pdf-lib embedding
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    // Embed as PNG
    const dataUrl = canvas.toDataURL('image/png');
    const imageBytes = await fetch(dataUrl).then((res) => res.arrayBuffer());
    const embeddedImage = await pdfDoc.embedPng(imageBytes);

    let pageWidth = img.naturalWidth;
    let pageHeight = img.naturalHeight;

    if (options.pdfPageSize === 'a4') {
      [pageWidth, pageHeight] = PageSizes.A4;
    } else if (options.pdfPageSize === 'letter') {
      [pageWidth, pageHeight] = PageSizes.Letter;
    }

    if (options.pdfOrientation === 'landscape' && pageWidth < pageHeight) {
      const temp = pageWidth;
      pageWidth = pageHeight;
      pageHeight = temp;
    } else if (options.pdfOrientation === 'portrait' && pageWidth > pageHeight) {
      const temp = pageWidth;
      pageWidth = pageHeight;
      pageHeight = temp;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const margin = options.pdfMargin || 0;

    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;

    if (options.pdfPageSize === 'fit') {
      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });
    } else {
      // Scale to fit page preserving aspect ratio
      const scale = Math.min(
        availableWidth / embeddedImage.width,
        availableHeight / embeddedImage.height
      );
      const scaledWidth = embeddedImage.width * scale;
      const scaledHeight = embeddedImage.height * scale;

      const x = margin + (availableWidth - scaledWidth) / 2;
      const y = margin + (availableHeight - scaledHeight) / 2;

      page.drawImage(embeddedImage, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes) as unknown as BlobPart], { type: 'application/pdf' });
  const firstFileName = 'name' in files[0] ? (files[0] as File).name : 'document';
  const baseName = firstFileName.substring(0, firstFileName.lastIndexOf('.')) || firstFileName;
  const fileName = files.length > 1 ? `${baseName}_combined.pdf` : `${baseName}.pdf`;

  return { blob, fileName };
}

/**
 * Converts a PDF document into images (one per page or first page)
 */
export async function pdfToImages(
  file: File,
  targetFormat: TargetFormat,
  options: ConversionOptions,
  onProgress?: (current: number, total: number) => void
): Promise<{ blob: Blob; fileName: string; pageIndex?: number }[]> {
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const results: { blob: Blob; fileName: string; pageIndex?: number }[] = [];

  const scale = (options.pdfDpi || 150) / 72; // Standard PDF DPI is 72

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) continue;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;

    let mimeType = 'image/png';
    let ext = 'png';
    if (targetFormat === 'jpeg') {
      mimeType = 'image/jpeg';
      ext = 'jpg';
    } else if (targetFormat === 'webp') {
      mimeType = 'image/webp';
      ext = 'webp';
    }

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to render page to image blob'));
        },
        mimeType,
        options.quality
      );
    });

    const pageSuffix = totalPages > 1 ? `_page_${pageNum}` : '';
    results.push({
      blob,
      fileName: `${baseName}${pageSuffix}.${ext}`,
      pageIndex: pageNum,
    });

    if (onProgress) {
      onProgress(pageNum, totalPages);
    }
  }

  return results;
}

/**
 * Merges multiple PDF files into one combined PDF
 */
export async function mergePdfs(files: File[]): Promise<{ blob: Blob; fileName: string }> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const fileBytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  const blob = new Blob([new Uint8Array(mergedPdfBytes) as unknown as BlobPart], { type: 'application/pdf' });
  return { blob, fileName: 'merged_document.pdf' };
}

/**
 * Splits a PDF or extracts specific pages
 */
export async function splitPdf(
  file: File,
  pageNumbers: number[]
): Promise<{ blob: Blob; fileName: string }> {
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const fileBytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(fileBytes);

  const newPdf = await PDFDocument.create();
  // PDF indices are 0-based
  const zeroBasedIndices = pageNumbers.map((n) => n - 1).filter((i) => i >= 0 && i < pdf.getPageCount());

  const copiedPages = await newPdf.copyPages(pdf, zeroBasedIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const newPdfBytes = await newPdf.save();
  const blob = new Blob([new Uint8Array(newPdfBytes) as unknown as BlobPart], { type: 'application/pdf' });
  return { blob, fileName: `${baseName}_extracted.pdf` };
}
