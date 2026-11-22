import React from 'react';
import { Lock, Volume2, VolumeX, ArrowLeftRight, CalendarCheck } from 'lucide-react';

export default function Header({ name, child, onSwitch, today = 0, sound, onToggleSound, onParent }) {
  return (
    <header className="safe-top px-4 sm:px-6 pt-3">
      <div className="flex items-center gap-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <img src="./icon.svg" alt="" className="w-11 h-11 rounded-2xl shadow-md shadow-brand-600/20" />
          <div className="leading-tight">
            <div className="text-xl font-black tracking-tight text-ink">Lumen <span className="text-brand-600">Math Lab</span></div>
            <div className="text-xs font-bold text-ink-muted">{child ? `Hi, ${child.name}!` : name ? `Hi, ${name}!` : 'Math & STEM Studio'}</div>
          </div>
        </div>
        {child && (
          <button type="button" onClick={onSwitch} aria-label={`Learning as ${child.name}. Tap to switch.`}
            className="press h-11 pl-2 pr-3 rounded-2xl bg-white border border-line flex items-center gap-2 font-extrabold card-shadow">
            <span className="text-2xl leading-none" aria-hidden="true">{child.avatar}</span>
            <span className="max-w-[7rem] truncate">{child.name}</span>
            <ArrowLeftRight size={16} className="text-ink-muted" />
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <div className="h-11 px-3 rounded-2xl bg-white border border-line flex items-center gap-1.5 font-extrabold tabular card-shadow" title="Sessions completed today"
            aria-label={`${today} session${today === 1 ? '' : 's'} completed today`}>
            <CalendarCheck size={18} className={today ? 'text-good' : 'text-ink-muted'} />{today}
            <span className="text-xs font-bold text-ink-muted">today</span>
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
