import React, { useState, useRef } from 'react';
import { mergePdfs, splitPdf } from '../services/pdfConverter';
import { saveFileNatively } from '../services/nativeShare';
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
} from 'lucide-react';

export const PdfStudioTab: React.FC = () => {
  // Merge state
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeSuccess, setMergeSuccess] = useState(false);
  const mergeInputRef = useRef<HTMLInputElement>(null);

  // Split state
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState('1');
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitSuccess, setSplitSuccess] = useState(false);
  const splitInputRef = useRef<HTMLInputElement>(null);

  const handleMergeFilesAdded = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(
        (f) => f.type === 'application/pdf' || f.name.endsWith('.pdf')
      );
      setMergeFiles((prev) => [...prev, ...files]);
      e.target.value = '';
    }
  };

  const moveMergeFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...mergeFiles];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newFiles.length) {
      const [removed] = newFiles.splice(index, 1);
      newFiles.splice(targetIndex, 0, removed);
      setMergeFiles(newFiles);
    }
  };

  const removeMergeFile = (index: number) => {
    setMergeFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExecuteMerge = async () => {
    if (mergeFiles.length < 2) return;
    setIsMerging(true);
    setMergeSuccess(false);
    try {
      const { blob, fileName } = await mergePdfs(mergeFiles);
      await saveFileNatively(blob, fileName);
      setMergeSuccess(true);
      setTimeout(() => setMergeSuccess(false), 4000);
    } catch (err) {
      alert('Failed to merge PDFs. Please ensure all files are valid PDF documents.');
    } finally {
      setIsMerging(false);
    }
  };

  const handleExecuteSplit = async () => {
    if (!splitFile) return;
    setIsSplitting(true);
    setSplitSuccess(false);

    try {
      // Parse ranges like "1, 2-4, 7"
      const pagesToExtract: number[] = [];
      const parts = pageRange.split(',');
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [startStr, endStr] = trimmed.split('-');
          const start = parseInt(startStr);
          const end = parseInt(endStr);
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = start; i <= end; i++) {
              pagesToExtract.push(i);
            }
          }
        } else {
          const num = parseInt(trimmed);
          if (!isNaN(num)) pagesToExtract.push(num);
        }
      }

      if (pagesToExtract.length === 0) {
        alert('Please enter valid page numbers to extract (e.g. 1, 3-5)');
        setIsSplitting(false);
        return;
      }

      const { blob, fileName } = await splitPdf(splitFile, pagesToExtract);
      await saveFileNatively(blob, fileName);
      setSplitSuccess(true);
      setTimeout(() => setSplitSuccess(false), 4000);
    } catch (err) {
      alert('Failed to split PDF. Please check the page numbers and file.');
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Tool 1: Merge PDFs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Combine className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              PDF Merge Studio
            </h3>
            <p className="text-xs text-slate-500">
              Reorder and combine multiple PDF documents into one single file
            </p>
          </div>
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
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 rounded-2xl p-8 text-center cursor-pointer transition-colors"
          >
            <FileText className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Add 2 or more PDF files to merge
            </p>
            <p className="text-xs text-slate-400 mt-1">Tap to browse your device</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              {mergeFiles.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {file.name}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => moveMergeFile(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveMergeFile(idx, 'down')}
                      disabled={idx === mergeFiles.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeMergeFile(idx)}
                      className="p-1 rounded text-slate-400 hover:text-red-500"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              <button
                onClick={() => mergeInputRef.current?.click()}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add More PDFs</span>
              </button>

              <button
                onClick={handleExecuteMerge}
                disabled={mergeFiles.length < 2 || isMerging}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md transition-all flex items-center space-x-2 ${
                  mergeFiles.length < 2 || isMerging
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 active:scale-95'
                }`}
              >
                {isMerging ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Merging Pages...</span>
                  </>
                ) : mergeSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Merged & Saved!</span>
                  </>
                ) : (
                  <>
                    <Combine className="w-4 h-4" />
                    <span>Merge {mergeFiles.length} PDFs</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tool 2: Split / Extract Pages */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Split className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              PDF Page Extractor & Splitter
            </h3>
            <p className="text-xs text-slate-500">
              Extract specific pages or page ranges from a PDF
            </p>
          </div>
        </div>

        <input
          ref={splitInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setSplitFile(e.target.files[0]);
              e.target.value = '';
            }
          }}
        />

        {!splitFile ? (
          <div
            onClick={() => splitInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-amber-400 rounded-2xl p-8 text-center cursor-pointer transition-colors"
          >
            <FileText className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Select a PDF to extract pages
            </p>
            <p className="text-xs text-slate-400 mt-1">Tap to browse</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3 truncate">
                <FileText className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                  {splitFile.name}
                </span>
              </div>
              <button
                onClick={() => setSplitFile(null)}
                className="p-1 rounded text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Pages to Extract:
              </label>
              <input
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="e.g. 1, 3-5, 8"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Enter single pages or ranges separated by commas, e.g.: <span className="font-mono font-semibold">1, 2-4</span>
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleExecuteSplit}
                disabled={isSplitting}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 transition-all flex items-center space-x-2 active:scale-95"
              >
                {isSplitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : splitSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Extracted & Saved!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Extract & Save Pages</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
