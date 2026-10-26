'use client';

import React, { useState } from 'react';
import { Sparkles, BookOpen, ChevronRight, X } from 'lucide-react';

export const FloInsights: React.FC = () => {
  const [activeStory, setActiveStory] = useState<{ title: string; content: string; tag: string } | null>(null);

  const insights = [
    {
      id: 'niacinamide',
      tag: 'Компонент дня',
      title: 'Ниацинамид: секрет сужения пор и бархатного финиша',
      preview: 'Почему этот витамин B3 подходит и при жирном блеске, и при чувствительности.',
      content:
        'Ниацинамид (витамин B3 в концентрации 2–5%) стимулирует синтез собственных церамидов в коже, сужает устья пор и регулирует выработку кожного сала. В отличие от агрессивных кислот, он не повышает чувствительность к солнцу и подходит для круглогодичного применения.',
      bg: 'from-rose-100 via-pink-50 to-white',
      accent: 'text-rose-600',
    },
    {
      id: 'barrier',
      tag: 'Уход за барьером',
      title: 'Стянутость после умывания — это не норма',
      preview: 'Если кожа «скрипит» от чистоты, её защитный липидный слой повреждён.',
      content:
        'Ощущение «скрипа» означает, что жесткие ПАВы смыли не только загрязнения, но и липидный цемент, удерживающий воду. Замени агрессивную пенку на слабокислотную (pH 5.5) или очищающую эмульсию с аминокислотами.',
      bg: 'from-amber-100 via-rose-50 to-white',
      accent: 'text-amber-700',
    },
    {
      id: 'spf',
      tag: 'Защита от солнца',
      title: 'Правило двух пальцев для SPF 50+',
      preview: 'Сколько крема на самом деле нужно, чтобы защитить лицо от пигментации.',
      content:
        'Чтобы получить заявленный на упаковке уровень защиты SPF 50+, необходимо около 1.25 мл крема на лицо — это ровно две плотные полоски средства, нанесенные вдоль указательного и среднего пальцев.',
      bg: 'from-sky-100 via-teal-50 to-white',
      accent: 'text-teal-700',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-[#ff5b79]" />
          <span>Инсайты дня от Mina</span>
        </h3>
        <span className="text-[11px] font-semibold text-[#ff5b79]">3 статьи</span>
      </div>

      {/* Horizontal Story Cards Carousel */}
      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        {insights.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveStory(item)}
            className="cursor-pointer shrink-0 w-64 bg-white rounded-3xl p-4 border border-rose-100/80 flo-card-shadow hover:border-rose-300 transition-all active:scale-[0.98] flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 ${item.accent}`}>
                {item.tag}
              </span>
              <h4 className="text-xs font-bold text-stone-900 leading-snug line-clamp-2">
                {item.title}
              </h4>
              <p className="text-[11px] text-stone-500 leading-relaxed line-clamp-2">
                {item.preview}
              </p>
            </div>

            <div className="pt-2 border-t border-rose-50 flex items-center justify-between text-[11px] font-bold text-[#ff5b79]">
              <span>Читать инсайт</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Story Detail Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-[#ff5b79]">
                {activeStory.tag}
              </span>
              <button
                type="button"
                onClick={() => setActiveStory(null)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-bold text-stone-900 leading-snug">
              {activeStory.title}
            </h3>

            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              {activeStory.content}
            </p>

            <button
              type="button"
              onClick={() => setActiveStory(null)}
              className="w-full py-2.5 rounded-full bg-[#ff5b79] text-white text-xs font-bold shadow-sm"
            >
              Понятно, спасибо!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
