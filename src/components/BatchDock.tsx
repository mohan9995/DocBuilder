import React from 'react';
import { FileItem, TargetFormat } from '../types';
import { Plus, Download, Trash2, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { sounds } from '../services/soundService';

interface BatchDockProps {
  items: FileItem[];
  activeItemId: string | null;
  onSelectItem: (id: string) => void;
  onAddMore: () => void;
  onClearAll: () => void;
  onConvertAll: (targetFormat: TargetFormat) => void;
  onDownloadAllZip: () => void;
  isConvertingAll: boolean;
}

export const BatchDock: React.FC<BatchDockProps> = ({
  items,
  activeItemId,
  onSelectItem,
  onAddMore,
  onClearAll,
  onConvertAll,
  onDownloadAllZip,
  isConvertingAll,
}) => {
  if (items.length <= 1) return null;

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const activeItem = items.find((i) => i.id === activeItemId) || items[0];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl p-2.5 sm:p-3 shadow-2xl flex items-center space-x-2 sm:space-x-3 overflow-hidden">
        {/* Scrollable file chip carousel */}
        <div className="flex items-center space-x-2 overflow-x-auto py-1 px-1 scrollbar-none max-w-[200px] sm:max-w-xs md:max-w-sm">
          {items.map((item, idx) => {
            const isActive = item.id === activeItemId;
            const isImage = item.file.type.startsWith('image/');

            return (
              <button
                key={item.id}
                onClick={() => {
                  sounds.playTick();
                  onSelectItem(item.id);
                }}
                className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex-shrink-0 overflow-hidden transition-all duration-200 border-2 ${
                  isActive
                    ? 'border-indigo-600 scale-105 shadow-md'
                    : 'border-white/60 dark:border-white/20 hover:scale-100 opacity-70 hover:opacity-100'
                }`}
              >
                {isImage ? (
                  <img
                    src={URL.createObjectURL(item.file)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">
                    PDF
                  </div>
                )}

                {/* Status indicator badge */}
                {item.status === 'completed' && (
                  <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  </div>
                )}
                {item.status === 'converting' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                )}
              </button>
            );
          })}

          {/* Add more button */}
          <button
            onClick={onAddMore}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/40 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-white/60 transition-colors flex-shrink-0"
            title="Add more files"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="h-7 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />

        {/* Batch actions */}
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          {completedCount > 0 ? (
            <button
              onClick={onDownloadAllZip}
              className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ZIP ({completedCount})</span>
            </button>
          ) : (
            <button
              onClick={() => onConvertAll(activeItem.targetFormat)}
              disabled={isConvertingAll}
              className="px-3.5 py-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Convert All ({items.length})</span>
            </button>
          )}

          <button
            onClick={onClearAll}
            className="p-2 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Clear all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
