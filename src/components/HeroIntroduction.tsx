import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Zap,
  PenTool,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lock,
  FileCheck2,
} from 'lucide-react';
import { sounds } from '../services/soundService';

export const HeroIntroduction: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      return localStorage.getItem('docbuilder_hero_collapsed') !== 'true';
    } catch {
      return true;
    }
  });

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pauseTimeoutRef = useRef<any>(null);

  const toggleExpand = () => {
    sounds.playTick();
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    try {
      localStorage.setItem('docbuilder_hero_collapsed', nextState ? 'false' : 'true');
    } catch {}
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft } = scrollRef.current;
    const cards = scrollRef.current.children;
    if (!cards.length) return;

    let closestIndex = 0;
    let minDiff = Infinity;
    for (let i = 0; i < cards.length; i++) {
      const cardLeft = (cards[i] as HTMLElement).offsetLeft - scrollRef.current.offsetLeft;
      const diff = Math.abs(cardLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }
    setActiveCardIndex(closestIndex);
  };

  const scrollToCard = (index: number) => {
    if (!scrollRef.current) return;
    const cards = scrollRef.current.children;
    if (cards[index]) {
      const targetCard = cards[index] as HTMLElement;
      scrollRef.current.scrollTo({
        left: targetCard.offsetLeft - scrollRef.current.offsetLeft,
        behavior: 'smooth',
      });
      setActiveCardIndex(index);
    }
  };

  const FEATURES = [
    {
      icon: <Lock className="w-4 h-4 text-emerald-400" />,
      title: 'Zero Server Uploads',
      subtitle: '100% Private & On-Device',
      desc: 'All processing happens locally in device memory. Your tickets, IDs & contracts never touch the cloud.',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    {
      icon: <CreditCard className="w-4 h-4 text-indigo-400" />,
      title: 'No Subscriptions Needed',
      subtitle: 'Free Forever & Unlimited',
      desc: 'Zero subscriptions, paywalls, or accounts. Enjoy unlimited conversions and exports at no cost.',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    },
    {
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      title: 'Zero Cloud Latency',
      subtitle: 'Instant Native Speed',
      desc: 'Powered by in-browser WebAssembly & hardware acceleration for instant 60fps conversions.',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    {
      icon: <PenTool className="w-4 h-4 text-rose-400" />,
      title: 'Doc Studio & Sign',
      subtitle: 'Interactive Editing Suite',
      desc: 'Sign contracts, drag text, drop interactive Help (i) pins with popovers, and merge PDFs seamlessly.',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    },
  ];

  // Automatic looping scroll on mobile
  useEffect(() => {
    if (!isExpanded || isPaused) return;

    const timer = setInterval(() => {
      setActiveCardIndex((prev) => {
        const next = (prev + 1) % FEATURES.length;
        scrollToCard(next);
        return next;
      });
    }, 3200);

    return () => clearInterval(timer);
  }, [isExpanded, isPaused, FEATURES.length]);

  const handleUserInteractStart = () => {
    setIsPaused(true);
    clearTimeout(pauseTimeoutRef.current);
  };

  const handleUserInteractEnd = () => {
    clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 4000);
  };

  return (
    <div className="w-full mb-4 sm:mb-5 transition-all duration-300">
      <div className="relative bg-slate-900/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl overflow-hidden">
        {/* Ambient Subtle Accent Glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Top Bar with Header & Minimize Toggle */}
        <div className="flex items-center justify-between gap-2">
          {/* Tag & Status Indicator */}
          <div className="flex items-center space-x-2 min-w-0">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 tracking-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>100% On-Device Processing</span>
            </span>

            <span className="hidden md:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>No Subscriptions Needed</span>
            </span>
          </div>

          {/* Toggle Minimize/Maximize Button */}
          <button
            onClick={toggleExpand}
            className="flex items-center space-x-1 px-2 py-1 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-white text-[11px] font-medium transition-colors border border-slate-700/60 flex-shrink-0"
            title={isExpanded ? 'Collapse Introduction' : 'Expand Feature Details'}
          >
            <span className="hidden xs:inline">{isExpanded ? 'Hide Info' : 'Show Features'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expanded View: Headline, Description & 4 Feature Tiles */}
        {isExpanded ? (
          <div className="mt-2.5 pt-2.5 sm:mt-3 sm:pt-3 border-t border-slate-800/80 animate-in fade-in duration-200">
            {/* Title & Introduction Narrative */}
            <div className="max-w-3xl mb-2 sm:mb-3">
              <h2 className="text-sm sm:text-base md:text-xl font-black text-white tracking-tight flex items-center space-x-2">
                <span>Private Document Studio & High-Speed Converter</span>
              </h2>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-300/90 leading-relaxed">
                DocBuilder executes <strong>100% locally on your device</strong> with zero cloud uploads and zero subscriptions.
                <span className="hidden sm:inline"> Your tickets, tax forms, and signatures never leave your browser memory.</span>
              </p>
            </div>

            {/* 4 Feature Cards (Auto-Scrolling Horizontal Carousel on Mobile, 4-col Grid on Desktop) */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              onTouchStart={handleUserInteractStart}
              onTouchEnd={handleUserInteractEnd}
              onMouseEnter={handleUserInteractStart}
              onMouseLeave={handleUserInteractEnd}
              className="flex md:grid md:grid-cols-4 gap-2.5 overflow-x-auto md:overflow-visible pb-1.5 md:pb-0 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-0.5 px-0.5"
            >
              {FEATURES.map((item, idx) => (
                <div
                  key={idx}
                  className="w-[230px] xs:w-[250px] md:w-auto flex-shrink-0 md:flex-shrink snap-start bg-slate-950/60 border border-slate-800/70 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`p-1.5 rounded-lg border ${item.badgeColor} flex-shrink-0`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-white truncate">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{item.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400/90 leading-snug">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Mobile Carousel Indicator Dots (Centered, no text) */}
            <div className="flex md:hidden items-center justify-center pt-2 gap-1.5">
              {FEATURES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToCard(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeCardIndex === idx
                      ? 'w-5 bg-indigo-500 shadow-sm shadow-indigo-500/50'
                      : 'w-1.5 bg-slate-700 hover:bg-slate-600'
                  }`}
                  aria-label={`Go to feature ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Collapsed Pill View: Clean single line */
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between flex-wrap gap-2 animate-in fade-in duration-150">
            <span className="truncate">
              🔒 <strong>Zero Server Uploads:</strong> Documents remain on your device • <strong>No Subscriptions</strong> needed.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
