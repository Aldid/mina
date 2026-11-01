import { faceBounds, type FaceInference } from './faceCheck';

export const SKIN_CONSENT_VERSION = 'perfect-skin-pilot-2026-10-31';
export const SKIN_PHOTO_LIMIT = 4 * 1024 * 1024;
export const SKIN_CONCERNS = [
  { id: 'redness', label: 'Покраснения' },
  { id: 'acne', label: 'Высыпания' },
  { id: 'pore', label: 'Поры' },
  { id: 'texture', label: 'Текстура' },
  { id: 'age_spot', label: 'Пигментация' },
] as const;
export type SkinConcernId = typeof SKIN_CONCERNS[number]['id'];
export interface SkinObservation { id: SkinConcernId; rawScore: number | null; maskUrl: string | null; }
export interface SkinAnalysisResult {
  provider: 'Perfect Corp';
  mode: 'SD';
  analyzedAt: string;
  observations: SkinObservation[];
}

// These extra requirements are for the provider's SD API, not clinical quality validation.
export function skinCaptureIssue(inference: FaceInference, width: number, height: number): string | null {
  if (Math.min(width, height) < 480) return 'Для анализа кожи нужна короткая сторона фото не меньше 480 пикселей. Выбери более крупный снимок.';
  const bounds = inference.faces.length === 1 ? faceBounds(inference.faces[0]) : null;
  if (!bounds || bounds.right - bounds.left <= .6) return 'Для анализа кожи лицо должно занимать больше 60% ширины фото. Сделай снимок ближе, сохранив лицо целиком в кадре.';
  return null;
}
