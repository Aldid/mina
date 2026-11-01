'use client';

import { Camera, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { dateFromKey, formatDay, localDateKey, weekForDate, type DailyJournal } from '../lib/dailyCare';

export function Header({ onOpenScanner, onSettings, onBack, settingsOpen }: {
  onOpenScanner: () => void; onSettings: () => void; onBack: () => void; settingsOpen: boolean;
}) {
  return <header className="mina-app-header">
    <div className="mina-app-toolbar">
      {settingsOpen ? <button type="button" className="mina-icon-button" aria-label="Назад из настроек" onClick={onBack}><ChevronLeft aria-hidden="true" size={24} /></button> : <p className="mina-wordmark">Mina</p>}
      {settingsOpen && <span className="mina-toolbar-title">Настройки</span>}
      <div className="mina-toolbar-actions">
        <button type="button" className="mina-icon-button" aria-label="Добавить фото кожи" onClick={onOpenScanner}><Camera aria-hidden="true" size={23} /></button>
        {!settingsOpen && <button type="button" className="mina-icon-button" aria-label="Открыть настройки" onClick={onSettings}><Settings aria-hidden="true" size={22} /></button>}
      </div>
    </div>
  </header>;
}

export function WeekCalendar({ today, selectedDate, journal, onSelectDate }: {
  today: string; selectedDate: string; journal: DailyJournal; onSelectDate: (key: string) => void;
}) {
  const week = weekForDate(selectedDate);
  const currentWeek = weekForDate(today)[0] === week[0];
  const shiftWeek = (offset: number) => {
    const date = dateFromKey(selectedDate);
    date.setDate(date.getDate() + offset * 7);
    const key = localDateKey(date);
    onSelectDate(key > today ? today : key);
  };
  return <div className="mina-week-calendar">
    <div className="mina-calendar-navigation">
      <button type="button" aria-label="Предыдущая неделя" onClick={() => shiftWeek(-1)}><ChevronLeft aria-hidden="true" size={18} /></button>
      <div><p>{formatDay(selectedDate)}</p>{selectedDate !== today && <button type="button" onClick={() => onSelectDate(today)}>К сегодняшнему дню</button>}</div>
      <button type="button" aria-label="Следующая неделя" disabled={currentWeek} onClick={() => shiftWeek(1)}><ChevronRight aria-hidden="true" size={18} /></button>
    </div>
    <div className="mina-week-days" aria-label="Дни выбранной недели">{week.map(key => {
      const date = dateFromKey(key), isSelected = key === selectedDate, entry = journal[key];
      const amDone = entry?.completed.am.length === 3, pmDone = entry?.completed.pm.length === 2;
      const label = `${date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}${key === today ? ', сегодня' : ''}${amDone ? ', утренний уход отмечен' : ''}${pmDone ? ', вечерний уход отмечен' : ''}${entry?.photoReviewed ? ', фото просмотрено' : ''}`;
      return <button key={key} type="button" disabled={key > today} onClick={() => onSelectDate(key)} aria-label={label} aria-current={key === today ? 'date' : undefined} aria-pressed={isSelected} className={isSelected ? 'is-selected' : ''}>
        <span>{date.toLocaleDateString('ru-RU', { weekday: 'short' })}</span><strong>{date.getDate()}</strong>
        <span className="mina-calendar-dots" aria-hidden="true"><i className={amDone ? 'is-done' : ''} /><i className={pmDone ? 'is-done' : ''} /></span>
      </button>;
    })}</div>
  </div>;
}
