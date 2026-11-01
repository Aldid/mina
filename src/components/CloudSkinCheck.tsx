'use client';
import { useEffect, useRef, useState } from 'react';
import { SKIN_PHOTO_LIMIT, type SkinAnalysisResult as Analysis } from '../lib/skinAnalysis';
import { startSkinAnalysis, waitForSkinAnalysis } from '../lib/skinAnalysisClient';
import { SkinAnalysisResult } from './SkinAnalysisResult';

export function CloudSkinCheck({ captureIssue, getPhoto, onComplete, onBusyChange }: {
  captureIssue: string | null;
  getPhoto: () => Promise<Blob>;
  onComplete: (result: Analysis) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [configError, setConfigError] = useState(false);
  const [consent, setConsent] = useState(false);
  const [stage, setStage] = useState<'idle' | 'uploading' | 'waiting'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);
  const jobRef = useRef<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const busyCallback = useRef(onBusyChange);
  busyCallback.current = onBusyChange;
  const busy = stage !== 'idle';
  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/skin-analysis', { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error();
        const body = await response.json();
        if (!controller.signal.aborted) setConfigured(body.configured === true);
      }).catch(() => { if (!controller.signal.aborted) setConfigError(true); });
    return () => { controller.abort(); controllerRef.current?.abort(); busyCallback.current(false); };
  }, []);
  useEffect(() => { busyCallback.current(busy); }, [busy]);

  const run = async () => {
    if (controllerRef.current || !configured || (!jobRef.current && (!consent || captureIssue))) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setError(null);
    try {
      if (!jobRef.current) {
        setStage('uploading');
        const photo = await getPhoto();
        if (controller.signal.aborted) return;
        if (photo.size > SKIN_PHOTO_LIMIT) throw new Error('Подготовленное фото больше 4 МБ. Выбери другой снимок.');
        jobRef.current = await startSkinAnalysis(photo, controller.signal);
        if (controller.signal.aborted) return;
      }
      setStage('waiting');
      const analysis = await waitForSkinAnalysis(jobRef.current, controller.signal);
      if (!controller.signal.aborted) { setResult(analysis); jobRef.current = null; }
    } catch (cause) {
      if (!controller.signal.aborted) {
        setError(cause instanceof Error ? cause.message : 'Не удалось получить анализ.');
        // A fresh submission always requires the user to consent again.
        setConsent(false);
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        if (!controller.signal.aborted) setStage('idle');
      }
    }
  };
  const stopWaiting = () => {
    controllerRef.current?.abort(); controllerRef.current = null;
    setStage('idle'); setConsent(false);
    setError('Ожидание остановлено. Если фото уже передано, обработка у Perfect Corp может продолжаться. Закрытие Mina не удаляет фото у сервиса.');
  };
  return <section className="mina-cloud-check" aria-labelledby="mina-cloud-title">
    <p className="mina-skin-eyebrow">Следующий шаг · отдельное согласие</p>
    <h3 id="mina-cloud-title">Анализ кожи по фото</h3>
    {result ? <><SkinAnalysisResult result={result} /><button type="button" className="mina-primary" onClick={() => onComplete(result)}>Сверить с ощущениями</button></> : <>
      <p>Perfect Corp оценит покраснения, высыпания, поры, текстуру и пигментацию. Это внешний сервис; локальная проверка лица уже завершена.</p>
      <div className="mina-cloud-privacy">
        <p><strong>Что отправится:</strong> подготовленное JPEG-фото через сервер Mina. Опорные точки и записи дневника не отправляются.</p>
        <p><strong>Срок у сервиса:</strong> по документации Perfect Corp, загруженные фото и созданные изображения хранятся 30 дней. Закрытие окна не удаляет их у провайдера. <a href="https://docs.perfectcorp.com/develop/file_retention_period" target="_blank" rel="noopener noreferrer">Условия хранения</a></p>
        <p>Mina не сохраняет снимок и результат в дневник. Результат здесь доступен до закрытия страницы или нового сканирования.</p>
      </div>
      {configError ? <p role="status" className="mina-cloud-availability">Не удалось проверить подключение. Можно завершить локальную проверку и попробовать позже.</p>
        : configured === null ? <p role="status">Проверяем подключение…</p>
        : !configured ? <p role="status" className="mina-cloud-availability"><strong>Анализ кожи пока не подключён.</strong> Владельцу Mina нужно добавить ключ Perfect Corp на сервер. Фото не отправлено сервису; локальная проверка работает.</p> : null}
      {captureIssue && <p className="mina-cloud-availability">{captureIssue}</p>}
      <p className="mina-checkup-section-note">Без макияжа и фильтров, при ровном свете, лицо анфас. Пилот использует режим SD. Физическое увлажнение и состояние барьера по этому фото не измеряем.</p>
      {!jobRef.current && <label className="mina-cloud-consent"><input type="checkbox" checked={consent} disabled={busy || !configured || !!captureIssue} onChange={event => setConsent(event.target.checked)} /><span>Я согласна отправить этот снимок в Perfect Corp для анализа кожи и понимаю срок хранения 30 дней.</span></label>}
      {error && <p role="alert" className="mina-checkup-error">{error}</p>}
      {busy ? <><p role="status" className="mina-cloud-progress">{stage === 'uploading' ? 'Передаём подготовленное фото…' : 'Perfect Corp анализирует фото. Обычно это занимает некоторое время; проверяем ответ каждые 10 секунд.'}</p><button type="button" className="mina-face-retry" onClick={stopWaiting}>Остановить ожидание</button></>
        : <button type="button" className="mina-primary" disabled={!configured || (!jobRef.current && (!consent || !!captureIssue))} onClick={() => void run()}>{jobRef.current ? 'Проверить этот анализ' : 'Отправить фото и проанализировать'}</button>}
    </>}
  </section>;
}
