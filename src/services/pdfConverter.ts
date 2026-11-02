import { PDFDocument, PageSizes, StandardFonts, rgb, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import type { ConversionOptions, TargetFormat, TextAnnotation, SignatureAnnotation, WatermarkConfig } from '../types';
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


/**
 * Bakes annotations, signatures, watermarks, rotations, and deletions permanently into a PDF document
 */
export async function bakePdfAnnotations(
  file: File,
  params: {
    textAnnotations: TextAnnotation[];
    signatures: SignatureAnnotation[];
    watermark?: WatermarkConfig;
    rotations?: Record<number, number>; // pageNumber (1-based) -> additional degrees
    deletedPages?: number[]; // pageNumbers (1-based)
  }
): Promise<{ blob: Blob; fileName: string }> {
  const fileBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBytes);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const totalPages = pdfDoc.getPageCount();

  // Apply rotations
  if (params.rotations) {
    for (const [pageNumStr, deg] of Object.entries(params.rotations)) {
      const pageNum = parseInt(pageNumStr);
      if (pageNum >= 1 && pageNum <= totalPages) {
        const page = pdfDoc.getPage(pageNum - 1);
        const currentRot = page.getRotation().angle;
        page.setRotation(degrees((currentRot + deg) % 360));
      }
    }
  }

  // Apply text annotations
  for (const ann of params.textAnnotations) {
    if (ann.page >= 1 && ann.page <= totalPages) {
      const page = pdfDoc.getPage(ann.page - 1);
      const { width, height } = page.getSize();
      const x = (ann.xPercent / 100) * width;
      const y = height - (ann.yPercent / 100) * height - ann.fontSize;

      // Color parsing
      let textColor = rgb(0.1, 0.1, 0.1);
      if (ann.color === 'blue') textColor = rgb(0.1, 0.2, 0.8);
      else if (ann.color === 'red') textColor = rgb(0.85, 0.15, 0.15);
      else if (ann.color === 'white') textColor = rgb(1, 1, 1);

      page.drawText(ann.text, {
        x,
        y,
        size: ann.fontSize,
        font: ann.isBold ? boldFont : regularFont,
        color: textColor,
      });
    }
  }

  // Apply signatures
  for (const sig of params.signatures) {
    if (sig.page >= 1 && sig.page <= totalPages) {
      const page = pdfDoc.getPage(sig.page - 1);
      const { width, height } = page.getSize();
      const sigBytes = await fetch(sig.dataUrl).then((res) => res.arrayBuffer());
      const sigImage = await pdfDoc.embedPng(sigBytes);

      const sigWidth = (sig.widthPercent / 100) * width;
      const sigHeight = (sig.heightPercent / 100) * height;
      const x = (sig.xPercent / 100) * width;
      const y = height - (sig.yPercent / 100) * height - sigHeight;

      page.drawImage(sigImage, {
        x,
        y,
        width: sigWidth,
        height: sigHeight,
      });
    }
  }

  // Apply watermarks
  if (params.watermark && params.watermark.enabled && params.watermark.text) {
    for (let i = 0; i < totalPages; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      page.drawText(params.watermark.text, {
        x: width / 4,
        y: height / 3,
        size: 54,
        font: boldFont,
        color: rgb(0.7, 0.7, 0.7),
        opacity: params.watermark.opacity || 0.2,
        rotate: degrees(45),
      });
    }
  }

  // Delete pages (in reverse order to keep indices valid)
  if (params.deletedPages && params.deletedPages.length > 0) {
    const sortedDeletions = [...new Set(params.deletedPages)].sort((a, b) => b - a);
    for (const pageNum of sortedDeletions) {
      if (pageNum >= 1 && pageNum <= pdfDoc.getPageCount()) {
        pdfDoc.removePage(pageNum - 1);
      }
    }
  }

  const bakedBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(bakedBytes) as unknown as BlobPart], { type: 'application/pdf' });
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  return { blob, fileName: `${baseName}_signed.pdf` };
}
