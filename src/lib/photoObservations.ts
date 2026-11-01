export interface PhotoMark { id: string; x: number; y: number; width: number; height: number; source: 'model' | 'manual'; }
export type PhotoAnalysis =
  | { status: 'completed'; modelId: string; modelSha256: string }
  | { status: 'manual'; reason: 'capture-quality' | 'user-choice' }
  | { status: 'unavailable'; reason: 'model-error' | 'simulator' };
export interface PhotoMetadata {
  version: 2;
  localDate: string;
  timeZone: string;
  analysis: PhotoAnalysis;
}
export interface ReviewedPhoto {
  id: string;
  capturedAt: string;
  width: number;
  height: number;
  image: Blob;
  marks: PhotoMark[];
  metadata?: PhotoMetadata;
}
export interface AcneBox { x1: number; y1: number; x2: number; y2: number; score: number; }
export const ACNE_MODEL_SHA = 'de7b25f3d1e2af69ee18f2b55cb6d93edf3c8dd29662a1c64cf8d903c3fa8526';
export const ACNE_MODEL_ID = 'mina-acne-yolov8s';
export const MAX_PHOTOS = 20;
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
export const MAX_MARKS = 100;

export function letterbox(width: number, height: number) {
  const scale = Math.min(640 / width, 640 / height);
  const resizedWidth = Math.round(width * scale), resizedHeight = Math.round(height * scale);
  return { scale, resizedWidth, resizedHeight, left: Math.floor((640 - resizedWidth) / 2), top: Math.floor((640 - resizedHeight) / 2) };
}
function overlap(a: AcneBox, b: AcneBox) {
  const area = Math.max(0, Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1)) * Math.max(0, Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1));
  const total = (a.x2-a.x1)*(a.y2-a.y1) + (b.x2-b.x1)*(b.y2-b.y1) - area;
  return total > 0 ? area / total : 0;
}
// This pinned export has exactly one class and a [1,5,8400] xywh/scores output.
export function acneMarks(data: Float32Array, dims: readonly number[], width: number, height: number): PhotoMark[] {
  if (dims.length !== 3 || dims[0] !== 1 || dims[1] !== 5 || dims[2] !== 8400 || data.length !== 42000) throw new Error('Неожиданный формат ответа локальной модели.');
  const geometry = letterbox(width, height), count = dims[2];
  const boxes: AcneBox[] = [];
  for (let i = 0; i < count; i++) {
    const x=data[i], y=data[count+i], w=data[2*count+i], h=data[3*count+i], score=data[4*count+i];
    if (![x,y,w,h,score].every(Number.isFinite) || score < .25 || score > 1 || w <= 0 || h <= 0) continue;
    const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value));
    const box = {
      x1:clamp((x-w/2-geometry.left)/geometry.scale,width), y1:clamp((y-h/2-geometry.top)/geometry.scale,height),
      x2:clamp((x+w/2-geometry.left)/geometry.scale,width), y2:clamp((y+h/2-geometry.top)/geometry.scale,height), score,
    };
    if (box.x2-box.x1 >= 1 && box.y2-box.y1 >= 1) boxes.push(box);
  }
  const kept: AcneBox[] = [];
  for (const box of boxes.sort((a,b)=>b.score-a.score).slice(0,1000)) {
    if (!kept.some(other=>overlap(other,box)>.45)) kept.push(box);
    if (kept.length >= MAX_MARKS) break;
  }
  return kept.map((box,index)=>({ id:`model-${index}`, x:box.x1/width, y:box.y1/height, width:(box.x2-box.x1)/width, height:(box.y2-box.y1)/height, source:'model' }));
}
export function manualMark(x: number, y: number): PhotoMark {
  return { id:`manual-${crypto.randomUUID()}`, x:Math.max(0,Math.min(.94,x-.03)), y:Math.max(0,Math.min(.94,y-.03)), width:.06, height:.06, source:'manual' };
}
export function validMarks(value: unknown): value is PhotoMark[] {
  return Array.isArray(value) && value.length <= MAX_MARKS && new Set(value.map(m=>m?.id)).size===value.length && value.every(m=>
    m && typeof m.id==='string' && m.id.length<=100 && ['model','manual'].includes(m.source) &&
    [m.x,m.y,m.width,m.height].every(Number.isFinite) && m.x>=0 && m.y>=0 && m.width>0 && m.height>0 && m.x+m.width<=1.000001 && m.y+m.height<=1.000001);
}
export function photoLabel(photo: Pick<ReviewedPhoto,'capturedAt'|'metadata'>) {
  const label = new Date(photo.capturedAt).toLocaleString('ru-RU',{timeZone:photo.metadata?.timeZone||'UTC',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'});
  return photo.metadata ? label : `${label} UTC`;
}
export function photoDayLabel(photo: Pick<ReviewedPhoto,'capturedAt'|'metadata'>) {
  const label = new Date(photo.capturedAt).toLocaleDateString('ru-RU',{timeZone:photo.metadata?.timeZone||'UTC',day:'numeric',month:'short'});
  return photo.metadata ? label : `${label} UTC`;
}
