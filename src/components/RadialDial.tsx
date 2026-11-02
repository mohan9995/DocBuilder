import React, { useState, useRef } from 'react';
import { TargetFormat, FileItem } from '../types';
import { sounds } from '../services/soundService';
import { saveFileNatively, shareFile } from '../services/nativeShare';
import {
  Upload,
  Download,
  Share2,
  Check,
  RefreshCw,
  Sparkles,
  Camera,
  FileText,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface RadialDialProps {
  activeItem: FileItem | null;
  onFilesAdded: (files: File[]) => void;
  onConvert: (format: TargetFormat) => void;
  isConverting: boolean;
  theme: string;
}

interface PetalDefinition {
  format: TargetFormat;
  label: string;
  badge?: string;
  color?: string;
}

const IMAGE_PETALS: PetalDefinition[] = [
  { format: 'jpeg', label: 'JPG' },
  { format: 'webp', label: 'WEBP' },
  { format: 'png', label: 'PNG' },
  { format: 'avif', label: 'AVIF' },
  { format: 'svg', label: 'SVG' },
  { format: 'ico', label: 'ICO' },
  { format: 'pdf', label: 'PDF' },
  { format: 'bmp', label: 'BMP' },
];

const PDF_PETALS: PetalDefinition[] = [
  { format: 'jpeg', label: 'JPG (Pages)' },
  { format: 'webp', label: 'WEBP (Pages)' },
  { format: 'png', label: 'PNG (Pages)' },
  { format: 'avif', label: 'AVIF (Pages)' },
  { format: 'svg', label: 'SVG (Wrap)' },
  { format: 'pdf', label: 'Compress' },
  { format: 'pdf', label: 'Extract' },
  { format: 'pdf', label: 'Re-encode' },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function getSectorPath(
  cx: number,
  cy: number,
  r1: number,
  r2: number,
  startAngle: number,
  endAngle: number
) {
  const p1 = polarToCartesian(cx, cy, r1, startAngle);
  const p2 = polarToCartesian(cx, cy, r2, startAngle);
  const p3 = polarToCartesian(cx, cy, r2, endAngle);
  const p4 = polarToCartesian(cx, cy, r1, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${r2} ${r2} 0 ${largeArc} 1 ${p3.x} ${p3.y} L ${p4.x} ${p4.y} A ${r1} ${r1} 0 ${largeArc} 0 ${p1.x} ${p1.y} Z`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export const RadialDial: React.FC<RadialDialProps> = ({
  activeItem,
  onFilesAdded,
  onConvert,
  isConverting,
  theme,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const [isWindowDragOver, setIsWindowDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Dial geometry constants
  const cx = 250;
  const cy = 250;
  const rInner = 88;
  const rOuter = 224;
  const numPetals = 8;
  const anglePerPetal = 360 / numPetals; // 45 deg
  const gapAngle = 2.4; // Soft separation between petals

  const isPdf = activeItem?.sourceFormat === 'pdf';
  const petals = isPdf ? PDF_PETALS : IMAGE_PETALS;

  // Handle global or dial drop
  const handleFileDrop = (e: React.DragEvent, targetFormat?: TargetFormat) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWindowDragOver(false);
    setDraggedOverIndex(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      sounds.playDrop();
      const files = Array.from(e.dataTransfer.files);
      onFilesAdded(files);

      // If dropped directly onto a petal, initiate conversion immediately!
      if (targetFormat) {
        setTimeout(() => {
          onConvert(targetFormat);
        }, 150);
      }
    }
  };

  const handlePetalClick = (format: TargetFormat, index: number) => {
    sounds.playTick();
    if (!activeItem) {
      // If no file loaded yet, open file picker with this intent!
      fileInputRef.current?.click();
      return;
    }
    if (isConverting) return;
    onConvert(format);
  };

  const savingsPercent =
    activeItem?.resultSize && activeItem.resultSize < activeItem.size
      ? Math.round(((activeItem.size - activeItem.resultSize) / activeItem.size) * 100)
      : null;

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none"
      onDragOver={(e) => {
        e.preventDefault();
        setIsWindowDragOver(true);
      }}
      onDragLeave={() => setIsWindowDragOver(false)}
      onDrop={(e) => handleFileDrop(e)}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf,.heic,.heif,.svg,.ico,.bmp,.webp,.avif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            onFilesAdded(Array.from(e.target.files));
            e.target.value = '';
          }
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            onFilesAdded(Array.from(e.target.files));
            e.target.value = '';
          }
        }}
      />

      {/* Main Dial Outer Container */}
      <div className="relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] md:w-[490px] md:h-[490px] flex items-center justify-center">
        {/* Soft Outer Halo & Ambient Drop Glow */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
            isWindowDragOver
              ? 'scale-105 shadow-[0_0_90px_rgba(255,255,255,0.7)]'
              : 'shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35)]'
          }`}
        />

        {/* Outer Frosted Glass Ring Rim */}
        <div className="absolute inset-2 sm:inset-3 rounded-full border border-white/40 dark:border-white/20 bg-white/10 dark:bg-black/10 backdrop-blur-md pointer-events-none" />

        {/* The SVG Radial Petal Wheel */}
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full relative z-10 transition-transform duration-300"
        >
          <defs>
            {/* Tangerine Warm Glow Filter */}
            <filter id="petalGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,0.18)" />
            </filter>
            <filter id="activePetalGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="rgba(255,255,255,0.6)" />
            </filter>
          </defs>

          {petals.map((petal, i) => {
            const midAngle = -90 + i * anglePerPetal;
            const startAngle = midAngle - anglePerPetal / 2 + gapAngle;
            const endAngle = midAngle + anglePerPetal / 2 - gapAngle;

            const isHovered = hoveredIndex === i;
            const isDraggedOver = draggedOverIndex === i;
            const isActiveTarget = activeItem?.targetFormat === petal.format;

            // Inset radius slightly when hovered for tactile pop
            const currentR1 = isHovered || isDraggedOver ? rInner - 2 : rInner;
            const currentR2 = isHovered || isDraggedOver ? rOuter + 3 : rOuter;

            const pathD = getSectorPath(cx, cy, currentR1, currentR2, startAngle, endAngle);

            // Centered label coordinates
            const labelR = (rInner + rOuter) / 2 + 6;
            const labelPos = polarToCartesian(cx, cy, labelR, midAngle);

            return (
              <g
                key={`${petal.format}-${i}`}
                className="cursor-pointer transition-all duration-200 group"
                onClick={() => handlePetalClick(petal.format, i)}
                onMouseEnter={() => {
                  setHoveredIndex(i);
                  sounds.playTick();
                }}
                onMouseLeave={() => setHoveredIndex(null)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDraggedOverIndex(i);
                }}
                onDragLeave={() => setDraggedOverIndex(null)}
                onDrop={(e) => handleFileDrop(e, petal.format)}
              >
                {/* Petal Wedge Path */}
                <path
                  d={pathD}
                  className={`transition-all duration-200 ${
                    isDraggedOver || isHovered
                      ? 'fill-white/80 dark:fill-white/40 stroke-white/95 dark:stroke-white/80'
                      : isActiveTarget
                      ? 'fill-white/60 dark:fill-white/30 stroke-white/90 dark:stroke-white/60'
                      : 'fill-white/45 dark:fill-white/15 stroke-white/60 dark:stroke-white/30 hover:fill-white/70'
                  }`}
                  style={{
                    backdropFilter: 'blur(20px)',
                    strokeWidth: isHovered || isDraggedOver ? '14px' : '10px',
                    strokeLinejoin: 'round',
                    strokeLinecap: 'round',
                    paintOrder: 'stroke fill',
                    filter: isHovered || isDraggedOver ? 'url(#activePetalGlow)' : 'url(#petalGlow)',
                  }}
                />

                {/* Petal Label */}
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`font-extrabold tracking-wider pointer-events-none transition-all duration-200 ${
                    isHovered || isDraggedOver
                      ? 'fill-slate-900 dark:fill-white text-[15px]'
                      : 'fill-slate-800 dark:fill-slate-100 text-[13.5px]'
                  }`}
                  style={{
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    textShadow: '0 1px 2px rgba(255,255,255,0.3)',
                  }}
                >
                  {petal.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Center Circular Aperture (The Hub) */}
        <div
          className="absolute z-20 w-[156px] h-[156px] sm:w-[176px] sm:h-[176px] rounded-full overflow-hidden flex flex-col items-center justify-center p-2 text-center transition-transform duration-300"
          style={{
            boxShadow:
              'inset 0 2px 10px rgba(0,0,0,0.25), 0 10px 25px rgba(0,0,0,0.25)',
          }}
        >
          {/* Background thumbnail if file exists */}
          {activeItem && (
            <div className="absolute inset-0 z-0">
              {activeItem.file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(activeItem.file)}
                  alt={activeItem.name}
                  className="w-full h-full object-cover scale-105 filter brightness-95"
                  onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                />
              ) : (
                <div className="w-full h-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center">
                  <FileText className="w-14 h-14 text-white/80" />
                </div>
              )}
              {/* Soft frosted vignette overlay */}
              <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" />
            </div>
          )}

          {/* EMPTY STATE: Drop invitation */}
          {!activeItem && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative z-10 w-full h-full rounded-full bg-white/35 dark:bg-black/30 backdrop-blur-xl border border-white/50 dark:border-white/20 flex flex-col items-center justify-center p-3 cursor-pointer hover:bg-white/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-white/80 dark:bg-white/20 shadow-md flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5 text-slate-800 dark:text-white" />
              </div>
              <span className="text-[11px] font-bold text-slate-900 dark:text-white tracking-tight">
                Drop File
              </span>
              <span className="text-[9px] text-slate-700/80 dark:text-slate-300">
                or tap center
              </span>
            </div>
          )}

          {/* ACTIVE STATE: File loaded in center hole */}
          {activeItem && (
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
              {/* Spinning Orbital Progress Ring during Conversion */}
              {isConverting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[146px] h-[146px] rounded-full border-4 border-white/20 border-t-white animate-spin shadow-lg" />
                </div>
              )}

              {/* Floating Center Pill: Size / Status (Exactly like Tangerine screenshot!) */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/85 backdrop-blur-xl border border-white/80 dark:border-white/30 shadow-lg flex items-center space-x-1.5 cursor-pointer hover:scale-105 transition-transform"
                title="Click to choose a different file"
              >
                {isConverting ? (
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 animate-pulse">
                    {activeItem.progress}%
                  </span>
                ) : activeItem.status === 'completed' ? (
                  <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {activeItem.resultSize ? formatBytes(activeItem.resultSize) : 'Done'}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                    {formatBytes(activeItem.size)}
                  </span>
                )}
              </div>

              {/* Savings Badge if completed */}
              {activeItem.status === 'completed' && savingsPercent && savingsPercent > 0 && (
                <div className="mt-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-md animate-bounce">
                  -{savingsPercent}% lighter
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating File Name Pill (Below the Wheel, exactly like Tangerine) */}
      {activeItem && (
        <div className="mt-4 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-xl max-w-[280px] sm:max-w-md">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0 animate-ping" />
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white truncate">
              {activeItem.name}
            </p>
            <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {activeItem.sourceFormat}
            </span>
          </div>

          {/* Converted Actions Floating Bar */}
          {activeItem.status === 'completed' && activeItem.resultBlob && activeItem.resultFileName && (
            <div className="mt-3 flex items-center space-x-2 animate-in zoom-in-95 duration-200">
              <button
                onClick={() =>
                  activeItem.resultBlob &&
                  activeItem.resultFileName &&
                  saveFileNatively(activeItem.resultBlob, activeItem.resultFileName)
                }
                className="px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Save {activeItem.targetFormat.toUpperCase()}</span>
              </button>

              <button
                onClick={() =>
                  activeItem.resultBlob &&
                  activeItem.resultFileName &&
                  shareFile(activeItem.resultBlob, activeItem.resultFileName)
                }
                className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/60 dark:border-slate-700 text-slate-800 dark:text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/60 dark:border-slate-700 text-slate-800 dark:text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
                title="Convert another file"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Prompt instruction when file loaded but not converted yet */}
          {activeItem.status === 'idle' && (
            <p className="text-xs font-medium text-white/90 drop-shadow mt-2 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Tap any format petal to convert instantly</span>
            </p>
          )}
        </div>
      )}

      {/* When no file: prompt & camera shortcut */}
      {!activeItem && (
        <div className="mt-4 flex items-center space-x-3 text-xs text-white/90 drop-shadow">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-white/30 backdrop-blur-md hover:bg-white/40 border border-white/40 text-white font-semibold transition-all shadow-sm"
          >
            Choose File from Device
          </button>
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="p-2 rounded-xl bg-white/30 backdrop-blur-md hover:bg-white/40 border border-white/40 text-white transition-all shadow-sm"
            title="Take Photo"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
