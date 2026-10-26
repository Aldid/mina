'use client';

import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SkincareRoutine, SkinMetrics } from '../types';

interface FloDailyPlanProps {
  routine: SkincareRoutine;
  metrics: SkinMetrics;
}

export const FloDailyPlan: React.FC<FloDailyPlanProps> = ({ routine, metrics }) => {
  const [activeTime, setActiveTime] = useState<'am' | 'pm'>('am');
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]); // Step 1 pre-completed for satisfaction
  const [copied, setCopied] = useState<boolean>(false);

  const currentSteps = activeTime === 'am' ? routine.am : routine.pm;

  const toggleStep = (order: number) => {
    let next: number[];
    if (completedSteps.includes(order)) {
      next = completedSteps.filter((s) => s !== order);
    } else {
      next = [...completedSteps, order];
      // Celebrate step completion
      try {
        confetti({
          particleCount: 20,
          spread: 45,
          origin: { y: 0.7 },
          colors: ['#ff5b79', '#ff758f', '#fde047'],
        });
      } catch {
        // ignore
      }
    }
    setCompletedSteps(next);
  };

  const handleCopy = async () => {
    const text = `
=== МОЙ БЬЮТИ-ПЛАН MINA (FLO ДЛЯ ЛИЦА) ===
Тип: ${metrics.skinType} • Сияние: ${metrics.overallHealthScore}%
Фокус дня: ${metrics.primaryConcern}

☀️ УТРО (AM):
${routine.am.map((s) => `[${completedSteps.includes(s.order) ? '✓' : ' '}] Шаг ${s.order}: ${s.productName} (${s.keyActives.join(', ')})`).join('\n')}

🌙 ВЕЧЕР (PM):
${routine.pm.map((s) => `[ ] Шаг ${s.order}: ${s.productName} (${s.keyActives.join(', ')})`).join('\n')}
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
    <div className="bg-white rounded-3xl p-5 border border-rose-100/80 flo-card-shadow space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#ff5b79]" />
            <span>Твой ритуал ухода на сегодня</span>
          </h3>
          <p className="text-[11px] text-stone-400">
            Выполняй шаги и отмечай галочками:
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-[#ff5b79] hover:bg-rose-100 transition-all flex items-center gap-1"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Скопировано!' : 'В заметки'}</span>
        </button>
      </div>

      {/* AM / PM Segmented Control */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-50 rounded-2xl border border-stone-100">
        <button
          type="button"
          onClick={() => setActiveTime('am')}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTime === 'am'
              ? 'bg-gradient-to-r from-amber-400 to-[#ff758f] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>☀️ Утро (5 шагов)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTime('pm')}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTime === 'pm'
              ? 'bg-gradient-to-r from-[#ff5b79] to-purple-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>🌙 Вечер (5 шагов)</span>
        </button>
      </div>

      {/* Steps List */}
      <div className="space-y-2.5">
        {currentSteps.map((step) => {
          const isDone = completedSteps.includes(step.order);
          return (
            <div
              key={step.order}
              onClick={() => toggleStep(step.order)}
              className={`cursor-pointer rounded-2xl p-3.5 border transition-all active:scale-[0.99] flex items-start gap-3 ${
                isDone
                  ? 'bg-rose-50/40 border-rose-200/60'
                  : 'bg-white hover:bg-stone-50/70 border-stone-100'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg mt-0.5 shrink-0 flex items-center justify-center border transition-all ${
                  isDone
                    ? 'bg-[#ff5b79] border-[#ff5b79] text-white shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-300'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${isDone ? 'opacity-100' : 'opacity-0'}`} />
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Шаг 0{step.order} • {step.phase === 'Cleanse' ? 'Очищение' : step.phase === 'Tone & Prep' ? 'Тонизирование' : step.phase === 'Target & Treat' ? 'Сыворотка' : step.phase === 'Hydrate & Seal' ? 'Увлажнение' : 'Защита от солнца'}
                  </span>
                  {isDone && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded-full">
                      Выполнено ✨
                    </span>
                  )}
                </div>

                <h4 className={`text-xs sm:text-sm font-bold leading-snug ${isDone ? 'text-stone-500 line-through' : 'text-stone-900'}`}>
                  {step.productName}
                </h4>

                <div className="flex flex-wrap gap-1 pt-0.5">
                  {step.keyActives.map((active) => (
                    <span
                      key={active}
                      className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-rose-50 text-[#ff5b79] border border-rose-100/60"
                    >
                      + {active}
                    </span>
                  ))}
                </div>

                <p className="text-[11px] text-stone-500 leading-relaxed pt-1">
                  💡 <strong className="text-stone-700">Секрет: </strong>{step.usageAdvice}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
