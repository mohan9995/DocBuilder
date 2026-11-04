import * as pdfjsLib from 'pdfjs-dist';

// Ensure PDF.js uses the local worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.js', window.location.href).href;
}

export interface PageThumbnail {
  pageNumber: number; // 1-based
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Loads a PDF file and generates thumbnails for all pages progressively
 */
export async function generatePdfThumbnails(
  file: File,
  options?: {
    maxDim?: number;
    onPageProgress?: (page: PageThumbnail, totalPages: number) => void;
    signal?: AbortSignal;
  }
): Promise<{ pageCount: number; thumbnails: PageThumbnail[] }> {
  const maxDim = options?.maxDim || 280;
  const arrayBuffer = await file.arrayBuffer();

  if (options?.signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const cMapBase = typeof window !== 'undefined' ? new URL('cmaps/', window.location.href).href : './cmaps/';
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: cMapBase,
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const thumbnails: PageThumbnail[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    if (options?.signal?.aborted) {
      break;
    }

    const page = await pdf.getPage(pageNum);
    const unscaledViewport = page.getViewport({ scale: 1.0 });

    // Calculate scale to fit within thumbnail bounding box while preserving aspect ratio
    const scale = Math.min(maxDim / unscaledViewport.width, maxDim / unscaledViewport.height);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Clean white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const thumb: PageThumbnail = {
        pageNumber: pageNum,
        dataUrl,
        width: canvas.width,
        height: canvas.height,
      };

      thumbnails.push(thumb);
      if (options?.onPageProgress) {
        options.onPageProgress(thumb, totalPages);
      }
    }
  }

  return { pageCount: totalPages, thumbnails };
}

/**
 * Renders a single high-definition page for inspection / zooming modal
 */
export async function renderHighResPage(
  file: File,
  pageNumber: number,
  targetDpi: number = 150
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const cMapBase = typeof window !== 'undefined' ? new URL('cmaps/', window.location.href).href : './cmaps/';
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: cMapBase,
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;
  if (pageNumber < 1 || pageNumber > pdf.numPages) {
    throw new Error(`Page ${pageNumber} out of range (1-${pdf.numPages})`);
  }

  const page = await pdf.getPage(pageNumber);
  const scale = targetDpi / 72;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to create canvas 2D context');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  return canvas.toDataURL('image/jpeg', 0.92);
}
