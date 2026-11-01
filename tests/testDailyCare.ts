import assert from 'node:assert/strict';
import {
  careForSymptoms,
  dateFromKey,
  emptyEntry,
  localDateKey,
  updateJournal,
  weekForDate,
} from '../src/lib/dailyCare';
import type { DailyJournal, SymptomId } from '../src/lib/dailyCare';
import { dayCountLabel, summarizeWeek } from '../src/lib/weeklyReview';

let passedGroups = 0;
function test(name: string, run: () => void): void {
  run();
  passedGroups += 1;
  console.log(`PASS ${name}`);
}

test('A fresh day has no invented symptoms or completed steps', () => {
  const first = emptyEntry();
  const second = emptyEntry();
  assert.equal(first.symptoms.length, 0);
  assert.equal(first.completed.am.length, 0);
  assert.equal(first.completed.pm.length, 0);
  first.completed.am.push('cleanse');
  first.symptoms.push('comfort');
  assert.deepEqual(second, { symptoms: [], completed: { am: [], pm: [] } });
});

test('The same step ID is independent between AM and PM, including toggle-off', () => {
  const day = '2026-10-28';
  let journal = updateJournal({}, day, { type: 'step', period: 'am', id: 'cleanse' });
  assert.deepEqual(journal[day].completed, { am: ['cleanse'], pm: [] });
  journal = updateJournal(journal, day, { type: 'step', period: 'pm', id: 'cleanse' });
  assert.deepEqual(journal[day].completed, { am: ['cleanse'], pm: ['cleanse'] });
  journal = updateJournal(journal, day, { type: 'step', period: 'am', id: 'cleanse' });
  assert.deepEqual(journal[day].completed, { am: [], pm: ['cleanse'] });
});

test('Revisiting an earlier date preserves its own symptoms, progress and reflection', () => {
  const firstDay = '2026-10-27';
  const secondDay = '2026-10-28';
  let journal = updateJournal({}, firstDay, { type: 'step', period: 'pm', id: 'moisturize' });
  journal = updateJournal(journal, firstDay, { type: 'symptom', id: 'tightness' });
  journal = updateJournal(journal, firstDay, { type: 'reflection', value: 'better' });
  const firstRecord = JSON.stringify(journal[firstDay]);
  journal = updateJournal(journal, secondDay, { type: 'step', period: 'am', id: 'protect' });
  journal = updateJournal(journal, secondDay, { type: 'symptom', id: 'comfort' });
  assert.equal(JSON.stringify(journal[firstDay]), firstRecord);
  assert.deepEqual(journal[secondDay].completed, { am: ['protect'], pm: [] });
  assert.equal(journal[secondDay].eveningFeeling, undefined);
  journal = updateJournal(journal, firstDay, { type: 'step', period: 'am', id: 'cleanse' });
  assert.deepEqual(journal[firstDay].completed, { am: ['cleanse'], pm: ['moisturize'] });
  assert.equal(journal[firstDay].eveningFeeling, 'better');
  assert.deepEqual(journal[secondDay].symptoms, ['comfort']);
});

test('Comfort conflicts with discomfort, while context remains and toggles are reversible', () => {
  const day = '2026-10-28';
  let journal = updateJournal({}, day, { type: 'symptom', id: 'redness' });
  journal = updateJournal(journal, day, { type: 'symptom', id: 'sun' });
  journal = updateJournal(journal, day, { type: 'symptom', id: 'comfort' });
  assert.deepEqual(journal[day].symptoms, ['sun', 'comfort']);
  journal = updateJournal(journal, day, { type: 'symptom', id: 'burning' });
  assert.deepEqual(journal[day].symptoms, ['sun', 'burning']);
  journal = updateJournal(journal, day, { type: 'symptom', id: 'burning' });
  assert.deepEqual(journal[day].symptoms, ['sun']);
  journal = updateJournal(journal, day, { type: 'symptom', id: 'sun' });
  assert.deepEqual(journal[day].symptoms, []);
});

test('Discomfort takes priority even if a mixed imported symptom array includes comfort', () => {
  const symptoms: SymptomId[] = ['comfort', 'shine', 'new-product', 'redness', 'burning'];
  const original = [...symptoms];
  const plan = careForSymptoms(symptoms);
  assert.equal(plan.gentle, true);
  assert.equal(plan.focus, 'Бережный режим');
  assert(plan.reason.includes('без новых кислот'));
  assert(plan.pm.some(step => step.detail.includes('не вводи новые активы') || step.detail.includes('Не вводи новые активы')));
  assert.deepEqual(symptoms, original);
  assert.equal(plan.am.length, 3);
  assert.equal(plan.pm.length, 2);
});

test('Journal updates preserve the input and do not rewrite the other date', () => {
  const journal: DailyJournal = {
    '2026-10-27': { symptoms: ['comfort'], completed: { am: ['cleanse'], pm: [] } },
    '2026-10-28': emptyEntry(),
  };
  const original = JSON.stringify(journal);
  const updated = updateJournal(journal, '2026-10-28', { type: 'step', period: 'pm', id: 'moisturize' });
  assert.equal(JSON.stringify(journal), original);
  assert.notEqual(updated, journal);
  assert.notEqual(updated['2026-10-28'], journal['2026-10-28']);
  assert.deepEqual(updated['2026-10-27'], journal['2026-10-27']);
});

test('A day outside does not invent UV data and retains outdoor SPF instructions', () => {
  const plan = careForSymptoms(['sun']);
  assert(plan.reason.includes('не определяет UV-индекс'));
  assert(!plan.reason.includes('Высокий ультрафиолетовый индекс'));
  const protection = plan.am.find(step => step.id === 'protect');
  assert(protection);
  assert(protection.detail.includes('каждые 2 часа'));
  assert(protection.detail.includes('плавания или потоотделения'));
});

test('Local dates and Monday-based weeks stay correct across Budapest DST and month boundaries', () => {
  const previousTimezone = process.env.TZ;
  process.env.TZ = 'Europe/Budapest';
  try {
    assert.equal(localDateKey(new Date('2026-10-24T22:30:00Z')), '2026-10-25');
    assert.equal(localDateKey(new Date('2026-10-25T23:30:00Z')), '2026-10-26');
    assert.equal(dateFromKey('2026-10-25').getHours(), 12);
    assert.deepEqual(weekForDate('2026-10-25'), [
      '2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25',
    ]);
    assert.deepEqual(weekForDate('2026-10-26'), [
      '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01',
    ]);
    assert.deepEqual(weekForDate('2026-03-29'), [
      '2026-03-23', '2026-03-24', '2026-03-25', '2026-03-26', '2026-03-27', '2026-03-28', '2026-03-29',
    ]);
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = previousTimezone;
  }
});

test('The weekly review excludes empty, undone, future and other-week entries', () => {
  let journal: DailyJournal = {
    '2026-10-25': { ...emptyEntry(), symptoms: ['comfort'] },
    '2026-10-26': emptyEntry(),
    '2026-10-29': { ...emptyEntry(), symptoms: ['redness'] },
    '2026-11-02': { ...emptyEntry(), symptoms: ['shine'] },
  };
  journal = updateJournal(journal, '2026-10-27', { type: 'step', period: 'am', id: 'cleanse' });
  journal = updateJournal(journal, '2026-10-27', { type: 'step', period: 'am', id: 'cleanse' });
  const summary = summarizeWeek(journal, '2026-10-28');
  assert.equal(summary.records.length, 0);
  assert.equal(summary.amComplete, 0);
  assert.equal(summary.pmComplete, 0);
  assert.equal(summary.sensationDays, 0);
  assert.deepEqual(summary.sensations, []);
});

test('Sparse weekly records distinguish no sensations, context and evening self-report', () => {
  const journal: DailyJournal = {
    '2026-10-26': { ...emptyEntry(), symptoms: ['sleep'] },
    '2026-10-27': { ...emptyEntry(), eveningFeeling: 'worse' },
    '2026-10-28': { ...emptyEntry(), symptoms: ['tightness', 'tightness', 'sun'] },
  };
  const summary = summarizeWeek(journal, '2026-10-28');
  assert.deepEqual(summary.records.map(record => record.date), ['2026-10-28', '2026-10-27', '2026-10-26']);
  assert.equal(summary.sensationDays, 1);
  assert.deepEqual(summary.sensations, [{ id: 'tightness', label: 'Стянутость', days: 1 }]);
  assert.deepEqual(summary.records[2].sensations, []);
  assert.deepEqual(summary.records[2].contexts, ['Недосып']);
  assert.equal(summary.records[1].eveningFeeling, 'worse');
  assert.equal(summary.amComplete, 0);
});

test('Weekly completion requires each real step and keeps AM and PM independent', () => {
  const journal: DailyJournal = {
    '2026-10-26': { symptoms: ['comfort'], completed: { am: ['cleanse', 'cleanse', 'moisturize', 'protect', 'unknown'], pm: ['cleanse'] } },
    '2026-10-27': { symptoms: ['redness'], completed: { am: ['cleanse', 'moisturize'], pm: ['cleanse', 'moisturize'] } },
    '2026-10-28': { ...emptyEntry(), completed: { am: ['unknown'], pm: [] } },
  };
  const original = JSON.stringify(journal);
  const summary = summarizeWeek(journal, '2026-10-28');
  assert.equal(summary.records.length, 2);
  assert.equal(summary.amComplete, 1);
  assert.equal(summary.pmComplete, 1);
  assert.deepEqual(summary.records[0].am, { done: 2, total: 3 });
  assert.deepEqual(summary.records[1].pm, { done: 1, total: 2 });
  assert.equal(JSON.stringify(journal), original);
});

test('Removing an observation updates weekly counts without treating missing days as comfort', () => {
  let journal: DailyJournal = {};
  journal = updateJournal(journal, '2026-10-26', { type: 'symptom', id: 'redness' });
  journal = updateJournal(journal, '2026-10-28', { type: 'symptom', id: 'redness' });
  assert.equal(summarizeWeek(journal, '2026-10-28').sensations[0].days, 2);
  journal = updateJournal(journal, '2026-10-26', { type: 'symptom', id: 'redness' });
  const summary = summarizeWeek(journal, '2026-10-28');
  assert.equal(summary.sensationDays, 1);
  assert.equal(summary.records.length, 1);
  assert(!summary.sensations.some(item => item.id === 'comfort'));
});

test('Week boundaries and Russian day labels remain accurate', () => {
  const journal: DailyJournal = { '2026-11-01': { ...emptyEntry(), eveningFeeling: 'same' } };
  const sunday = summarizeWeek(journal, '2026-11-01');
  assert.equal(sunday.start, '2026-10-26');
  assert.equal(sunday.end, '2026-11-01');
  assert.equal(sunday.records.length, 1);
  assert.equal(summarizeWeek(journal, '2026-11-02').records.length, 0);
  assert.equal(summarizeWeek(journal, '2026-11-02', '2026-10-26').records.length, 1);
  assert.equal(dayCountLabel(1), '1 день');
  assert.equal(dayCountLabel(2), '2 дня');
  assert.equal(dayCountLabel(7), '7 дней');
  assert.equal(dayCountLabel(11), '11 дней');
  assert.equal(dayCountLabel(21), '21 день');
});

console.log(`\n${passedGroups} daily-care behavior groups passed.\n`);
