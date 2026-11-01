export type TimeOfDay = 'am' | 'pm';
export type SymptomId = 'comfort' | 'tightness' | 'shine' | 'redness' | 'burning' | 'itch' | 'flaking' | 'new-product' | 'ac' | 'sleep' | 'sun' | 'wind' | 'stress';
export type EveningFeeling = 'better' | 'same' | 'worse';

export const SENSATIONS: { id: SymptomId; label: string }[] = [
  { id: 'comfort', label: 'Коже комфортно' },
  { id: 'tightness', label: 'Стянутость' },
  { id: 'shine', label: 'Блеск в Т-зоне' },
  { id: 'redness', label: 'Покраснение' },
  { id: 'burning', label: 'Жжение' },
  { id: 'itch', label: 'Зуд' },
  { id: 'flaking', label: 'Шелушение' },
];
export const CONTEXTS: { id: SymptomId; label: string }[] = [
  { id: 'new-product', label: 'Новое средство' },
  { id: 'ac', label: 'Кондиционер / отопление' },
  { id: 'sleep', label: 'Недосып' },
  { id: 'sun', label: 'День на улице' },
  { id: 'wind', label: 'Холод / ветер' },
  { id: 'stress', label: 'Стресс' },
];

export interface DailyEntry {
  symptoms: SymptomId[];
  completed: { am: string[]; pm: string[] };
  eveningFeeling?: EveningFeeling;
  photoReviewed?: true;
}
export type DailyJournal = Record<string, DailyEntry>;
export interface CareStep { id: string; title: string; detail: string; ingredients: string; }
export interface DailyCarePlan {
  focus: string;
  summary: string;
  reason: string;
  source: string;
  sourceUrl: string;
  gentle: boolean;
  am: CareStep[];
  pm: CareStep[];
}

export function emptyEntry(): DailyEntry {
  return { symptoms: [], completed: { am: [], pm: [] } };
}

// Local calendar keys avoid a UTC date shift near midnight.
export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function dateFromKey(key: string): Date { return new Date(`${key}T12:00:00`); }
export function weekForDate(key: string): string[] {
  const date = dateFromKey(key);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(date);
    day.setDate(day.getDate() + offset);
    return localDateKey(day);
  });
}
export function formatDay(key: string, includeYear = false): string {
  return dateFromKey(key).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: includeYear ? 'numeric' : undefined });
}

export type JournalAction =
  | { type: 'photo-review' }
  | { type: 'symptom'; id: SymptomId }
  | { type: 'step'; period: TimeOfDay; id: string }
  | { type: 'reflection'; value: EveningFeeling };

export function updateJournal(journal: DailyJournal, date: string, action: JournalAction): DailyJournal {
  const entry = journal[date] || emptyEntry();
  if (action.type === 'photo-review') return { ...journal, [date]: { ...entry, photoReviewed: true } };
  if (action.type === 'symptom') {
    let symptoms = entry.symptoms.includes(action.id)
      ? entry.symptoms.filter(id => id !== action.id)
      : [...entry.symptoms, action.id];
    const discomfort = ['tightness', 'shine', 'redness', 'burning', 'itch', 'flaking'];
    if (action.id === 'comfort' && symptoms.includes('comfort')) {
      symptoms = symptoms.filter(id => !discomfort.includes(id));
    } else if (discomfort.includes(action.id) && symptoms.includes(action.id)) {
      symptoms = symptoms.filter(id => id !== 'comfort');
    }
    return { ...journal, [date]: { ...entry, symptoms } };
  }
  if (action.type === 'reflection') {
    return { ...journal, [date]: { ...entry, eveningFeeling: action.value } };
  }
  const previous = entry.completed[action.period];
  const completed = previous.includes(action.id) ? previous.filter(id => id !== action.id) : [...previous, action.id];
  return { ...journal, [date]: { ...entry, completed: { ...entry.completed, [action.period]: completed } } };
}

export function careForSymptoms(symptoms: SymptomId[]): DailyCarePlan {
  const has = (id: SymptomId) => symptoms.includes(id);
  const gentle = has('burning') || has('itch') || has('redness');
  const dry = has('tightness') || has('flaking');
  let focus = 'Твой спокойный ритуал';
  let summary = 'Небольшая забота утром и вечером';
  let reason = 'Пока нет отметок об ощущениях. Это базовый план, который можно уточнить в дневнике ниже.';
  if (gentle) {
    focus = 'Бережный режим';
    summary = 'Сегодня без новых активов';
    reason = 'Ты отметила жжение, зуд или покраснение. Оставили привычную мягкую базу, без новых кислот и сывороток. Отметка в дневнике не определяет причину реакции.';
  } else if (dry) {
    focus = 'Комфорт и увлажнение';
    summary = 'Мягкая база без лишних шагов';
    reason = 'Ты отметила стянутость или шелушение. В плане — деликатное очищение и привычное увлажнение. По этой отметке нельзя измерить влажность или состояние барьера.';
  } else if (has('shine')) {
    focus = 'Лёгкий уход';
    summary = 'Комфорт без агрессивного очищения';
    reason = 'Ты отметила блеск. Предлагаем мягкое очищение и подходящее лёгкое увлажнение, без автоматического добавления кислот.';
  } else if (has('new-product')) {
    focus = 'Наблюдаем за новым';
    summary = 'Один понятный шаг за раз';
    reason = 'Ты отметила новое средство. Не добавляем другие активы автоматически: сначала важно наблюдать переносимость и следовать инструкции средства.';
  } else if (has('comfort')) {
    focus = 'Коже комфортно';
    summary = 'Продолжай привычную базу';
    reason = 'По твоей отметке коже комфортно. Сохраняем простой привычный уход; дополнительные средства не обязательны.';
  }
  if (has('sun')) reason += ' Отметка о времени на улице не определяет UV-индекс. На улице обновляй SPF примерно каждые 2 часа и после воды или потоотделения.';
  if (has('ac') || has('wind') || has('sleep') || has('stress')) reason += ' Контекст дня записан для наблюдения, но сам по себе не доказывает причину ощущений.';
  return {
    focus, summary, reason, gentle,
    source: gentle || has('new-product') ? 'AAD: реакция на новое средство' : 'AAD: базовый уход',
    sourceUrl: gentle || has('new-product')
      ? 'https://www.aad.org/public/everyday-care/skin-care-secrets/prevent-skin-problems/test-skin-care-products'
      : 'https://www.aad.org/public/everyday-care/skin-care-basics/care/face-washing-101',
    am: [
      { id: 'cleanse', title: 'Мягкое очищение', detail: 'Используй привычное деликатное средство по потребности, тёплую воду и пальцы. Не три кожу.', ingredients: 'Без скрабирующих частиц; средство, которое ты уже переносишь.' },
      { id: 'moisturize', title: dry || gentle ? 'Увлажнение для комфорта' : 'Привычное увлажнение', detail: gentle ? 'Выбирай уже знакомое средство без отдушки. Если оно усиливает жжение, прекрати использование и обратись за советом специалиста.' : has('shine') ? 'Выбери знакомую лёгкую текстуру, которая комфортна коже. Блеск не означает, что увлажнение нужно исключить.' : 'Нанеси привычный увлажняющий крем по потребности. Не нужно добавлять несколько новых средств сразу.', ingredients: 'Например, глицерин или церамиды в подходящей тебе формуле.' },
      { id: 'protect', title: 'Защита от солнца', detail: 'Перед выходом используй SPF 30+ с UVA/UVB-защитой по инструкции. На улице обновляй примерно каждые 2 часа и после плавания или потоотделения; помни о шее и ушах.', ingredients: 'Подходящий SPF 30+; при необходимости водостойкий.' },
    ],
    pm: [
      { id: 'cleanse', title: 'Деликатно очистить кожу', detail: 'Удали косметику и загрязнения подходящим средством. Дополнительный этап нужен по ситуации, а не ради числа шагов.', ingredients: 'Привычное мягкое очищающее средство.' },
      { id: 'moisturize', title: gentle ? 'Привычная мягкая база' : 'Увлажнить и завершить день', detail: gentle ? 'Не вводи новые активы на фоне раздражения. При выраженной или сохраняющейся реакции обратись к специалисту.' : 'Нанеси привычное увлажняющее средство по потребности. Сегодняшний ритуал может быть коротким.', ingredients: 'Знакомая формула по переносимости, без обязательной сыворотки.' },
    ],
  };
}
