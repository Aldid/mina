'use client';

import React, { useState } from 'react';
import { Plus, Check, Sparkles, Lightbulb } from 'lucide-react';

interface FloSymptomLoggerProps {
  onSymptomChange?: (symptoms: string[]) => void;
}

export const FloSymptomLogger: React.FC<FloSymptomLoggerProps> = ({ onSymptomChange }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Гладкость / Glow']);

  const symptomsList = [
    { id: 'glow', label: '✨ Идеальный Glow', tip: 'Кожа в превосходном тонусе! Поддерживай баланс легким увлажнением и SPF 50+.' },
    { id: 'tightness', label: '💧 Стянутость', tip: 'Ощущение стянутости говорит о нехватке влаги. Нанеси увлажняющий тонер ладонями в 2 слоя.' },
    { id: 'shine', label: '🫧 Блеск в Т-зоне', tip: 'Себум усилился. Добавь каплю сыворотки с ниацинамидом и цинком для бархатного финиша.' },
    { id: 'redness', label: '🌸 Покраснения', tip: 'Сосуды реагируют на внешнюю среду. Нанеси концентрат с центеллой азиатской (Cica).' },
    { id: 'ac', label: '❄️ Сухой кондиционер', tip: 'Офисный воздух вытягивает влагу. Обязательно защити кожу кремом с церамидами.' },
    { id: 'sleep', label: '😴 Недосып', tip: 'Легкая отечность век. Используй крем-гель с пептидами и кофеином легкими похлопываниями.' },
    { id: 'sun', label: '☀️ Солнечный день', tip: 'Высокий ультрафиолетовый индекс. Не забудь обновить SPF через 3–4 часа на открытом воздухе.' },
  ];

  const toggleSymptom = (label: string) => {
    let next: string[];
    if (selectedSymptoms.includes(label)) {
      next = selectedSymptoms.filter((s) => s !== label);
    } else {
      next = [...selectedSymptoms, label];
    }
    setSelectedSymptoms(next);
    onSymptomChange?.(next);
  };

  const activeTip = symptomsList.find((s) => selectedSymptoms.includes(s.label))?.tip ||
    'Отмечай ежедневные ощущения, чтобы Mina точнее адаптировала твой утренний и вечерний ритуал.';

  return (
    <div className="bg-white rounded-3xl p-5 border border-rose-100/80 flo-card-shadow space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-stone-900">
            Как твоя кожа чувствует себя сегодня?
          </h3>
          <p className="text-[11px] text-stone-400">
            Нажми, чтобы отметить симптомы или внешние факторы:
          </p>
        </div>
        <span className="text-xs font-bold text-[#ff5b79] px-2 py-0.5 rounded-full bg-rose-50">
          {selectedSymptoms.length} отмечено
        </span>
      </div>

      {/* Pill Buttons Grid */}
      <div className="flex flex-wrap gap-1.5">
        {symptomsList.map((item) => {
          const isSelected = selectedSymptoms.includes(item.label);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleSymptom(item.label)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-gradient-to-r from-[#ff5b79] to-[#ff758f] text-white shadow-xs shadow-rose-200'
                  : 'bg-stone-50 text-stone-600 hover:bg-rose-50/70 border border-stone-100'
              }`}
            >
              <span>{item.label}</span>
              {isSelected ? (
                <Check className="w-3 h-3 text-white" />
              ) : (
                <Plus className="w-3 h-3 text-stone-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Flo Dynamic Tip Box */}
      <div className="bg-rose-50/60 rounded-2xl p-3 border border-rose-100/70 text-xs text-stone-700 flex items-start gap-2.5">
        <Lightbulb className="w-4 h-4 text-[#ff5b79] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-stone-900 font-bold">Совет Mina на сегодня: </strong>
          {activeTip}
        </p>
      </div>
    </div>
  );
};
