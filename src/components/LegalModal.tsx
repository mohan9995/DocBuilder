import React from 'react';
import { X, ShieldCheck, FileText, Info, Mail, Github, ExternalLink, CheckCircle2 } from 'lucide-react';
import { sounds } from '../services/soundService';

export type LegalModalType = 'privacy' | 'terms' | 'about' | 'contact' | null;

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const handleClose = () => {
    sounds.playTick();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="fixed inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl z-10 text-slate-200">
        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content by Type */}
        {type === 'privacy' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 id="legal-modal-title" className="text-lg sm:text-xl font-black text-white">
                  Privacy Policy & Data Security
                </h2>
                <p className="text-xs text-slate-400">Effective Date: November 2026</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-4">
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                <h3 className="font-bold text-emerald-300 flex items-center space-x-1.5 mb-1 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>The DocBuilder Privacy Commitment: 100% On-Device</span>
                </h3>
                <p className="text-xs text-slate-300">
                  DocBuilder does not upload, transmit, intercept, or store your documents, signatures, or images on any server. All processing runs entirely inside your device's browser memory via WebAssembly and Canvas APIs.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">1. Information Collection</h4>
                <p className="text-slate-400">
                  We do not collect personal identifying information. We do not require accounts, logins, email addresses, or phone numbers.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">2. Document Processing Mechanics</h4>
                <p className="text-slate-400">
                  When you select a document or image:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-1 text-slate-400 text-xs">
                  <li>The file is read by your browser using the local JavaScript File API.</li>
                  <li>Operations (converting, merging, signing, compressing) run in volatile device RAM.</li>
                  <li>Temporary object URLs are automatically revoked upon reset or completion.</li>
                  <li>Closing the browser tab completely destroys all session data from RAM.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">3. Zero Third-Party Analytics & Cookies</h4>
                <p className="text-slate-400">
                  DocBuilder does not use Google Analytics, tracking cookies, advertising pixels, or telemetry beacons. No third-party network requests are made when inspecting or converting documents.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">4. Offline Capability</h4>
                <p className="text-slate-400">
                  Because all WebAssembly binaries and character maps (cmaps) are hosted locally on our static origin, you can even disconnect your internet connection and DocBuilder will continue processing documents seamlessly.
                </p>
              </div>
            </div>
          </div>
        )}

        {type === 'terms' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 id="legal-modal-title" className="text-lg sm:text-xl font-black text-white">
                  Terms of Service
                </h2>
                <p className="text-xs text-slate-400">Last Updated: November 2026</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-4">
              <div>
                <h4 className="font-bold text-white mb-1">1. Acceptance of Terms</h4>
                <p className="text-slate-400">
                  By accessing or using DocBuilder (https://docbuilder.mysalesforce.in), you agree to these Terms. If you do not agree, please do not use the application.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">2. Permitted Use</h4>
                <p className="text-slate-400">
                  DocBuilder is free for personal, educational, and commercial purposes. There are no fees, subscriptions, or licensing charges.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">3. Intellectual Property Rights</h4>
                <p className="text-slate-400">
                  You retain 100% of all intellectual property rights, copyrights, and ownership in any files, signatures, or documents you process through DocBuilder. We never claim any ownership or license over your files.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">4. Disclaimer of Warranties</h4>
                <p className="text-slate-400">
                  DocBuilder is provided "as is" without warranty of any kind. While we rigorously test our client-side WebAssembly conversion engines, you are responsible for maintaining backups of your original documents.
                </p>
              </div>
            </div>
          </div>
        )}

        {type === 'about' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h2 id="legal-modal-title" className="text-lg sm:text-xl font-black text-white">
                  About DocBuilder
                </h2>
                <p className="text-xs text-slate-400">Reimagining Document Utilities</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-4">
              <p>
                <strong>DocBuilder</strong> was born out of a simple observation: users should never have to surrender their private contracts, medical records, or tax documents to cloud conversion servers simply to convert an image or sign a PDF.
              </p>
              <p className="text-slate-400">
                Using modern advancements in WebAssembly, HTML5 Canvas, and client-side cryptography, DocBuilder brings enterprise-grade document manipulation directly into the user's browser, phone, and tablet without server dependencies.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-500">Core Engine</span>
                  <p className="font-bold text-xs text-white">React 18 + TypeScript + Vite</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-500">PDF Technology</span>
                  <p className="font-bold text-xs text-white">pdf-lib + pdfjs-dist</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {type === 'contact' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h2 id="legal-modal-title" className="text-lg sm:text-xl font-black text-white">
                  Contact & Support
                </h2>
                <p className="text-xs text-slate-400">DocBuilder Community</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-4">
              <p>
                Have questions, encountered an issue, or want to suggest a new client-side document format?
              </p>
              <div className="space-y-2 pt-2">
                <a
                  href="https://github.com/mohan9995/DocBuilder/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <Github className="w-5 h-5 text-white" />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white">GitHub Issues</h4>
                      <p className="text-[11px] text-slate-400">Report bugs or submit feature requests</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
