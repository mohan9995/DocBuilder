import React from 'react';
import { ThemePreset } from './AmbientBackground';
import {
  ShieldCheck,
  Palette,
  Volume2,
  VolumeX,
  FileText,
  Sliders,
  HelpCircle,
  Laptop,
  Smartphone,
} from 'lucide-react';
import { sounds } from '../services/soundService';
import { getPlatformName } from '../services/nativeShare';

interface FloatingHeaderProps {
  theme: ThemePreset;
  setTheme: (t: ThemePreset) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  activeView: 'dial' | 'doc-studio' | 'pdf-studio';
  setActiveView: (view: 'dial' | 'doc-studio' | 'pdf-studio') => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
}

export const FloatingHeader: React.FC<FloatingHeaderProps> = ({
  theme,
  setTheme,
  soundEnabled,
  setSoundEnabled,
  activeView,
  setActiveView,
  onOpenSettings,
  onOpenGuide,
}) => {
  const [isThemeOpen, setIsThemeOpen] = React.useState(false);
  const platform = getPlatformName();

  const THEMES: { id: ThemePreset; name: string; dotColor: string }[] = [
    { id: 'tangerine', name: 'Tangerine Sunset', dotColor: 'bg-[#ff6a48]' },
    { id: 'aurora', name: 'Cosmic Aurora', dotColor: 'bg-[#06b6d4]' },
    { id: 'midnight', name: 'OLED Midnight', dotColor: 'bg-[#6366f1]' },
    { id: 'frost', name: 'Apple Frost', dotColor: 'bg-[#cbd5e1]' },
  ];

  return (
    <header className="fixed top-3 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none">
      <div className="max-w-5xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Brand & Mode Switcher Pill */}
        <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
            ⚡
          </div>
          <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white px-1 tracking-tight hidden sm:inline">
            OmniConvert
          </span>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Mode Switcher */}
          <button
            onClick={() => setActiveView('dial')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeView === 'dial'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Converter
          </button>
          <button
            onClick={() => setActiveView('doc-studio')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeView === 'doc-studio'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Doc Studio & Sign
          </button>
          <button
            onClick={() => setActiveView('pdf-studio')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeView === 'pdf-studio'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Merge PDFs
          </button>
        </div>

        {/* Right Floating Actions */}
        <div className="flex items-center space-x-2 p-1 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg">
          {/* Theme Selector */}
          <div className="relative">
            <button
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors flex items-center"
              title="Change Ambiance Theme"
            >
              <Palette className="w-4 h-4" />
            </button>

            {/* Click-outside backdrop */}
            {isThemeOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsThemeOpen(false)}
              />
            )}

            {/* Dropdown presets */}
            {isThemeOpen && (
              <div className="absolute right-0 top-full mt-2 flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/60 dark:border-slate-800 rounded-2xl p-1.5 shadow-2xl min-w-[175px] z-50 animate-in fade-in zoom-in-95 duration-150">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setIsThemeOpen(false);
                      sounds.playTick();
                    }}
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                      theme === t.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${t.dotColor}`} />
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              sounds.enabled = next;
              if (next) sounds.playTick();
            }}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors"
            title={soundEnabled ? 'Mute Haptic Sound FX' : 'Enable Haptic Sound FX'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-slate-800 dark:text-slate-200" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Granular Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors"
            title="Conversion Quality & Resize Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Store / Publishing Guide */}
          <button
            onClick={onOpenGuide}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-sm"
            title="App Store & Google Play Packaging"
          >
            {platform === 'web' ? <Laptop className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">App Stores</span>
          </button>
        </div>
      </div>
    </header>
  );
};
