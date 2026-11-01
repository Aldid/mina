'use client';

import React from 'react';
import { Check, Plus } from 'lucide-react';
import { CONTEXTS, SENSATIONS, SymptomId } from '../lib/dailyCare';

interface FloSymptomLoggerProps {
  symptoms: SymptomId[];
  onToggle: (id: SymptomId) => void;
  heading: string;
}

const groups = [
  { label: 'Ощущения', items: SENSATIONS },
  { label: 'Контекст дня', items: CONTEXTS },
];

export const FloSymptomLogger: React.FC<FloSymptomLoggerProps> = ({ symptoms, onToggle, heading }) => (
  <section className="mina-checkin space-y-5" aria-labelledby="mina-symptoms-title">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1.5">
        <h2 id="mina-symptoms-title" tabIndex={-1} className="text-base font-bold text-stone-900">{heading}</h2>
        <p className="text-sm leading-relaxed text-stone-600">Выбери ощущения. Mina подстроит фокус ухода.</p>
      </div>
      <span className="shrink-0 py-1 text-xs font-medium text-stone-500" aria-live="polite" aria-atomic="true">
        {symptoms.length} отмечено
      </span>
    </div>

    {groups.map((group) => (
      <fieldset key={group.label} className="space-y-2.5">
        <legend className="text-sm font-semibold text-stone-800">{group.label}</legend>
        <div className="flex flex-wrap gap-2">
          {group.items.map((item) => {
            const selected = symptoms.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onToggle(item.id)}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b52b4b] motion-reduce:transition-none ${selected ? 'border-[#c06c79] bg-[#f9e9e9] text-[#782e40]' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'}`}
              >
                <span>{item.label}</span>
                {selected ? <Check className="h-4 w-4 shrink-0" aria-hidden="true" /> : <Plus className="h-4 w-4 shrink-0 text-stone-500" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </fieldset>
    ))}

    <p className="border-t border-rose-50 pt-3 text-xs leading-relaxed text-stone-500">
      Контекст — для наблюдений, не для диагноза. При выраженном или сохраняющемся дискомфорте обратись к специалисту.
    </p>
  </section>
);
