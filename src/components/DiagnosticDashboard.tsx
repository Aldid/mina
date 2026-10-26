'use client';

import React, { useState } from 'react';
import {
  Droplets,
  Sparkles,
  Shield,
  Heart,
  ChevronRight,
  Smile,
  Flower2,
  CheckCircle2,
  Info,
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

  const beautyPillars = [
    {
      label: 'Увлажненность',
      sub: metrics.hydration >= 70 ? 'Кожа напитанная и эластичная' : 'Нуждается в мягком увлажняющем тонере',
      value: metrics.hydration,
      icon: Droplets,
      color: 'from-sky-400 to-blue-400',
      badgeBg: 'bg-sky-50 text-sky-800 border-sky-100',
    },
    {
      label: 'Матовость Т-зоны',
      sub: metrics.sebumControl >= 65 ? 'Бархатный финиш без блеска' : 'Легкий блеск к середине дня',
      value: metrics.sebumControl,
      icon: Flower2,
      color: 'from-amber-400 to-rose-400',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-100',
    },
    {
      label: 'Защитный барьер',
      sub: metrics.barrierHealth >= 70 ? 'Крепкий защитный барьер' : 'Нуждается в церамидах и защите',
      value: metrics.barrierHealth,
      icon: Shield,
      color: 'from-emerald-400 to-teal-400',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    },
    {
      label: 'Спокойствие тона',
      sub: metrics.rednessSensitivity >= 65 ? 'Ровный фарфоровый цвет лица' : 'Склонность к легкому румянцу',
      value: metrics.rednessSensitivity,
      icon: Heart,
      color: 'from-rose-400 to-pink-400',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-100',
    },
  ];

  const zoneNamesRu: Record<string, string> = {
    'Forehead': 'Лоб',
    'T-Zone': 'Т-зона (нос)',
    'Cheeks': 'Щёки',
    'Under-Eye': 'Зона вокруг глаз',
    'Chin': 'Подбородок',
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Glow Snapshot Hero Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-rose-100 p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            {/* Glowing Aura Ring */}
            <div className="relative w-22 h-22 shrink-0 rounded-full bg-gradient-to-tr from-rose-400 via-rose-200 to-amber-200 p-1 shadow-md">
              <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-stone-900 leading-none">
                  {metrics.overallHealthScore}
                </span>
                <span className="text-[9px] tracking-wider uppercase font-bold text-rose-500 mt-0.5">
                  Glow Score
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/70 text-xs font-semibold">
                <Sparkles className="w-3 h-3 text-rose-500" />
                <span>Тип: {metrics.skinType === 'Combination' ? 'Комбинированная' : metrics.skinType === 'Sensitive' ? 'Чувствительная' : metrics.skinType === 'Oily' ? 'Склонная к жирности' : metrics.skinType === 'Dry' ? 'Сухая' : 'Нормальная (Glass Skin)'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Твоя карта сияния кожи
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
                Главный акцент ухода: <span className="font-semibold text-rose-600">{metrics.primaryConcern}</span>.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onProceedToProtocol}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <span>Мой ритуал ухода (AM/PM)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Soft Beauty Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-rose-50">
          {beautyPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.label}
                className="bg-stone-50/70 rounded-2xl p-3 border border-stone-100 flex flex-col justify-between space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <Icon className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold text-stone-900">{pillar.value}%</span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-stone-800 leading-none">
                    {pillar.label}
                  </h4>
                  <p className="text-[10px] text-stone-500 mt-1 leading-tight">
                    {pillar.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive 5-Zone Face Guide */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-rose-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-rose-500" />
              <span>Зональный разбор лица</span>
            </h3>
            <p className="text-xs text-stone-500">
              Нажми на зону лица, чтобы узнать подробное наблюдение и рекомендацию:
            </p>
          </div>
        </div>

        {/* Zone Selector Chips */}
        <div className="flex flex-wrap gap-1.5">
          {metrics.zones.map((zone) => {
            const isSelected = selectedZone.zone === zone.zone;
            const ruName = zoneNamesRu[zone.zone] || zone.zone;
            return (
              <button
                key={zone.zone}
                type="button"
                onClick={() => setSelectedZone(zone)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-rose-500 text-white shadow-2xs scale-105'
                    : 'bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-stone-900'
                }`}
              >
                {ruName} ({zone.score}%)
              </button>
            );
          })}
        </div>

        {/* Selected Zone Card */}
        <div className="bg-gradient-to-br from-rose-50/40 via-white to-amber-50/30 rounded-2xl p-4 border border-rose-100/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h4 className="text-sm font-bold text-stone-900">
                Зона: {zoneNamesRu[selectedZone.zone]} • {selectedZone.metric}
              </h4>
            </div>

            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100/70 text-rose-700">
              {selectedZone.severity === 'Optimal' ? '✨ В норме' : selectedZone.severity === 'Mild' ? '💧 Требует внимания' : '🌸 Особая забота'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="bg-white/80 p-3 rounded-xl border border-rose-100/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Что видит Mina
              </span>
              <p className="text-stone-700 leading-relaxed font-medium">
                {selectedZone.observation}
              </p>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-rose-100/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                Совет бьюти-эксперта
              </span>
              <p className="text-stone-700 leading-relaxed font-medium">
                {selectedZone.recommendation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
