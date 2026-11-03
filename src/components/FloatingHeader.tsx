import React from 'react';
import { ThemePreset } from './AmbientBackground';
import {
  Palette,
  Volume2,
  VolumeX,
  Sliders,
} from 'lucide-react';
import { sounds } from '../services/soundService';

interface FloatingHeaderProps {
  theme: ThemePreset;
  setTheme: (t: ThemePreset) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  activeView: 'dial' | 'doc-studio' | 'pdf-studio';
  setActiveView: (view: 'dial' | 'doc-studio' | 'pdf-studio') => void;
  onOpenSettings: () => void;
}

export const FloatingHeader: React.FC<FloatingHeaderProps> = ({
  theme,
  setTheme,
  soundEnabled,
  setSoundEnabled,
  activeView,
  setActiveView,
  onOpenSettings,
}) => {
  const [isThemeOpen, setIsThemeOpen] = React.useState(false);

  const THEMES: { id: ThemePreset; name: string; dotColor: string }[] = [
    { id: 'tangerine', name: 'Tangerine Sunset', dotColor: 'bg-[#ff6a48]' },
    { id: 'aurora', name: 'Cosmic Aurora', dotColor: 'bg-[#06b6d4]' },
    { id: 'midnight', name: 'OLED Midnight', dotColor: 'bg-[#6366f1]' },
    { id: 'frost', name: 'Apple Frost', dotColor: 'bg-[#cbd5e1]' },
  ];

  return (
    <header className="fixed top-2 sm:top-3 left-0 right-0 z-40 px-2 sm:px-6 pointer-events-none">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5 pointer-events-auto">
        {/* Brand & Mode Switcher Pill */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 p-1 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg min-w-0">
          <button
            onClick={() => setActiveView('dial')}
            className="flex items-center space-x-1 sm:space-x-1.5 focus:outline-none text-left"
            title="DocBuilder Home"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-orange-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-sm flex-shrink-0">
              ⚡
            </div>
            <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white px-1 tracking-tight hidden md:inline">
              DocBuilder
            </span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 sm:mx-1 hidden xs:block" />

          {/* Mode Switcher */}
          <button
            onClick={() => setActiveView('dial')}
            className={`px-2 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap ${
              activeView === 'dial'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">Converter</span>
            <span className="sm:hidden">Convert</span>
          </button>
          <button
            onClick={() => setActiveView('doc-studio')}
            className={`px-2 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap ${
              activeView === 'doc-studio'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">Doc Studio & Sign</span>
            <span className="sm:hidden">Studio</span>
          </button>
          <button
            onClick={() => setActiveView('pdf-studio')}
            className={`px-2 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap ${
              activeView === 'pdf-studio'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">Merge PDFs</span>
            <span className="sm:hidden">Merge</span>
          </button>
        </div>

        {/* Right Floating Actions */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 p-1 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg flex-shrink-0">
          {/* Theme Selector */}
          <div className="relative">
            <button
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors flex items-center"
              title="Change Ambiance Theme"
            >
              <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
            className="p-1.5 sm:p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors"
            title={soundEnabled ? 'Mute Haptic Sound FX' : 'Enable Haptic Sound FX'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-800 dark:text-slate-200" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            )}
          </button>

          {/* Granular Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors"
            title="Conversion Quality & Resize Settings"
          >
            <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
