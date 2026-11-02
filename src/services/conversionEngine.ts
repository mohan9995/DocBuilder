import type { FileItem } from '../types';
import { convertImage } from './imageConverter';
import { imagesToPdf, pdfToImages } from './pdfConverter';

export function detectFormat(file: File): string {
  const nameParts = file.name.split('.');
  if (nameParts.length > 1) {
    const ext = nameParts.pop()?.toLowerCase();
    if (ext) return ext;
  }
  if (file.type.includes('png')) return 'png';
  if (file.type.includes('jpeg') || file.type.includes('jpg')) return 'jpeg';
  if (file.type.includes('webp')) return 'webp';
  if (file.type.includes('pdf')) return 'pdf';
  if (file.type.includes('svg')) return 'svg';
  if (file.type.includes('gif')) return 'gif';
  return 'unknown';
}

/**
 * Executes a file conversion based on source and target types
 */
export async function executeConversion(
  item: FileItem,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob; fileName: string; size: number }> {
  const sourceFormat = item.sourceFormat.toLowerCase();
  const targetFormat = item.targetFormat.toLowerCase();

  if (onProgress) onProgress(20);

  // Case 1: Image to Image conversion
  const isSourceImage = ['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'bmp', 'ico', 'svg', 'heic', 'heif'].includes(sourceFormat);
  const isTargetImage = ['png', 'jpeg', 'webp', 'avif', 'gif', 'bmp', 'ico', 'svg'].includes(targetFormat);

  if (isSourceImage && isTargetImage) {
    if (onProgress) onProgress(50);
    const result = await convertImage(item.file, item.targetFormat, item.options);
    if (onProgress) onProgress(100);
    return {
      blob: result.blob,
      fileName: result.fileName,
      size: result.blob.size,
    };
  }

  // Case 2: Image to PDF conversion
  if (isSourceImage && targetFormat === 'pdf') {
    if (onProgress) onProgress(50);
    const result = await imagesToPdf([item.file], item.options);
    if (onProgress) onProgress(100);
    return {
      blob: result.blob,
      fileName: result.fileName,
      size: result.blob.size,
    };
  }

  // Case 3: PDF to Image conversion
  if (sourceFormat === 'pdf' && isTargetImage) {
    if (onProgress) onProgress(40);
    const results = await pdfToImages(
      item.file,
      item.targetFormat,
      item.options,
      (current, total) => {
        if (onProgress) {
          onProgress(Math.round(40 + (current / total) * 55));
        }
      }
    );

    if (results.length === 0) {
      throw new Error('PDF has no pages to convert.');
    }

    // If PDF is 1 page, return the image directly
    if (results.length === 1) {
      if (onProgress) onProgress(100);
      return {
        blob: results[0].blob,
        fileName: results[0].fileName,
        size: results[0].blob.size,
      };
    }

    // If PDF is multi-page, package pages into a ZIP automatically
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    results.forEach((r) => {
      zip.file(r.fileName, r.blob);
    });
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const baseName = item.file.name.substring(0, item.file.name.lastIndexOf('.')) || item.file.name;
    if (onProgress) onProgress(100);

    return {
      blob: zipBlob,
      fileName: `${baseName}_pages_${targetFormat}.zip`,
      size: zipBlob.size,
    };
  }

  throw new Error(`Conversion from ${sourceFormat.toUpperCase()} to ${targetFormat.toUpperCase()} is currently unsupported on-device.`);
}
