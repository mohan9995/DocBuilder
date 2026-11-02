import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { FileItem } from '../types';
import { saveFileNatively } from './nativeShare';

/**
 * Zips all completed file items and downloads or shares the archive
 */
export async function downloadAllAsZip(items: FileItem[], zipName = 'converted_files.zip'): Promise<void> {
  const completedItems = items.filter((item) => item.status === 'completed' && item.resultBlob);
  if (completedItems.length === 0) return;

  const zip = new JSZip();

  completedItems.forEach((item) => {
    if (item.resultBlob && item.resultFileName) {
      zip.file(item.resultFileName, item.resultBlob);
    }
  });

  const content = await zip.generateAsync({ type: 'blob' });
  await saveFileNatively(content, zipName);
}
