'use client';

import { ChevronRight, Moon, Sun } from 'lucide-react';
import { dateFromKey, formatDay } from '../lib/dailyCare';
import type { DailyJournal, EveningFeeling } from '../lib/dailyCare';
import { dayCountLabel, summarizeWeek } from '../lib/weeklyReview';

interface Props {
  today: string;
  selectedDate: string;
  journal: DailyJournal;
  onOpenDay: (date: string) => void;
  storageNote: string;
}

const eveningLabels: Record<EveningFeeling, string> = {
  better: 'Комфортнее',
  same: 'Так же',
  worse: 'Менее комфортно',
};

export function WeeklyReview({ today, selectedDate, journal, onOpenDay, storageNote }: Props) {
  const summary = summarizeWeek(journal, today, selectedDate);
  const shortDate = (date: string) => dateFromKey(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: date.slice(0, 4) !== today.slice(0, 4) ? 'numeric' : undefined });

  return <section aria-labelledby="mina-week-title" className="mina-week-review">
    <div className="mina-week-heading">
      <h2 id="mina-week-title">Твоя неделя</h2>
      <p>{shortDate(summary.start)} — {shortDate(summary.end)}</p>
    </div>
    {summary.records.length === 0 ? <div className="mina-week-empty">
      <p className="mina-week-lead">Всё начинается с одной отметки</p>
      <p>Отметки ощущений и ухода появятся здесь. Пропущенные дни ничего не обнуляют.</p>
      <button type="button" onClick={() => onOpenDay(today)}>Отметить сегодня<ChevronRight aria-hidden="true" size={16} /></button>
    </div> : <>
      <p className="mina-week-lead">{dayCountLabel(summary.records.length)} с отметками</p>
      <div className="mina-week-routines" aria-label="Полностью отмеченные ритуалы">
        <p><Sun aria-hidden="true" size={16} />Утро<span>{summary.amComplete}</span></p>
        <p><Moon aria-hidden="true" size={16} />Вечер<span>{summary.pmComplete}</span></p>
      </div>
      <p className="mina-week-caption">Полностью отмеченные ритуалы. Любой отдельный шаг тоже имеет значение.</p>
      <details className="mina-week-details">
        <summary>Посмотреть записи<ChevronRight aria-hidden="true" size={17} /></summary>
        <ul className="mina-week-records" aria-label="Записи за неделю">
          {summary.records.map(record => <li key={record.date}>
            <button type="button" aria-label={`Открыть запись за ${formatDay(record.date, record.date.slice(0, 4) !== today.slice(0, 4))}`} aria-describedby={`mina-week-record-${record.date}`} aria-pressed={record.date === selectedDate} onClick={() => onOpenDay(record.date)}>
              <span className="mina-week-record-date">{record.date === today ? `Сегодня, ${shortDate(record.date)}` : dateFromKey(record.date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'short', year: record.date.slice(0, 4) !== today.slice(0, 4) ? 'numeric' : undefined })}<ChevronRight aria-hidden="true" size={16} /></span>
              <span id={`mina-week-record-${record.date}`}>
              <span className="mina-week-record-sensations">{record.sensations.length ? record.sensations.join(', ') : 'Ощущения не отмечены'}</span>
              {record.contexts.length > 0 && <span className="mina-week-record-note">Контекст: {record.contexts.join(', ')}</span>}
              {record.eveningFeeling && <span className="mina-week-record-note">К вечеру: {eveningLabels[record.eveningFeeling]}</span>}
              {record.photoReviewed && <span className="mina-week-record-note">Фото просмотрено</span>}
              <span className="mina-week-record-progress"><span>Утро {record.am.done}/{record.am.total}</span><span>Вечер {record.pm.done}/{record.pm.total}</span></span>
              </span>
            </button>
          </li>)}
        </ul>
        {summary.sensations.length > 0 && <div className="mina-week-sensations">
          <h3>Ощущения в записях</h3>
          <p>Дней с отметками ощущений: {summary.sensationDays}. Это твои наблюдения, без вывода о причинах.</p>
          <ul>{summary.sensations.map(item => <li key={item.id}><span>{item.label}</span><span>{dayCountLabel(item.days)}</span></li>)}</ul>
        </div>}
      </details>
    </>}
    <p className="mina-week-session">{storageNote}</p>
  </section>;
}
