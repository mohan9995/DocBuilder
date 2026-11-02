import React, { useState } from 'react';
import { X, Apple, Play, Laptop, ShieldCheck, Copy, Check, Terminal } from 'lucide-react';

interface PlatformGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlatformGuideModal: React.FC<PlatformGuideModalProps> = ({ isOpen, onClose }) => {
  const [activePlatform, setActivePlatform] = useState<'ios' | 'android' | 'web'>('ios');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Cross-Platform & Store Deployment Guide
              </h3>
              <p className="text-xs text-slate-500">
                How to run on Web/Laptop and publish to App Store & Google Play
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selection Tabs */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex space-x-2">
          <button
            onClick={() => setActivePlatform('ios')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activePlatform === 'ios'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>Apple App Store (iOS)</span>
          </button>

          <button
            onClick={() => setActivePlatform('android')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activePlatform === 'android'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Google Play Store (Android)</span>
          </button>

          <button
            onClick={() => setActivePlatform('web')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activePlatform === 'web'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Laptop & Web PWA</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {/* iOS Section */}
          {activePlatform === 'ios' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 text-xs">
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                  Native iOS Xcode Project:
                </span>{' '}
                Capacitor wraps this lightweight React app into a native Swift/Xcode workspace ready for TestFlight and App Store submission.
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
                  1. Build & Generate iOS Project:
                </h4>
                <div className="relative bg-slate-900 text-slate-200 font-mono p-3 rounded-xl text-xs">
                  <pre>
                    npm run build{'\n'}
                    npx cap add ios{'\n'}
                    npx cap sync ios{'\n'}
                    npx cap open ios
                  </pre>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'npm run build && npx cap add ios && npx cap sync ios && npx cap open ios',
                        'ios-code'
                      )
                    }
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    {copiedCode === 'ios-code' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
                  2. In Xcode:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 text-xs">
                  <li>Select your Apple Developer Team in <span className="font-semibold text-slate-700 dark:text-slate-200">Signing & Capabilities</span>.</li>
                  <li>Set bundle identifier (e.g. <span className="font-mono">com.omniconvert.app</span>).</li>
                  <li>Click <span className="font-semibold text-slate-700 dark:text-slate-200">Product &gt; Archive</span> and upload to App Store Connect!</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 flex items-start space-x-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-800 dark:text-emerald-300">
                  <span className="font-semibold">App Store Privacy Nutrition Labels:</span> Because conversions execute 100% on the user's device, you can answer "Data Not Collected" on App Store Connect.
                </p>
              </div>
            </div>
          )}

          {/* Android Section */}
          {activePlatform === 'android' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 text-xs">
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                  Google Play Store (Android Studio):
                </span>{' '}
                Compiles into a signed Android App Bundle (<span className="font-mono">.aab</span>) for the Google Play Console.
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
                  1. Build & Generate Android Project:
                </h4>
                <div className="relative bg-slate-900 text-slate-200 font-mono p-3 rounded-xl text-xs">
                  <pre>
                    npm run build{'\n'}
                    npx cap add android{'\n'}
                    npx cap sync android{'\n'}
                    npx cap open android
                  </pre>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'npm run build && npx cap add android && npx cap sync android && npx cap open android',
                        'android-code'
                      )
                    }
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    {copiedCode === 'android-code' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
                  2. In Android Studio:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 text-xs">
                  <li>Click <span className="font-semibold text-slate-700 dark:text-slate-200">Build &gt; Generate Signed Bundle / APK</span>.</li>
                  <li>Choose <span className="font-semibold text-slate-700 dark:text-slate-200">Android App Bundle (.aab)</span>.</li>
                  <li>Create or select your upload keystore, and upload to Google Play Console!</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 flex items-start space-x-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-800 dark:text-emerald-300">
                  <span className="font-semibold">Google Play Data Safety Section:</span> You can declare "No user data collected or shared with third parties", which speeds up Google Play review approval!
                </p>
              </div>
            </div>
          )}

          {/* Web Section */}
          {activePlatform === 'web' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 text-xs">
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                  Laptop / Desktop Web Hosting:
                </span>{' '}
                Because it is a static, client-side bundle, you can host it for free on Vercel, Netlify, Cloudflare Pages, or GitHub Pages.
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
                  Run locally on your laptop:
                </h4>
                <div className="relative bg-slate-900 text-slate-200 font-mono p-3 rounded-xl text-xs">
                  <pre>npm run dev</pre>
                  <button
                    onClick={() => copyToClipboard('npm run dev', 'web-code')}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    {copiedCode === 'web-code' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
                  Production Build:
                </h4>
                <div className="relative bg-slate-900 text-slate-200 font-mono p-3 rounded-xl text-xs">
                  <pre>npm run build</pre>
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  Produces an optimized <span className="font-mono">dist/</span> directory that can be deployed to any static host.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
