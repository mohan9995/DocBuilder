import { useState, useEffect } from 'react';
import { RadialDial } from './components/RadialDial';
import { AmbientBackground, ThemePreset } from './components/AmbientBackground';
import { FloatingHeader } from './components/FloatingHeader';
import { BatchDock } from './components/BatchDock';
import { QuickSettingsDrawer } from './components/QuickSettingsDrawer';
import { PdfStudioTab } from './components/PdfStudioTab';
import { PlatformGuideModal } from './components/PlatformGuideModal';
import { FileItem, TargetFormat, ConversionOptions } from './types';
import { executeConversion, detectFormat } from './services/conversionEngine';
import { downloadAllAsZip } from './services/zipService';
import { sounds } from './services/soundService';

const INITIAL_OPTIONS: ConversionOptions = {
  quality: 0.9,
  maintainAspectRatio: true,
  pdfPageSize: 'fit',
  pdfOrientation: 'portrait',
  pdfMargin: 0,
  pdfDpi: 150,
};

export function App() {
  const [theme, setTheme] = useState<ThemePreset>('tangerine');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeView, setActiveView] = useState<'dial' | 'pdf-studio'>('dial');
  const [items, setItems] = useState<FileItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [options, setOptions] = useState<ConversionOptions>(INITIAL_OPTIONS);

  // Sync dark class for themes
  useEffect(() => {
    if (theme === 'midnight' || theme === 'aurora') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'frost') {
      document.documentElement.classList.remove('dark');
    } else {
      // Tangerine can be dynamic or default dark text
      document.documentElement.classList.remove('dark');
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
    if (!activeItemId || newItems.length > 0) {
      setActiveItemId(newItems[0].id);
    }
  };

  const activeItem = items.find((i) => i.id === activeItemId) || (items.length > 0 ? items[0] : null);

  const handleConvertActive = async (format: TargetFormat) => {
    if (!activeItem) return;

    setIsConverting(true);

    // Update active item target
    const currentItem: FileItem = {
      ...activeItem,
      targetFormat: format,
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
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between overflow-x-hidden font-sans">
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

      {/* Main Interactive Stage */}
      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center px-4 py-20 z-10">
        {activeView === 'dial' ? (
          <div className="flex flex-col items-center justify-center w-full animate-in zoom-in-95 duration-300">
            {/* The Innovative Radial Dial */}
            <RadialDial
              activeItem={activeItem}
              onFilesAdded={handleFilesAdded}
              onConvert={handleConvertActive}
              isConverting={isConverting}
              theme={theme}
            />
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-6 border border-white/60 dark:border-white/10 shadow-2xl">
            <PdfStudioTab />
          </div>
        )}
      </main>

      {/* Floating Batch Carousel Dock (when 2+ files are queued) */}
      <BatchDock
        items={items}
        activeItemId={activeItemId}
        onSelectItem={(id) => setActiveItemId(id)}
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

      {/* Modals & Slide-over Drawers */}
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
