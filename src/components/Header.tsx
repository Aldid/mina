'use client';

import React from 'react';
import { Sparkles, RotateCcw, ShieldCheck, Heart } from 'lucide-react';

interface HeaderProps {
  hasActiveScan: boolean;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ hasActiveScan, onReset }) => {
  return (
    <header className="w-full bg-white/70 backdrop-blur-xl border-b border-rose-100/60 sticky top-0 z-40 transition-all shadow-[0_4px_20px_-10px_rgba(244,63,94,0.08)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={hasActiveScan ? onReset : undefined}>
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-400 via-rose-300 to-amber-200 flex items-center justify-center text-white shadow-sm shadow-rose-200/80">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-stone-900">
                Mina
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block animate-pulse" />
            </div>
            <p className="text-[10px] text-stone-400 font-medium tracking-wider uppercase">
              Beauty & Skincare AI
            </p>
          </div>
        </div>

        {/* Center / Right actions */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50/80 text-rose-700 text-xs font-medium border border-rose-100/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Приватно • Фото не сохраняются</span>
          </div>

          {hasActiveScan && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-stone-700 bg-white hover:bg-rose-50/60 active:scale-95 transition-all border border-rose-200/80 shadow-xs hover:border-rose-300"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
              <span>В зеркало</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
