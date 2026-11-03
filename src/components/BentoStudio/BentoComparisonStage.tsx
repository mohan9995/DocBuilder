import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileItem } from '../../types';
import {
  Upload,
  Split,
  Eye,
  Info,
  Maximize2,
  FileText,
  Sparkles,
  Camera,
} from 'lucide-react';
import { sounds } from '../../services/soundService';

interface BentoComparisonStageProps {
  activeItem: FileItem | null;
  previewUrl: string | null;
  onFilesAdded: (files: File[]) => void;
  isConverting: boolean;
  quality: number;
}

export const BentoComparisonStage: React.FC<BentoComparisonStageProps> = ({
  activeItem,
  previewUrl,
  onFilesAdded,
  isConverting,
  quality,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100%
  const [isDragging, setIsDragging] = useState(false);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; aspect: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Original image URL
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  useEffect(() => {
    if (activeItem && activeItem.file.type.startsWith('image/')) {
      const url = URL.createObjectURL(activeItem.file);
      setOriginalUrl(url);

      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const divisor = gcd(w, h);
        const aspect = `${Math.round(w / divisor)}:${Math.round(h / divisor)}`;
        setImageMeta({ width: w, height: h, aspect: w === h ? '1:1' : aspect });
      };
      img.src = url;

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setOriginalUrl(null);
      setImageMeta(null);
    }
  }, [activeItem]);

  const handlePointerMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const newPos = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(newPos);
    },
    []
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) handlePointerMove(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) handlePointerMove(e.touches[0].clientX);
    };
    const onStop = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onStop);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onStop);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onStop);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onStop);
    };
  }, [isDragging, handlePointerMove]);

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  const isImage = activeItem && activeItem.file.type.startsWith('image/');
  const currentPreview = previewUrl || (activeItem?.resultUrl ?? originalUrl);

  const savingsPercent =
    activeItem?.resultSize && activeItem.resultSize < activeItem.size
      ? Math.round(((activeItem.size - activeItem.resultSize) / activeItem.size) * 100)
      : null;

  return (
    <div className="bg-slate-900/90 dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl border border-slate-800/80 p-3.5 sm:p-6 flex flex-col h-full shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Top Header & Telemetry */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
            01
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white text-xs sm:text-sm tracking-tight flex items-center space-x-1.5 sm:space-x-2">
              <span className="truncate">Live Stage & Comparison</span>
              {activeItem?.status === 'completed' && (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                  Ready
                </span>
              )}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
              Drag slider to compare quality in real-time
            </p>
          </div>
        </div>

        {/* Change file button */}
        {activeItem && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] sm:text-xs font-semibold transition-all border border-slate-700 flex-shrink-0 whitespace-nowrap"
          >
            Change
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf,.heic,.heif,.svg,.ico,.bmp,.webp,.avif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            sounds.playDrop();
            onFilesAdded(Array.from(e.target.files));
            e.target.value = '';
          }
        }}
      />

      {/* Main Preview / Split Stage */}
      <div className="flex-1 my-3 sm:my-4 min-h-[220px] sm:min-h-[340px] flex items-center justify-center relative rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800/80 overflow-hidden">
        {/* EMPTY STATE */}
        {!activeItem ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-8 text-center cursor-pointer group w-full h-full hover:bg-slate-900/40 transition-colors"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <h4 className="text-white font-bold text-base mb-1">
              Drop file here or browse device
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Supports high-resolution PNG, JPG, WebP, AVIF, HEIC, and PDF documents
            </p>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20">
                Choose File
              </span>
            </div>
          </div>
        ) : isImage && originalUrl ? (
          /* LIVE COMPARISON SPLIT SCREEN */
          <div
            ref={containerRef}
            className="relative w-full h-full flex items-center justify-center select-none overflow-hidden cursor-ew-resize"
            onMouseDown={(e) => {
              setIsDragging(true);
              handlePointerMove(e.clientX);
            }}
            onTouchStart={(e) => {
              setIsDragging(true);
              if (e.touches[0]) handlePointerMove(e.touches[0].clientX);
            }}
          >
            {/* Right side / Converted Layer (Full width behind) */}
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <img
                src={currentPreview || originalUrl}
                alt="Converted Preview"
                className="max-h-full max-w-full object-contain pointer-events-none"
              />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-indigo-600/90 text-white font-mono text-[11px] font-bold shadow-md backdrop-blur-md">
                {activeItem.status === 'completed'
                  ? `${activeItem.targetFormat.toUpperCase()} • ${formatBytes(activeItem.resultSize || 0)}`
                  : `Preview • ~${Math.round(quality * 100)}% Quality`}
              </span>
            </div>

            {/* Left side / Original Layer (Clipped by slider position) */}
            <div
              className="absolute inset-0 flex items-center justify-center p-2 overflow-hidden pointer-events-none"
              style={{
                clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
              }}
            >
              <img
                src={originalUrl}
                alt="Original"
                className="max-h-full max-w-full object-contain"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-300 font-mono text-[11px] font-bold shadow-md backdrop-blur-md border border-slate-700">
                Original • {formatBytes(activeItem.size)}
              </span>
            </div>

            {/* Draggable Divider Handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white z-20 pointer-events-none shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 font-bold text-xs flex items-center justify-center shadow-2xl border-2 border-indigo-600">
                <Split className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Interactive hint */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/80 text-[10px] font-medium border border-white/10">
              ◄ Drag slider to compare quality ►
            </div>
          </div>
        ) : (
          /* PDF OR DOCUMENT PREVIEW */
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <FileText className="w-16 h-16 text-indigo-400 mb-3" />
            <h4 className="text-white font-bold text-sm mb-1">{activeItem.name}</h4>
            <p className="text-xs text-slate-400 font-mono mb-2">
              PDF Document • {formatBytes(activeItem.size)}
            </p>
            {activeItem.status === 'completed' && activeItem.resultSize && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                Converted: {formatBytes(activeItem.resultSize)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Telemetry Bar */}
      {activeItem && (
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono font-medium">
              {activeItem.name}
            </span>
            {imageMeta && (
              <>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
                  {imageMeta.width} × {imageMeta.height} px
                </span>
                <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 font-mono">
                  Ratio {imageMeta.aspect}
                </span>
              </>
            )}
          </div>

          {/* Savings Badge */}
          {savingsPercent && savingsPercent > 0 && (
            <div className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{savingsPercent}% smaller footprint</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
