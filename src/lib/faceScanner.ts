import type { FaceInference } from './faceCheck';

export class FaceScanner {
  private worker: Worker;
  private nextId = 0;
  private disposed = false;
  private busy = false;
  private pending: { id: number; resolve: (value: FaceInference) => void; reject: (reason: Error) => void; timer: ReturnType<typeof setTimeout> } | null = null;
  constructor() {
    if (typeof Worker === 'undefined' || typeof createImageBitmap === 'undefined' || typeof OffscreenCanvas === 'undefined') throw new Error('Этот браузер не поддерживает локальный сканер. Попробуй современный Chrome или Safari.');
    this.worker = new Worker(new URL('./face.worker.ts', import.meta.url), { name: 'mina-face-check' });
    this.worker.onmessage = (event: MessageEvent<{ id: number; result?: FaceInference; error?: string }>) => {
      const pending = this.pending;
      if (!pending || pending.id !== event.data.id) return;
      clearTimeout(pending.timer); this.pending = null;
      if (event.data.result) pending.resolve(event.data.result);
      else pending.reject(new Error(event.data.error || 'Не удалось проверить кадр. Попробуй ещё раз.'));
    };
    this.worker.onerror = () => { this.dispose(new Error('Сканер не загрузился. Обнови страницу и попробуй ещё раз.')); };
  }
  async analyze(canvas: HTMLCanvasElement): Promise<FaceInference> {
    if (this.disposed) throw new Error('Проверка отменена.');
    if (this.busy) throw new Error('Дождись завершения текущей проверки.');
    this.busy = true;
    try {
      const image = await createImageBitmap(canvas);
      if (this.disposed) { image.close(); throw new Error('Проверка отменена.'); }
      return await new Promise<FaceInference>((resolve, reject) => {
      const id = ++this.nextId;
      const timer = setTimeout(() => this.dispose(new Error('Загрузка модели заняла слишком долго. Попробуй ещё раз.')), 45_000);
      this.pending = { id, resolve, reject, timer };
      try { this.worker.postMessage({ id, image }, [image]); }
      catch { image.close(); this.dispose(new Error('Не удалось передать кадр локальной модели.')); }
      });
    } finally { this.busy = false; }
  }
  dispose(reason = new Error('Проверка отменена.')) {
    this.disposed = true;
    this.worker.terminate();
    if (this.pending) {
      clearTimeout(this.pending.timer); this.pending.reject(reason); this.pending = null;
    }
  }
}
