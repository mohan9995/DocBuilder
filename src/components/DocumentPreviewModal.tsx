import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  Circle,
  FileText,
  Loader2,
  Download,
} from 'lucide-react';
import { PageThumbnail, renderHighResPage } from '../services/pdfPreviewService';
import { sounds } from '../services/soundService';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  initialPage?: number;
  selectedPages?: number[];
  onTogglePageSelect?: (pageNumber: number) => void;
  thumbnails?: PageThumbnail[];
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  file,
  initialPage = 1,
  selectedPages = [],
  onTogglePageSelect,
  thumbnails = [],
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [highResUrl, setHighResUrl] = useState<string | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = fit, 1.5, 2.0
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const isPdf = file?.type === 'application/pdf' || file?.name.toLowerCase().endsWith('.pdf');
  const isImage = file?.type.startsWith('image/');
  const totalPages = thumbnails.length || 1;

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(initialPage || 1);
      setZoomLevel(1);
    }
  }, [isOpen, initialPage]);

  // Handle Image loading
  useEffect(() => {
    if (!isOpen || !file) return;

    if (isImage) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setImageUrl(null);
      };
    }
  }, [isOpen, file, isImage]);

  // Handle PDF high-res page rendering
  useEffect(() => {
    if (!isOpen || !file || !isPdf) return;

    let isCancelled = false;
    setIsLoadingPage(true);

    renderHighResPage(file, currentPage, 150)
      .then((url) => {
        if (!isCancelled) {
          setHighResUrl(url);
          setIsLoadingPage(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn('High-res render fallback to thumbnail:', err);
          const thumb = thumbnails.find((t) => t.pageNumber === currentPage);
          if (thumb) setHighResUrl(thumb.dataUrl);
          setIsLoadingPage(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, file, currentPage, isPdf, thumbnails]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrevPage();
      } else if (e.key === 'ArrowRight') {
        goToNextPage();
      } else if (e.key === ' ' && onTogglePageSelect && isPdf) {
        e.preventDefault();
        onTogglePageSelect(currentPage);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, totalPages, isPdf, onTogglePageSelect]);

  const goToPrevPage = () => {
    if (currentPage > 1) {
      sounds.playTick();
      setCurrentPage((p) => p - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      sounds.playTick();
      setCurrentPage((p) => p + 1);
    }
  };

  if (!isOpen || !file) return null;

  const isCurrentPageSelected = selectedPages.includes(currentPage);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main Container */}
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 text-white">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 id="preview-modal-title" className="text-xs sm:text-sm font-bold truncate max-w-[200px] sm:max-w-md">
                {file.name}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400">
                {isPdf ? `Page ${currentPage} of ${totalPages}` : `${(file.size / 1024).toFixed(1)} KB • Image Document`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Zoom Controls */}
            <div className="flex items-center rounded-xl bg-slate-800/80 border border-slate-700/60 p-0.5">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                disabled={zoomLevel <= 0.75}
                className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <span className="px-1 text-[11px] font-mono text-slate-300 min-w-[40px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                disabled={zoomLevel >= 2.5}
                className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Selection Toggle (for Extraction) */}
            {isPdf && onTogglePageSelect && (
              <button
                onClick={() => {
                  sounds.playTick();
                  onTogglePageSelect(currentPage);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isCurrentPageSelected
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {isCurrentPageSelected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden xs:inline">Selected</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4 opacity-50" />
                    <span className="hidden xs:inline">Select Page</span>
                  </>
                )}
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/60"
              title="Close Preview (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Stage: High-Resolution Viewport */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-3 sm:p-6 overflow-auto select-none">
          {isLoadingPage && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
              <p className="text-xs text-slate-300 font-medium">Rendering Page {currentPage}...</p>
            </div>
          )}

          {isPdf ? (
            highResUrl ? (
              <div
                className="transition-transform duration-150 shadow-2xl rounded-lg overflow-hidden bg-white max-h-full max-w-full flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              >
                <img
                  src={highResUrl}
                  alt={`Page ${currentPage}`}
                  className="max-h-[70vh] w-auto object-contain block"
                />
              </div>
            ) : null
          ) : isImage && imageUrl ? (
            <div
              className="transition-transform duration-150 shadow-2xl rounded-lg overflow-hidden max-h-full max-w-full flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            >
              <img
                src={imageUrl}
                alt={file.name}
                className="max-h-[70vh] w-auto object-contain block"
              />
            </div>
          ) : (
            <div className="text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No preview available</p>
            </div>
          )}

          {/* Floating Left / Right Navigation Arrows for PDF */}
          {isPdf && totalPages > 1 && (
            <>
              <button
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white disabled:opacity-20 border border-slate-700 shadow-xl transition-all"
                title="Previous Page (Left Arrow)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white disabled:opacity-20 border border-slate-700 shadow-xl transition-all"
                title="Next Page (Right Arrow)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Thumbnail Strip for Multi-Page PDFs */}
        {isPdf && totalPages > 1 && (
          <div className="px-3 py-2.5 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[11px] font-bold text-slate-400">
                All Pages ({totalPages})
              </span>
              <span className="text-[10px] text-slate-500">
                Click any thumbnail to jump to page
              </span>
            </div>

            <div className="flex items-center space-x-2.5 overflow-x-auto py-1 px-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {thumbnails.map((thumb) => {
                const isSelectedForExtract = selectedPages.includes(thumb.pageNumber);
                const isCurrent = thumb.pageNumber === currentPage;

                return (
                  <button
                    key={thumb.pageNumber}
                    onClick={() => {
                      sounds.playTick();
                      setCurrentPage(thumb.pageNumber);
                    }}
                    className={`group relative flex-shrink-0 w-16 sm:w-20 rounded-xl overflow-hidden border-2 transition-all ${
                      isCurrent
                        ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-105 shadow-md'
                        : isSelectedForExtract
                        ? 'border-emerald-500 opacity-90 hover:opacity-100'
                        : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="w-full h-20 sm:h-24 bg-white flex items-center justify-center overflow-hidden">
                      <img
                        src={thumb.dataUrl}
                        alt={`Page ${thumb.pageNumber}`}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>

                    {/* Page Label Banner */}
                    <div className="absolute bottom-0 inset-x-0 py-0.5 bg-slate-900/90 text-center text-[10px] font-bold text-white font-mono">
                      Page {thumb.pageNumber}
                    </div>

                    {/* Extraction badge */}
                    {isSelectedForExtract && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
