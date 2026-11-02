import React from 'react';
import { TargetFormat, FileItem } from '../../types';
import {
  Zap,
  Printer,
  Compass,
  CheckCircle2,
  Layers,
  FileCode2,
} from 'lucide-react';
import { sounds } from '../../services/soundService';

interface BentoFormatMatrixProps {
  activeItem: FileItem | null;
  currentTarget: TargetFormat;
  onSelectTarget: (format: TargetFormat) => void;
}

interface FormatOption {
  format: TargetFormat;
  label: string;
  sublabel: string;
  recommended?: boolean;
}

export const BentoFormatMatrix: React.FC<BentoFormatMatrixProps> = ({
  activeItem,
  currentTarget,
  onSelectTarget,
}) => {
  const isPdf = activeItem?.sourceFormat === 'pdf';

  const GROUPS: { title: string; icon: React.ReactNode; options: FormatOption[] }[] = isPdf
    ? [
        {
          title: 'Extract Pages as Images',
          icon: <Zap className="w-4 h-4 text-amber-400" />,
          options: [
            { format: 'jpeg', label: 'JPG Pages', sublabel: 'Fast photo extraction', recommended: true },
            { format: 'png', label: 'PNG Pages', sublabel: 'High-res lossless' },
            { format: 'webp', label: 'WEBP Pages', sublabel: 'Compact image pages' },
          ],
        },
        {
          title: 'Document Operations',
          icon: <Printer className="w-4 h-4 text-emerald-400" />,
          options: [
            { format: 'pdf', label: 'Single PDF', sublabel: 'Re-encode or split' },
            { format: 'svg', label: 'SVG Frame', sublabel: 'Vector wrapper' },
          ],
        },
      ]
    : [
        {
          title: 'Web & High Speed Optimization',
          icon: <Zap className="w-4 h-4 text-amber-400" />,
          options: [
            { format: 'webp', label: 'WEBP', sublabel: '~65% lighter, universal', recommended: true },
            { format: 'avif', label: 'AVIF', sublabel: '~80% lighter next-gen' },
          ],
        },
        {
          title: 'Universal & Archival Formats',
          icon: <Printer className="w-4 h-4 text-indigo-400" />,
          options: [
            { format: 'jpeg', label: 'JPG / JPEG', sublabel: 'Universal compatibility' },
            { format: 'png', label: 'PNG', sublabel: 'Lossless with transparency' },
            { format: 'pdf', label: 'PDF', sublabel: 'Document format' },
          ],
        },
        {
          title: 'Vectors & Specialist Assets',
          icon: <Compass className="w-4 h-4 text-pink-400" />,
          options: [
            { format: 'svg', label: 'SVG', sublabel: 'Scalable container' },
            { format: 'ico', label: 'ICO', sublabel: 'App & favicon preset' },
            { format: 'bmp', label: 'BMP', sublabel: 'Uncompressed raw' },
          ],
        },
      ];

  return (
    <div className="bg-slate-900/90 dark:bg-slate-900/90 rounded-3xl border border-slate-800/80 p-5 sm:p-6 flex flex-col h-full shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
            02
          </div>
          <div>
            <h3 className="font-bold text-white text-sm tracking-tight">
              Format Matrix by Intent
            </h3>
            <p className="text-[11px] text-slate-400">
              Select output standard for this conversion
            </p>
          </div>
        </div>
      </div>

      {/* Format Groups */}
      <div className="flex-1 py-4 space-y-4 overflow-y-auto">
        {GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400">
              {group.icon}
              <span>{group.title}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
              {group.options.map((opt) => {
                const isSelected = currentTarget === opt.format;

                return (
                  <button
                    key={`${opt.format}-${opt.label}`}
                    onClick={() => {
                      sounds.playTick();
                      onSelectTarget(opt.format);
                    }}
                    className={`relative p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                        : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-white font-mono">
                          {opt.label}
                        </span>
                        {opt.recommended && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            PRO
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {opt.sublabel}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
