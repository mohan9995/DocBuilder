import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
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
  AlertCircle,
  FileText,
  GripHorizontal,
  Info,
  Maximize2,
  Check,
} from 'lucide-react';
import { TextAnnotation, SignatureAnnotation, WatermarkConfig } from '../../types';
import { SignatureModal } from './SignatureModal';
import { bakePdfAnnotations } from '../../services/pdfConverter';
import { loadImage } from '../../services/imageConverter';
import { saveFileNatively } from '../../services/nativeShare';
import { sounds } from '../../services/soundService';

// Ensure PDF.js uses public static worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.js', window.location.href).href;
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
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Tool Mode
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'info-pin' | 'signature' | 'watermark'>('select');
  const [copiedPinId, setCopiedPinId] = useState<string | null>(null);

  // Dragging State for Text and Signatures
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragRef = useRef<{
    id: string;
    type: 'text' | 'signature';
    startX: number;
    startY: number;
    initialXPct: number;
    initialYPct: number;
    hasMoved: boolean;
  } | null>(null);

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
  const renderTaskRef = useRef<any>(null);

  // Sync initialFile if it changes from parent
  useEffect(() => {
    if (initialFile) {
      setFile(initialFile);
      setCurrentPage(1);
      setDeletedPages([]);
      setPageRotations({});
      setTextAnnotations([]);
      setSignatures([]);
      setErrorMessage(null);
    }
  }, [initialFile]);

  // Load and render document page (supports both PDF and Images)
  useEffect(() => {
    if (!file) return;

    let isCancelled = false;

    async function renderDocument() {
      if (!file) return;
      setIsLoadingPage(true);
      setErrorMessage(null);

      // Cancel any ongoing PDF.js render task
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
        renderTaskRef.current = null;
      }

      try {
        const isImage = file.type.startsWith('image/');

        if (isImage) {
          // Render Image Document directly to canvas
          const img = await loadImage(file);
          if (isCancelled) return;

          setTotalPages(1);

          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const rotation = pageRotations[1] || 0;
          const isSideways = rotation === 90 || rotation === 270;

          const targetWidth = isSideways ? img.naturalHeight : img.naturalWidth;
          const targetHeight = isSideways ? img.naturalWidth : img.naturalHeight;

          // Scale to comfortable high-definition viewport
          const maxDim = 1200;
          const scale = Math.min(1, maxDim / Math.max(targetWidth, targetHeight));

          canvas.width = Math.round(targetWidth * scale);
          canvas.height = Math.round(targetHeight * scale);

          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          if (isSideways) {
            ctx.drawImage(img, -canvas.height / 2, -canvas.width / 2, canvas.height, canvas.width);
          } else {
            ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
          }
          ctx.restore();

          setIsLoadingPage(false);
          return;
        }

        // Render PDF Document using PDF.js
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        if (isCancelled) return;

        setTotalPages(pdf.numPages);

        if (deletedPages.includes(currentPage)) {
          const nextAvail = Array.from({ length: pdf.numPages }, (_, i) => i + 1).find(
            (p) => !deletedPages.includes(p)
          );
          if (nextAvail) setCurrentPage(nextAvail);
          setIsLoadingPage(false);
          return;
        }

        const page = await pdf.getPage(currentPage);
        if (isCancelled) return;

        const currentRot = (page.rotate + (pageRotations[currentPage] || 0)) % 360;

        // Render at crisp 1.5x scale
        const viewport = page.getViewport({
          scale: 1.5,
          rotation: currentRot,
        });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const renderTask = page.render({
          canvasContext: ctx,
          viewport,
        });
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        renderTaskRef.current = null;

        // Auto-extract existing standard PDF Text / Help annotations
        try {
          const annots = await page.getAnnotations();
          const textAnnots = annots.filter(
            (a: any) =>
              (a.subtype === 'Text' || a.name === 'Help' || a.name === 'Comment') &&
              (a.contentsObj?.str || a.contents)
          );
          if (textAnnots.length > 0) {
            const view = page.view;
            const pageWidth = view && view[2] ? view[2] - view[0] : viewport.width;
            const pageHeight = view && view[3] ? view[3] - view[1] : viewport.height;
            setTextAnnotations((prev) => {
              const existingTexts = new Set(prev.map((t) => `${t.page}-${t.text}`));
              const imported: TextAnnotation[] = [];
              textAnnots.forEach((a: any, idx: number) => {
                const textStr = a.contentsObj?.str || a.contents || '';
                const key = `${currentPage}-${textStr}`;
                if (!existingTexts.has(key)) {
                  existingTexts.add(key);
                  const rect = a.rect || [0, 0, 20, 20];
                  const xPct = Math.max(0, Math.min(94, (rect[0] / pageWidth) * 100));
                  const yPct = Math.max(0, Math.min(94, ((pageHeight - rect[3]) / pageHeight) * 100));
                  imported.push({
                    id: `imported-pin-${currentPage}-${idx}-${Date.now()}`,
                    page: currentPage,
                    xPercent: xPct,
                    yPercent: yPct,
                    text: textStr,
                    fontSize: 14,
                    color: 'blue',
                    isCallout: true,
                    isOpen: false,
                  });
                }
              });
              return imported.length > 0 ? [...prev, ...imported] : prev;
            });
          }
        } catch {
          // ignore annotation extraction error
        }

        if (!isCancelled) {
          setIsLoadingPage(false);
        }
      } catch (err: any) {
        if (err?.name === 'RenderingCancelledException') {
          return;
        }
        console.error('Failed to render document page:', err);
        setErrorMessage(err?.message || 'Failed to render document page. Please try re-uploading.');
        setIsLoadingPage(false);
      }
    }

    renderDocument();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [file, currentPage, pageRotations[currentPage], deletedPages]);

  // Copy text helper for Help Pins
  const handleCopyPinText = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedPinId(id);
    sounds.playSuccess();
    setTimeout(() => setCopiedPinId(null), 2000);
  };

  // DRAG & DROP POINTER HANDLERS
  const handlePointerDown = (
    e: React.PointerEvent,
    id: string,
    type: 'text' | 'signature',
    initialXPct: number,
    initialYPct: number
  ) => {
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    setDraggingId(id);
    dragRef.current = {
      id,
      type,
      startX: e.clientX,
      startY: e.clientY,
      initialXPct,
      initialYPct,
      hasMoved: false,
    };
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current || !containerRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragRef.current.hasMoved = true;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const dxPct = (dx / rect.width) * 100;
    const dyPct = (dy / rect.height) * 100;

    const newXPct = Math.max(0, Math.min(94, dragRef.current.initialXPct + dxPct));
    const newYPct = Math.max(0, Math.min(94, dragRef.current.initialYPct + dyPct));

    if (dragRef.current.type === 'text') {
      setTextAnnotations((prev) =>
        prev.map((t) => (t.id === dragRef.current?.id ? { ...t, xPercent: newXPct, yPercent: newYPct } : t))
      );
    } else if (dragRef.current.type === 'signature') {
      setSignatures((prev) =>
        prev.map((s) => (s.id === dragRef.current?.id ? { ...s, xPercent: newXPct, yPercent: newYPct } : s))
      );
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setDraggingId(null);
    dragRef.current = null;
  }, []);

  // Handle click on document canvas to insert text or info pin
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((activeTool !== 'text' && activeTool !== 'info-pin') || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const xPercent = Math.max(0, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));

    const isCallout = activeTool === 'info-pin';

    const newAnnotation: TextAnnotation = {
      id: `text-${Date.now()}`,
      page: currentPage,
      xPercent,
      yPercent,
      text: isCallout ? 'Informational note / review text' : 'Click to type',
      fontSize: 16,
      color: 'black',
      isBold: false,
      isCallout,
      isOpen: isCallout, // open immediately when created in pin mode
    };

    setTextAnnotations((prev) => [...prev, newAnnotation]);
    setActiveTool('select');
    sounds.playTick();
  };

  // Add signature stamp
  const handleApplySignature = (dataUrl: string) => {
    const newSig: SignatureAnnotation = {
      id: `sig-${Date.now()}`,
      page: currentPage,
      xPercent: 35,
      yPercent: 70,
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
    } catch (err: any) {
      alert(`Export failed: ${err?.message || 'Check document format.'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const currentPageTexts = textAnnotations.filter((t) => t.page === currentPage);
  const currentPageSigs = signatures.filter((s) => s.page === currentPage);

  return (
    <div
      className="w-full flex flex-col space-y-4 select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Studio Top Control Strip */}
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        {/* Left: Tools */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Add Text Tool */}
          <button
            onClick={() => {
              sounds.playTick();
              setActiveTool(activeTool === 'text' ? 'select' : 'text');
            }}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTool === 'text'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span><span className="hidden xs:inline">Add </span>Text</span>
          </button>

          {/* Help (i) Info Pin Tool */}
          <button
            onClick={() => {
              sounds.playTick();
              setActiveTool(activeTool === 'info-pin' ? 'select' : 'info-pin');
            }}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTool === 'info-pin'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Drop an interactive (i) help pin with selectable popover text"
          >
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
            <span>Help (i)</span>
          </button>

          {/* Signature Tool */}
          <button
            onClick={() => setIsSignatureModalOpen(true)}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1.5 transition-all"
          >
            <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Sign</span>
          </button>

          {/* Watermark Tool */}
          <button
            onClick={() => {
              sounds.playTick();
              setWatermark((prev) => ({ ...prev, enabled: !prev.enabled }));
            }}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              watermark.enabled
                ? 'bg-amber-600/20 text-amber-400 border border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{watermark.enabled ? `Watermark: ON` : 'Watermark'}</span>
          </button>

          <div className="h-4 sm:h-5 w-px bg-slate-800 hidden xs:block" />

          {/* Rotate Page */}
          <button
            onClick={handleRotateCurrentPage}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Rotate current page 90 degrees"
          >
            <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Delete Page */}
          <button
            onClick={handleDeleteCurrentPage}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400"
            title="Delete current page"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Right: Export & File Open */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {file ? (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
              >
                Change
              </button>

              <button
                onClick={handleExportPdf}
                disabled={isExporting}
                className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all active:scale-95 ${
                  exportSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-indigo-600/30'
                }`}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                    <span>Baking...</span>
                  </>
                ) : exportSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Export PDF</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
            >
              Open Document
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/*,.heic,.heif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setCurrentPage(1);
            setDeletedPages([]);
            setPageRotations({});
            setTextAnnotations([]);
            setSignatures([]);
            setErrorMessage(null);
            e.target.value = '';
          }
        }}
      />

      {/* Main Interactive Document Stage */}
      <div
        className="relative bg-slate-950/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-2 sm:p-8 flex flex-col items-center justify-center min-h-[360px] sm:min-h-[500px] overflow-hidden shadow-2xl"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            sounds.playDrop();
            setFile(e.dataTransfer.files[0]);
            setCurrentPage(1);
            setDeletedPages([]);
            setPageRotations({});
            setTextAnnotations([]);
            setSignatures([]);
            setErrorMessage(null);
          }
        }}
      >
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-3xl p-12 text-center cursor-pointer transition-all w-full max-w-md group"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <h4 className="text-white font-bold text-base mb-1">
              Select a Document or Image to Edit & Sign
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Add text annotations, drop (i) help pins, draw official digital signatures, and drag them anywhere
            </p>
            <span className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md">
              Browse Files (PDF or Image)
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            {/* Active Prompt Tool Banner */}
            {activeTool === 'text' && (
              <div className="mb-3 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium animate-pulse">
                Click anywhere on the document to place text • Drag the ✥ handle to reposition ✏️
              </div>
            )}
            {activeTool === 'info-pin' && (
              <div className="mb-3 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium animate-pulse">
                Click anywhere to place an interactive Help (i) pin ℹ️
              </div>
            )}

            {/* Error Message if rendering fails */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Document Rendered Canvas & Interactive Annotation Layer */}
            <div className="relative max-w-full flex items-center justify-center">
              {isLoadingPage && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-30">
                  <div className="flex flex-col items-center space-y-2 text-white text-xs font-semibold">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                    <span>Rendering page...</span>
                  </div>
                </div>
              )}

              <div
                ref={containerRef}
                onClick={handleStageClick}
                className={`relative shadow-2xl rounded-xl overflow-hidden bg-white border border-slate-700/60 max-w-full cursor-${
                  activeTool === 'text' || activeTool === 'info-pin' ? 'crosshair' : 'default'
                }`}
              >
                {/* PDF or Image Canvas */}
                <canvas
                  ref={canvasRef}
                  className="block max-w-full h-auto mx-auto pointer-events-none"
                  style={{ display: 'block' }}
                />

                {/* Watermark Overlay Preview */}
                {watermark.enabled && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                    <span
                      className="text-4xl sm:text-6xl font-black uppercase text-slate-900/15 select-none -rotate-45 tracking-widest text-center px-4"
                    >
                      {watermark.text}
                    </span>
                  </div>
                )}

                {/* Text Annotations & Help (i) Pins Layer */}
                {currentPageTexts.map((ann) => (
                  <div
                    key={ann.id}
                    style={{
                      left: `${ann.xPercent}%`,
                      top: `${ann.yPercent}%`,
                    }}
                    className={`absolute z-20 ${
                      draggingId === ann.id ? 'opacity-80 scale-105 z-30' : ''
                    }`}
                  >
                    {/* CASE 1: Help (i) Pin Mode */}
                    {ann.isCallout ? (
                      <div className="relative group/pin">
                        {/* Authentic Circular Help (i) Badge */}
                        <div
                          onPointerDown={(e) =>
                            handlePointerDown(e, ann.id, 'text', ann.xPercent, ann.yPercent)
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            if (dragRef.current?.hasMoved) return;
                            setTextAnnotations((prev) =>
                              prev.map((t) => (t.id === ann.id ? { ...t, isOpen: !t.isOpen } : t))
                            );
                            sounds.playTick();
                          }}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center cursor-pointer transition-all select-none shadow-lg active:scale-95 ${
                            ann.isOpen
                              ? 'bg-blue-600 text-white ring-4 ring-blue-400/50 scale-105 shadow-blue-500/50'
                              : 'bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white ring-2 ring-white hover:scale-110 shadow-blue-600/40'
                          }`}
                          title={ann.isOpen ? 'Click to close note' : 'Click to show note (User Selectable) • Drag to move'}
                        >
                          <Info className="w-4 h-4 pointer-events-none stroke-[2.5]" />
                        </div>

                        {/* Expandable Popover Card with User-Selectable & Copyable Text */}
                        {ann.isOpen && (
                          <div
                            className="absolute top-9 left-0 sm:left-1/2 sm:-translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-2 border-blue-500/80 rounded-2xl p-3 shadow-2xl w-64 xs:w-72 sm:w-80 max-w-[calc(100vw-36px)] animate-in zoom-in-95 duration-150"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800 mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center space-x-1">
                                <Info className="w-3.5 h-3.5" />
                                <span>Info Note (Selectable)</span>
                              </span>
                              <div className="flex items-center space-x-1">
                                {/* Copy Button */}
                                <button
                                  onClick={(e) => handleCopyPinText(ann.id, ann.text, e)}
                                  className="px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/60 transition-colors"
                                  title="Copy text to clipboard"
                                >
                                  {copiedPinId === ann.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-500" />
                                      <span className="text-emerald-500 font-bold">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Share2 className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                                {/* Switch back to normal text */}
                                <button
                                  onClick={() =>
                                    setTextAnnotations((prev) =>
                                      prev.map((t) =>
                                        t.id === ann.id ? { ...t, isCallout: false } : t
                                      )
                                    )
                                  }
                                  className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800"
                                  title="Switch to Normal Text"
                                >
                                  T
                                </button>
                                {/* Close popover */}
                                <button
                                  onClick={() =>
                                    setTextAnnotations((prev) =>
                                      prev.map((t) => (t.id === ann.id ? { ...t, isOpen: false } : t))
                                    )
                                  }
                                  className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                  title="Close Note"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Selectable & Editable Textarea */}
                            <textarea
                              value={ann.text}
                              onChange={(e) =>
                                setTextAnnotations((prev) =>
                                  prev.map((t) => (t.id === ann.id ? { ...t, text: e.target.value } : t))
                                )
                              }
                              className="w-full text-xs font-sans text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 resize-none select-text cursor-text leading-relaxed selection:bg-blue-200 dark:selection:bg-blue-800"
                              rows={3}
                              placeholder="Enter helpful information or note..."
                              autoFocus
                            />

                            <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400">
                              <span>Drag pin to move</span>
                              <button
                                onClick={() =>
                                  setTextAnnotations((prev) => prev.filter((t) => t.id !== ann.id))
                                }
                                className="text-red-500 hover:text-red-600 font-semibold"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* CASE 2: Normal Inline Text Box with Drag Handle */
                      <div
                        className="flex items-center bg-white/95 rounded-xl border-2 border-indigo-500 shadow-xl px-2 py-1 space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Drag Handle */}
                        <div
                          onPointerDown={(e) =>
                            handlePointerDown(e, ann.id, 'text', ann.xPercent, ann.yPercent)
                          }
                          className="p-1 cursor-grab active:cursor-grabbing hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                          title="Drag to reposition text"
                        >
                          <GripHorizontal className="w-3.5 h-3.5" />
                        </div>

                        {/* Editable Text Input */}
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
                          style={{
                            fontSize: `${ann.fontSize}px`,
                            color: ann.color === 'blue' ? '#1e40af' : ann.color === 'red' ? '#dc2626' : '#0f172a',
                            fontWeight: ann.isBold ? 'bold' : 'normal',
                          }}
                          className="bg-transparent outline-none font-sans font-medium min-w-[70px] select-text cursor-text"
                        />

                        {/* Switch to Help (i) Pin Button */}
                        <button
                          onClick={() =>
                            setTextAnnotations((prev) =>
                              prev.map((t) =>
                                t.id === ann.id ? { ...t, isCallout: true, isOpen: true } : t
                              )
                            )
                          }
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                          title="Convert to Help (i) Pin"
                        >
                          <Info className="w-3.5 h-3.5 text-blue-500" />
                        </button>

                        {/* Font Size Toggle */}
                        <button
                          onClick={() => {
                            setTextAnnotations((prev) =>
                              prev.map((t) =>
                                t.id === ann.id
                                  ? { ...t, fontSize: t.fontSize >= 28 ? 14 : t.fontSize + 4 }
                                  : t
                              )
                            );
                          }}
                          className="px-1 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 hover:bg-slate-200 font-mono"
                          title="Toggle Font Size"
                        >
                          {ann.fontSize}pt
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() =>
                            setTextAnnotations((prev) => prev.filter((t) => t.id !== ann.id))
                          }
                          className="p-1 text-slate-400 hover:text-red-500 rounded"
                          title="Delete text"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Signatures Layer with Drag Handle & Resizing */}
                {currentPageSigs.map((sig) => (
                  <div
                    key={sig.id}
                    style={{
                      left: `${sig.xPercent}%`,
                      top: `${sig.yPercent}%`,
                      width: `${sig.widthPercent}%`,
                    }}
                    className={`absolute z-20 group select-none ${
                      draggingId === sig.id ? 'opacity-80 scale-105 z-30' : ''
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative border-2 border-dashed border-indigo-500/70 hover:border-indigo-500 rounded-xl p-1.5 bg-white/50 backdrop-blur-[2px] shadow-lg">
                      {/* Top Drag Bar Handle */}
                      <div
                        onPointerDown={(e) =>
                          handlePointerDown(e, sig.id, 'signature', sig.xPercent, sig.yPercent)
                        }
                        className="w-full flex items-center justify-center py-0.5 cursor-grab active:cursor-grabbing hover:bg-indigo-50 rounded mb-1 text-indigo-500"
                        title="Drag signature anywhere"
                      >
                        <GripHorizontal className="w-4 h-4" />
                      </div>

                      {/* Signature Image */}
                      <img
                        src={sig.dataUrl}
                        alt="Signature Stamp"
                        className="w-full h-auto object-contain pointer-events-none"
                      />

                      {/* Delete Signature Button */}
                      <button
                        onClick={() =>
                          setSignatures((prev) => prev.filter((s) => s.id !== sig.id))
                        }
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-red-600 text-white shadow-md hover:bg-red-500"
                        title="Remove signature"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      {/* Corner Resize Toggle Handle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSignatures((prev) =>
                            prev.map((s) =>
                              s.id === sig.id
                                ? {
                                    ...s,
                                    widthPercent: s.widthPercent >= 45 ? 20 : s.widthPercent + 8,
                                  }
                                : s
                            )
                          );
                        }}
                        className="absolute -bottom-2 -right-2 p-1 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-500 cursor-pointer"
                        title="Click to scale size"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Page Navigation Strip */}
            {totalPages > 1 && (
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
            )}
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
