'use client';

import React from 'react';
import { Sparkles, ShieldCheck, RotateCcw, ScanFace } from 'lucide-react';

interface HeaderProps {
  hasActiveScan: boolean;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ hasActiveScan, onReset }) => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-rose-400 to-amber-300 flex items-center justify-center text-white shadow-sm shadow-rose-200">
            <ScanFace className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-stone-900 font-serif">
                Mina
              </span>
              <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80">
                Skin AI
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
              Intelligent Facial Diagnostic Kiosk
            </p>
          </div>
        </div>

        {/* Center / Right status & actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-medium border border-stone-200/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ephemeral RAM Vision — Zero Image Storage</span>
          </div>

          {hasActiveScan && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200/80 active:bg-stone-200 transition-colors border border-stone-200 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span>New Scan</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
