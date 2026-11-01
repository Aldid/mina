import { SKIN_CONSENT_VERSION, type SkinAnalysisResult } from './skinAnalysis';

async function responseBody(response: Response) {
  const body = await response.json();
  if (!response.ok) throw new Error(typeof body.message === 'string' ? body.message : 'Не удалось получить анализ. Попробуй позже.');
  return body;
}
export async function startSkinAnalysis(photo: Blob, signal: AbortSignal): Promise<string> {
  const body = await responseBody(await fetch('/api/skin-analysis', {
    method: 'POST', body: photo, signal, cache: 'no-store',
    headers: { 'Content-Type': 'image/jpeg', 'X-Mina-Consent': SKIN_CONSENT_VERSION },
  }));
  if (typeof body.job !== 'string') throw new Error('Сервис не подтвердил запуск анализа. Фото автоматически повторно не отправляем.');
  return body.job;
}
function waitForPoll(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const cancel = () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', cancel); resolve(); }, 10_000);
    signal.addEventListener('abort', cancel, { once: true });
    if (signal.aborted) { signal.removeEventListener('abort', cancel); cancel(); }
  });
}
export async function waitForSkinAnalysis(job: string, signal: AbortSignal): Promise<SkinAnalysisResult> {
  for (let attempt = 0; attempt < 18; attempt++) {
    await waitForPoll(signal);
    const body = await responseBody(await fetch(`/api/skin-analysis?job=${encodeURIComponent(job)}`, { cache: 'no-store', signal }));
    if (body.status === 'success' && body.result) return body.result;
    if (body.status !== 'running') throw new Error('Сервис вернул неизвестное состояние анализа.');
  }
  throw new Error('Анализ занимает больше трёх минут. Можно проверить этот же анализ позже — без повторной отправки фото.');
}
