import assert from 'node:assert/strict';
import { JOURNAL_KEY, JournalStore, decodeJournal, encodeJournal } from '../src/lib/journalStorage';
import { emptyEntry } from '../src/lib/dailyCare';

class MemoryStorage {
  value: string | null = null;
  failWrite = false;
  failRemove = false;
  writes = 0;
  getItem(key: string) { assert.equal(key, JOURNAL_KEY); return this.value; }
  setItem(key: string, value: string) {
    assert.equal(key, JOURNAL_KEY);
    if (this.failWrite) throw new Error('Quota exceeded');
    this.value = value; this.writes += 1;
  }
  removeItem(key: string) {
    assert.equal(key, JOURNAL_KEY);
    if (this.failRemove) throw new Error('Storage blocked');
    this.value = null;
  }
}
let passed = 0;
function test(name: string, run: () => void) { run(); passed += 1; console.log(`PASS ${name}`); }
function session() { const storage = new MemoryStorage(); const store = new JournalStore(() => storage); store.load(); return { storage, store }; }

test('Construction is server-safe and session marks never opt in implicitly', () => {
  const server = new JournalStore(() => { throw new Error('No browser'); });
  assert.equal(server.getServerSnapshot().ready, false);
  const { storage, store } = session();
  store.change('2026-10-31', { type: 'symptom', id: 'tightness' });
  assert.equal(storage.writes, 0);
  assert.equal(storage.value, null);
  assert.equal(store.getSnapshot().mode, 'session');
});

test('Explicit opt-in and reload restore dates, independent periods and reflection', () => {
  const { storage, store } = session();
  store.change('2026-10-24', { type: 'step', period: 'am', id: 'cleanse' });
  assert(store.enable());
  store.change('2026-10-31', { type: 'step', period: 'pm', id: 'moisturize' });
  store.change('2026-10-31', { type: 'reflection', value: 'better' });
  const restored = new JournalStore(() => storage); restored.load();
  assert.equal(restored.getSnapshot().mode, 'device');
  assert.deepEqual(restored.getSnapshot().journal, store.getSnapshot().journal);
  assert.deepEqual(restored.getSnapshot().journal['2026-10-24'].completed, { am: ['cleanse'], pm: [] });
});

test('Only approved diary fields are serialized; images and demo metrics are excluded', () => {
  const source = { '2026-10-31': { ...emptyEntry(), photo: 'SECRET_IMAGE', demoResult: { hydration: 99 }, arbitrary: 'SECRET_EXTRA' } };
  const raw = encodeJournal(source);
  assert(!raw.includes('SECRET') && !raw.includes('hydration') && !raw.includes('photo'));
  assert.deepEqual(decodeJournal(raw), { '2026-10-31': emptyEntry() });
  assert.throws(() => decodeJournal('{broken'));
  assert.throws(() => decodeJournal(JSON.stringify({ version: 2, journal: {} })));
  assert.throws(() => decodeJournal(JSON.stringify({ version: 1, journal: { '2026-02-30': emptyEntry() } })));
  assert.throws(() => decodeJournal(JSON.stringify({ version: 1, journal: { '2026-10-31': { ...emptyEntry(), symptoms: ['unknown'] } } })));
});

test('Unreadable existing data is preserved and never overwritten by fresh marks', () => {
  const storage = new MemoryStorage(); storage.value = '{unreadable';
  const store = new JournalStore(() => storage); store.load();
  assert.equal(store.getSnapshot().issue, 'format');
  store.change('2026-10-31', { type: 'symptom', id: 'comfort' });
  assert.equal(store.enable(), false);
  assert.equal(storage.value, '{unreadable');
  assert.equal(storage.writes, 0);
});

test('A failed save retains open marks and the last saved copy, with a successful retry', () => {
  const { storage, store } = session(); store.enable();
  const old = storage.value;
  storage.failWrite = true;
  store.change('2026-10-31', { type: 'symptom', id: 'redness' });
  assert.equal(store.getSnapshot().issue, 'save');
  assert.deepEqual(store.getSnapshot().journal['2026-10-31'].symptoms, ['redness']);
  assert.equal(storage.value, old);
  storage.failWrite = false; assert(store.enable());
  assert.deepEqual(decodeJournal(storage.value!)['2026-10-31'].symptoms, ['redness']);
});

test('Disabling deletes only the saved copy; subsequent session changes do not recreate it', () => {
  const { storage, store } = session();
  store.change('2026-10-31', { type: 'symptom', id: 'comfort' }); store.enable();
  storage.failRemove = true; assert.equal(store.disable(), false);
  assert.equal(store.getSnapshot().mode, 'device'); assert(storage.value);
  storage.failRemove = false; assert(store.disable());
  assert.equal(storage.value, null); assert.equal(store.getSnapshot().mode, 'session');
  assert.deepEqual(store.getSnapshot().journal['2026-10-31'].symptoms, ['comfort']);
  store.change('2026-10-31', { type: 'symptom', id: 'sleep' }); assert.equal(storage.value, null);
});

test('Erase clears disk and open history only if storage removal succeeds', () => {
  const { storage, store } = session();
  store.change('2026-10-31', { type: 'reflection', value: 'same' }); store.enable();
  storage.failRemove = true; assert.equal(store.clear(), false);
  assert(store.getSnapshot().journal['2026-10-31']); assert(storage.value);
  storage.failRemove = false; assert(store.clear());
  assert.equal(storage.value, null); assert.deepEqual(store.getSnapshot().journal, {});
  assert.equal(store.getSnapshot().mode, 'session');
});

test('Unseen revisions pause saving rather than overwriting another tab', () => {
  const { storage, store } = session(); store.enable();
  const external = encodeJournal({ '2026-10-24': { ...emptyEntry(), eveningFeeling: 'better' } });
  storage.value = external;
  store.change('2026-10-31', { type: 'symptom', id: 'tightness' });
  assert.equal(store.getSnapshot().issue, 'conflict'); assert.equal(storage.value, external);
  assert(store.getSnapshot().journal['2026-10-31']);
  assert.equal(store.enable(), false);
});

test('Clean external updates sync; external opt-out is never silently reversed', () => {
  const { storage, store } = session(); store.enable();
  const external = encodeJournal({ '2026-10-24': { ...emptyEntry(), eveningFeeling: 'better' } });
  storage.value = external; store.receiveExternal(external);
  assert.equal(store.getSnapshot().journal['2026-10-24'].eveningFeeling, 'better');
  storage.value = null; store.receiveExternal(null);
  assert.equal(store.getSnapshot().mode, 'session');
  store.change('2026-10-31', { type: 'symptom', id: 'sun' }); assert.equal(storage.value, null);
});

test('Blocked browser access still permits a fully in-memory diary', () => {
  const store = new JournalStore(() => { throw new Error('Storage blocked'); }); store.load();
  assert.equal(store.getSnapshot().ready, true); assert.equal(store.getSnapshot().issue, 'read');
  store.change('2026-10-31', { type: 'symptom', id: 'comfort' });
  assert.equal(store.enable(), false);
  assert.deepEqual(store.getSnapshot().journal['2026-10-31'].symptoms, ['comfort']);
});

console.log(`\n${passed} journal-storage behavior groups passed.\n`);
