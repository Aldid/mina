import type { PhotoAnalysis, PhotoMetadata, ReviewedPhoto } from './photoObservations';

export interface PhotoAddition {
  capturedAt: string;
  localDate: string;
  timeZone: string;
}

function dateInZone(timestamp: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(timestamp));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

// Capture this once when the prepared frame is created, before async inference/review.
export function photoAddition(date = new Date(), timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'): PhotoAddition {
  const capturedAt = date.toISOString();
  return { capturedAt, localDate: dateInZone(capturedAt, timeZone), timeZone };
}

export function photoMetadata(addition: PhotoAddition, analysis: PhotoAnalysis): PhotoMetadata {
  return cleanPhotoMetadata({ version: 2, localDate: addition.localDate, timeZone: addition.timeZone, analysis }, addition.capturedAt);
}

export function photoJournalDate(photo: Pick<ReviewedPhoto, 'metadata'>): string | null {
  // An old record has no trustworthy original day; don't guess from the current zone.
  return photo.metadata?.localDate || null;
}

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function cleanPhotoMetadata(value: unknown, capturedAt: string): PhotoMetadata {
  if (!object(value) || value.version !== 2 || typeof value.localDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value.localDate) || typeof value.timeZone !== 'string' ||
      value.timeZone.length > 100 || !value.timeZone || value.localDate !== dateInZone(capturedAt, value.timeZone) ||
      !object(value.analysis)) throw new Error('Invalid photo metadata');
  const input = value.analysis;
  let analysis: PhotoAnalysis;
  if (input.status === 'completed' && typeof input.modelId === 'string' && /^[a-zA-Z0-9._-]{1,80}$/.test(input.modelId) &&
      typeof input.modelSha256 === 'string' && /^[a-f0-9]{64}$/.test(input.modelSha256)) {
    analysis = { status: 'completed', modelId: input.modelId, modelSha256: input.modelSha256 };
  } else if (input.status === 'manual' && (input.reason === 'capture-quality' || input.reason === 'user-choice')) {
    analysis = { status: 'manual', reason: input.reason };
  } else if (input.status === 'unavailable' && (input.reason === 'model-error' || input.reason === 'simulator')) {
    analysis = { status: 'unavailable', reason: input.reason };
  } else throw new Error('Invalid photo analysis');
  return { version: 2, localDate: value.localDate, timeZone: value.timeZone, analysis };
}

export function photoAnalysisInfo(photo: Pick<ReviewedPhoto, 'metadata'>) {
  const analysis = photo.metadata?.analysis;
  if (!analysis) return { status: 'unknown', title: 'Статус ИИ неизвестен', description: 'Сведения о запуске ИИ для этого снимка недоступны. Источники оставленных отметок показаны отдельно.' };
  if (analysis.status === 'completed') return { status: analysis.status, title: 'ИИ выполнен', description: 'Модель обработала фото на устройстве. Её подсказки могут быть неточными или отсутствовать.' };
  if (analysis.status === 'manual') return { status: analysis.status, title: 'Ручная разметка', description: 'Автоматическая подсветка не запускалась. Отметки добавляются вручную; ИИ их не создавал.' };
  return { status: analysis.status, title: 'ИИ недоступен', description: analysis.reason === 'simulator'
    ? 'Снимок добавлен в ручном режиме Intel-симулятора. ИИ-результат не создавался.'
    : 'Автоматическую подсветку не удалось завершить. Отметки для этого снимка добавляются вручную.' };
}
