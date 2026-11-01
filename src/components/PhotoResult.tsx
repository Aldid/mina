'use client';

import { PhotoFrame } from './PhotoFrame';
import { PhotoAnalysisStatus } from './PhotoAnalysisStatus';
import { formatDay, type DailyJournal } from '../lib/dailyCare';
import { photoResultContext } from '../lib/photoResult';
import type { ReviewedPhoto } from '../lib/photoObservations';

interface PhotoResultProps {
  photo: ReviewedPhoto;
  journal: DailyJournal;
  today: string;
  onOpenJournal: (date: string) => void;
  onOpenRoutine: (date: string) => void;
}

export function PhotoResult({ photo, journal, today, onOpenJournal, onOpenRoutine }: PhotoResultProps) {
  const result = photoResultContext(photo, journal);
  const isToday = result.date === today;
  const day = result.date ? formatDay(result.date, result.date.slice(0, 4) !== today.slice(0, 4)) : null;
  const actionDate = result.date || today;
  const hasSensations = result.sensations.length > 0;
  const hasEntries = hasSensations || result.contexts.length > 0;
  const hasMarks = result.modelMarks + result.manualMarks > 0;
  const journalAction = !result.date ? 'Отметить ощущения сегодня' : isToday
    ? hasSensations ? 'Изменить ощущения' : 'Отметить ощущения'
    : `Открыть записи за ${day}`;

  return <div className="mina-photo-result">
    <PhotoFrame photo={photo} />
    <PhotoAnalysisStatus photo={photo} />
    {hasMarks ? <dl className="mina-result-legend" aria-label="Источники подтверждённых отметок">
      {result.modelMarks > 0 && <div><dt><span className="mina-result-swatch" aria-hidden="true" />Подсказки ИИ, которые ты оставила</dt><dd>{result.modelMarks}</dd></div>}
      {result.manualMarks > 0 && <div><dt><span className="mina-result-swatch is-manual" aria-hidden="true" />Добавлено тобой вручную</dt><dd>{result.manualMarks}</dd></div>}
    </dl> : <p className="mina-result-empty-marks">На этом фото нет подтверждённых отметок.</p>}
    <p className="mina-result-caption">Разметку проверила ты. Отметки помогают наблюдать за участками на фото; они не определяют диагноз или тяжесть состояния.</p>

    <section className="mina-result-journal" aria-labelledby="mina-result-journal-title">
      <div className="mina-result-section-heading"><h2 id="mina-result-journal-title">{result.date?'Твои записи':'Привязка к дневнику'}</h2><span>{isToday ? 'Сегодня' : day || 'День неизвестен'}</span></div>
      {hasSensations ? <ul className="mina-result-tags" aria-label="Ощущения из дневника">{result.sensations.map(item => <li key={item.id}>{item.label}</li>)}</ul>
        : result.date ? <p>Ощущения {isToday ? 'сегодня' : 'за этот день'} пока не отмечены. По фото Mina их не определяет.</p>
          : <p>День добавления и исходный часовой пояс этого снимка недоступны. Время показано в UTC; записи дневника к нему автоматически не привязываем.</p>}
      {result.contexts.length > 0 && <div className="mina-result-context"><h3>Контекст дня</h3><ul className="mina-result-tags" aria-label="Контекст из дневника">{result.contexts.map(item => <li key={item.id}>{item.label}</li>)}</ul><p>Это твои наблюдения, а не установленные причины изменений кожи.</p></div>}
      {result.date&&!isToday && <p className="mina-result-caption">Здесь записи за день добавления снимка. Они могут быть дополнены позже и не описывают обязательно момент съёмки.</p>}
    </section>

    <section className="mina-result-next" aria-labelledby="mina-result-next-title">
      <p className="mina-result-basis">{hasEntries ? `По твоим записям ${isToday ? 'за сегодня' : `за ${day}`}` : 'Следующий шаг'}</p>
      <h2 id="mina-result-next-title">{hasEntries ? result.plan.focus : result.date?'Уточним твой уход':'Продолжить сегодня'}</h2>
      <p>{hasEntries ? result.plan.summary : result.date?'Отметь, как чувствует себя кожа. Это поможет выбрать фокус ухода; одна разметка на фото его не меняет.':'Можно открыть сегодняшние записи или план ухода. Они не будут связаны с этим архивным снимком.'}</p>
      {hasEntries && <details className="mina-result-reason"><summary>Почему такой фокус?</summary><p>{result.plan.reason}</p><a href={result.plan.sourceUrl} target="_blank" rel="noopener noreferrer">{result.plan.source}</a></details>}
      <div className="mina-result-actions">
        <button type="button" className="mina-primary" onClick={() => hasSensations ? onOpenRoutine(actionDate) : onOpenJournal(actionDate)}>{hasSensations ? 'Посмотреть уход' : journalAction}</button>
        <button type="button" className="mina-result-link" onClick={() => hasSensations ? onOpenJournal(actionDate) : onOpenRoutine(actionDate)}>{hasSensations ? journalAction : result.date?'Посмотреть базовый уход':'Посмотреть уход на сегодня'}</button>
      </div>
    </section>
  </div>;
}
