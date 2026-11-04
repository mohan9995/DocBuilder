import React, { useState, useRef, useEffect, useMemo } from 'react';
import { mergePdfs, splitPdf } from '../services/pdfConverter';
import { saveFileNatively } from '../services/nativeShare';
import { generatePdfThumbnails, PageThumbnail } from '../services/pdfPreviewService';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import {
  FileText,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Combine,
  Split,
  Download,
  Loader2,
  CheckCircle2,
  GripVertical,
  ShieldCheck,
  Upload,
  Eye,
  CheckSquare,
  Square,
  ZoomIn,
  Check,
  Layers,
} from 'lucide-react';
import { sounds } from '../services/soundService';

interface PdfStudioTabProps {
  defaultSubTab?: 'merge' | 'split';
}

function parsePageRangeString(rangeStr: string, maxPages: number): number[] {
  const pages: Set<number> = new Set();
  const parts = rangeStr.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr);
      const end = parseInt(endStr);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(maxPages, Math.max(start, end));
        for (let i = min; i <= max; i++) {
          pages.add(i);
        }
      }
    } else {
      const num = parseInt(trimmed);
      if (!isNaN(num) && num >= 1 && num <= maxPages) {
        pages.add(num);
      }
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

function formatPageNumbersToRange(pages: number[]): string {
  if (pages.length === 0) return '';
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = start;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = sorted[i];
      end = start;
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges.join(', ');
}

export const PdfStudioTab: React.FC<PdfStudioTabProps> = ({ defaultSubTab = 'merge' }) => {
  const [subTab, setSubTab] = useState<'merge' | 'split'>(defaultSubTab);

  useEffect(() => {
    if (defaultSubTab) {
      setSubTab(defaultSubTab);
    }
  }, [defaultSubTab]);

  // Merge state
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeSuccess, setMergeSuccess] = useState(false);
  const [isDraggingMerge, setIsDraggingMerge] = useState(false);
  const mergeInputRef = useRef<HTMLInputElement>(null);

  // Split state
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState('1');
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitSuccess, setSplitSuccess] = useState(false);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const splitInputRef = useRef<HTMLInputElement>(null);

  // Split Visual Thumbnails State
  const [splitThumbnails, setSplitThumbnails] = useState<PageThumbnail[]>([]);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false);
  const [thumbnailProgress, setThumbnailProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  // Preview Modal State
  const [previewModalFile, setPreviewModalFile] = useState<File | null>(null);
  const [previewModalInitialPage, setPreviewModalInitialPage] = useState<number>(1);
  const [previewModalThumbnails, setPreviewModalThumbnails] = useState<PageThumbnail[]>([]);

  // Selected pages array derived from pageRange or state
  const selectedPages = useMemo(() => {
    const total = splitThumbnails.length || 9999;
    return parsePageRangeString(pageRange, total);
  }, [pageRange, splitThumbnails.length]);

  // Generate thumbnails progressively when splitFile is selected
  useEffect(() => {
    if (!splitFile) {
      setSplitThumbnails([]);
      setThumbnailProgress({ current: 0, total: 0 });
      return;
    }

    const abortController = new AbortController();
    setIsLoadingThumbnails(true);
    setSplitThumbnails([]);

    generatePdfThumbnails(splitFile, {
      maxDim: 320,
      signal: abortController.signal,
      onPageProgress: (thumb, totalPages) => {
        setSplitThumbnails((prev) => [...prev, thumb]);
        setThumbnailProgress({ current: thumb.pageNumber, total: totalPages });
      },
    })
      .then(({ thumbnails }) => {
        setSplitThumbnails(thumbnails);
        setIsLoadingThumbnails(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Failed to generate PDF thumbnails:', err);
        }
        setIsLoadingThumbnails(false);
      });

    return () => {
      abortController.abort();
    };
  }, [splitFile]);

  const addMergeFiles = (files: File[]) => {
    const valid = files.filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    if (valid.length > 0) {
      sounds.playDrop();
      setMergeFiles((prev) => [...prev, ...valid]);
    }
  };

  const handleMergeFilesAdded = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addMergeFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleMergeDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingMerge(false);
    if (e.dataTransfer.files) {
      addMergeFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleSplitDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingSplit(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        sounds.playDrop();
        setSplitFile(file);
        setPageRange('1');
      }
    }
  };

  const moveMergeFile = (index: number, direction: 'up' | 'down') => {
    sounds.playTick();
    const newFiles = [...mergeFiles];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newFiles.length) {
      const [removed] = newFiles.splice(index, 1);
      newFiles.splice(targetIndex, 0, removed);
      setMergeFiles(newFiles);
    }
  };

  const removeMergeFile = (index: number) => {
    sounds.playTick();
    setMergeFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const totalMergeSize = mergeFiles.reduce((acc, f) => acc + f.size, 0);
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Toggle single page selection in Split mode
  const togglePageSelection = (pageNum: number) => {
    sounds.playTick();
    let next: number[];
    if (selectedPages.includes(pageNum)) {
      next = selectedPages.filter((p) => p !== pageNum);
    } else {
      next = [...selectedPages, pageNum].sort((a, b) => a - b);
    }
    setPageRange(formatPageNumbersToRange(next));
  };

  const handleSelectAllPages = () => {
    sounds.playTick();
    const all = splitThumbnails.map((t) => t.pageNumber);
    setPageRange(formatPageNumbersToRange(all));
  };

  const handleClearPageSelection = () => {
    sounds.playTick();
    setPageRange('');
  };

  const handleSelectOddPages = () => {
    sounds.playTick();
    const odds = splitThumbnails.map((t) => t.pageNumber).filter((p) => p % 2 !== 0);
    setPageRange(formatPageNumbersToRange(odds));
  };

  const handleSelectEvenPages = () => {
    sounds.playTick();
    const evens = splitThumbnails.map((t) => t.pageNumber).filter((p) => p % 2 === 0);
    setPageRange(formatPageNumbersToRange(evens));
  };

  const openInspectionModal = (file: File, pageNumber: number = 1, thumbs: PageThumbnail[] = []) => {
    sounds.playTick();
    setPreviewModalFile(file);
    setPreviewModalInitialPage(pageNumber);
    setPreviewModalThumbnails(thumbs);
  };

  const handleExecuteMerge = async () => {
    if (mergeFiles.length < 2) return;
    setIsMerging(true);
    setMergeSuccess(false);
    try {
      const { blob, fileName } = await mergePdfs(mergeFiles);
      await saveFileNatively(blob, fileName);
      setMergeSuccess(true);
      sounds.playSuccess();
      setTimeout(() => setMergeSuccess(false), 4000);
    } catch (err: any) {
      alert(`Failed to merge PDFs: ${err?.message || 'Please ensure all files are valid PDF documents.'}`);
    } finally {
      setIsMerging(false);
    }
  };

  const handleExecuteSplit = async () => {
    if (!splitFile) return;
    const total = splitThumbnails.length || 9999;
    const pagesToExtract = parsePageRangeString(pageRange, total);

    if (pagesToExtract.length === 0) {
      alert('Please select or enter at least one page number to extract (e.g. 1, 3-5)');
      return;
    }

    setIsSplitting(true);
    setSplitSuccess(false);

    try {
      const { blob, fileName } = await splitPdf(splitFile, pagesToExtract);
      await saveFileNatively(blob, fileName);
      setSplitSuccess(true);
      sounds.playSuccess();
      setTimeout(() => setSplitSuccess(false), 4000);
    } catch (err: any) {
      alert(`Failed to split PDF: ${err?.message || 'Please check the page numbers and file.'}`);
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sub-Tab Switcher */}
      <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-sm mx-auto shadow-inner">
        <button
          onClick={() => {
            sounds.playTick();
            setSubTab('merge');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            subTab === 'merge'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Combine className="w-4 h-4" />
          <span>Merge PDFs</span>
          {mergeFiles.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-mono flex items-center justify-center">
              {mergeFiles.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            sounds.playTick();
            setSubTab('split');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            subTab === 'split'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Split className="w-4 h-4" />
          <span>Split & Extract</span>
          {splitFile && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      </div>

      {subTab === 'merge' ? (
        /* Tool 1: Merge PDFs */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Combine className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  PDF Merge Studio
                </h3>
                <p className="text-xs text-slate-400">
                  Reorder, preview, and combine multiple PDF documents into a single document on-device.
                </p>
              </div>
            </div>

            {mergeFiles.length > 0 && (
              <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {mergeFiles.length} files • {formatSize(totalMergeSize)}
              </span>
            )}
          </div>

          <input
            ref={mergeInputRef}
            type="file"
            multiple
            accept="application/pdf"
            className="hidden"
            onChange={handleMergeFilesAdded}
          />

          {mergeFiles.length === 0 ? (
            <div
              onClick={() => mergeInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingMerge(true);
              }}
              onDragLeave={() => setIsDraggingMerge(false)}
              onDrop={handleMergeDrop}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                isDraggingMerge
                  ? 'border-indigo-400 bg-indigo-500/10'
                  : 'border-slate-800 hover:border-indigo-500/60 bg-slate-950/40'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">
                Drag & drop multiple PDF files here
              </p>
              <p className="text-xs text-slate-400 mt-1">or tap anywhere to browse files on your device</p>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero server uploads • 100% On-Device</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {mergeFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-xs flex items-center justify-center flex-shrink-0 font-mono">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {formatSize(file.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                      {/* Document Preview Button */}
                      <button
                        onClick={async () => {
                          const { thumbnails } = await generatePdfThumbnails(file, { maxDim: 300 });
                          openInspectionModal(file, 1, thumbnails);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-indigo-400 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center space-x-1 text-xs"
                        title="Preview this PDF document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">Preview</span>
                      </button>

                      <button
                        onClick={() => moveMergeFile(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white disabled:opacity-20 border border-slate-800"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveMergeFile(idx, 'down')}
                        disabled={idx === mergeFiles.length - 1}
                        className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white disabled:opacity-20 border border-slate-800"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeMergeFile(idx)}
                        className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => mergeInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center space-x-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add More PDFs</span>
                  </button>

                  <button
                    onClick={() => setMergeFiles([])}
                    className="px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <button
                  onClick={handleExecuteMerge}
                  disabled={mergeFiles.length < 2 || isMerging}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg transition-all flex items-center space-x-2 ${
                    mergeFiles.length < 2 || isMerging
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-indigo-600/30 active:scale-95'
                  }`}
                >
                  {isMerging ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Merging On-Device...</span>
                    </>
                  ) : mergeSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>Merged & Saved!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Merge {mergeFiles.length} PDFs</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Tool 2: Split PDFs with Visual Page Grid & Previewer */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Split className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  PDF Page Extractor & Splitter
                </h3>
                <p className="text-xs text-slate-400">
                  Preview all pages visually, click to select, or enter ranges to extract into a new document.
                </p>
              </div>
            </div>

            {splitFile && splitThumbnails.length > 0 && (
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {selectedPages.length} of {splitThumbnails.length} pages selected
              </span>
            )}
          </div>

          <input
            ref={splitInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                sounds.playDrop();
                setSplitFile(e.target.files[0]);
                setPageRange('1');
                e.target.value = '';
              }
            }}
          />

          {!splitFile ? (
            <div
              onClick={() => splitInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingSplit(true);
              }}
              onDragLeave={() => setIsDraggingSplit(false)}
              onDrop={handleSplitDrop}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                isDraggingSplit
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-slate-800 hover:border-amber-500/60 bg-slate-950/40'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">
                Select a PDF file to extract pages
              </p>
              <p className="text-xs text-slate-400 mt-1">Tap or drag a PDF into this zone</p>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero server uploads • 100% On-Device</span>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* File Info Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center space-x-3 min-w-0">
                  <FileText className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">
                      {splitFile.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {formatSize(splitFile.size)} • {splitThumbnails.length > 0 ? `${splitThumbnails.length} pages` : 'Reading pages...'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {splitThumbnails.length > 0 && (
                    <button
                      onClick={() => openInspectionModal(splitFile, 1, splitThumbnails)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 border border-slate-700 transition-colors"
                      title="Inspect PDF Document in Full Screen"
                    >
                      <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                      <span>Full Preview</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSplitFile(null);
                      setSplitThumbnails([]);
                      setPageRange('1');
                    }}
                    className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                    title="Change PDF File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Range Input & Quick Preset Buttons */}
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>Pages to Extract:</span>
                    <span className="text-slate-400 font-normal font-mono text-[11px]">(Click cards below or edit range)</span>
                  </label>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <button
                      onClick={handleSelectAllPages}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    >
                      All
                    </button>
                    <button
                      onClick={handleSelectOddPages}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    >
                      Odd
                    </button>
                    <button
                      onClick={handleSelectEvenPages}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    >
                      Even
                    </button>
                    <button
                      onClick={handleClearPageSelection}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700/60 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="e.g. 1, 3-5, 8"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono"
                />
              </div>

              {/* Progressive Thumbnail Grid with Page Numbers */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Visual Page Selector</span>
                  </h4>
                  {isLoadingThumbnails && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-amber-400 font-mono">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Loading page {thumbnailProgress.current} of {thumbnailProgress.total}...</span>
                    </div>
                  )}
                </div>

                {splitThumbnails.length === 0 && isLoadingThumbnails ? (
                  <div className="py-12 text-center bg-slate-950/30 rounded-2xl border border-slate-800">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Rendering high-speed visual page previews...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {splitThumbnails.map((thumb) => {
                      const isSelected = selectedPages.includes(thumb.pageNumber);

                      return (
                        <div
                          key={thumb.pageNumber}
                          onClick={() => togglePageSelection(thumb.pageNumber)}
                          className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-150 flex flex-col bg-slate-950 shadow-md ${
                            isSelected
                              ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-[1.02]'
                              : 'border-slate-800/80 hover:border-slate-600 hover:scale-[1.01]'
                          }`}
                        >
                          {/* Top Card Badge: Page Number & Selection Indicator */}
                          <div
                            className={`flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold border-b transition-colors ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-500'
                                : 'bg-slate-900 text-slate-300 border-slate-800'
                            }`}
                          >
                            <span className="font-mono">Page {thumb.pageNumber}</span>
                            <div className="flex items-center space-x-1">
                              {/* Magnify / Inspect button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openInspectionModal(splitFile, thumb.pageNumber, splitThumbnails);
                                }}
                                className="p-1 rounded-md hover:bg-white/20 text-white transition-colors"
                                title={`Inspect Page ${thumb.pageNumber} in Full Screen`}
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                              {/* Checkbox indicator */}
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                  isSelected ? 'bg-white text-emerald-600' : 'border border-slate-600'
                                }`}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                            </div>
                          </div>

                          {/* Rendered Thumbnail Container */}
                          <div className="relative aspect-[3/4] w-full bg-white flex items-center justify-center overflow-hidden">
                            <img
                              src={thumb.dataUrl}
                              alt={`Page ${thumb.pageNumber}`}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-[10px] font-bold text-white border border-slate-700 shadow-lg">
                                {isSelected ? 'Click to Deselect' : 'Click to Select'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  {selectedPages.length === 0 ? (
                    <span className="text-rose-400">Please select at least 1 page to extract</span>
                  ) : (
                    <span>
                      Extracting <strong className="text-white">{selectedPages.length}</strong> pages:{' '}
                      <span className="font-mono text-emerald-400">{formatPageNumbersToRange(selectedPages)}</span>
                    </span>
                  )}
                </span>

                <button
                  onClick={handleExecuteSplit}
                  disabled={isSplitting || selectedPages.length === 0}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSplitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Extracting {selectedPages.length} Pages...</span>
                    </>
                  ) : splitSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>Extracted & Saved!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Extract {selectedPages.length} Selected {selectedPages.length === 1 ? 'Page' : 'Pages'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full-Screen Document Inspection Modal */}
      <DocumentPreviewModal
        isOpen={!!previewModalFile}
        onClose={() => setPreviewModalFile(null)}
        file={previewModalFile}
        initialPage={previewModalInitialPage}
        selectedPages={selectedPages}
        onTogglePageSelect={togglePageSelection}
        thumbnails={previewModalThumbnails}
      />
    </div>
  );
};
