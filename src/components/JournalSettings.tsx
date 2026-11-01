'use client';

import { useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import type { JournalSnapshot } from '../lib/journalStorage';

interface Props {
  mode: JournalSnapshot['mode'];
  issue: JournalSnapshot['issue'];
  confirmErase: boolean;
  onConfirmErase: (value: boolean) => void;
  onEnable: () => boolean;
  onDisable: () => boolean;
  onErase: () => boolean;
  onReload: () => void;
}

const issues = {
  read: 'Не удалось прочитать историю. Отметки доступны в этой сессии; сохранение пока не включено.',
  format: 'Сохранённая копия не прочиталась. Она не перезаписана. Можно попробовать прочитать её снова или удалить копию.',
  save: 'Последние отметки не удалось сохранить. Они остаются в этой сессии. Попробуй сохранить снова перед закрытием Mina.',
  remove: 'Не удалось удалить сохранённую копию. Удаление не подтверждено — попробуй ещё раз.',
  conflict: 'Дневник изменён в другом открытом окне Mina. Твои текущие отметки остались здесь; автоматическое сохранение приостановлено.',
  'external-disabled': 'Сохранение отключено в другом окне. Здесь отметки останутся до завершения сессии.',
};

export function JournalSettings({ mode, issue, confirmErase, onConfirmErase, onEnable, onDisable, onErase, onReload }: Props) {
  const [confirmReload, setConfirmReload] = useState(false);
  const [notice, setNotice] = useState('');
  const focusTitle = () => document.getElementById('mina-storage-title')?.focus({ preventScroll: true });
  const enable = () => { setNotice(onEnable() ? 'История сохранена. Следующие отметки будут сохраняться автоматически.' : ''); focusTitle(); };
  const disable = () => { setNotice(onDisable() ? 'Сохранённая копия удалена. Текущие отметки остались только в этой сессии.' : ''); focusTitle(); };
  return <section className="mina-journal-settings" aria-labelledby="mina-storage-title">
    <div className="mina-storage-heading">
      <h2 id="mina-storage-title" tabIndex={-1}>Сохранение дневника</h2>
      <span><ShieldCheck aria-hidden="true" size={14} />{mode === 'device' ? 'На устройстве' : 'В этой сессии'}</span>
    </div>
    <p>{mode === 'device' ? 'Записи остаются в Mina на этом устройстве между запусками. Их можно открыть и дополнить в календаре.' : 'После перезагрузки отметки исчезнут. Включи сохранение, если хочешь возвращаться к дневнику.'}</p>
    {issue && <p role="alert" className="mina-storage-error">{issues[issue]}</p>}
    {notice && !issue && <p role="status" className="mina-storage-notice"><Check aria-hidden="true" size={16} />{notice}</p>}
    <div className="mina-storage-actions">
      {mode === 'session' && issue !== 'format' && issue !== 'conflict' && <button type="button" className="mina-storage-save" onClick={enable}>Сохранять на этом устройстве</button>}
      {mode === 'device' && issue === 'save' && <button type="button" className="mina-storage-save" onClick={enable}>Попробовать сохранить снова</button>}
      {mode === 'device' && <button type="button" onClick={disable}>Отключить и удалить копию</button>}
      {(issue === 'conflict' || issue === 'read' || issue === 'format') && <button type="button" onClick={() => { setNotice(''); setConfirmReload(true); }}>Прочитать сохранённую копию</button>}
      {(mode === 'device' || issue === 'format' || issue === 'conflict' || issue === 'remove') && <button type="button" onClick={() => { setNotice(''); onConfirmErase(true); }}>Удалить историю</button>}
    </div>
    {confirmReload && <div className="mina-storage-confirm" role="group" aria-label="Подтверждение загрузки истории">
      <p>Записи в этой сессии будут заменены сохранённой копией. Несохранённые изменения могут исчезнуть.</p>
      <div><button type="button" onClick={() => { onReload(); setConfirmReload(false); focusTitle(); }}>Загрузить копию</button><button type="button" onClick={() => { setConfirmReload(false); focusTitle(); }}>Отмена</button></div>
    </div>}
    {confirmErase && <div className="mina-storage-confirm" role="group" aria-label="Подтверждение удаления истории">
      <p>Удалить все записи дневника с этого устройства и из текущей сессии? Это действие нельзя отменить. Сохранение будет выключено.</p>
      <div><button type="button" onClick={() => { if (onErase()) { onConfirmErase(false); setNotice('История удалена. Сохранение выключено.'); focusTitle(); } }}>Удалить все записи</button><button type="button" onClick={() => { onConfirmErase(false); focusTitle(); }}>Оставить записи</button></div>
    </div>}
    <details>
      <summary>Что сохраняется и где</summary>
      <p>Здесь сохраняются даты, ощущения, контекст, галочки ухода, вечерняя самооценка и факт просмотра фото. Снимки и разметка хранятся отдельно, только по кнопке «Сохранить фото на устройстве». Их можно удалить в разделе фото. Удаление текстового дневника не удаляет снимки. Серверной копии нет.</p>
      <p>История доступна в этом экземпляре Mina на этом устройстве. Удаление данных приложения или сайта удалит её. На общем устройстве её могут увидеть другие люди с доступом к Mina. Резервными копиями устройства управляет сама система.</p>
      <p>Отключение сохранения удаляет локальную копию, сохраняя открытые отметки до завершения сессии. Кнопка «Удалить историю» очищает и эту сессию. В других открытых окнах могут оставаться отметки в памяти.</p>
    </details>
  </section>;
}
