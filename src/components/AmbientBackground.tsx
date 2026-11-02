import React from 'react';

export type ThemePreset = 'tangerine' | 'aurora' | 'midnight' | 'frost';

interface AmbientBackgroundProps {
  theme: ThemePreset;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ theme }) => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden transition-all duration-700">
      {theme === 'tangerine' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-[#ff5e36] via-[#ff9057] to-[#804dee]">
          {/* Ambient luminous radial orbs */}
          <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-[#ffa94d] opacity-60 blur-3xl animate-pulse" />
          <div className="absolute top-[30%] -right-[15%] w-[60vw] h-[60vw] rounded-full bg-[#f43f5e] opacity-50 blur-3xl" />
          <div className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] rounded-full bg-[#6366f1] opacity-60 blur-3xl" />
          {/* Soft noise texture overlay for Apple frosted depth */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_0,transparent_100%)]" />
        </div>
      )}

      {theme === 'aurora' && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#042f2e]">
          <div className="absolute -top-[10%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-[#06b6d4] opacity-30 blur-3xl" />
          <div className="absolute top-[40%] right-[0%] w-[50vw] h-[50vw] rounded-full bg-[#8b5cf6] opacity-35 blur-3xl" />
          <div className="absolute bottom-[0%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-[#10b981] opacity-25 blur-3xl" />
        </div>
      )}

      {theme === 'midnight' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b] via-[#111115] to-[#18181b]">
          <div className="absolute top-[20%] left-[25%] w-[50vw] h-[50vw] rounded-full bg-[#4f46e5] opacity-20 blur-3xl" />
          <div className="absolute bottom-[10%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-[#db2777] opacity-15 blur-3xl" />
        </div>
      )}

      {theme === 'frost' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1]">
          <div className="absolute -top-[20%] right-[10%] w-[60vw] h-[60vw] rounded-full bg-[#e0e7ff] opacity-70 blur-3xl" />
          <div className="absolute bottom-[0%] left-[10%] w-[70vw] h-[70vw] rounded-full bg-[#fce7f3] opacity-60 blur-3xl" />
        </div>
      )}
    </div>
  );
};
