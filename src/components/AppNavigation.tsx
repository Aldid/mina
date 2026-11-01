'use client';
import { House, ScanFace, Droplets, BookOpen } from 'lucide-react';

export type MainScreen = 'today' | 'photos' | 'care' | 'journal';
const items = [
  { id: 'today', label: 'Сегодня', icon: House },
  { id: 'photos', label: 'Фото', icon: ScanFace },
  { id: 'care', label: 'Уход', icon: Droplets },
  { id: 'journal', label: 'Дневник', icon: BookOpen },
] as const;

export function AppNavigation({ active, onSelect }: { active: MainScreen; onSelect: (screen: MainScreen) => void }) {
  return <nav className="mina-tabbar" aria-label="Разделы Mina">{items.map(item => <button key={item.id} type="button" aria-current={active === item.id ? 'page' : undefined} onClick={() => onSelect(item.id)}>
    <span><item.icon aria-hidden="true" size={23} strokeWidth={active === item.id ? 2.2 : 1.7} /></span><span>{item.label}</span>
  </button>)}</nav>;
}
