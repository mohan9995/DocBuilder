import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { saveAs } from 'file-saver';

/**
 * Checks if the current app is running in a native mobile container (iOS / Android)
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Gets the current platform name: 'ios' | 'android' | 'web'
 */
export function getPlatformName(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}

/**
 * Converts a Blob to a Base64 string
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Saves or shares a converted file using native mobile APIs or web download
 */
export async function saveFileNatively(blob: Blob, fileName: string): Promise<void> {
  if (isNativePlatform()) {
    try {
      const base64Data = await blobToBase64(blob);

      // Write to Cache / Documents directory
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });

      // Present Native Share Sheet (Save to Files, AirDrop, etc.)
      await Share.share({
        title: `Converted File: ${fileName}`,
        text: `Here is your converted file: ${fileName}`,
        url: savedFile.uri,
        dialogTitle: 'Share or Save Converted File',
      });
      return;
    } catch (err) {
      console.warn('Native share failed, falling back to web download', err);
    }
  }

  // Web Browser / Laptop download fallback
  saveAs(blob, fileName);
}

/**
 * Triggers native system share dialog for a file if supported
 */
export async function shareFile(blob: Blob, fileName: string): Promise<boolean> {
  if (isNativePlatform()) {
    try {
      const base64Data = await blobToBase64(blob);
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });

      await Share.share({
        title: fileName,
        url: savedFile.uri,
      });
      return true;
    } catch (err) {
      console.warn('Capacitor share failed', err);
      return false;
    }
  }

  // Web Share API fallback (supported on Safari / Chrome mobile)
  if (navigator.canShare && navigator.share) {
    try {
      const file = new File([blob], fileName, { type: blob.type });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: fileName,
        });
        return true;
      }
    } catch (err) {
      console.warn('Web share failed', err);
    }
  }

  // Fallback to direct download
  saveAs(blob, fileName);
  return true;
}
