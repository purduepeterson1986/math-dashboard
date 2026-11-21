import React from 'react';
import { Zap, ClipboardList, BookOpen, FlaskConical, Shuffle } from 'lucide-react';

const MAP = {
  flash: { Icon: Zap, cls: 'bg-amber-100 text-amber-600', grad: 'from-amber-50 to-white', ring: 'hover:border-amber-300' },
  worksheet: { Icon: ClipboardList, cls: 'bg-sky-100 text-sky-600', grad: 'from-sky-50 to-white', ring: 'hover:border-sky-300' },
  story: { Icon: BookOpen, cls: 'bg-rose-100 text-rose-600', grad: 'from-rose-50 to-white', ring: 'hover:border-rose-300' },
  stem: { Icon: FlaskConical, cls: 'bg-emerald-100 text-emerald-600', grad: 'from-emerald-50 to-white', ring: 'hover:border-emerald-300' },
  mix: { Icon: Shuffle, cls: 'bg-violet-100 text-violet-600', grad: 'from-violet-50 to-white', ring: 'hover:border-violet-300' },
};
export const modeStyle = (m) => MAP[m] || MAP.mix;

export default function ModeIcon({ mode, size = 22, box = 'w-11 h-11' }) {
  const { Icon, cls } = modeStyle(mode);
  return <span className={`${box} shrink-0 rounded-2xl flex items-center justify-center ${cls}`}><Icon size={size} /></span>;
}
