'use client';

import React, { useState } from 'react';
import {
  Droplets,
  Sparkles,
  Shield,
  Heart,
  ChevronRight,
  Smile,
  MapPin,
  Flame,
} from 'lucide-react';
import { SkinMetrics, ZoneAnalysis } from '../types';

interface DiagnosticDashboardProps {
  metrics: SkinMetrics;
  onProceedToProtocol: () => void;
}

export const DiagnosticDashboard: React.FC<DiagnosticDashboardProps> = ({
  metrics,
  onProceedToProtocol,
}) => {
  const [selectedZone, setSelectedZone] = useState<ZoneAnalysis>(metrics.zones[0]);

  // Simplified friendly metrics for everyday users
  const simplePillars = [
    {
      label: 'Увлажненность',
      enLabel: 'Hydration',
      value: metrics.hydration,
      status: metrics.hydration >= 70 ? 'Бархатистая и напитанная' : 'Требует увлажнения',
      icon: Droplets,
      textColor: 'text-sky-700',
      bgColor: 'bg-sky-50/80 border-sky-200/80',
      barColor: 'bg-sky-400',
    },
    {
      label: 'Матовость и себум',
      enLabel: 'Oil Balance',
      value: metrics.sebumControl,
      status: metrics.sebumControl >= 65 ? 'Сбалансированная' : 'Склонна к блеску в T-зоне',
      icon: Flame,
      textColor: 'text-amber-800',
      bgColor: 'bg-amber-50/80 border-amber-200/80',
      barColor: 'bg-amber-400',
    },
    {
      label: 'Защитный барьер',
      enLabel: 'Skin Barrier',
      value: metrics.barrierHealth,
      status: metrics.barrierHealth >= 70 ? 'Стойкий и здоровый' : 'Чувствительный к перепадам',
      icon: Shield,
      textColor: 'text-emerald-800',
      bgColor: 'bg-emerald-50/80 border-emerald-200/80',
      barColor: 'bg-emerald-400',
    },
    {
      label: 'Спокойствие кожи',
      enLabel: 'Calmness',
      value: metrics.rednessSensitivity,
      status: metrics.rednessSensitivity >= 65 ? 'Ровный красивый тон' : 'Склонна к покраснениям',
      icon: Heart,
      textColor: 'text-rose-800',
      bgColor: 'bg-rose-50/80 border-rose-200/80',
      barColor: 'bg-rose-400',
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Glow Snapshot Hero Card */}
      <div className="bg-gradient-to-br from-white via-rose-50/30 to-amber-50/20 rounded-3xl border border-rose-100/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Glowing Score Ring */}
            <div className="relative w-22 h-22 sm:w-24 sm:h-24 shrink-0 rounded-full bg-gradient-to-tr from-rose-200 via-rose-300 to-amber-200 flex items-center justify-center p-1.5 shadow-sm">
              <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">
                <span className="text-3xl font-serif font-black text-stone-900 leading-none">
                  {metrics.overallHealthScore}
                </span>
                <span className="text-[10px] tracking-widest uppercase font-bold text-rose-500 mt-1">
                  Glow Score
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Тип кожи: {metrics.skinType}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
                Твой снимок сияния
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                Фокус внимания: <span className="font-semibold text-rose-700">{metrics.primaryConcern}</span>.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onProceedToProtocol}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-950 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            <span>Посмотреть твой ритуал ухода</span>
            <ChevronRight className="w-4 h-4 text-rose-300" />
          </button>
        </div>

        {/* 4 Soft Friendly Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {simplePillars.map((p) => (
            <div
              key={p.label}
              className={`p-4 rounded-2xl border ${p.bgColor} space-y-2 transition-all hover:bg-white`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p.icon className={`w-4 h-4 ${p.textColor}`} />
                  <span className="text-xs font-bold text-stone-900">
                    {p.label}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-stone-700">
                  {p.value}%
                </span>
              </div>

              {/* Gentle progress track */}
              <div className="w-full h-1.5 rounded-full bg-stone-200/60 overflow-hidden">
                <div
                  className={`h-full rounded-full ${p.barColor} transition-all duration-700`}
                  style={{ width: `${p.value}%` }}
                />
              </div>

              <p className="text-[11px] text-stone-600 font-medium">
                {p.status}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Simplified Face Zones — Click to explore */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-stone-900 font-serif">
              Зоны твоего лица
            </h3>
          </div>
          <span className="text-[11px] text-stone-400 font-medium">
            Нажми на зону, чтобы увидеть совет
          </span>
        </div>

        {/* Easy Zone Buttons */}
        <div className="flex flex-wrap gap-2">
          {metrics.zones.map((z) => (
            <button
              key={z.zone}
              type="button"
              onClick={() => setSelectedZone(z)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedZone.zone === z.zone
                  ? 'bg-rose-50 text-rose-900 border border-rose-300 shadow-xs font-bold'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/80'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  z.severity === 'Optimal'
                    ? 'bg-emerald-400'
                    : z.severity === 'Mild'
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
              />
              <span>{z.zone}</span>
            </button>
          ))}
        </div>

        {/* Selected Zone Friendly Tip Box */}
        {selectedZone && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-stone-50 to-rose-50/30 border border-rose-100/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 font-serif">
                Область: {selectedZone.zone}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-stone-600 border border-stone-200">
                {selectedZone.severity === 'Optimal' ? 'В порядке' : 'Требует внимания'}
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              <span className="font-semibold text-stone-800">Что заметил сканер: </span>
              {selectedZone.observation}
            </p>

            <p className="text-xs text-rose-700 font-medium leading-relaxed bg-white/70 p-2.5 rounded-xl border border-rose-100">
              💡 <span className="font-semibold">Что делать: </span>
              {selectedZone.recommendation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
