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
  backgroundColor?: string;

  // PDF options
  pdfPageSize: 'fit' | 'a4' | 'letter';
  pdfOrientation: 'portrait' | 'landscape';
  pdfMargin: number;
  pdfDpi: number;
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
  thumbnailUrl?: string;
  options: ConversionOptions;
}

export interface TextAnnotation {
  id: string;
  page: number;
  xPercent: number; // 0 to 100 relative to page width
  yPercent: number; // 0 to 100 relative to page height
  text: string;
  fontSize: number;
  color: string;
  isBold?: boolean;
  isCallout?: boolean; // Help (i) icon mode
  isOpen?: boolean; // Callout popover open state
}

export interface SignatureAnnotation {
  id: string;
  page: number;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  dataUrl: string;
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  opacity: number;
  color: string;
}
