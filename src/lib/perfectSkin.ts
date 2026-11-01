// Server-only adapter. Never import this module into a client component.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { SKIN_CONCERNS, type SkinAnalysisResult } from './skinAnalysis';

const API = 'https://yce-api-01.makeupar.com';
const TASK = '/s2s/v2.1/task/skin-analysis';
// Exact host documented in the provider's upload and JSON result examples.
const IMAGE_HOST = 'yce-us.s3-accelerate.amazonaws.com';
type JsonObject = Record<string, unknown>;
export class SkinServiceError extends Error {
  constructor(public code: string, message: string, public status = 502) { super(message); }
}
const invalidResponse = () => new SkinServiceError('provider_response', 'Сервис вернул неожиданный ответ. Результат не подставлен; попробуй позже.');
function object(value: unknown): JsonObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalidResponse();
  return value as JsonObject;
}
function textValue(value: unknown): string {
  if (typeof value !== 'string' || !value || value.length > 4096) throw invalidResponse();
  return value;
}
export function providerImageUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 8192) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === IMAGE_HOST && !url.port && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
function providerError(code: unknown): SkinServiceError {
  const captureErrors: Record<string, string> = {
    error_below_min_image_size: 'Сервису нужно фото большего разрешения. Выбери другое фото.',
    error_src_face_too_small: 'Сервис просит более крупный план лица. Сделай фото ближе.',
    error_src_face_out_of_bound: 'Сервис не видит лицо целиком. Оставь немного места вокруг него.',
    error_lighting_dark: 'Сервису не хватает света. Повтори фото при мягком дневном освещении.',
  };
  return new SkinServiceError('analysis_failed', typeof code === 'string' && captureErrors[code] || 'Сервис не смог проанализировать этот кадр. Попробуй другое фото.');
}

export function normalizeSkinResult(value: unknown, now = new Date()): SkinAnalysisResult {
  const output = object(value).output;
  if (!Array.isArray(output) || output.length > 100) throw invalidResponse();
  const observations = SKIN_CONCERNS.flatMap(concern => {
    const row = output.find(item => item && typeof item === 'object' && item.type === concern.id && (!item.region || item.region === 'whole'));
    if (!row) return [];
    const rawScore = typeof row.raw_score === 'number' && Number.isFinite(row.raw_score) && row.raw_score >= 1 && row.raw_score <= 100 ? row.raw_score : null;
    const maskUrl = Array.isArray(row.mask_urls) ? row.mask_urls.map(providerImageUrl).find(Boolean) || null : null;
    // ui_score is deliberately excluded: the provider describes it as a psychologically adjusted score.
    return rawScore !== null || maskUrl ? [{ id: concern.id, rawScore, maskUrl }] : [];
  });
  if (!observations.length) throw invalidResponse();
  return { provider: 'Perfect Corp', mode: 'SD', analyzedAt: now.toISOString(), observations };
}

export function createPerfectSkin(key: string, fetcher: typeof fetch = fetch) {
  async function request(path: string, signal: AbortSignal, body?: unknown): Promise<JsonObject> {
    const response = await fetcher(API + path, {
      method: body === undefined ? 'GET' : 'POST', cache: 'no-store', redirect: 'error', signal,
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!response.ok) {
      // Do not return raw upstream messages: they may contain identifiers, URLs or credentials.
      if (response.status === 401 || response.status === 403) throw new SkinServiceError('provider_auth', 'Не удалось подключиться к сервису. Владельцу Mina нужно проверить ключ и доступ к Skin Analysis.', 503);
      if (response.status === 429) throw new SkinServiceError('provider_limit', 'Сервис временно ограничил запросы. Подожди и попробуй позже.', 429);
      if (response.status === 402) throw new SkinServiceError('provider_credits', 'У сервиса закончились доступные единицы анализа. Владельцу Mina нужно проверить баланс.', 503);
      throw new SkinServiceError('provider_unavailable', 'Сервис анализа сейчас недоступен. Фото повторно не отправлялось.');
    }
    const payload = object(await response.json());
    if (payload.status !== 200) throw providerError(payload.error_code);
    return object(payload.data);
  }
  return {
    async start(photo: Uint8Array, signal: AbortSignal): Promise<string> {
      const data = await request('/s2s/v2.0/file', signal, { files: [{ content_type: 'image/jpeg', file_name: 'mina-skin.jpg', file_size: photo.byteLength }] });
      if (!Array.isArray(data.files) || data.files.length !== 1) throw invalidResponse();
      const file = object(data.files[0]);
      const fileId = textValue(file.file_id);
      if (!Array.isArray(file.requests) || file.requests.length !== 1) throw invalidResponse();
      const upload = object(file.requests[0]);
      const url = providerImageUrl(upload.url);
      if (!url || upload.method !== 'PUT') throw invalidResponse();
      const givenHeaders = object(upload.headers);
      const headers: Record<string, string> = {};
      for (const name of Object.keys(givenHeaders)) {
        const lower = name.toLowerCase();
        if (lower !== 'content-type' && lower !== 'content-length' && !lower.startsWith('x-amz-')) throw invalidResponse();
        const value = String(givenHeaders[name]);
        if (lower === 'content-length' && value !== String(photo.byteLength)) throw invalidResponse();
        if (lower === 'content-type' && value !== 'image/jpeg' && value !== 'image/jpg') throw invalidResponse();
        headers[name] = value;
      }
      // The API bearer key is never attached to the pre-signed upload request.
      const uploaded = await fetcher(url, { method: 'PUT', headers, body: new Blob([new Uint8Array(photo)], { type: 'image/jpeg' }), signal, redirect: 'error', cache: 'no-store' });
      if (!uploaded.ok) throw new SkinServiceError('upload_failed', 'Не удалось передать фото сервису. Анализ не запускался.');
      const task = await request(TASK, signal, {
        src_file_id: fileId, dst_actions: SKIN_CONCERNS.map(c => c.id),
        miniserver_args: { enable_mask_overlay: true }, format: 'json', pf_camera_kit: false,
      });
      return textValue(task.task_id);
    },
    async status(taskId: string, signal: AbortSignal) {
      const data = await request(`${TASK}/${encodeURIComponent(taskId)}`, signal);
      if (data.task_status === 'running') return { status: 'running' as const };
      if (data.task_status === 'error') throw providerError(data.error);
      if (data.task_status !== 'success') throw invalidResponse();
      return { status: 'success' as const, result: normalizeSkinResult(data.results) };
    },
  };
}

// Short-lived signed task handles prevent arbitrary provider task lookups; nothing is persisted.
export function signSkinJob(task: string, key: string, now = Date.now()): string {
  const data = Buffer.from(JSON.stringify({ task, expires: now + 20 * 60_000 })).toString('base64url');
  const signature = createHmac('sha256', key).update(`mina-skin-job:${data}`).digest('base64url');
  return `${data}.${signature}`;
}
export function verifySkinJob(token: string, key: string, now = Date.now()): string {
  try {
    if (token.length > 7000) throw new Error();
    const [data, signature, extra] = token.split('.');
    if (!data || !signature || extra) throw new Error();
    const expected = createHmac('sha256', key).update(`mina-skin-job:${data}`).digest();
    const received = Buffer.from(signature, 'base64url');
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) throw new Error();
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!Number.isFinite(payload.expires) || payload.expires <= now || payload.expires > now + 20 * 60_000) throw new Error();
    return textValue(payload.task);
  } catch { throw new SkinServiceError('expired_job', 'Ссылка на этот анализ истекла или недействительна. Новый снимок требует нового согласия.', 400); }
}
