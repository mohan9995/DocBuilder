import React from 'react';
import {
  Combine,
  PenTool,
  FilePlus2,
  FileImage,
  Scissors,
  Minimize2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { sounds } from '../services/soundService';

export interface ToolCardData {
  id: string;
  path: string;
  title: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  action: () => void;
}

interface PopularToolsSectionProps {
  onSelectTool: (path: string) => void;
}

export const PopularToolsSection: React.FC<PopularToolsSectionProps> = ({ onSelectTool }) => {
  const TOOLS: ToolCardData[] = [
    {
      id: 'merge-pdf',
      path: '/merge-pdf',
      title: 'Merge PDFs',
      badge: 'PDF',
      description: 'Combine multiple PDF documents, receipts, or contracts into one clean file.',
      icon: <Combine className="w-5 h-5 text-indigo-400" />,
      gradient: 'from-indigo-500/20 via-indigo-600/10 to-transparent',
      action: () => onSelectTool('/merge-pdf'),
    },
    {
      id: 'pdf-editor',
      path: '/pdf-editor',
      title: 'Doc Studio & Sign',
      badge: 'Interactive',
      description: 'Sign contracts, type text notes, drop Help (i) popovers, and stamp watermarks.',
      icon: <PenTool className="w-5 h-5 text-rose-400" />,
      gradient: 'from-rose-500/20 via-rose-600/10 to-transparent',
      action: () => onSelectTool('/pdf-editor'),
    },
    {
      id: 'image-to-pdf',
      path: '/image-to-pdf',
      title: 'Image to PDF',
      badge: 'Convert',
      description: 'Transform JPG, PNG, WEBP, and HEIC photos into professional PDF documents.',
      icon: <FilePlus2 className="w-5 h-5 text-emerald-400" />,
      gradient: 'from-emerald-500/20 via-emerald-600/10 to-transparent',
      action: () => onSelectTool('/image-to-pdf'),
    },
    {
      id: 'pdf-to-jpg',
      path: '/pdf-to-jpg',
      title: 'PDF to JPG',
      badge: 'Extract',
      description: 'Extract PDF pages as high-resolution JPG or PNG images, with ZIP archiving.',
      icon: <FileImage className="w-5 h-5 text-amber-400" />,
      gradient: 'from-amber-500/20 via-amber-600/10 to-transparent',
      action: () => onSelectTool('/pdf-to-jpg'),
    },
    {
      id: 'split-pdf',
      path: '/split-pdf',
      title: 'Split & Extract PDF',
      badge: 'Pages',
      description: 'Extract specific pages or page ranges from any PDF document without quality loss.',
      icon: <Scissors className="w-5 h-5 text-cyan-400" />,
      gradient: 'from-cyan-500/20 via-cyan-600/10 to-transparent',
      action: () => onSelectTool('/split-pdf'),
    },
    {
      id: 'compress-pdf',
      path: '/compress-pdf',
      title: 'Compress & Optimize',
      badge: 'Budget',
      description: 'Fine-tune document quality from 10% to 100% to reduce file weight for email.',
      icon: <Minimize2 className="w-5 h-5 text-purple-400" />,
      gradient: 'from-purple-500/20 via-purple-600/10 to-transparent',
      action: () => onSelectTool('/compress-pdf'),
    },
    {
      id: 'webp-to-png',
      path: '/webp-to-png',
      title: 'WEBP to PNG',
      badge: 'Lossless',
      description: 'Convert WebP graphics into lossless PNG images with full transparency preserved.',
      icon: <RefreshCw className="w-5 h-5 text-blue-400" />,
      gradient: 'from-blue-500/20 via-blue-600/10 to-transparent',
      action: () => onSelectTool('/webp-to-png'),
    },
    {
      id: 'avif-to-jpg',
      path: '/avif-to-jpg',
      title: 'AVIF to JPG',
      badge: 'Transcode',
      description: 'Convert next-generation AVIF images into universal JPEGs supported everywhere.',
      icon: <Sparkles className="w-5 h-5 text-orange-400" />,
      gradient: 'from-orange-500/20 via-orange-600/10 to-transparent',
      action: () => onSelectTool('/avif-to-jpg'),
    },
  ];

  return (
    <section aria-labelledby="popular-tools-heading" className="w-full mt-10 sm:mt-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Client-Side Utilities</span>
          </div>
          <h2 id="popular-tools-heading" className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Popular Document & Image Tools
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Free, unlimited, and executed 100% on-device in your browser.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {TOOLS.map((tool) => (
          <a
            key={tool.id}
            href={tool.path}
            onClick={(e) => {
              e.preventDefault();
              sounds.playTick();
              tool.action();
            }}
            className="group relative bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 overflow-hidden"
          >
            {/* Subtle Gradient Backlight */}
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tool.gradient} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-300`}
            />

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white flex-shrink-0">
                  {tool.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/60">
                  {tool.badge}
                </span>
              </div>

              <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-indigo-300 transition-colors">
                {tool.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                {tool.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
              <span>Open Tool</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
