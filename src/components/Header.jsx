import React from 'react';
import { Lock, Star, Flame, Volume2, VolumeX } from 'lucide-react';

export default function Header({ name, stars, dayStreak, sound, onToggleSound, onParent }) {
  return (
    <header className="safe-top px-4 sm:px-6 pt-3">
      <div className="flex items-center gap-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <img src="./icon.svg" alt="" className="w-11 h-11 rounded-2xl shadow-md shadow-brand-600/20" />
          <div className="leading-tight">
            <div className="text-xl font-black tracking-tight text-ink">Lumen <span className="text-brand-600">Math Lab</span></div>
            <div className="text-xs font-bold text-ink-muted">{name ? `Hi, ${name}!` : 'Math & STEM Studio'}</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="h-11 px-3 rounded-2xl bg-white border border-line flex items-center gap-1.5 font-extrabold tabular card-shadow" title="Stars earned">
            <Star size={18} className="text-amber-500 fill-amber-400" />{stars}
          </div>
          <div className="h-11 px-3 rounded-2xl bg-white border border-line flex items-center gap-1.5 font-extrabold tabular card-shadow" title="Days in a row">
            <Flame size={18} className={dayStreak ? 'text-orange-500' : 'text-ink-muted'} />{dayStreak}
          </div>
          <button type="button" onClick={onToggleSound} aria-label={sound ? 'Mute sounds' : 'Turn sounds on'}
            className="press w-12 h-11 rounded-2xl bg-white border border-line flex items-center justify-center text-ink-soft card-shadow">
            {sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button type="button" onClick={onParent} className="press h-11 px-3 rounded-2xl text-ink-muted hover:text-ink-soft flex items-center gap-1.5 text-sm font-bold">
            <Lock size={16} /> <span className="hidden sm:inline">Parent Portal</span>
          </button>
        </div>
      </div>
    </header>
  );
}
