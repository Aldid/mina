'use client';

import React from 'react';
import { BookOpen, ChevronDown, ExternalLink } from 'lucide-react';

const insights = [
  {
    id: 'gentle-cleansing',
    tag: 'Комфорт кожи',
    title: 'После умывания тянет кожу?',
    preview: 'Ощущения помогают заметить, когда привычный уход стоит пересмотреть.',
    content: 'Стянутость сама по себе не измеряет увлажнённость и не подтверждает повреждение барьера. Для мягкого очищения AAD рекомендует неабразивное средство, чуть тёплую воду и умывание кончиками пальцев без трения. При сухости или зуде может помочь привычное увлажняющее средство. Если дискомфорт сохраняется, обсуди его с дерматологом.',
    source: 'AAD: Face washing 101',
    url: 'https://www.aad.org/public/everyday-care/skin-care-basics/care/face-washing-101',
  },
  {
    id: 'new-product',
    tag: 'Новое средство',
    title: 'Познакомь кожу с новым уходом',
    preview: 'Добавляй средства постепенно и отмечай свою реакцию.',
    content: 'Перед добавлением косметического средства AAD рекомендует пробовать его на небольшом участке кожи в течение 7–10 дней, учитывая инструкцию средства. При реакции прекрати использование. Выраженное или сохраняющееся раздражение — повод обратиться к специалисту. Домашняя проба не заменяет медицинское обследование на контактную аллергию.',
    source: 'AAD: How to test skin care products',
    url: 'https://www.aad.org/public/everyday-care/skin-care-secrets/prevent-skin-problems/test-skin-care-products',
  },
  {
    id: 'sun-protection',
    tag: 'Защита от солнца',
    title: 'SPF — это ещё и обновление',
    preview: 'Защита нужна и в облачный день. Ориентируйся на время на улице.',
    content: 'AAD рекомендует солнцезащитное средство широкого спектра UVA/UVB с SPF 30 или выше и водостойкостью. Наноси достаточное количество по инструкции, не забывая шею и уши. На улице обновляй защиту примерно каждые два часа и после плавания или потоотделения. «Два пальца» — приблизительная подсказка, а не универсальная точная доза.',
    source: 'AAD: How to apply sunscreen',
    url: 'https://www.aad.org/public/everyday-care/sun-protection/shade-clothing-sunscreen/how-to-apply-sunscreen',
  },
];

export const FloInsights: React.FC = () => (
  <section className="space-y-3" aria-labelledby="mina-insights-title">
    <div className="flex items-center justify-between gap-3 px-1">
      <h2 id="mina-insights-title" className="flex items-center gap-2 text-base font-bold text-stone-900">
        <BookOpen className="h-4 w-4 text-[#b52b4b]" aria-hidden="true" />
        Об уходе — понятнее
      </h2>
      <span className="text-xs text-stone-500">3 памятки</span>
    </div>
    <div className="flex items-start gap-3 overflow-x-auto pb-3">
      {insights.map((item) => (
        <details key={item.id} className="group w-72 shrink-0 rounded-3xl border border-rose-100 bg-white flo-card-shadow">
          <summary className="cursor-pointer list-none rounded-3xl p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b52b4b] [&::-webkit-details-marker]:hidden">
            <span className="text-xs font-semibold text-[#b52b4b]">{item.tag}</span>
            <span className="mt-2 block text-base font-bold leading-snug text-stone-900">{item.title}</span>
            <span className="mt-2 block text-sm leading-relaxed text-stone-600">{item.preview}</span>
            <span className="mt-4 flex items-center justify-between border-t border-rose-50 pt-3 text-sm font-semibold text-[#b52b4b]">
              Читать памятку
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
            </span>
          </summary>
          <div className="space-y-4 px-5 pb-5">
            <p className="text-sm leading-relaxed text-stone-700">{item.content}</p>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 rounded text-xs font-semibold text-[#b52b4b] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b52b4b]">
              <span>{item.source} (на английском, новая вкладка)</span>
              <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            </a>
          </div>
        </details>
      ))}
    </div>
    <p className="px-1 text-xs leading-relaxed text-stone-500">Образовательные материалы помогают разобраться в уходе и не заменяют консультацию специалиста.</p>
  </section>
);
