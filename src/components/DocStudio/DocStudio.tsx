import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import {
  Type,
  PenTool,
  ShieldAlert,
  RotateCw,
  Trash2,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Plus,
  Loader2,
  CheckCircle2,
  X,
  Move,
} from 'lucide-react';
import { TextAnnotation, SignatureAnnotation, WatermarkConfig } from '../../types';
import { SignatureModal } from './SignatureModal';
import { bakePdfAnnotations } from '../../services/pdfConverter';
import { saveFileNatively, shareFile } from '../../services/nativeShare';
import { sounds } from '../../services/soundService';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    pdfjsWorker ||
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

interface DocStudioProps {
  initialFile?: File | null;
}

export const DocStudio: React.FC<DocStudioProps> = ({ initialFile }) => {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Active Tool Mode
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'signature' | 'watermark'>('select');

  // Annotations State
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [signatures, setSignatures] = useState<SignatureAnnotation[]>([]);
  const [watermark, setWatermark] = useState<WatermarkConfig>({
    enabled: false,
    text: 'CONFIDENTIAL',
    opacity: 0.2,
    color: '#94a3b8',
  });
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [deletedPages, setDeletedPages] = useState<number[]>([]);

  // Canvas & Container Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load and render PDF page
  useEffect(() => {
    if (!file) return;

    let isCancelled = false;

    async function renderPage() {
      if (!file) return;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      if (isCancelled) return;

      setTotalPages(pdf.numPages);

      // Skip if current page is marked deleted
      if (deletedPages.includes(currentPage)) {
        // Jump to next available
        const nextAvail = Array.from({ length: pdf.numPages }, (_, i) => i + 1).find(
          (p) => !deletedPages.includes(p)
        );
        if (nextAvail) setCurrentPage(nextAvail);
        return;
      }

      const page = await pdf.getPage(currentPage);
      if (isCancelled) return;

      const viewport = page.getViewport({
        scale: 1.5,
        rotation: pageRotations[currentPage] || 0,
      });

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;
    }

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [file, currentPage, pageRotations[currentPage], deletedPages]);

  // Handle click on PDF stage to insert text
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'text' || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const xPercent = Math.max(0, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));

    const newAnnotation: TextAnnotation = {
      id: `text-${Date.now()}`,
      page: currentPage,
      xPercent,
      yPercent,
      text: 'Click to edit text',
      fontSize: 16,
      color: 'black',
    };

    setTextAnnotations((prev) => [...prev, newAnnotation]);
    setActiveTool('select');
    sounds.playTick();
  };

  // Add signature
  const handleApplySignature = (dataUrl: string) => {
    const newSig: SignatureAnnotation = {
      id: `sig-${Date.now()}`,
      page: currentPage,
      xPercent: 40,
      yPercent: 75,
      widthPercent: 28,
      heightPercent: 12,
      dataUrl,
    };
    setSignatures((prev) => [...prev, newSig]);
    sounds.playDrop();
  };

  // Rotate page
  const handleRotateCurrentPage = () => {
    sounds.playTick();
    setPageRotations((prev) => ({
      ...prev,
      [currentPage]: ((prev[currentPage] || 0) + 90) % 360,
    }));
  };

  // Delete page
  const handleDeleteCurrentPage = () => {
    if (deletedPages.length >= totalPages - 1) {
      alert('Cannot delete all pages of the document.');
      return;
    }
    sounds.playTick();
    setDeletedPages((prev) => [...prev, currentPage]);
  };

  // Bake & Export permanent PDF
  const handleExportPdf = async () => {
    if (!file) return;
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const { blob, fileName } = await bakePdfAnnotations(file, {
        textAnnotations,
        signatures,
        watermark,
        rotations: pageRotations,
        deletedPages,
      });

      await saveFileNatively(blob, fileName);
      setExportSuccess(true);
      sounds.playSuccess();
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      alert('Failed to export edited document.');
    } finally {
      setIsExporting(false);
    }
  };

  const currentPageTexts = textAnnotations.filter((t) => t.page === currentPage);
  const currentPageSigs = signatures.filter((s) => s.page === currentPage);

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Studio Top Control Strip */}
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Left: Tools */}
        <div className="flex items-center space-x-2">
          {/* Add Text Tool */}
          <button
            onClick={() => {
              sounds.playTick();
              setActiveTool(activeTool === 'text' ? 'select' : 'text');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTool === 'text'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Add Text</span>
          </button>

          {/* Signature Tool */}
          <button
            onClick={() => setIsSignatureModalOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1.5 transition-all"
          >
            <PenTool className="w-4 h-4" />
            <span>Sign</span>
          </button>

          {/* Watermark Tool */}
          <button
            onClick={() => {
              sounds.playTick();
              setWatermark((prev) => ({ ...prev, enabled: !prev.enabled }));
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              watermark.enabled
                ? 'bg-amber-600/20 text-amber-400 border border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{watermark.enabled ? 'Watermark: ON' : 'Watermark'}</span>
          </button>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          {/* Rotate Page */}
          <button
            onClick={handleRotateCurrentPage}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Rotate current page 90 degrees"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Delete Page */}
          <button
            onClick={handleDeleteCurrentPage}
            className="p-2 rounded-xl bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400"
            title="Delete current page"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Export CTA */}
        <div className="flex items-center space-x-2">
          {file ? (
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all active:scale-95 ${
                exportSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-indigo-600/30'
              }`}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Baking Edits...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved & Exported!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export Final PDF</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Open PDF
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setCurrentPage(1);
            setDeletedPages([]);
            setPageRotations({});
            setTextAnnotations([]);
            setSignatures([]);
            e.target.value = '';
          }
        }}
      />

      {/* Main Interactive Document Stage */}
      <div className="relative bg-slate-950/80 border border-slate-800 rounded-3xl p-4 sm:p-8 flex flex-col items-center justify-center min-h-[500px] overflow-hidden shadow-2xl">
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-3xl p-12 text-center cursor-pointer transition-all w-full max-w-md group"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <h4 className="text-white font-bold text-base mb-1">
              Select a PDF to Edit & Sign
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Add text annotations, draw official digital signatures, and customize pages
            </p>
            <span className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md">
              Browse Files
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            {/* Active Prompt Tool Banner */}
            {activeTool === 'text' && (
              <div className="mb-3 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium animate-pulse">
                Click anywhere on the document page to drop text ✏️
              </div>
            )}

            {/* Document Rendered Canvas & Interactive Annotation Layer */}
            <div
              ref={containerRef}
              onClick={handleStageClick}
              className={`relative shadow-2xl rounded-xl overflow-hidden bg-white max-w-full cursor-${
                activeTool === 'text' ? 'crosshair' : 'default'
              }`}
            >
              {/* PDF Canvas */}
              <canvas ref={canvasRef} className="block max-w-full h-auto" />

              {/* Watermark Overlay Preview */}
              {watermark.enabled && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                  <span
                    className="text-4xl sm:text-6xl font-black uppercase text-slate-900/15 select-none -rotate-45 tracking-widest"
                  >
                    {watermark.text}
                  </span>
                </div>
              )}

              {/* Text Annotations Layer */}
              {currentPageTexts.map((ann) => (
                <div
                  key={ann.id}
                  style={{
                    left: `${ann.xPercent}%`,
                    top: `${ann.yPercent}%`,
                  }}
                  className="absolute z-20 group"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center bg-white/95 rounded-lg border border-indigo-400 shadow-lg px-2 py-1">
                    <input
                      type="text"
                      value={ann.text}
                      onChange={(e) =>
                        setTextAnnotations((prev) =>
                          prev.map((t) =>
                            t.id === ann.id ? { ...t, text: e.target.value } : t
                          )
                        )
                      }
                      style={{ fontSize: `${ann.fontSize}px` }}
                      className="bg-transparent text-slate-900 outline-none font-sans font-medium min-w-[80px]"
                    />
                    <button
                      onClick={() =>
                        setTextAnnotations((prev) => prev.filter((t) => t.id !== ann.id))
                      }
                      className="ml-1 p-0.5 text-slate-400 hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Signatures Layer */}
              {currentPageSigs.map((sig) => (
                <div
                  key={sig.id}
                  style={{
                    left: `${sig.xPercent}%`,
                    top: `${sig.yPercent}%`,
                    width: `${sig.widthPercent}%`,
                  }}
                  className="absolute z-20 group cursor-move select-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative border-2 border-dashed border-indigo-500/50 hover:border-indigo-500 rounded-lg p-1 bg-white/40 backdrop-blur-[1px]">
                    <img
                      src={sig.dataUrl}
                      alt="Signature Stamp"
                      className="w-full h-auto object-contain pointer-events-none"
                    />
                    <button
                      onClick={() =>
                        setSignatures((prev) => prev.filter((s) => s.id !== sig.id))
                      }
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-red-600 text-white shadow-md hover:bg-red-500"
                      title="Remove signature"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Page Navigation Strip */}
            <div className="mt-4 flex items-center space-x-3 bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-800 shadow-md">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-xs font-mono font-bold text-slate-200">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Signature Pad Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onApplySignature={handleApplySignature}
      />
    </div>
  );
};
