'use client';

import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  AlertTriangle,
  Check,
  Calendar,
  Coffee,
  Copy,
  Printer,
  ChevronLeft,
  ShieldAlert,
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

  // Format full prescription text for copying
  const handleCopyPrescription = async () => {
    const text = `
=== MINA SKINCARE PRESCRIPTION ===
Skin Type: ${metrics.skinType} (Overall Health: ${metrics.overallHealthScore}/100)
Primary Concern: ${metrics.primaryConcern}

--- MORNING PROTOCOL (AM) ---
${routine.am
  .map(
    (s) =>
      `Step ${s.order}: ${s.phase} — ${s.productName}\nKey Actives: ${s.keyActives.join(', ')}\nAdvice: ${s.usageAdvice}\n`
  )
  .join('\n')}

--- EVENING PROTOCOL (PM) ---
${routine.pm
  .map(
    (s) =>
      `Step ${s.order}: ${s.phase} — ${s.productName}\nKey Actives: ${s.keyActives.join(', ')}\nAdvice: ${s.usageAdvice}\n`
  )
  .join('\n')}

--- KEY INGREDIENTS TO SEEK ---
${routine.keyIngredientsToSeek.map((i) => `• ${i.ingredient}: ${i.benefit}`).join('\n')}

--- INGREDIENTS TO AVOID ---
${routine.ingredientsToAvoid.map((i) => `• ${i.ingredient}: ${i.reason}`).join('\n')}
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors self-start"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Biometric Scores</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyPrescription}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-700 border border-stone-300 shadow-2xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>Copy Full Routine</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 shadow-2xs transition-colors hidden sm:flex"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>Print Prescription</span>
          </button>
        </div>
      </div>

      {/* AM vs PM Routine Switcher */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-md p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
              Clinical Daily Regimen
            </h2>
            <p className="text-xs text-stone-500">
              Personalized for {metrics.skinType} skin profile with focus on{' '}
              <span className="text-rose-600 font-semibold">{metrics.primaryConcern}</span>.
            </p>
          </div>

          <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-semibold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTime('am')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
                activeTime === 'am'
                  ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Morning (AM) Protection</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTime('pm')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
                activeTime === 'pm'
                  ? 'bg-indigo-50 text-indigo-900 border border-indigo-200 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-500" />
              <span>Evening (PM) Restoration</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Regimen Cards */}
        <div className="space-y-3">
          {currentSteps.map((step) => (
            <div
              key={step.order}
              className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <span className="w-7 h-7 rounded-full bg-rose-100 text-rose-800 text-xs font-serif font-bold flex items-center justify-center shrink-0 border border-rose-200">
                  {step.order}
                </span>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-rose-700">
                      {step.phase}
                    </span>
                    <span className="text-xs text-stone-300">•</span>
                    <h3 className="text-sm font-bold text-stone-900 font-serif">
                      {step.productName}
                    </h3>
                  </div>

                  <p className="text-xs text-stone-500">
                    {step.productType}
                  </p>

                  <p className="text-xs text-stone-700 pt-1 leading-relaxed">
                    <span className="font-semibold text-stone-900">How to Apply: </span>
                    {step.usageAdvice}
                  </p>
                </div>
              </div>

              {/* Key Actives Badges */}
              <div className="flex flex-wrap md:flex-col items-start md:items-end gap-1.5 shrink-0 pt-2 md:pt-0">
                <span className="text-[10px] text-stone-400 font-medium">Key Actives:</span>
                <div className="flex flex-wrap gap-1 md:justify-end">
                  {step.keyActives.map((active) => (
                    <span
                      key={active}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white text-stone-800 border border-stone-200 shadow-2xs"
                    >
                      {active}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ingredient Matchmaker (Seek vs Avoid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Beneficial Actives */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-md p-6 space-y-3.5">
          <div className="flex items-center gap-2 pb-1 border-b border-stone-100">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-stone-900">
              Key Actives to Seek
            </h3>
          </div>

          <div className="space-y-2.5">
            {routine.keyIngredientsToSeek.map((item) => (
              <div
                key={item.ingredient}
                className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-0.5 text-xs"
              >
                <span className="font-bold text-emerald-900 block">
                  {item.ingredient}
                </span>
                <p className="text-emerald-800/90 leading-relaxed text-[11px]">
                  {item.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contraindications / Ingredients to Avoid */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-md p-6 space-y-3.5">
          <div className="flex items-center gap-2 pb-1 border-b border-stone-100">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-stone-900">
              Ingredients to Avoid / Caution
            </h3>
          </div>

          <div className="space-y-2.5">
            {routine.ingredientsToAvoid.map((item) => (
              <div
                key={item.ingredient}
                className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-0.5 text-xs"
              >
                <span className="font-bold text-amber-950 block">
                  {item.ingredient}
                </span>
                <p className="text-amber-900/90 leading-relaxed text-[11px]">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Rituals & Lifestyle Tips */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
            <Calendar className="w-4 h-4 text-rose-600" />
            <span>Weekly Specialized Rituals</span>
          </div>
          <ul className="space-y-1.5 text-xs text-stone-600">
            {routine.weeklyRituals.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
            <Coffee className="w-4 h-4 text-rose-600" />
            <span>Lifestyle & Environmental Guidance</span>
          </div>
          <ul className="space-y-1.5 text-xs text-stone-600">
            {routine.lifestyleAndDietTips.map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
