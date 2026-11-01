'use client';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { DailyCarePlan } from '../lib/dailyCare';
interface Props { plan: DailyCarePlan; completed: number; total: number; dateLabel: string; greeting: string; onOpenRoutine: () => void; }
export function FloSkinCircle({ plan, completed, total, dateLabel, greeting, onOpenRoutine }: Props) {
  return (
    <section aria-label="Твой фокус дня" className="mina-focus">
      <div className="mina-focus-caption"><span className="mina-live-dot" />{greeting} Твой фокус на {dateLabel}</div>
      <h2 aria-live="polite">{plan.focus}</h2>
      <p className="mina-focus-description">{plan.summary}.<br />В своём ритме, шаг за шагом.</p>
      <div className="mina-focus-actions">
        <button type="button" onClick={onOpenRoutine} className="mina-primary">Открыть мой ритуал <ArrowDown size={17} aria-hidden="true" /></button>
        <div className="mina-progress" aria-label={`${completed} из ${total} шагов отмечено за день`}>
          <div className="mina-progress-bars" aria-hidden="true">{Array.from({length:total},(_,i)=><span key={i} className={i < completed ? 'is-done' : ''}/>)}</div>
          <span aria-live="polite">{completed} из {total} за день</span>
        </div>
      </div>
      <details className="mina-explanation">
        <summary>Почему такой план? <ArrowUpRight size={15} aria-hidden="true" /></summary>
        <div className="space-y-3 pt-3 text-sm leading-relaxed text-stone-600"><p>{plan.reason}</p><p>План основан на твоих ощущениях. Подсветка на фото не назначает средства.</p><a href={plan.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4">{plan.source}</a></div>
      </details>
    </section>
  );
}
