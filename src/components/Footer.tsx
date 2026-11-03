import React from 'react';
import { ShieldCheck, Heart, Github, ExternalLink } from 'lucide-react';
import { sounds } from '../services/soundService';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    sounds.playTick();
    onNavigate(path);
  };

  return (
    <footer className="w-full mt-14 sm:mt-20 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl pt-10 pb-28 sm:pb-16 text-slate-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Ethos */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-orange-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                ⚡
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">DocBuilder</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your Documents. Your Privacy. Your Control. Convert, merge, split, and edit files directly in your browser memory.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>100% On-Device Engine</span>
            </div>
          </div>

          {/* Col 2: Popular Tools */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-3">
              Document Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/merge-pdf" onClick={(e) => handleLinkClick(e, '/merge-pdf')} className="hover:text-indigo-400 transition-colors">
                  Merge PDF Files
                </a>
              </li>
              <li>
                <a href="/split-pdf" onClick={(e) => handleLinkClick(e, '/split-pdf')} className="hover:text-indigo-400 transition-colors">
                  Split & Extract PDF
                </a>
              </li>
              <li>
                <a href="/pdf-editor" onClick={(e) => handleLinkClick(e, '/pdf-editor')} className="hover:text-indigo-400 transition-colors">
                  Doc Studio & Sign
                </a>
              </li>
              <li>
                <a href="/image-to-pdf" onClick={(e) => handleLinkClick(e, '/image-to-pdf')} className="hover:text-indigo-400 transition-colors">
                  Image to PDF Converter
                </a>
              </li>
              <li>
                <a href="/pdf-to-jpg" onClick={(e) => handleLinkClick(e, '/pdf-to-jpg')} className="hover:text-indigo-400 transition-colors">
                  PDF to JPG & PNG
                </a>
              </li>
              <li>
                <a href="/compress-pdf" onClick={(e) => handleLinkClick(e, '/compress-pdf')} className="hover:text-indigo-400 transition-colors">
                  Compress PDF
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Image Transcoders */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-3">
              Image Transcoders
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/webp-to-png" onClick={(e) => handleLinkClick(e, '/webp-to-png')} className="hover:text-indigo-400 transition-colors">
                  WEBP to PNG Converter
                </a>
              </li>
              <li>
                <a href="/avif-to-jpg" onClick={(e) => handleLinkClick(e, '/avif-to-jpg')} className="hover:text-indigo-400 transition-colors">
                  AVIF to JPG Converter
                </a>
              </li>
              <li>
                <a href="/" onClick={(e) => handleLinkClick(e, '/')} className="hover:text-indigo-400 transition-colors">
                  Bento Batch Converter
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Transparency */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-3">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/privacy" onClick={(e) => handleLinkClick(e, '/privacy')} className="hover:text-indigo-400 transition-colors flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a href="/terms" onClick={(e) => handleLinkClick(e, '/terms')} className="hover:text-indigo-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/about" onClick={(e) => handleLinkClick(e, '/about')} className="hover:text-indigo-400 transition-colors">
                  About DocBuilder
                </a>
              </li>
              <li>
                <a href="/contact" onClick={(e) => handleLinkClick(e, '/contact')} className="hover:text-indigo-400 transition-colors">
                  Contact & Inquiries
                </a>
              </li>
              <li className="pt-2">
                <a
                  href="https://github.com/mohan9995/DocBuilder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div>
            © {currentYear} DocBuilder (https://docbuilder.mysalesforce.in). All rights reserved. Zero server tracking.
          </div>
          <div className="flex items-center space-x-1">
            <span>Built with privacy in mind for web, iOS, and Android</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
