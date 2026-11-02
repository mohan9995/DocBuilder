import React from 'react';
import { TargetFormat } from '../types';
import { Play, Download, Trash2, Combine, Sparkles, Loader2 } from 'lucide-react';

interface ConversionToolbarProps {
  itemsCount: number;
  completedCount: number;
  isConverting: boolean;
  globalTarget: TargetFormat;
  onSetGlobalTarget: (format: TargetFormat) => void;
  onConvertAll: () => void;
  onDownloadAllZip: () => void;
  onCombineToPdf: () => void;
  onClearAll: () => void;
}

const AVAILABLE_FORMATS: { format: TargetFormat; label: string; group: 'Image' | 'Document' }[] = [
  { format: 'webp', label: 'WEBP (High Compression)', group: 'Image' },
  { format: 'png', label: 'PNG (Lossless & Alpha)', group: 'Image' },
  { format: 'jpeg', label: 'JPG / JPEG (Standard)', group: 'Image' },
  { format: 'pdf', label: 'PDF (Document)', group: 'Document' },
  { format: 'avif', label: 'AVIF (Next-Gen)', group: 'Image' },
  { format: 'svg', label: 'SVG (Vector Container)', group: 'Image' },
  { format: 'ico', label: 'ICO (App Icon)', group: 'Image' },
  { format: 'bmp', label: 'BMP (Bitmap)', group: 'Image' },
];

export const ConversionToolbar: React.FC<ConversionToolbarProps> = ({
  itemsCount,
  completedCount,
  isConverting,
  globalTarget,
  onSetGlobalTarget,
  onConvertAll,
  onDownloadAllZip,
  onCombineToPdf,
  onClearAll,
}) => {
  if (itemsCount === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-all mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Summary & Global Target Selector */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              {itemsCount} {itemsCount === 1 ? 'file' : 'files'}
            </span>
            {completedCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-medium">
                {completedCount} ready
              </span>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          {/* Global Target Dropdown */}
          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Convert all to:
            </label>
            <select
              value={globalTarget}
              onChange={(e) => onSetGlobalTarget(e.target.value as TargetFormat)}
              className="text-sm font-semibold bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              {AVAILABLE_FORMATS.map((item) => (
                <option key={item.format} value={item.format}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
          {/* Combine to 1 PDF button */}
          {itemsCount > 1 && (
            <button
              onClick={onCombineToPdf}
              title="Merge all images into a single multi-page PDF"
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800/60 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors flex items-center space-x-1.5"
            >
              <Combine className="w-3.5 h-3.5" />
              <span>Merge to 1 PDF</span>
            </button>
          )}

          {/* Download All as ZIP (visible when completed items exist) */}
          {completedCount > 0 && (
            <button
              onClick={onDownloadAllZip}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP ({completedCount})</span>
            </button>
          )}

          {/* Convert All CTA */}
          <button
            onClick={onConvertAll}
            disabled={isConverting}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all flex items-center space-x-2 active:scale-95 ${
              isConverting
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Converting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Convert All</span>
              </>
            )}
          </button>

          {/* Clear All */}
          <button
            onClick={onClearAll}
            disabled={isConverting}
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Clear list"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
