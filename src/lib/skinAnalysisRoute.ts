import { createPerfectSkin, signSkinJob, verifySkinJob, SkinServiceError } from './perfectSkin';
import { SKIN_CONSENT_VERSION, SKIN_PHOTO_LIMIT } from './skinAnalysis';

function reply(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff' } });
}
function localPilot(request: Request) {
  return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(request.url).hostname);
}
function jpegSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) return null;
  let at = 2;
  while (at + 8 < bytes.length) {
    if (bytes[at++] !== 0xff) return null;
    while (bytes[at] === 0xff) at++;
    const marker = bytes[at++];
    if (marker === 0xda || marker === 0xd9) break;
    const length = bytes[at] * 256 + bytes[at + 1];
    if (length < 2 || at + length > bytes.length) return null;
    if ([0xc0, 0xc1, 0xc2].includes(marker) && length >= 8) return { height: bytes[at + 3] * 256 + bytes[at + 4], width: bytes[at + 5] * 256 + bytes[at + 6] };
    at += length;
  }
  return null;
}
async function readPhoto(request: Request, signal: AbortSignal): Promise<Uint8Array> {
  if (request.headers.get('content-type') !== 'image/jpeg') throw new SkinServiceError('photo_type', 'Нужно фото в формате JPEG.', 415);
  const declared = request.headers.get('content-length');
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > SKIN_PHOTO_LIMIT)) throw new SkinServiceError('photo_size', 'Подготовленное фото должно быть не больше 4 МБ.', 413);
  const reader = request.body?.getReader();
  if (!reader) throw new SkinServiceError('photo_missing', 'Фото не получено.', 400);
  const abortRead = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener('abort', abortRead, { once: true });
  if (signal.aborted) abortRead();
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const chunk = await reader.read();
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > SKIN_PHOTO_LIMIT) {
        void reader.cancel().catch(() => {});
        throw new SkinServiceError('photo_size', 'Подготовленное фото должно быть не больше 4 МБ.', 413);
      }
      chunks.push(chunk.value);
    }
  } finally { signal.removeEventListener('abort', abortRead); reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const dimensions = jpegSize(bytes);
  if (!dimensions || Math.min(dimensions.width, dimensions.height) < 480 || Math.max(dimensions.width, dimensions.height) > 2560) throw new SkinServiceError('photo_dimensions', 'Фото не удалось проверить: нужен JPEG с короткой стороной от 480 px и длинной до 2560 px.', 400);
  return bytes;
}

export function createSkinAnalysisHandlers(key: () => string | undefined, fetcher: typeof fetch = fetch) {
  // A local pilot only. Public hosting requires authentication, durable quotas and a privacy review.
  let recentStarts: number[] = [];
  async function handle(request: Request, start: boolean) {
    if (!localPilot(request)) return reply({ code: 'local_pilot', message: 'Этот пилот доступен только в локальной Mina.' }, 403);
    const secret = key()?.trim();
    const url = new URL(request.url);
    if (!start && !url.searchParams.has('job')) return reply({ configured: !!secret, provider: 'Perfect Corp', consentVersion: SKIN_CONSENT_VERSION });
    if (start && (request.headers.get('origin') !== url.origin || request.headers.get('x-mina-consent') !== SKIN_CONSENT_VERSION)) return reply({ code: 'consent_required', message: 'Перед отправкой фото нужно отдельное согласие для этого снимка.' }, 403);
    if (!secret) return reply({ code: 'not_configured', message: 'Анализ кожи пока не подключён. Фото не отправлено сервису.' }, 503);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40_000);
    const abort = () => controller.abort();
    request.signal.addEventListener('abort', abort, { once: true });
    if (request.signal.aborted) controller.abort();
    try {
      const provider = createPerfectSkin(secret, fetcher);
      if (!start) return reply(await provider.status(verifySkinJob(url.searchParams.get('job') || '', secret), controller.signal));
      recentStarts = recentStarts.filter(time => time > Date.now() - 60_000);
      if (recentStarts.length >= 3) throw new SkinServiceError('local_limit', 'Подожди минуту перед новым анализом.', 429);
      recentStarts.push(Date.now());
      const photo = await readPhoto(request, controller.signal);
      const task = await provider.start(photo, controller.signal);
      return reply({ status: 'running', job: signSkinJob(task, secret) }, 202);
    } catch (error) {
      if (error instanceof SkinServiceError) return reply({ code: error.code, message: error.message }, error.status);
      return reply({ code: controller.signal.aborted ? 'timeout' : 'service_error', message: controller.signal.aborted ? 'Ожидание ответа остановлено. Если фото уже передано, обработка у Perfect Corp может продолжаться.' : 'Не удалось получить ответ сервиса. Если фото уже передано, оно может остаться у Perfect Corp согласно сроку хранения.' }, 502);
    } finally {
      clearTimeout(timeout);
      request.signal.removeEventListener('abort', abort);
    }
  }
  return { GET: (request: Request) => handle(request, false), POST: (request: Request) => handle(request, true) };
}
