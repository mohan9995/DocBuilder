import type { ConversionOptions, TargetFormat } from '../types';

/**
 * Loads an image file or blob into an HTMLImageElement
 */
export async function loadImage(file: Blob | File): Promise<HTMLImageElement> {
  let objectUrl = '';
  // Check if it's HEIC / HEIF
  const name = 'name' in file ? (file as File).name.toLowerCase() : '';
  const type = file.type.toLowerCase();

  let processableBlob: Blob = file;

  if (type === 'image/heic' || type === 'image/heif' || name.endsWith('.heic') || name.endsWith('.heif')) {
    try {
      const heic2any = (await import('heic2any')).default;
      const converted = await heic2any({
        blob: file,
        toType: 'image/png',
        quality: 0.95
      });
      processableBlob = Array.isArray(converted) ? converted[0] : converted;
    } catch (err) {
      console.warn('HEIC conversion failed, attempting direct load', err);
    }
  }

  objectUrl = URL.createObjectURL(processableBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode image. Format might be corrupted or unsupported.'));
    };
    img.src = objectUrl;
  });
}

/**
 * Converts an image file to another format client-side using Canvas / SVG / WASM
 */
export async function convertImage(
  file: File,
  targetFormat: TargetFormat,
  options: ConversionOptions
): Promise<{ blob: Blob; fileName: string }> {
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

  // Handle SVG target format
  if (targetFormat === 'svg') {
    // If source is already SVG
    if (file.type.includes('svg') || file.name.endsWith('.svg')) {
      return { blob: file, fileName: `${baseName}.svg` };
    }
    // Convert raster image to an SVG wrapper
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const img = await loadImage(file);
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.naturalWidth}" height="${img.naturalHeight}" viewBox="0 0 ${img.naturalWidth} ${img.naturalHeight}">
  <image width="${img.naturalWidth}" height="${img.naturalHeight}" href="${dataUrl}"/>
</svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    return { blob, fileName: `${baseName}.svg` };
  }

  // Load image into canvas
  const img = await loadImage(file);
  let targetWidth = img.naturalWidth;
  let targetHeight = img.naturalHeight;

  if (targetFormat === 'ico') {
    // Standard icon dimension
    targetWidth = options.resizeWidth || 64;
    targetHeight = options.resizeHeight || 64;
  } else if (options.resizeWidth || options.resizeHeight) {
    if (options.maintainAspectRatio) {
      if (options.resizeWidth && !options.resizeHeight) {
        targetWidth = options.resizeWidth;
        targetHeight = Math.round((img.naturalHeight * options.resizeWidth) / img.naturalWidth);
      } else if (!options.resizeWidth && options.resizeHeight) {
        targetHeight = options.resizeHeight;
        targetWidth = Math.round((img.naturalWidth * options.resizeHeight) / img.naturalHeight);
      } else if (options.resizeWidth && options.resizeHeight) {
        const ratio = Math.min(
          options.resizeWidth / img.naturalWidth,
          options.resizeHeight / img.naturalHeight
        );
        targetWidth = Math.round(img.naturalWidth * ratio);
        targetHeight = Math.round(img.naturalHeight * ratio);
      }
    } else {
      targetWidth = options.resizeWidth || img.naturalWidth;
      targetHeight = options.resizeHeight || img.naturalHeight;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context is not available.');
  }

  // Enable high quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // If converting to JPEG or BMP, fill transparent background with white
  if (targetFormat === 'jpeg' || (targetFormat as string) === 'jpg' || targetFormat === 'bmp') {
    ctx.fillStyle = options.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Determine MIME type
  let mimeType = 'image/png';
  let extension = targetFormat.toLowerCase();

  switch (targetFormat) {
    case 'jpeg':
      mimeType = 'image/jpeg';
      extension = 'jpg';
      break;
    case 'webp':
      mimeType = 'image/webp';
      break;
    case 'avif':
      mimeType = 'image/avif';
      break;
    case 'bmp':
      mimeType = 'image/bmp';
      break;
    case 'ico':
      mimeType = 'image/x-icon';
      break;
    case 'gif':
      mimeType = 'image/gif';
      break;
    default:
      mimeType = 'image/png';
      extension = 'png';
      break;
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          // Fallback if browser doesn't support direct toBlob for AVIF or BMP
          try {
            const dataUrl = canvas.toDataURL('image/png');
            fetch(dataUrl)
              .then((res) => res.blob())
              .then((b) => resolve({ blob: b, fileName: `${baseName}.${extension}` }))
              .catch(reject);
          } catch (e) {
            reject(new Error(`Failed to convert image to ${targetFormat}`));
          }
          return;
        }
        resolve({ blob, fileName: `${baseName}.${extension}` });
      },
      mimeType,
      options.quality
    );
  });
}
