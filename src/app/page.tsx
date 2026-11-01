'use client';
import { useEffect, useRef, useState } from 'react';
import { Camera, ScanFace, ChevronRight, ShieldCheck } from 'lucide-react';
import { Header, WeekCalendar } from '../components/Header';
import { AppNavigation, type MainScreen } from '../components/AppNavigation';
import { FloSymptomLogger } from '../components/FloSymptomLogger';
import { FloDailyPlan } from '../components/FloDailyPlan';
import { FloInsights } from '../components/FloInsights';
import { ScannerModal } from '../components/ScannerModal';
import { WeeklyReview } from '../components/WeeklyReview';
import { JournalSettings } from '../components/JournalSettings';
import { PhotoDiary } from '../components/PhotoDiary';
import { useJournal } from '../lib/useJournal';
import type { ReviewedPhoto } from '../lib/photoObservations';
import { photoJournalDate } from '../lib/photoMetadata';
import { careForSymptoms, emptyEntry, formatDay, localDateKey, type JournalAction, type TimeOfDay } from '../lib/dailyCare';

type Screen = MainScreen | 'settings';
const headings: Record<Screen, string> = { today: 'mina-today-title', photos: 'mina-photo-diary-title', care: 'mina-care-title', journal: 'mina-journal-title', settings: 'mina-settings-title' };

export default function Home() {
  const [today, setToday] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>('today');
  const previousScreen = useRef<MainScreen>('today');
  const [focusTarget, setFocusTarget] = useState<string | null>(null);
  const { journal, mode, issue, ready, store } = useJournal();
  const [confirmErase, setConfirmErase] = useState(false);
  const [activeTime, setActiveTime] = useState<TimeOfDay>('am');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [photo, setPhoto] = useState<ReviewedPhoto | null>(null);
  useEffect(() => {
    const updateDate = () => setToday(localDateKey(new Date()));
    updateDate();
    const interval = window.setInterval(updateDate, 30_000);
    document.addEventListener('visibilitychange', updateDate);
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', updateDate); };
  }, []);
  const date = selectedDate || today;
  const entry = journal[date] || emptyEntry();
  const plan = careForSymptoms(entry.symptoms);
  const dayLabel = date ? formatDay(date, date.slice(0, 4) !== today.slice(0, 4)) : '';
  const navigate = (next: Screen, target = headings[next]) => {
    if (next === 'settings' && screen !== 'settings') previousScreen.current = screen;
    setScreen(next); setFocusTarget(target);
  };
  useEffect(() => {
    if (!focusTarget || !ready) return;
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(focusTarget);
      if (target) {
        target.focus({ preventScroll: true });
        const headerHeight = document.querySelector('header')?.getBoundingClientRect().height || 0;
        const top = focusTarget === headings[screen] ? 0 : Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight - 16);
        window.scrollTo({ top, behavior: 'auto' });
      }
      setFocusTarget(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [screen, date, focusTarget, ready]);
  const openJournalDay = (key: string) => { setSelectedDate(key === today ? null : key); navigate('today', 'mina-symptoms-title'); };
  const openRoutine = (key: string) => { setSelectedDate(key === today ? null : key); navigate('care', 'routine-heading'); };
  const changeEntry = (action: JournalAction) => { if (date) store.change(date, action); };
  const resetView = () => { setSelectedDate(null); setActiveTime('am'); setPhoto(null); setIsScannerOpen(false); };
  const storageNote = mode === 'device'
    ? issue ? 'Сохранение требует внимания — открой настройки.' : 'История сохраняется на этом устройстве.'
    : 'Дневник пока в этой сессии. После перезапуска записи исчезнут.';
  const calendar = <WeekCalendar today={today} selectedDate={date} journal={journal} onSelectDate={key => setSelectedDate(key === today ? null : key)} />;
  return <div className="mina-app-shell">
    <Header onOpenScanner={() => setIsScannerOpen(true)} onSettings={() => navigate('settings')} settingsOpen={screen === 'settings'} onBack={() => navigate(previousScreen.current)} />
    <main className="mina-main mina-app-main">
      {today && ready ? <>
        <section className="mina-screen" hidden={screen !== 'today'} aria-labelledby="mina-today-title">
          <div className="mina-screen-heading"><p>Дневник твоей кожи</p><h1 id="mina-today-title" tabIndex={-1}>{date === today ? 'Сегодня' : dayLabel}</h1></div>
          {calendar}
          <section className="mina-today-photo" aria-labelledby="mina-today-photo-title">
            <div className="mina-today-photo-symbol" aria-hidden="true"><ScanFace size={42} strokeWidth={1.25} /></div>
            <h2 id="mina-today-photo-title">Твоя кожа. Твои наблюдения.</h2>
            <p>Сделай снимок, проверь отметки и сохрани то, к чему хочешь вернуться.</p>
            <button type="button" className="mina-primary" onClick={() => setIsScannerOpen(true)}><Camera aria-hidden="true" size={19} />Добавить фото</button>
            <button type="button" className="mina-result-link" onClick={() => navigate('photos')}>Открыть мои снимки</button>
          </section>
          <button type="button" className="mina-today-routine" onClick={() => openRoutine(date)}><span><strong>{plan.focus}</strong><span>Утро {entry.completed.am.length}/{plan.am.length} · Вечер {entry.completed.pm.length}/{plan.pm.length}</span></span><ChevronRight aria-hidden="true" size={21} /></button>
          {entry.photoReviewed && <p className="mina-photo-reviewed-note">Фото за {dayLabel} просмотрено. Ощущения и уход отмечаются отдельно.</p>}
          <FloSymptomLogger symptoms={entry.symptoms} onToggle={id => changeEntry({ type: 'symptom', id })} heading={date === today ? 'Что чувствуешь сегодня?' : `Ощущения за ${dayLabel}`} />
          {mode === 'session' && <button type="button" className="mina-session-link" onClick={() => navigate('settings')}>Включить сохранение дневника<ChevronRight aria-hidden="true" size={16} /></button>}
        </section>

        <section className="mina-screen" hidden={screen !== 'photos'} aria-label="Фото кожи">
          <PhotoDiary current={photo} journal={journal} today={today} onOpen={() => setIsScannerOpen(true)} onClear={() => setPhoto(null)} onOpenJournal={openJournalDay} onOpenRoutine={openRoutine} />
        </section>

        <section className="mina-screen" hidden={screen !== 'care'} aria-labelledby="mina-care-title">
          <div className="mina-screen-heading"><p>{dayLabel}</p><h1 id="mina-care-title" tabIndex={-1}>Уход</h1><span className="mina-care-focus">{plan.focus}</span></div>
          <FloDailyPlan key={date} plan={plan} entry={entry} activeTime={activeTime} onTimeChange={setActiveTime} onToggleStep={(period, id) => changeEntry({ type: 'step', period, id })} onReflection={value => changeEntry({ type: 'reflection', value })} onEditSymptoms={() => openJournalDay(date)} dateLabel={dayLabel} />
          <details className="mina-care-explanation"><summary>Почему такой план?</summary><p>{plan.reason}</p><a href={plan.sourceUrl} target="_blank" rel="noreferrer">{plan.source}</a></details>
          <FloInsights />
        </section>

        <section className="mina-screen" hidden={screen !== 'journal'} aria-labelledby="mina-journal-title">
          <div className="mina-screen-heading"><p>Ощущения и маленькие привычки</p><h1 id="mina-journal-title" tabIndex={-1}>Дневник</h1></div>
          {calendar}
          <WeeklyReview today={today} selectedDate={date} journal={journal} onOpenDay={openJournalDay} storageNote={storageNote} />
          <button type="button" className="mina-session-link" onClick={() => navigate('settings')}>Управлять сохранением<ChevronRight aria-hidden="true" size={16} /></button>
        </section>

        <section className="mina-screen" hidden={screen !== 'settings'} aria-labelledby="mina-settings-title">
          <div className="mina-screen-heading"><h1 id="mina-settings-title" tabIndex={-1}>Твои данные</h1><p>Сохранение под твоим контролем.</p></div>
          <JournalSettings mode={mode} issue={issue} confirmErase={confirmErase} onConfirmErase={setConfirmErase} onEnable={store.enable} onDisable={store.disable} onReload={store.load} onErase={() => { if (!store.clear()) return false; resetView(); return true; }} />
          {mode === 'session' && <div className="mina-session-reset"><h2>Новая сессия</h2><p>Сбросит несохранённые записи и открытое фото. Сохранённые снимки останутся в разделе «Фото».</p><button type="button" className="mina-result-link" onClick={() => { store.clearSession(); resetView(); navigate('today'); }}>Начать новую сессию</button></div>}
          <div className="mina-app-privacy"><ShieldCheck aria-hidden="true" size={20} /><h2>Фото остаются на устройстве</h2><p>Анализ выполняется локально. Сохранение снимка — отдельное действие после проверки. Удаление дневника не удаляет сохранённые фото.</p><p>Подсказки помогают наблюдать за кожей и не заменяют медицинскую диагностику. Временными данными камеры также управляет система устройства.</p></div>
        </section>
      </> : <p className="mina-app-loading" role="status">Открываем Mina…</p>}
    </main>
    <AppNavigation active={screen === 'settings' ? previousScreen.current : screen} onSelect={next => { if (next === 'today') setSelectedDate(null); navigate(next); }} />
    <ScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onPhotoComplete={value => {
      const key = localDateKey(new Date()), reviewedDay = photoJournalDate(value);
      setToday(key); setSelectedDate(reviewedDay && reviewedDay !== key ? reviewedDay : null); setPhoto(value);
      if (reviewedDay) store.change(reviewedDay, { type: 'photo-review' });
      navigate('photos');
    }} />
  </div>;
}
