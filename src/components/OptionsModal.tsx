import React, { useState } from 'react';
import { FileItem, ConversionOptions } from '../types';
import { X, Sliders, Check } from 'lucide-react';

interface OptionsModalProps {
  item: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveOptions: (id: string, options: ConversionOptions) => void;
}

export const OptionsModal: React.FC<OptionsModalProps> = ({
  item,
  isOpen,
  onClose,
  onSaveOptions,
}) => {
  if (!isOpen || !item) return null;

  const [options, setOptions] = useState<ConversionOptions>({ ...item.options });

  const handleSave = () => {
    onSaveOptions(item.id, options);
    onClose();
  };

  const isPdfTarget = item.targetFormat === 'pdf';
  const isImageTarget = ['png', 'jpeg', 'webp', 'avif', 'gif', 'bmp', 'ico', 'svg'].includes(item.targetFormat);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Conversion Settings
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-[220px]">
                {item.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Quality Slider (Images) */}
          {isImageTarget && item.targetFormat !== 'png' && item.targetFormat !== 'svg' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider">
                  Output Quality
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {Math.round(options.quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={options.quality}
                onChange={(e) => setOptions({ ...options, quality: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Lower quality creates smaller file sizes for faster loading.
              </p>
            </div>
          )}

          {/* Resize options (Images) */}
          {isImageTarget && item.targetFormat !== 'svg' && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="font-semibold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider block">
                Resize Dimensions (Optional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Width (px)</label>
                  <input
                    type="number"
                    placeholder="Auto"
                    value={options.resizeWidth || ''}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        resizeWidth: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Height (px)</label>
                  <input
                    type="number"
                    placeholder="Auto"
                    value={options.resizeHeight || ''}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        resizeHeight: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={options.maintainAspectRatio}
                  onChange={(e) =>
                    setOptions({ ...options, maintainAspectRatio: e.target.checked })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Preserve aspect ratio (recommended)
                </span>
              </label>
            </div>
          )}

          {/* PDF Page Settings (When target is PDF) */}
          {isPdfTarget && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="font-semibold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider block">
                PDF Document Settings
              </label>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Page Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['fit', 'a4', 'letter'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setOptions({ ...options, pdfPageSize: size })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                        options.pdfPageSize === size
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {size === 'fit' ? 'Auto Fit' : size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Page Orientation</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['portrait', 'landscape'] as const).map((ori) => (
                    <button
                      key={ori}
                      type="button"
                      onClick={() => setOptions({ ...options, pdfOrientation: ori })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                        options.pdfOrientation === ori
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {ori}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Margins: {options.pdfMargin} pt
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={options.pdfMargin}
                  onChange={(e) =>
                    setOptions({ ...options, pdfMargin: parseInt(e.target.value) })
                  }
                  className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* PDF to Image DPI (when source is PDF) */}
          {item.sourceFormat === 'pdf' && isImageTarget && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="font-semibold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider block">
                PDF Rendering Resolution (DPI)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { dpi: 72, label: '72 (Web)' },
                  { dpi: 150, label: '150 (Clear)' },
                  { dpi: 300, label: '300 (Print)' },
                ].map((itemDpi) => (
                  <button
                    key={itemDpi.dpi}
                    type="button"
                    onClick={() => setOptions({ ...options, pdfDpi: itemDpi.dpi })}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      options.pdfDpi === itemDpi.dpi
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {itemDpi.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
