'use client';

import React from 'react';
import { Sparkles, ChevronRight, Droplets, Heart, Shield, ArrowUpRight } from 'lucide-react';
import { SkinMetrics } from '../types';

interface FloSkinCircleProps {
  metrics: SkinMetrics;
  onOpenRoutine: () => void;
  onOpenScanner: () => void;
}

export const FloSkinCircle: React.FC<FloSkinCircleProps> = ({
  metrics,
  onOpenRoutine,
  onOpenScanner,
}) => {
  return (
    <div className="flex flex-col items-center text-center space-y-4 pt-2">
      {/* Flo-style Glowing Main Circle */}
      <div
        onClick={onOpenRoutine}
        className="relative group cursor-pointer w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2.5 bg-gradient-to-tr from-[#ff758f]/40 via-[#ff5b79]/20 to-[#ffe5ec] flo-circle-pulse transition-transform duration-300 active:scale-95 flex items-center justify-center"
      >
        {/* Inner Circle Surface */}
        <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center p-6 space-y-1.5 shadow-inner border border-rose-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff5b79] px-3 py-0.5 rounded-full bg-rose-50 border border-rose-100/60">
            {metrics.skinType === 'Combination' ? 'Комбинированная' : metrics.skinType === 'Sensitive' ? 'Чувствительная' : metrics.skinType === 'Oily' ? 'Склонная к жирности' : 'Нормальная / Glass Skin'}
          </span>

          <div className="flex items-baseline justify-center gap-1 pt-1">
            <span className="text-5xl sm:text-6xl font-black text-stone-900 tracking-tight leading-none">
              {metrics.overallHealthScore}
            </span>
            <span className="text-base font-extrabold text-[#ff5b79]">%</span>
          </div>

          <h3 className="text-sm font-bold text-stone-800">
            Здоровое сияние
          </h3>

          <p className="text-xs text-stone-500 leading-snug max-w-[180px]">
            {metrics.primaryConcern}
          </p>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ff5b79] group-hover:translate-x-0.5 transition-transform">
              <span>Открыть ритуал</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* 3 Quick Flo Health Pills */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm pt-1">
        <div className="bg-white rounded-2xl p-2.5 border border-rose-100/80 text-center flo-card-shadow">
          <div className="flex items-center justify-center gap-1 text-sky-500 text-xs font-bold">
            <Droplets className="w-3.5 h-3.5" />
            <span>{metrics.hydration}%</span>
          </div>
          <span className="text-[10px] text-stone-500 font-medium mt-0.5 block">Влага</span>
        </div>

        <div className="bg-white rounded-2xl p-2.5 border border-rose-100/80 text-center flo-card-shadow">
          <div className="flex items-center justify-center gap-1 text-amber-500 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{metrics.sebumControl}%</span>
          </div>
          <span className="text-[10px] text-stone-500 font-medium mt-0.5 block">Матовость</span>
        </div>

        <div className="bg-white rounded-2xl p-2.5 border border-rose-100/80 text-center flo-card-shadow">
          <div className="flex items-center justify-center gap-1 text-emerald-500 text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>{metrics.barrierHealth}%</span>
          </div>
          <span className="text-[10px] text-stone-500 font-medium mt-0.5 block">Барьер</span>
        </div>
      </div>
    </div>
  );
};
