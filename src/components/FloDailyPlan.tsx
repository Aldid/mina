'use client';
import { useState } from 'react';
import { Sun, Moon, Copy, CheckCircle2 } from 'lucide-react';
import { DailyCarePlan, DailyEntry, EveningFeeling, TimeOfDay } from '../lib/dailyCare';
interface Props { plan: DailyCarePlan; entry: DailyEntry; activeTime: TimeOfDay; onTimeChange: (period: TimeOfDay) => void; onToggleStep: (period: TimeOfDay, id: string) => void; onReflection: (value: EveningFeeling) => void; onEditSymptoms: () => void; dateLabel: string; }
export function FloDailyPlan({ plan, entry, activeTime, onTimeChange, onToggleStep, onReflection, onEditSymptoms, dateLabel }: Props) {
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');
  const steps = plan[activeTime];
  const completed = entry.completed[activeTime];
  const isComplete = steps.every(step => completed.includes(step.id));
  const copyPlan = async () => {
    const periodText = (period: TimeOfDay) => plan[period].map(step => `[${entry.completed[period].includes(step.id) ? '✓' : ' '}] ${step.title}\n${step.detail}`).join('\n\n');
    try {
      await navigator.clipboard.writeText(`Mina · ${dateLabel}\n${plan.focus}\n\nУтро\n${periodText('am')}\n\nВечер\n${periodText('pm')}\n\n${plan.reason}\nОбщая информация об уходе, не медицинское назначение.`);
      setCopyState('success');
    } catch { setCopyState('error'); }
  };
  return <section aria-labelledby="routine-heading" className="mina-routine space-y-4">
    <div className="flex items-start justify-between gap-3"><div><h2 id="routine-heading" tabIndex={-1} className="text-base font-bold text-stone-900">Твой ежедневный уход</h2><p className="mt-1 text-sm text-stone-600">{dateLabel} · Несколько простых шагов</p></div><button type="button" onClick={copyPlan} className="inline-flex shrink-0 items-center gap-1.5 min-h-11 px-2 text-sm text-rose-800 font-semibold" aria-label="Скопировать план ухода"><Copy className="w-4 h-4" aria-hidden="true" /><span>В заметки</span></button></div>
    {copyState !== 'idle' && <p role="status" className="text-sm text-stone-600">{copyState === 'success' ? 'План скопирован. При изменении отметок скопируй его заново.' : 'Не удалось скопировать. Проверь разрешение браузера на доступ к буферу обмена.'}</p>}
    <div className="grid grid-cols-2 gap-1 p-1 bg-[#eeeae7] rounded-xl" role="group" aria-label="Время ухода">{(['am', 'pm'] as const).map(period => <button key={period} type="button" aria-pressed={activeTime === period} onClick={() => onTimeChange(period)} className={`min-h-12 flex items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold ${activeTime === period ? 'bg-white text-stone-900' : 'text-stone-500 hover:bg-white/60'}`}>{period === 'am' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}{period === 'am' ? 'Утро' : 'Вечер'} · {entry.completed[period].length}/{plan[period].length}</button>)}</div>
    <p className="text-xs text-stone-500">{activeTime === 'am' ? 'Утренние' : 'Вечерние'} отметки сохраняются отдельно.</p>
    <div className="space-y-3">{steps.map((step, index) => {
      const done = completed.includes(step.id);
      return <article key={step.id} className={`mina-step ${done ? 'mina-step-done' : ''}`}>
        <label className="flex items-start gap-3 cursor-pointer min-h-11"><input type="checkbox" checked={done} onChange={() => onToggleStep(activeTime, step.id)} aria-label={`${activeTime === 'am' ? 'Утро' : 'Вечер'}: ${step.title}`} className="mt-1 w-5 h-5 accent-rose-600 shrink-0" /><span className="flex-1"><span className="block text-xs text-stone-500 mb-1">Шаг {index + 1}{done ? ' · Выполнено' : ''}</span><span className="block text-sm font-semibold text-stone-900">{step.title}</span></span></label>
        <details className="mt-1 pl-8 text-sm text-stone-600"><summary className="min-h-8 cursor-pointer font-medium text-rose-800">Как сделать</summary><p className="pt-2 leading-relaxed">{step.detail}</p><p className="pt-2 text-xs leading-relaxed text-stone-500">{step.ingredients}</p></details>
      </article>;
    })}</div>
    {isComplete && <div role="status" className="flex items-start gap-2 text-sm text-rose-900 bg-rose-50 rounded-2xl p-3"><CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />{activeTime === 'am' ? 'Утренний ритуал отмечен. Можно продолжать день.' : 'Вечерний ритуал отмечен. Спасибо за заботу о себе.'}</div>}
    {activeTime === 'pm' && <fieldset className="border-t border-rose-100 pt-4"><legend className="text-sm font-semibold text-stone-800 pt-4">Как коже к вечеру?</legend><div className="flex flex-wrap gap-2 pt-2">{([{ value: 'better', label: 'Комфортнее' }, { value: 'same', label: 'Так же' }, { value: 'worse', label: 'Менее комфортно' }] as const).map(option => <button key={option.value} type="button" aria-pressed={entry.eveningFeeling === option.value} onClick={() => onReflection(option.value)} className={`min-h-11 rounded-full border px-3 text-sm ${entry.eveningFeeling === option.value ? 'bg-rose-100 text-rose-900 border-rose-300' : 'text-stone-600 border-stone-200'}`}>{option.label}</button>)}</div><p className="mt-3 text-xs text-stone-500">Твоя самооценка для дневника; она не доказывает эффект средства.</p>{entry.eveningFeeling === 'worse' && <p className="mt-3 text-sm text-stone-700">Появились новые ощущения? <button type="button" onClick={onEditSymptoms} className="underline text-rose-800 min-h-11">Уточни их в дневнике</button>, чтобы обновить фокус ухода.</p>}</fieldset>}
  </section>;
}
