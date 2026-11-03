import React from 'react';
import { Layers, FileCode, Cpu, Check, Shield } from 'lucide-react';

export const SupportedFormatsSection: React.FC = () => {
  const FORMAT_CATEGORIES = [
    {
      category: 'Universal Documents',
      badge: 'PDF Engine',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      formats: [
        { name: 'PDF', ext: '.pdf', inOut: 'Input & Output', engine: 'pdf-lib & pdfjs-dist (WASM)', desc: 'Full support for multi-page rendering, merging, splitting, digital signatures, and text baking.' },
      ],
    },
    {
      category: 'Web & High-Compression Formats',
      badge: 'Next-Gen',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      formats: [
        { name: 'WEBP', ext: '.webp', inOut: 'Input & Output', engine: 'Browser Native Canvas', desc: 'Google next-gen web image format with superior compression and full alpha transparency.' },
        { name: 'AVIF', ext: '.avif', inOut: 'Input & Output', engine: 'Native AV1 / Canvas Fallback', desc: 'Cutting-edge AV1 image file format providing maximum compression efficiency.' },
      ],
    },
    {
      category: 'Print & Standard Photography',
      badge: 'Universal',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      formats: [
        { name: 'PNG', ext: '.png', inOut: 'Input & Output', engine: 'Lossless Canvas Pipeline', desc: 'Lossless raster image format preserving fine line details, diagrams, and transparent alpha.' },
        { name: 'JPEG / JPG', ext: '.jpg, .jpeg', inOut: 'Input & Output', engine: 'DCT Quantization Canvas', desc: 'Standard photo compression format with adjustable quality budgeting from 10% to 100%.' },
      ],
    },
    {
      category: 'Mobile & Apple Media',
      badge: 'On-Device',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      formats: [
        { name: 'HEIC / HEIF', ext: '.heic, .heif', inOut: 'Input (Transcodes to any)', engine: 'heic2any (Client WebAssembly)', desc: 'Apple iPhone High Efficiency Image Container decoded directly in browser memory.' },
      ],
    },
    {
      category: 'Specialist & Vector Formats',
      badge: 'Specialist',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      formats: [
        { name: 'SVG', ext: '.svg', inOut: 'Input & Output', engine: 'Vector XML Canvas Wrapper', desc: 'Scalable Vector Graphics wrapped safely without script execution risks.' },
        { name: 'ICO', ext: '.ico', inOut: 'Input & Output', engine: 'Favicon Canvas Scaler', desc: 'Standard browser favicons with customizable square bounding box.' },
        { name: 'BMP', ext: '.bmp', inOut: 'Input & Output', engine: 'Uncompressed Bitmap Canvas', desc: 'Legacy uncompressed Windows bitmap raster graphics.' },
        { name: 'GIF', ext: '.gif', inOut: 'Input & Output', engine: 'Indexed Raster Canvas', desc: 'Still-frame GIF graphics decoding with full palette support.' },
      ],
    },
  ];

  return (
    <section aria-labelledby="supported-formats-heading" className="w-full mt-10 sm:mt-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mb-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hardware Accelerated</span>
          </div>
          <h2 id="supported-formats-heading" className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Supported Formats & Conversion Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Every format is processed locally using in-browser WebAssembly, Web Workers, and Canvas APIs.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {FORMAT_CATEGORIES.map((cat, idx) => (
          <div
            key={idx}
            className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm sm:text-base text-white">{cat.category}</h3>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cat.badgeColor}`}>
                {cat.badge}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cat.formats.map((fmt, fIdx) => (
                <div
                  key={fIdx}
                  className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-sm text-white">{fmt.name}</span>
                      <span className="text-[11px] font-mono text-slate-500">{fmt.ext}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {fmt.inOut}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">
                    {fmt.desc}
                  </p>
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-mono">
                    <Cpu className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{fmt.engine}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
