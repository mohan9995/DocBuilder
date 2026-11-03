import React from 'react';
import { ConversionOptions, TargetFormat, FileItem } from '../../types';
import {
  Sparkles,
  Download,
  Share2,
  Sliders,
  Scale,
  Gauge,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { saveFileNatively, shareFile } from '../../services/nativeShare';
import { sounds } from '../../services/soundService';

interface BentoControlsTileProps {
  activeItem: FileItem | null;
  targetFormat: TargetFormat;
  options: ConversionOptions;
  setOptions: React.Dispatch<React.SetStateAction<ConversionOptions>>;
  onConvert: () => void;
  isConverting: boolean;
}

export const BentoControlsTile: React.FC<BentoControlsTileProps> = ({
  activeItem,
  targetFormat,
  options,
  setOptions,
  onConvert,
  isConverting,
}) => {
  const isImageTarget = ['png', 'jpeg', 'webp', 'avif', 'gif', 'bmp', 'ico', 'svg'].includes(targetFormat);

  // Quick budget helper
  const handleSetQuality = (q: number) => {
    sounds.playTick();
    setOptions((prev) => ({ ...prev, quality: q }));
  };

  const isCompleted = activeItem?.status === 'completed';

  return (
    <div className="bg-slate-900/90 dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl border border-slate-800/80 p-3.5 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sm:gap-6">
        {/* Left: Quality & Budget Sliders */}
        <div className="flex-1 space-y-3 sm:space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
            <Gauge className="w-4 h-4 text-indigo-400" />
            <span>Optimization & Weight Tuning</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Real-time Quality Slider */}
            <div className="space-y-1.5 bg-slate-950/40 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-800/60">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Quality & Compression</span>
                <span className="font-mono font-bold text-indigo-400">
                  {Math.round(options.quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={options.quality}
                onChange={(e) => {
                  setOptions((prev) => ({ ...prev, quality: parseFloat(e.target.value) }));
                }}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Smallest</span>
                <span>Balanced (85%)</span>
                <span>Lossless</span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-1.5 bg-slate-950/40 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-800/60">
              <span className="text-slate-400 text-xs block">Target Size Budget</span>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[
                  { label: 'Max', q: 0.95 },
                  { label: '85%', q: 0.85 },
                  { label: '70%', q: 0.70 },
                  { label: '50%', q: 0.50 },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSetQuality(item.q)}
                    className={`px-2 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                      Math.abs(options.quality - item.q) < 0.04
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 block pt-0.5">
                Adjusts real-time comparison preview live on the stage
              </span>
            </div>
          </div>
        </div>

        {/* Right: Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 lg:pl-6 lg:border-l lg:border-slate-800">
          {/* If already completed, show Save & Share options */}
          {isCompleted && activeItem?.resultBlob && activeItem.resultFileName ? (
            <div className="flex items-center space-x-2.5 w-full sm:w-auto">
              <button
                onClick={() =>
                  activeItem.resultBlob &&
                  activeItem.resultFileName &&
                  saveFileNatively(activeItem.resultBlob, activeItem.resultFileName)
                }
                className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Save {targetFormat.toUpperCase()}</span>
              </button>

              <button
                onClick={() =>
                  activeItem.resultBlob &&
                  activeItem.resultFileName &&
                  shareFile(activeItem.resultBlob, activeItem.resultFileName)
                }
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-md transition-all active:scale-95"
                title="Share via native share sheet"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={onConvert}
                disabled={isConverting}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shadow-md transition-all active:scale-95"
                title="Re-convert with new settings"
              >
                <RefreshCw className={`w-4 h-4 ${isConverting ? 'animate-spin' : ''}`} />
              </button>
            </div>
          ) : (
            /* Primary Convert CTA */
            <button
              onClick={onConvert}
              disabled={!activeItem || isConverting}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center justify-center space-x-2.5 active:scale-95 ${
                !activeItem || isConverting
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing File...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Convert to {targetFormat.toUpperCase()}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
