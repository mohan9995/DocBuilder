import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FileDropzone } from './components/FileDropzone';
import { FileList } from './components/FileList';
import { ConversionToolbar } from './components/ConversionToolbar';
import { OptionsModal } from './components/OptionsModal';
import { PdfStudioTab } from './components/PdfStudioTab';
import { PlatformGuideModal } from './components/PlatformGuideModal';
import { FileItem, TargetFormat, ConversionOptions } from './types';
import { executeConversion, detectFormat } from './services/conversionEngine';
import { imagesToPdf } from './services/pdfConverter';
import { downloadAllAsZip } from './services/zipService';
import { saveFileNatively } from './services/nativeShare';
import { Shield, Zap, Lock, Smartphone } from 'lucide-react';

const DEFAULT_OPTIONS: ConversionOptions = {
  quality: 0.9,
  maintainAspectRatio: true,
  pdfPageSize: 'fit',
  pdfOrientation: 'portrait',
  pdfMargin: 0,
  pdfDpi: 150,
};

export function App() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [globalTarget, setGlobalTarget] = useState<TargetFormat>('webp');
  const [isConvertingAll, setIsConvertingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'converter' | 'pdf-studio'>('converter');
  const [selectedItemForOptions, setSelectedItemForOptions] = useState<FileItem | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Dark mode setup
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('omni_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('omni_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('omni_theme', 'light');
    }
  }, [darkMode]);

  const handleFilesAdded = (files: File[]) => {
    const newItems: FileItem[] = files.map((file) => {
      const detected = detectFormat(file);
      // Smart default target
      let defaultTarget: TargetFormat = globalTarget;
      if (detected === 'pdf') {
        defaultTarget = 'jpeg';
      } else if (detected === 'webp' && globalTarget === 'webp') {
        defaultTarget = 'png';
      }

      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        sourceFormat: detected,
        targetFormat: defaultTarget,
        status: 'idle',
        progress: 0,
        options: { ...DEFAULT_OPTIONS },
      };
    });

    setItems((prev) => [...prev, ...newItems]);
  };

  const handleUpdateTarget = (id: string, targetFormat: TargetFormat) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, targetFormat } : item))
    );
  };

  const handleSetGlobalTarget = (format: TargetFormat) => {
    setGlobalTarget(format);
    setItems((prev) =>
      prev.map((item) => {
        // Keep PDF to image default if source is PDF and target was document
        return { ...item, targetFormat: format };
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setItems([]);
  };

  const handleConvertSingle = async (id: string) => {
    const targetItem = items.find((i) => i.id === id);
    if (!targetItem) return;

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'converting', progress: 10, error: undefined } : i))
    );

    try {
      const result = await executeConversion(targetItem, (progress) => {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, progress } : i))
        );
      });

      const resultUrl = URL.createObjectURL(result.blob);

      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                status: 'completed',
                progress: 100,
                resultBlob: result.blob,
                resultUrl,
                resultFileName: result.fileName,
                resultSize: result.size,
              }
            : i
        )
      );
    } catch (err: any) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                status: 'error',
                error: err?.message || 'Conversion failed',
              }
            : i
        )
      );
    }
  };

  const handleConvertAll = async () => {
    const pendingItems = items.filter((item) => item.status !== 'completed');
    if (pendingItems.length === 0) return;

    setIsConvertingAll(true);

    for (const item of pendingItems) {
      await handleConvertSingle(item.id);
    }

    setIsConvertingAll(false);
  };

  const handleCombineToPdf = async () => {
    const imageItems = items.filter((item) =>
      ['png', 'jpg', 'jpeg', 'webp', 'avif', 'bmp', 'heic', 'heif'].includes(
        item.sourceFormat.toLowerCase()
      )
    );

    if (imageItems.length === 0) {
      alert('Please upload images to merge them into a single PDF.');
      return;
    }

    try {
      const files = imageItems.map((item) => item.file);
      const result = await imagesToPdf(files, DEFAULT_OPTIONS);
      await saveFileNatively(result.blob, result.fileName);
    } catch (err) {
      alert('Failed to combine images into PDF.');
    }
  };

  const handleDownloadAllZip = async () => {
    await downloadAllAsZip(items);
  };

  const handleSaveOptions = (id: string, options: ConversionOptions) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, options } : item))
    );
  };

  const completedCount = items.filter((i) => i.status === 'completed').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenGuide={() => setIsGuideOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'converter' ? (
          <div>
            {/* Hero Banner */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                In-House Fast File Converter
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
                Convert images and documents locally with zero cloud lag. Optimized for laptops, iPhone, and Android.
              </p>
            </div>

            {/* Dropzone */}
            <div className="mb-6">
              <FileDropzone onFilesAdded={handleFilesAdded} />
            </div>

            {/* Toolbar */}
            <ConversionToolbar
              itemsCount={items.length}
              completedCount={completedCount}
              isConverting={isConvertingAll}
              globalTarget={globalTarget}
              onSetGlobalTarget={handleSetGlobalTarget}
              onConvertAll={handleConvertAll}
              onDownloadAllZip={handleDownloadAllZip}
              onCombineToPdf={handleCombineToPdf}
              onClearAll={handleClearAll}
            />

            {/* File List */}
            <FileList
              items={items}
              onUpdateTarget={handleUpdateTarget}
              onRemoveItem={handleRemoveItem}
              onConvertSingle={handleConvertSingle}
              onOpenOptions={(item) => setSelectedItemForOptions(item)}
            />

            {/* Features Highlights */}
            {items.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 text-base">
                    Instant & Offline
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Powered by WebAssembly & Canvas. Conversions run at local hardware speeds without waiting for network transfers.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 text-base">
                    100% Private & In-House
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Files never leave your device memory. Full compliance with strict corporate and App Store privacy standards.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-center">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 text-base">
                    Laptop & Mobile Ready
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Runs on any desktop browser or packages directly into native iOS and Android apps for App Store & Google Play.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <PdfStudioTab />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Local sandbox processing • Zero server bandwidth costs</span>
          </div>
          <button
            onClick={() => setIsGuideOpen(true)}
            className="hover:text-indigo-500 underline transition-colors"
          >
            How to publish to iOS & Android Stores
          </button>
        </div>
      </footer>

      {/* Modals */}
      <OptionsModal
        item={selectedItemForOptions}
        isOpen={Boolean(selectedItemForOptions)}
        onClose={() => setSelectedItemForOptions(null)}
        onSaveOptions={handleSaveOptions}
      />

      <PlatformGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}

export default App;
