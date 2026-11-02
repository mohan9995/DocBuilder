import React from 'react';
import { FileItem, TargetFormat } from '../types';
import {
  FileText,
  Image as ImageIcon,
  Download,
  Share2,
  Trash2,
  Settings,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { saveFileNatively, shareFile } from '../services/nativeShare';

interface FileListProps {
  items: FileItem[];
  onUpdateTarget: (id: string, target: TargetFormat) => void;
  onRemoveItem: (id: string) => void;
  onConvertSingle: (id: string) => void;
  onOpenOptions: (item: FileItem) => void;
}

const FORMAT_OPTIONS: { value: TargetFormat; label: string }[] = [
  { value: 'webp', label: 'WEBP' },
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPG' },
  { value: 'pdf', label: 'PDF' },
  { value: 'avif', label: 'AVIF' },
  { value: 'svg', label: 'SVG' },
  { value: 'ico', label: 'ICO' },
  { value: 'bmp', label: 'BMP' },
];

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const FileList: React.FC<FileListProps> = ({
  items,
  onUpdateTarget,
  onRemoveItem,
  onConvertSingle,
  onOpenOptions,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3 mb-8">
      {items.map((item) => {
        const isImage = item.file.type.startsWith('image/');
        const isPdf = item.file.type === 'application/pdf' || item.name.endsWith('.pdf');
        const savingsPercent =
          item.resultSize && item.resultSize < item.size
            ? Math.round(((item.size - item.resultSize) / item.size) * 100)
            : null;

        return (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* File Info & Thumbnail */}
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500 overflow-hidden relative border border-slate-200/60 dark:border-slate-700/60">
                  {isImage && (
                    <img
                      src={URL.createObjectURL(item.file)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                    />
                  )}
                  {isPdf && <FileText className="w-6 h-6 text-red-500" />}
                  {!isImage && !isPdf && <ImageIcon className="w-6 h-6 text-indigo-500" />}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[200px] sm:max-w-xs md:max-w-sm">
                    {item.name}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>{formatBytes(item.size)}</span>
                    <span>•</span>
                    <span className="uppercase font-mono font-medium text-slate-600 dark:text-slate-300">
                      {item.sourceFormat}
                    </span>
                  </div>
                </div>
              </div>

              {/* Conversion Target & Actions */}
              <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                {/* Arrow & Target format selector */}
                <div className="flex items-center space-x-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  <select
                    value={item.targetFormat}
                    disabled={item.status === 'converting'}
                    onChange={(e) => onUpdateTarget(item.id, e.target.value as TargetFormat)}
                    className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    {FORMAT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        to {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Options Gear Button */}
                <button
                  onClick={() => onOpenOptions(item)}
                  title="Configure conversion options"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Status / Convert / Download Button */}
                {item.status === 'idle' && (
                  <button
                    onClick={() => onConvertSingle(item.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 transition-all"
                  >
                    Convert
                  </button>
                )}

                {item.status === 'converting' && (
                  <div className="flex items-center space-x-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 px-3 py-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{item.progress}%</span>
                  </div>
                )}

                {item.status === 'completed' && item.resultBlob && (
                  <div className="flex items-center space-x-1.5">
                    {savingsPercent && savingsPercent > 0 && (
                      <span className="hidden md:inline-block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        -{savingsPercent}%
                      </span>
                    )}
                    <button
                      onClick={() =>
                        item.resultBlob &&
                        item.resultFileName &&
                        saveFileNatively(item.resultBlob, item.resultFileName)
                      }
                      title="Download file"
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center space-x-1 active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() =>
                        item.resultBlob &&
                        item.resultFileName &&
                        shareFile(item.resultBlob, item.resultFileName)
                      }
                      title="Share file"
                      className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {item.status === 'error' && (
                  <div
                    className="flex items-center space-x-1 text-xs text-red-500 px-2 py-1"
                    title={item.error}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Failed</span>
                  </div>
                )}

                {/* Remove Item */}
                <button
                  onClick={() => onRemoveItem(item.id)}
                  title="Remove file"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Converting Progress Bar */}
            {item.status === 'converting' && (
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            )}

            {/* Completed info banner */}
            {item.status === 'completed' && item.resultSize && (
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready ({formatBytes(item.resultSize)})</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400 truncate max-w-[220px]">
                  {item.resultFileName}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
