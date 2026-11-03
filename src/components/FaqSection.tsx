import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { sounds } from '../services/soundService';

export interface FaqItem {
  q: string;
  a: string;
}

interface FaqSectionProps {
  customFaqs?: FaqItem[];
  title?: string;
  subtitle?: string;
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    q: 'Are my documents ever uploaded to a remote server?',
    a: 'No. DocBuilder processes all files 100% locally on your computer or phone using in-browser WebAssembly and Canvas APIs. Your files never leave your device memory, and no server uploads ever take place.',
  },
  {
    q: 'Is DocBuilder completely free, or are there hidden subscriptions?',
    a: 'DocBuilder is 100% free with unlimited conversions, exports, and document editing. There are no subscriptions, no paywalls, no PRO tiers, and no account registrations required.',
  },
  {
    q: 'Can DocBuilder work without an active internet connection?',
    a: 'Yes. Once loaded, DocBuilder operates entirely in client-side memory. All processing workers and font character maps (cmaps) are stored locally on the origin, enabling offline document conversion and editing.',
  },
  {
    q: 'What is the maximum document size supported?',
    a: 'Because conversions occur directly in your browser RAM, file size capacity depends on your local device specifications. Modern desktop computers and smartphones comfortably process documents and photo batches of several hundred megabytes without slowdown.',
  },
  {
    q: 'How does digital signing work in Doc Studio?',
    a: 'You can draw your signature using a trackpad, mouse, or touchscreen (in Navy or Black ink). DocBuilder renders the signature vector onto an in-memory canvas and permanently bakes it into the PDF binary using standard PDF-lib embedding.',
  },
  {
    q: 'What is the Help (i) icon feature in Doc Studio?',
    a: 'The Help (i) icon places a native interactive note annotation directly onto your PDF compliant with ISO 32000 standards. When opened in Adobe Acrobat, Chrome, Apple Preview, or Edge, clicking the (i) pin opens a popover displaying the user-selectable text note you typed.',
  },
  {
    q: 'Why are DocBuilder conversions so much faster than other online tools?',
    a: 'Traditional online converters make you upload your file across the internet to a remote queue, wait for a server to transcode it, and then download it back. DocBuilder performs calculations directly on your local device CPU and GPU via WebAssembly, eliminating upload and download latency completely.',
  },
];

export const FaqSection: React.FC<FaqSectionProps> = ({
  customFaqs,
  title = 'Frequently Asked Questions',
  subtitle = 'Everything you need to know about DocBuilder and on-device processing.',
}) => {
  const faqs = customFaqs && customFaqs.length > 0 ? customFaqs : DEFAULT_FAQS;
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleIndex = (index: number) => {
    sounds.playTick();
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section aria-labelledby="faq-heading" className="w-full mt-10 sm:mt-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 mb-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Got Questions?</span>
          </div>
          <h2 id="faq-heading" className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndices.includes(index);
          const answerId = `faq-answer-${index}`;
          const buttonId = `faq-button-${index}`;

          return (
            <div
              key={index}
              className={`bg-slate-900/70 border rounded-2xl transition-all duration-200 overflow-hidden ${
                isOpen ? 'border-indigo-500/40 shadow-lg shadow-indigo-500/5' : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <button
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => toggleIndex(index)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between space-x-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl"
              >
                <span className="font-bold text-xs sm:text-sm text-white leading-snug">
                  {faq.q}
                </span>
                <span className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 flex-shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {isOpen && (
                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-slate-300/90 leading-relaxed border-t border-slate-800/60 animate-in fade-in duration-150"
                >
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
