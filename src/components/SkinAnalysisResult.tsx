'use client';
import { useState } from 'react';
import { SKIN_CONCERNS, type SkinAnalysisResult as Analysis } from '../lib/skinAnalysis';

export function SkinAnalysisResult({ result }: { result: Analysis }) {
  const [selected, setSelected] = useState(result.observations[0]?.id);
  const [failedMap, setFailedMap] = useState<string | null>(null);
  const observation = result.observations.find(item => item.id === selected);
  const concern = SKIN_CONCERNS.find(item => item.id === selected);
  return <section className="mina-skin-result" aria-label="Результат анализа кожи">
    <p className="mina-skin-eyebrow">Perfect Corp · анализ фото · SD</p>
    <h3>Что заметила модель</h3>
    <p>Выбери область анализа, чтобы посмотреть карту, которую вернул сервис. Это оценка видимых признаков на одном фото, не диагноз.</p>
    <div className="mina-skin-concerns" role="group" aria-label="Направления анализа кожи">
      {SKIN_CONCERNS.map(item => <button key={item.id} type="button" aria-pressed={selected === item.id} disabled={!result.observations.some(row => row.id === item.id)} onClick={() => setSelected(item.id)}>{item.label}</button>)}
    </div>
    {observation?.maskUrl && failedMap !== observation.maskUrl
      ? <figure className="mina-skin-map"><img src={observation.maskUrl} alt={`Карта сервиса: ${concern?.label}`} referrerPolicy="no-referrer" onError={() => setFailedMap(observation.maskUrl)} /><figcaption>{concern?.label} · визуализация Perfect Corp</figcaption></figure>
      : <p className="mina-skin-empty">{observation?.maskUrl ? 'Карту не удалось загрузить. Ссылка сервиса могла истечь.' : 'Сервис не вернул доступную карту для этого направления.'}</p>}
    {result.observations.length < SKIN_CONCERNS.length && <p>Некоторые направления не вернулись в ответе и недоступны для выбора.</p>}
    <details className="mina-skin-indices"><summary>Посмотреть индексы модели</summary>
      <p>Исходные индексы Perfect Corp от 1 до 100: по описанию поставщика, выше означает менее выраженные признаки. Это не проценты здоровья и не измерение влажности или защитного барьера. Свет и ракурс влияют на результат. Скорректированный «бьюти-балл» не используем.</p>
      <dl>{SKIN_CONCERNS.map(item => {
        const score = result.observations.find(row => row.id === item.id)?.rawScore;
        return <div key={item.id}><dt>{item.label}</dt><dd>{score == null ? 'Нет данных' : `${Math.round(score * 10) / 10} / 100`}</dd></div>;
      })}</dl>
    </details>
    <p className="mina-skin-next">Следующий шаг — сверить фото с ощущениями. План ухода учитывает твои отметки; по одному фото Mina не назначает новые активные средства.</p>
  </section>;
}
