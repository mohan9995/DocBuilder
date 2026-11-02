import { useState, useEffect, useRef } from 'react';
import { BentoComparisonStage } from './components/BentoStudio/BentoComparisonStage';
import { BentoFormatMatrix } from './components/BentoStudio/BentoFormatMatrix';
import { BentoControlsTile } from './components/BentoStudio/BentoControlsTile';
import { AmbientBackground, ThemePreset } from './components/AmbientBackground';
import { FloatingHeader } from './components/FloatingHeader';
import { BatchDock } from './components/BatchDock';
import { QuickSettingsDrawer } from './components/QuickSettingsDrawer';
import { PdfStudioTab } from './components/PdfStudioTab';
import { PlatformGuideModal } from './components/PlatformGuideModal';
import { FileItem, TargetFormat, ConversionOptions } from './types';
import { executeConversion, detectFormat } from './services/conversionEngine';
import { convertImage } from './services/imageConverter';
import { downloadAllAsZip } from './services/zipService';
import { sounds } from './services/soundService';

const INITIAL_OPTIONS: ConversionOptions = {
  quality: 0.85,
  maintainAspectRatio: true,
  pdfPageSize: 'fit',
  pdfOrientation: 'portrait',
  pdfMargin: 0,
  pdfDpi: 150,
};

export function App() {
  const [theme, setTheme] = useState<ThemePreset>('aurora'); // Default to sleek Cosmic Aurora for Concept B
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeView, setActiveView] = useState<'dial' | 'pdf-studio'>('dial');
  const [items, setItems] = useState<FileItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('webp');
  const [isConverting, setIsConverting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [options, setOptions] = useState<ConversionOptions>(INITIAL_OPTIONS);

  // Live real-time preview URL for split-screen comparison
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const debounceTimerRef = useRef<any>(null);

  // Sync dark class for themes
  useEffect(() => {
    if (theme === 'midnight' || theme === 'aurora') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'frost') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  // Support clipboard paste (Cmd+V / Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const itemsList = e.clipboardData.items;
      const files: File[] = [];
      for (let i = 0; i < itemsList.length; i++) {
        if (itemsList[i].kind === 'file') {
          const file = itemsList[i].getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        sounds.playDrop();
        handleFilesAdded(files);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFilesAdded = (files: File[]) => {
    const newItems: FileItem[] = files.map((file) => {
      const detected = detectFormat(file);
      const defaultTarget: TargetFormat = detected === 'pdf' ? 'jpeg' : 'webp';

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
        options: { ...options },
      };
    });

    setItems((prev) => [...prev, ...newItems]);
    if (!activeItemId && newItems.length > 0) {
      setActiveItemId(newItems[0].id);
      setTargetFormat(newItems[0].targetFormat);
    }
  };

  const activeItem = items.find((i) => i.id === activeItemId) || (items.length > 0 ? items[0] : null);

  // Real-time Before/After preview generator (Debounced Canvas processing)
  useEffect(() => {
    if (!activeItem || !activeItem.file.type.startsWith('image/')) {
      setPreviewUrl(null);
      return;
    }

    if (activeItem.status === 'completed' && activeItem.resultUrl) {
      setPreviewUrl(activeItem.resultUrl);
      return;
    }

    // Debounce preview rendering by 120ms to keep 60fps slider smoothness
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const isTargetImage = ['png', 'jpeg', 'webp', 'avif', 'gif', 'bmp', 'ico', 'svg'].includes(targetFormat);
        if (isTargetImage) {
          const res = await convertImage(activeItem.file, targetFormat, options);
          const url = URL.createObjectURL(res.blob);
          setPreviewUrl((prev) => {
            if (prev && prev !== activeItem.resultUrl) URL.revokeObjectURL(prev);
            return url;
          });
        }
      } catch (err) {
        // Fallback silently if format isn't supported live
      }
    }, 120);

    return () => {
      clearTimeout(debounceTimerRef.current);
    };
  }, [activeItem?.id, targetFormat, options.quality, options.resizeWidth, options.resizeHeight]);

  // Execute single file conversion
  const handleConvertActive = async () => {
    if (!activeItem) return;

    setIsConverting(true);

    const currentItem: FileItem = {
      ...activeItem,
      targetFormat,
      options: { ...options },
      status: 'converting',
      progress: 15,
      error: undefined,
    };

    setItems((prev) => prev.map((item) => (item.id === currentItem.id ? currentItem : item)));

    try {
      const result = await executeConversion(currentItem, (progress) => {
        setItems((prev) =>
          prev.map((item) => (item.id === currentItem.id ? { ...item, progress } : item))
        );
      });

      const resultUrl = URL.createObjectURL(result.blob);

      setItems((prev) =>
        prev.map((item) =>
          item.id === currentItem.id
            ? {
                ...item,
                status: 'completed',
                progress: 100,
                resultBlob: result.blob,
                resultUrl,
                resultFileName: result.fileName,
                resultSize: result.size,
              }
            : item
        )
      );

      setPreviewUrl(resultUrl);
      sounds.playSuccess();
    } catch (err: any) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === currentItem.id
            ? { ...item, status: 'error', error: err?.message || 'Conversion failed' }
            : item
        )
      );
    } finally {
      setIsConverting(false);
    }
  };

  // Convert all items in batch
  const handleConvertAll = async (format: TargetFormat) => {
    if (items.length === 0) return;
    setIsConverting(true);

    for (const item of items) {
      if (item.status === 'completed') continue;

      const updatedItem: FileItem = {
        ...item,
        targetFormat: format,
        options: { ...options },
        status: 'converting',
        progress: 20,
      };

      setItems((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));

      try {
        const result = await executeConversion(updatedItem, (progress) => {
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, progress } : i))
          );
        });

        const resultUrl = URL.createObjectURL(result.blob);
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
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
      } catch (e: any) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: 'error', error: e?.message } : i
          )
        );
      }
    }

    sounds.playSuccess();
    setIsConverting(false);
  };

  const handleDownloadAllZip = async () => {
    await downloadAllAsZip(items);
  };

  const handleClearAll = () => {
    setItems([]);
    setActiveItemId(null);
    setPreviewUrl(null);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between overflow-x-hidden font-sans text-slate-100">
      {/* Dynamic Ambient Fluid Mesh Gradient */}
      <AmbientBackground theme={theme} />

      {/* Floating Glass Top Bar */}
      <FloatingHeader
        theme={theme}
        setTheme={setTheme}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Interactive Stage: Concept B (The Bento Studio) */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-28 z-10 flex flex-col justify-center">
        {activeView === 'dial' ? (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Top Row: Two Bento Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Tile 1: Live Comparison & Inspector Stage (7 cols) */}
              <div className="lg:col-span-7 flex flex-col">
                <BentoComparisonStage
                  activeItem={activeItem}
                  previewUrl={previewUrl}
                  onFilesAdded={handleFilesAdded}
                  isConverting={isConverting}
                  quality={options.quality}
                />
              </div>

              {/* Tile 2: Intent-Driven Format Matrix (5 cols) */}
              <div className="lg:col-span-5 flex flex-col">
                <BentoFormatMatrix
                  activeItem={activeItem}
                  currentTarget={targetFormat}
                  onSelectTarget={(fmt) => {
                    setTargetFormat(fmt);
                    if (activeItem) {
                      setItems((prev) =>
                        prev.map((i) => (i.id === activeItem.id ? { ...i, targetFormat: fmt } : i))
                      );
                    }
                  }}
                />
              </div>
            </div>

            {/* Bottom Row: Bento Tile 3 (Controls & Budget Tuning) */}
            <div>
              <BentoControlsTile
                activeItem={activeItem}
                targetFormat={targetFormat}
                options={options}
                setOptions={setOptions}
                onConvert={handleConvertActive}
                isConverting={isConverting}
              />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl mx-auto bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 border border-slate-800 shadow-2xl">
            <PdfStudioTab />
          </div>
        )}
      </main>

      {/* Floating Batch Carousel Dock (when 2+ files are queued) */}
      <BatchDock
        items={items}
        activeItemId={activeItemId}
        onSelectItem={(id) => {
          setActiveItemId(id);
          const item = items.find((i) => i.id === id);
          if (item) setTargetFormat(item.targetFormat);
        }}
        onAddMore={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.multiple = true;
          input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files) handleFilesAdded(Array.from(files));
          };
          input.click();
        }}
        onClearAll={handleClearAll}
        onConvertAll={handleConvertAll}
        onDownloadAllZip={handleDownloadAllZip}
        isConvertingAll={isConverting}
      />

      {/* Granular Preferences Drawer & Store Deployment Guide */}
      <QuickSettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        options={options}
        setOptions={setOptions}
      />

      <PlatformGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}

export default App;
