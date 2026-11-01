'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { JOURNAL_KEY, JournalStore } from './journalStorage';

export function useJournal() {
  const [store] = useState(() => new JournalStore(() => window.localStorage));
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  useEffect(() => {
    store.load();
    const sync = (event: StorageEvent) => {
      // storageArea access can also fail when browser storage is blocked.
      try {
        if (event.storageArea === window.localStorage && (event.key === JOURNAL_KEY || event.key === null)) {
          store.receiveExternal(event.key === null ? null : event.newValue);
        }
      } catch { /* The current in-memory journal remains usable. */ }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [store]);
  return { ...snapshot, store };
}
