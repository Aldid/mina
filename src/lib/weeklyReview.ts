import { CONTEXTS, SENSATIONS, careForSymptoms, weekForDate } from './dailyCare';
import type { DailyJournal, EveningFeeling, TimeOfDay } from './dailyCare';

export interface WeekRecord {
  date: string;
  sensations: string[];
  contexts: string[];
  am: { done: number; total: number };
  pm: { done: number; total: number };
  eveningFeeling?: EveningFeeling;
  photoReviewed?: true;
}

export function summarizeWeek(journal: DailyJournal, today: string, weekDate = today) {
  const week = weekForDate(weekDate);
  const records: WeekRecord[] = [];
  for (const date of week) {
    const entry = journal[date];
    if (date > today || !entry) continue;
    const plan = careForSymptoms(entry.symptoms);
    const progress = (period: TimeOfDay) => ({
      done: plan[period].filter(step => entry.completed[period].includes(step.id)).length,
      total: plan[period].length,
    });
    const record: WeekRecord = {
      date,
      sensations: SENSATIONS.filter(item => entry.symptoms.includes(item.id)).map(item => item.label),
      contexts: CONTEXTS.filter(item => entry.symptoms.includes(item.id)).map(item => item.label),
      am: progress('am'),
      pm: progress('pm'),
      eveningFeeling: entry.eveningFeeling,
      photoReviewed: entry.photoReviewed,
    };
    // Toggling the last mark off leaves an empty entry, not an observed day.
    if (record.sensations.length || record.contexts.length || record.am.done || record.pm.done || record.eveningFeeling || record.photoReviewed) {
      records.push(record);
    }
  }
  const sensationDays = records.filter(record => record.sensations.length > 0).length;
  const sensations = SENSATIONS.map(item => ({
    id: item.id,
    label: item.label,
    days: records.filter(record => record.sensations.includes(item.label)).length,
  })).filter(item => item.days > 0).sort((a, b) => b.days - a.days);

  return {
    start: week[0],
    end: week[6],
    records: records.reverse(),
    amComplete: records.filter(record => record.am.done === record.am.total).length,
    pmComplete: records.filter(record => record.pm.done === record.pm.total).length,
    sensationDays,
    sensations,
  };
}

export function dayCountLabel(count: number): string {
  const lastTwo = count % 100;
  const last = count % 10;
  const word = lastTwo >= 11 && lastTwo <= 14 ? 'дней' : last === 1 ? 'день' : last >= 2 && last <= 4 ? 'дня' : 'дней';
  return `${count} ${word}`;
}
