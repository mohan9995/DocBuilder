import React from 'react';
import { ConversionOptions } from '../types';
import { X, Sliders, Check } from 'lucide-react';

interface QuickSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  options: ConversionOptions;
  setOptions: React.Dispatch<React.SetStateAction<ConversionOptions>>;
}

export const QuickSettingsDrawer: React.FC<QuickSettingsDrawerProps> = ({
  isOpen,
  onClose,
  options,
  setOptions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl max-w-md w-full border border-white/60 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Output Preferences
              </h3>
              <p className="text-xs text-slate-500">
                Applied to all radial conversions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Quality Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider">
                Image Quality & Compression
              </label>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                {Math.round(options.quality * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={options.quality}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, quality: parseFloat(e.target.value) }))
              }
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              85% - 90% is the optimal balance between visual clarity and lightweight file size.
            </p>
          </div>

          {/* Resize options */}
          <div className="space-y-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
            <label className="font-semibold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider block">
              Optional Resizing
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Width (px)</label>
                <input
                  type="number"
                  placeholder="Auto (natural)"
                  value={options.resizeWidth || ''}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      resizeWidth: e.target.value ? parseInt(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Height (px)</label>
                <input
                  type="number"
                  placeholder="Auto (natural)"
                  value={options.resizeHeight || ''}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      resizeHeight: e.target.value ? parseInt(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>

            <label className="flex items-center space-x-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={options.maintainAspectRatio}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    maintainAspectRatio: e.target.checked,
                  }))
                }
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Maintain aspect ratio
              </span>
            </label>
          </div>

          {/* PDF Page Settings */}
          <div className="space-y-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
            <label className="font-semibold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider block">
              PDF Page Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['fit', 'a4', 'letter'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setOptions((prev) => ({ ...prev, pdfPageSize: size }))}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    options.pdfPageSize === size
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {size === 'fit' ? 'Auto Fit' : size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-200/60 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
