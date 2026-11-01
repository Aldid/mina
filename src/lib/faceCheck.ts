export interface FacePoint { x: number; y: number; z: number; }
export interface PixelStats { brightness: number; darkFraction: number; brightFraction: number; detail: number; }
export interface FaceInference { faces: FacePoint[][]; pixels: PixelStats | null; }
export interface CaptureCheck { id: string; label: string; pass: boolean; hint: string; }
export interface FaceCheckReport {
  source: 'upload' | 'webcam';
  facesDetected: number;
  landmarkCount: number;
  ready: boolean;
  checks: CaptureCheck[];
}

export function faceBounds(points: FacePoint[]) {
  if (!points.length || points.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) return null;
  return {
    left: Math.min(...points.map(p => p.x)), right: Math.max(...points.map(p => p.x)),
    top: Math.min(...points.map(p => p.y)), bottom: Math.max(...points.map(p => p.y)),
  };
}

// These are broad capture-quality heuristics, not skin measurements or clinical thresholds.
export function pixelStats(data: Uint8ClampedArray, width: number, height: number): PixelStats {
  const gray: number[] = [];
  let total = 0, dark = 0, bright = 0;
  for (let i = 0; i < data.length; i += 4) {
    const value = data[i] * .299 + data[i + 1] * .587 + data[i + 2] * .114;
    gray.push(value); total += value;
    if (value < 15) dark += 1;
    if (value > 250) bright += 1;
  }
  let sum = 0, squares = 0, count = 0;
  for (let y = 1; y < height - 1; y += 1) for (let x = 1; x < width - 1; x += 1) {
    const i = y * width + x;
    const laplacian = gray[i - 1] + gray[i + 1] + gray[i - width] + gray[i + width] - 4 * gray[i];
    sum += laplacian; squares += laplacian * laplacian; count += 1;
  }
  return { brightness: total / Math.max(1, gray.length), darkFraction: dark / Math.max(1, gray.length), brightFraction: bright / Math.max(1, gray.length), detail: count ? Math.max(0, squares / count - (sum / count) ** 2) : 0 };
}

export function assessFace(inference: FaceInference, width: number, height: number, source: FaceCheckReport['source']): FaceCheckReport {
  const { faces, pixels } = inference;
  const checks: CaptureCheck[] = [{ id: 'face', label: 'Одно лицо в кадре', pass: faces.length === 1, hint: faces.length === 0 ? 'Лицо не найдено. Посмотри в камеру или выбери другое фото.' : faces.length > 1 ? 'В кадре несколько лиц. Оставь в кадре только себя.' : 'Модель нашла одно лицо.' }];
  const report = { source, facesDetected: faces.length, landmarkCount: faces.length === 1 ? faces[0].length : 0, ready: false, checks };
  if (faces.length !== 1) return report;
  const points = faces[0];
  const bounds = faceBounds(points);
  // Face Mesh V2 eye outer corners (MediaPipe topology). No expression inference.
  const leftEye = points[33], rightEye = points[263];
  if (!bounds || !leftEye || !rightEye || width <= 0 || height <= 0) {
    checks.push({ id: 'geometry', label: 'Опорные точки', pass: false, hint: 'Не удалось надёжно построить контур. Попробуй другой кадр.' });
    return report;
  }
  const faceWidth = bounds.right - bounds.left, faceHeight = bounds.bottom - bounds.top;
  const sizeOK = faceWidth >= .24 && faceHeight >= .28 && faceWidth * width >= 100 && faceHeight * height >= 120;
  const inFrame = bounds.left >= .02 && bounds.top >= .02 && bounds.right <= .98 && bounds.bottom <= .98;
  const centered = Math.abs((bounds.left + bounds.right) / 2 - .5) < .2 && Math.abs((bounds.top + bounds.bottom) / 2 - .5) < .22;
  const tilt = Math.atan2(Math.abs(leftEye.y - rightEye.y) * height, Math.abs(leftEye.x - rightEye.x) * width) * 180 / Math.PI;
  checks.push(
    { id: 'size', label: 'Расстояние до камеры', pass: sizeOK, hint: sizeOK ? 'Лицо достаточно крупное для опорных точек.' : 'Поднеси камеру ближе или выбери фото, где лицо крупнее.' },
    { id: 'position', label: 'Лицо целиком и ближе к центру', pass: inFrame && centered, hint: inFrame && centered ? 'Контур помещается в кадр.' : 'Помести лицо целиком в центр, оставив немного места вокруг.' },
    { id: 'tilt', label: 'Без сильного наклона', pass: tilt <= 12, hint: tilt <= 12 ? 'Линия глаз достаточно ровная.' : 'Держи голову ровнее и попробуй ещё раз.' },
    { id: 'light', label: 'Без явного пересвета или темноты', pass: !!pixels && pixels.brightness >= 32 && pixels.brightness <= 240 && pixels.darkFraction < .8 && pixels.brightFraction < .5, hint: !pixels ? 'Свет не удалось проверить.' : pixels.brightness < 32 || pixels.darkFraction >= .8 ? 'Добавь мягкий свет перед лицом.' : pixels.brightness > 240 || pixels.brightFraction >= .5 ? 'Убери яркий свет, который засвечивает лицо.' : 'Явной потери света на лице не обнаружено.' },
    { id: 'detail', label: 'Базовая детализация', pass: !!pixels && pixels.detail >= 18, hint: pixels && pixels.detail >= 18 ? 'Деталей достаточно для этой базовой проверки.' : 'Протри объектив, удерживай камеру неподвижно и повтори снимок.' },
  );
  report.ready = checks.every(check => check.pass);
  return report;
}
