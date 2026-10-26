'use client';

import React from 'react';
import { Sparkles, ShieldCheck, Camera, Calendar, Flame } from 'lucide-react';

interface HeaderProps {
  onOpenScanner: () => void;
  activeScore: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenScanner, activeScore }) => {
  // Flo-style weekly strip: 7 days with glowing completion dots
  const weekDays = [
    { day: 'Пн', date: '21', score: 78, completed: true },
    { day: 'Вт', date: '22', score: 80, completed: true },
    { day: 'Ср', date: '23', score: 75, completed: true },
    { day: 'Чт', date: '24', score: 82, completed: true },
    { day: 'Пт', date: '25', score: 85, completed: true },
    { day: 'Сб', date: '26', score: activeScore, isToday: true, completed: true },
    { day: 'Вс', date: '27', score: 86, isFuture: true },
  ];

  return (
    <header className="w-full bg-white/80 backdrop-blur-xl border-b border-rose-100/70 sticky top-0 z-40 transition-all flo-card-shadow">
      <div className="max-w-md mx-auto px-4 pt-3 pb-2.5 space-y-3">
        {/* Top Flo Brand & Quick Scan Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ff5b79] via-[#ff758f] to-[#ffb3c1] flex items-center justify-center text-white shadow-sm shadow-rose-300">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-stone-900">
                  Mina
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-rose-100/80 text-[10px] font-bold text-[#ff5b79]">
                  Flo for Skin
                </span>
              </div>
              <p className="text-[10px] text-stone-400 font-medium">
                Сегодня, 26 октября • День сияния
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100/70 text-[#ff5b79] text-xs font-bold border border-rose-200/60 transition-all active:scale-95 shadow-2xs"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>AI-скан</span>
          </button>
        </div>

        {/* Flo-style 7-Day Skin Calendar Strip */}
        <div className="flex items-center justify-between gap-1 pt-0.5">
          {weekDays.map((item) => (
            <div
              key={item.day}
              className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-2xl transition-all ${
                item.isToday
                  ? 'bg-gradient-to-b from-[#ff5b79] to-[#f43f68] text-white shadow-sm shadow-rose-300 scale-105'
                  : 'bg-stone-50/70 text-stone-500 hover:bg-rose-50/50'
              }`}
            >
              <span className={`text-[10px] font-semibold leading-none ${item.isToday ? 'text-rose-100' : 'text-stone-400'}`}>
                {item.day}
              </span>
              <span className={`text-xs font-extrabold mt-1 leading-none ${item.isToday ? 'text-white' : 'text-stone-800'}`}>
                {item.date}
              </span>
              {item.completed && !item.isFuture && (
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${item.isToday ? 'bg-white' : 'bg-rose-400'}`} />
              )}
              {item.isFuture && (
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 bg-stone-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};
