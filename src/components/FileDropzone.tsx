import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image, FileText, Plus, Clipboard, Camera } from 'lucide-react';

interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ onFilesAdded }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Support clipboard paste (Cmd+V / Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        onFilesAdded(files);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesAdded]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      onFilesAdded(droppedFiles);
      e.dataTransfer.clearData();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onFilesAdded(selectedFiles);
      // Reset input value so re-uploading the same file triggers change
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-3xl border-2 border-dashed transition-all p-8 sm:p-12 text-center flex flex-col items-center justify-center cursor-pointer group ${
        isDragOver
          ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 scale-[1.01]'
          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50/50 dark:hover:bg-slate-900 shadow-sm'
      }`}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf,.heic,.heif,.svg,.ico,.bmp,.webp,.avif"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Floating Animated Icons */}
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 group-hover:scale-110 transition-transform duration-300">
          <UploadCloud className="w-10 h-10" />
        </div>
        <div className="absolute -top-1 -right-2 p-1.5 bg-emerald-500 text-white rounded-lg shadow-md animate-bounce">
          <Plus className="w-3.5 h-3.5" />
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        Choose files or drag & drop here
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        Convert between <span className="font-semibold text-indigo-600 dark:text-indigo-400">PNG, JPG, WebP, AVIF, SVG, ICO, HEIC</span> and <span className="font-semibold text-indigo-600 dark:text-indigo-400">PDF</span>.
        100% processed directly inside your device memory.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-2 active:scale-95"
        >
          <FileText className="w-4 h-4" />
          <span>Select Files</span>
        </button>

        {/* Camera capture quick trigger for mobile */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            cameraInputRef.current?.click();
          }}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm transition-all flex items-center space-x-2"
        >
          <Camera className="w-4 h-4 text-slate-500" />
          <span>Camera</span>
        </button>
      </div>

      {/* Footer tips */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 dark:text-slate-500">
        <span className="flex items-center space-x-1">
          <Clipboard className="w-3.5 h-3.5" />
          <span>Paste screenshot (Ctrl+V / Cmd+V)</span>
        </span>
        <span>•</span>
        <span className="flex items-center space-x-1">
          <Image className="w-3.5 h-3.5" />
          <span>Batch upload supported</span>
        </span>
      </div>
    </div>
  );
};
