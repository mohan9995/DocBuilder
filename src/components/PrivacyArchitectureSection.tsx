import React from 'react';
import { ShieldCheck, HardDrive, WifiOff, EyeOff, Lock, CheckCircle2, XCircle } from 'lucide-react';

export const PrivacyArchitectureSection: React.FC = () => {
  return (
    <section aria-labelledby="privacy-architecture-heading" className="w-full mt-10 sm:mt-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mb-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Privacy Guarantee</span>
          </div>
          <h2 id="privacy-architecture-heading" className="text-xl sm:text-2xl font-black text-white tracking-tight">
            How DocBuilder Protects Your Privacy
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Understanding why on-device document processing is the safest way to convert and edit confidential files.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Card 1: Traditional Cloud Converters */}
        <div className="bg-slate-900/60 border border-rose-950/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 mb-3">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-bold text-sm sm:text-base text-rose-200">
                Traditional Cloud Converters
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Uploads your contracts, tax returns, and medical records to remote cloud servers.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Documents are stored temporarily or permanently on third-party disk storage.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Vulnerable to man-in-the-middle interception, cloud breaches, and server log exposure.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Imposes bandwidth throttling, hourly file caps, or mandatory paid subscriptions.</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
            Privacy Risk: High (Files leave your perimeter)
          </div>
        </div>

        {/* Card 2: DocBuilder On-Device Architecture */}
        <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg shadow-emerald-500/5">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 mb-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-bold text-sm sm:text-base text-emerald-300">
                DocBuilder On-Device Architecture
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>100% Client-Side Processing:</strong> WebAssembly, Canvas, and Web Workers execute locally.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Zero Cloud Storage:</strong> Your documents never touch a remote filesystem or database.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Volatile RAM Purge:</strong> When you close the browser tab, all document memory is instantly cleared.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Unlimited & Free:</strong> No paywalls, no daily file quotas, and no account registrations required.</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-emerald-400/90 flex items-center justify-between">
            <span>Privacy Security: 100% Air-Gapped & Local</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* 3 Privacy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-4">
        <div className="bg-slate-950/60 border border-slate-800/70 rounded-xl p-3.5 flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-white">Local Memory Sandbox</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Conversions occur in standard browser Web Workers without persistent cookies or local storage tracking.
            </p>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/70 rounded-xl p-3.5 flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
            <WifiOff className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-white">Zero External HTTP Requests</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              All PDF workers, fonts, and cmaps are hosted locally on our static origin with zero external CDN calls.
            </p>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/70 rounded-xl p-3.5 flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0">
            <EyeOff className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-white">Zero Trackers or Telemetry</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              DocBuilder loads no advertising trackers, analytics scripts, or behavioral tracking SDKs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
