export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'avif' | 'gif' | 'bmp' | 'ico' | 'svg';
export type DocumentFormat = 'pdf' | 'txt' | 'md' | 'json';
export type TargetFormat = ImageFormat | DocumentFormat;

export type ConversionStatus = 'idle' | 'converting' | 'completed' | 'error';

export interface ConversionOptions {
  // Image options
  quality: number; // 0.1 to 1.0 (default 0.9)
  resizeWidth?: number;
  resizeHeight?: number;
  maintainAspectRatio: boolean;
  backgroundColor?: string; // e.g. '#ffffff' for transparent PNG -> JPEG

  // PDF options
  pdfPageSize: 'fit' | 'a4' | 'letter';
  pdfOrientation: 'portrait' | 'landscape';
  pdfMargin: number; // in pt
  pdfDpi: number; // 72 to 300 for PDF to image rendering
}

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  sourceFormat: string;
  targetFormat: TargetFormat;
  status: ConversionStatus;
  progress: number;
  resultBlob?: Blob;
  resultUrl?: string;
  resultFileName?: string;
  resultSize?: number;
  error?: string;
  options: ConversionOptions;
}

export interface FormatCategory {
  id: string;
  label: string;
  formats: { id: TargetFormat; label: string; description: string }[];
}
