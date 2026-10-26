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
  Flower2,
  AlertCircle,
  Lightbulb,
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
=== ТВОЙ БЬЮТИ-РИТУАЛ MINA ===
Тип кожи: ${metrics.skinType} • Glow Score: ${metrics.overallHealthScore}/100
Главный фокус: ${metrics.primaryConcern}

--- ☀️ УТРЕННИЙ УХОД (ЗАЩИТА И СВЕЖЕСТЬ) ---
${routine.am
  .map(
    (s) =>
      `Шаг 0${s.order}: ${s.productName}\n• Активные вещества: ${s.keyActives.join(', ')}\n• Секрет нанесения: ${s.usageAdvice}\n`
  )
  .join('\n')}

--- 🌙 ВЕЧЕРНИЙ УХОД (ВОССТАНОВЛЕНИЕ И ПИТАНИЕ) ---
${routine.pm
  .map(
    (s) =>
      `Шаг 0${s.order}: ${s.productName}\n• Активные вещества: ${s.keyActives.join(', ')}\n• Секрет нанесения: ${s.usageAdvice}\n`
  )
  .join('\n')}

--- ТВОИ СУПЕР-ИНГРЕДИЕНТЫ ---
${routine.keyIngredientsToSeek.map((i) => `✨ ${i.ingredient}: ${i.benefit}`).join('\n')}

--- ЧЕГО ЛУЧШЕ ИЗБЕГАТЬ ---
${routine.ingredientsToAvoid.map((i) => `⚠️ ${i.ingredient}: ${i.reason}`).join('\n')}
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
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-1">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-rose-500" />
          <span>Назад к показателям кожи</span>
        </button>

        <button
          type="button"
          onClick={handleCopyPrescription}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-rose-50 text-stone-700 border border-rose-200/80 shadow-2xs transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Скопировано в буфер!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-rose-500" />
              <span>Скопировать в заметки</span>
            </>
          )}
        </button>
      </div>

      {/* AM / PM Segmented Control */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-rose-100 p-2 shadow-xs">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTime('am')}
            className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTime === 'am'
                ? 'bg-gradient-to-r from-amber-400 to-rose-400 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>☀️ Утренний ритуал (5 шагов)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTime('pm')}
            className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTime === 'pm'
                ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>🌙 Вечерний ритуал (5 шагов)</span>
          </button>
        </div>
      </div>

      {/* Step Cards List */}
      <div className="space-y-3">
        {currentSteps.map((step) => (
          <div
            key={step.order}
            className="bg-white/95 backdrop-blur-md rounded-2xl border border-rose-100/80 p-4 sm:p-5 shadow-xs hover:border-rose-300 transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-8 h-8 rounded-xl bg-rose-50 text-rose-600 font-extrabold text-xs flex items-center justify-center border border-rose-200/60 shadow-2xs">
                  0{step.order}
                </span>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                      {step.phase === 'Cleanse' ? 'Очищение' : step.phase === 'Tone & Prep' ? 'Тонизирование' : step.phase === 'Target & Treat' ? 'Сыворотка' : step.phase === 'Hydrate & Seal' ? 'Увлажнение' : 'Защита от солнца'}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">
                      {step.productType}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                    {step.productName}
                  </h4>
                </div>
              </div>
            </div>

            {/* Active Ingredients Tags */}
            <div className="flex flex-wrap gap-1.5 pl-11">
              {step.keyActives.map((active) => (
                <span
                  key={active}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100"
                >
                  + {active}
                </span>
              ))}
            </div>

            {/* Application secret */}
            <div className="ml-11 bg-stone-50/70 p-3 rounded-xl border border-stone-100 text-xs text-stone-600 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-stone-800 font-semibold">Секрет нанесения: </strong>
                {step.usageAdvice}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Super Ingredients & Avoid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
        {/* Ingredients to Seek */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-emerald-100/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
              ✨
            </span>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Твои супер-ингредиенты
            </h4>
          </div>

          <div className="space-y-2 text-xs">
            {routine.keyIngredientsToSeek.map((item) => (
              <div key={item.ingredient} className="space-y-0.5">
                <span className="font-bold text-emerald-800">{item.ingredient}</span>
                <p className="text-stone-500 leading-tight text-[11px]">{item.benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ingredients to Avoid */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-amber-100/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
              ⚠️
            </span>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Чего лучше избегать
            </h4>
          </div>

          <div className="space-y-2 text-xs">
            {routine.ingredientsToAvoid.map((item) => (
              <div key={item.ingredient} className="space-y-0.5">
                <span className="font-bold text-amber-900">{item.ingredient}</span>
                <p className="text-stone-500 leading-tight text-[11px]">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lifestyle Habits Card */}
      <div className="bg-gradient-to-r from-rose-50/70 via-white to-amber-50/50 rounded-2xl border border-rose-100 p-4 shadow-xs flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-stone-600">
          <h4 className="font-bold text-stone-900">Бьюти-привычки для сияния:</h4>
          <p className="leading-relaxed">
            Пей чистую воду в течение дня, меняй наволочку каждые 3–4 дня и обязательно смывай солнцезащитный крем вечером двухэтапным очищением.
          </p>
        </div>
      </div>
    </div>
  );
};
