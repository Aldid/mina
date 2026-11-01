import { CONTEXTS, SENSATIONS, dateFromKey, localDateKey, updateJournal } from './dailyCare';
import type { DailyEntry, DailyJournal, EveningFeeling, JournalAction, SymptomId } from './dailyCare';

export const JOURNAL_KEY = 'mina.journal.v1';
const symptomIds = new Set([...SENSATIONS, ...CONTEXTS].map(item => item.id));
const steps = { am: new Set(['cleanse', 'moisturize', 'protect']), pm: new Set(['cleanse', 'moisturize']) };
const feelings = new Set<EveningFeeling>(['better', 'same', 'worse']);
type StorageAccess = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type StorageIssue = 'read' | 'format' | 'save' | 'remove' | 'conflict' | 'external-disabled';
export interface JournalSnapshot {
  ready: boolean;
  journal: DailyJournal;
  mode: 'session' | 'device';
  issue: StorageIssue | null;
}

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Rebuild only journal fields. Photos, demo results and arbitrary properties never enter storage.
function journalFields(value: unknown): DailyJournal {
  if (!object(value)) throw new Error('Invalid journal');
  const journal: DailyJournal = {};
  for (const [date, item] of Object.entries(value)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || localDateKey(dateFromKey(date)) !== date || !object(item) || !object(item.completed)) {
      throw new Error('Invalid entry');
    }
    if (!Array.isArray(item.symptoms) || !item.symptoms.every(id => typeof id === 'string' && symptomIds.has(id as SymptomId))) throw new Error('Invalid symptoms');
    const completed = { am: [] as string[], pm: [] as string[] };
    for (const period of ['am', 'pm'] as const) {
      const ids = item.completed[period];
      if (!Array.isArray(ids) || !ids.every(id => typeof id === 'string' && steps[period].has(id))) throw new Error('Invalid steps');
      completed[period] = Array.from(new Set(ids as string[]));
    }
    const entry: DailyEntry = { symptoms: Array.from(new Set(item.symptoms as SymptomId[])), completed };
    if (item.photoReviewed === true) entry.photoReviewed = true;
    if (item.eveningFeeling !== undefined) {
      if (!feelings.has(item.eveningFeeling as EveningFeeling)) throw new Error('Invalid reflection');
      entry.eveningFeeling = item.eveningFeeling as EveningFeeling;
    }
    journal[date] = entry;
  }
  return journal;
}

export function encodeJournal(journal: DailyJournal): string {
  return JSON.stringify({ version: 1, journal: journalFields(journal) });
}

export function decodeJournal(raw: string): DailyJournal {
  const value: unknown = JSON.parse(raw);
  if (!object(value) || value.version !== 1) throw new Error('Unsupported journal');
  return journalFields(value.journal);
}

// One controller per mounted diary; no browser access during server rendering.
export class JournalStore {
  private initial: JournalSnapshot = { ready: false, journal: {}, mode: 'session', issue: null };
  private snapshot = this.initial;
  private lastRaw: string | null = null;
  private listeners = new Set<() => void>();
  constructor(private storage: () => StorageAccess) {}
  getSnapshot = () => this.snapshot;
  getServerSnapshot = () => this.initial;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  private publish(update: Partial<JournalSnapshot>) {
    this.snapshot = { ...this.snapshot, ...update };
    this.listeners.forEach(listener => listener());
  }
  load = () => {
    let raw: string | null;
    try { raw = this.storage().getItem(JOURNAL_KEY); }
    catch { this.publish({ ready: true, mode: 'session', issue: 'read' }); return; }
    this.lastRaw = raw;
    if (raw === null) {
      this.publish({ ready: true, mode: 'session', issue: null });
      return;
    }
    try { this.publish({ ready: true, journal: decodeJournal(raw), mode: 'device', issue: null }); }
    catch { this.publish({ ready: true, mode: 'session', issue: 'format' }); }
  };
  private persist(journal: DailyJournal): boolean {
    try {
      const storage = this.storage();
      const actual = storage.getItem(JOURNAL_KEY);
      // Don't recreate a copy disabled elsewhere, or overwrite an unseen revision.
      if (actual !== this.lastRaw) {
        this.publish({ issue: actual === null ? 'external-disabled' : 'conflict', ...(actual === null ? { mode: 'session' as const } : {}) });
        if (actual === null) this.lastRaw = null;
        return false;
      }
      const raw = encodeJournal(journal);
      storage.setItem(JOURNAL_KEY, raw);
      this.lastRaw = raw;
      this.publish({ mode: 'device', issue: null });
      return true;
    } catch { this.publish({ issue: 'save' }); return false; }
  }
  change = (date: string, action: JournalAction) => {
    const journal = updateJournal(this.snapshot.journal, date, action);
    this.publish({ journal });
    if (this.snapshot.mode === 'device' && this.snapshot.issue !== 'conflict') this.persist(journal);
  };
  enable = () => {
    if (this.snapshot.issue === 'format' || this.snapshot.issue === 'conflict') return false;
    return this.persist(this.snapshot.journal);
  };
  disable = () => {
    try {
      const storage = this.storage();
      if (storage.getItem(JOURNAL_KEY) !== this.lastRaw) { this.publish({ issue: 'conflict' }); return false; }
      storage.removeItem(JOURNAL_KEY);
      this.lastRaw = null;
      this.publish({ mode: 'session', issue: null });
      return true;
    } catch { this.publish({ issue: 'remove' }); return false; }
  };
  clear = () => {
    if (!this.disable()) return false;
    this.publish({ journal: {} });
    return true;
  };
  clearSession = () => this.publish({ journal: {} });
  receiveExternal = (raw: string | null) => {
    if (raw === this.lastRaw) return;
    if (raw === null) {
      this.lastRaw = null;
      this.publish({ mode: 'session', issue: 'external-disabled' });
      return;
    }
    if (this.snapshot.mode !== 'device' || this.snapshot.issue) {
      this.publish({ issue: 'conflict' });
      return;
    }
    try {
      const journal = decodeJournal(raw);
      this.lastRaw = raw;
      this.publish({ journal, issue: null });
    } catch { this.publish({ issue: 'conflict' }); }
  };
}
