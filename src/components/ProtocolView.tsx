'use client';

import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  Check,
  Copy,
  ChevronLeft,
  ShieldCheck,
  Heart,
  Droplet,
} from 'lucide-react';
import { SkincareRoutine, SkinMetrics } from '../types';

interface ProtocolViewProps {
  routine: SkincareRoutine;
  metrics: SkinMetrics;
  onBackToDashboard: () => void;
}

export const ProtocolView: React.FC<ProtocolViewProps> = ({
  routine,
  metrics,
  onBackToDashboard,
}) => {
  const [activeTime, setActiveTime] = useState<'am' | 'pm'>('am');
  const [copied, setCopied] = useState<boolean>(false);

  const currentSteps = activeTime === 'am' ? routine.am : routine.pm;

  const handleCopyPrescription = async () => {
    const text = `
=== РИТУАЛ УХОДА MINA ===
Тип кожи: ${metrics.skinType} • Glow Score: ${metrics.overallHealthScore}/100
Главный фокус: ${metrics.primaryConcern}

--- ☀️ УТРЕННИЙ УХОД (AM) ---
${routine.am
  .map(
    (s) =>
      `Шаг ${s.order} (${s.phase}): ${s.productName}\n• Активы: ${s.keyActives.join(', ')}\n• Применение: ${s.usageAdvice}\n`
  )
  .join('\n')}

--- 🌙 ВЕЧЕРНИЙ УХОД (PM) ---
${routine.pm
  .map(
    (s) =>
      `Шаг ${s.order} (${s.phase}): ${s.productName}\n• Активы: ${s.keyActives.join(', ')}\n• Применение: ${s.usageAdvice}\n`
  )
  .join('\n')}

--- ТВОИ СУПЕР-ИНГРЕДИЕНТЫ ---
${routine.keyIngredientsToSeek.map((i) => `✨ ${i.ingredient}: ${i.benefit}`).join('\n')}
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Назад к показателям кожи</span>
        </button>

        <button
          type="button"
          onClick={handleCopyPrescription}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Скопировано в буфер!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-stone-500" />
              <span>Скопировать уход</span>
            </>
          )}
        </button>
      </div>

      {/* Routine Container */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header with Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Персональная программа</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
              Твой ритуал ухода за кожей
            </h2>
            <p className="text-xs text-stone-500">
              Простые и понятные шаги для твоей кожи ({metrics.skinType}).
            </p>
          </div>

          {/* AM / PM Pills */}
          <div className="inline-flex p-1 bg-stone-100/90 rounded-2xl border border-stone-200 text-xs font-bold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTime('am')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                activeTime === 'am'
                  ? 'bg-amber-100/70 text-amber-900 shadow-xs font-bold border border-amber-200/80'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>☀️ Утро (AM)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTime('pm')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                activeTime === 'pm'
                  ? 'bg-indigo-100/70 text-indigo-900 shadow-xs font-bold border border-indigo-200/80'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-500" />
              <span>🌙 Вечер (PM)</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Regimen Cards */}
        <div className="space-y-3">
          {currentSteps.map((step) => (
            <div
              key={step.order}
              className="p-4 sm:p-5 rounded-2xl border border-rose-100/70 bg-gradient-to-r from-white to-stone-50/50 hover:to-rose-50/20 transition-all shadow-2xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center shrink-0 border border-rose-200/80">
                    {step.order}
                  </span>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 block">
                      {step.phase}
                    </span>
                    <h3 className="text-sm font-bold text-stone-900 font-serif">
                      {step.productName}
                    </h3>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-stone-400 bg-stone-100 px-2.5 py-0.5 rounded-full hidden sm:inline-block">
                  {step.productType}
                </span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed pl-11">
                👉 <span className="font-semibold text-stone-800">Как наносить: </span>
                {step.usageAdvice}
              </p>

              {/* Actives badges */}
              <div className="flex flex-wrap items-center gap-1.5 pl-11 pt-1">
                <span className="text-[10px] text-stone-400 font-medium mr-1">
                  Активные вещества:
                </span>
                {step.keyActives.map((a) => (
                  <span
                    key={a}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-stone-700 border border-stone-200"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Super Ingredients & Things to Avoid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Beneficial Actives */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-6 space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-stone-100">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-stone-900 font-serif">
              Твои супер-ингредиенты
            </h3>
          </div>

          <div className="space-y-2">
            {routine.keyIngredientsToSeek.map((item) => (
              <div
                key={item.ingredient}
                className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 space-y-0.5"
              >
                <span className="text-xs font-bold text-emerald-950 block">
                  ✨ {item.ingredient}
                </span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  {item.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Ingredients to Avoid */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-6 space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-stone-100">
            <ShieldCheck className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-stone-900 font-serif">
              Чего лучше избегать
            </h3>
          </div>

          <div className="space-y-2">
            {routine.ingredientsToAvoid.map((item) => (
              <div
                key={item.ingredient}
                className="p-3 rounded-2xl bg-rose-50/40 border border-rose-100/80 space-y-0.5"
              >
                <span className="text-xs font-bold text-rose-950 block">
                  🚫 {item.ingredient}
                </span>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
