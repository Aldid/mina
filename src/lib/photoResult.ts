import { CONTEXTS, SENSATIONS, careForSymptoms, type DailyJournal } from './dailyCare';
import type { ReviewedPhoto } from './photoObservations';
import { photoJournalDate } from './photoMetadata';

// Archived photos use the local day they were added, independently of the calendar selection.
// Only retained, human-confirmed boxes are counted; original inference totals are not stored.
export function photoResultContext(photo: Pick<ReviewedPhoto, 'metadata' | 'marks'>, journal: DailyJournal) {
  const date = photoJournalDate(photo);
  const symptoms = (date ? journal[date]?.symptoms : undefined) || [];
  const hasDiscomfort = SENSATIONS.some(item => item.id !== 'comfort' && symptoms.includes(item.id));
  const sensations = SENSATIONS.filter(item => symptoms.includes(item.id) && !(hasDiscomfort && item.id === 'comfort'));
  const contexts = CONTEXTS.filter(item => symptoms.includes(item.id));

  return {
    date,
    sensations,
    contexts,
    modelMarks: photo.marks.filter(mark => mark.source === 'model').length,
    manualMarks: photo.marks.filter(mark => mark.source === 'manual').length,
    plan: careForSymptoms(symptoms),
  };
}
