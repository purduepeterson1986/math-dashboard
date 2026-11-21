import React, { useMemo, useState } from 'react';
import { SlidersHorizontal, ChevronDown, Play, Check, X } from 'lucide-react';
import ModeIcon from '../components/ModeIcon.jsx';
import { modeById } from '../curriculum/index.js';
import { topicsForMode } from '../lib/session.js';

/** Bottom sheet shown before a session: collapsible topic filters, difficulty preset, length. */
export default function SetupSheet({ curriculum, mode, saved, child, onNotMe, onStart, onClose }) {
  const m = modeById(mode);
  const available = useMemo(() => curriculum.topics.filter((t) => mode === 'mix' || t.modes.includes(mode)), [curriculum, mode]);
  const initialTopics = (saved?.topics || available.map((t) => t.id)).filter((id) => available.some((t) => t.id === id));
  const [topics, setTopics] = useState(initialTopics.length ? initialTopics : available.map((t) => t.id));
  const [difficulty, setDifficulty] = useState(saved?.difficulty || curriculum.defaultDifficulty);
  const [count, setCount] = useState(saved?.count || curriculum.defaults[mode]?.count);
  const [seconds, setSeconds] = useState(saved?.seconds || curriculum.defaults.flash.seconds);
  const [open, setOpen] = useState(false);

  const groups = useMemo(() => {
    const g = new Map();
    available.forEach((t) => { if (!g.has(t.group)) g.set(t.group, []); g.get(t.group).push(t); });
    return [...g.entries()];
  }, [available]);

  const toggle = (id) => setTopics((ts) => (ts.includes(id) ? ts.filter((x) => x !== id) : [...ts, id]));
  const toggleGroup = (items) => {
    const ids = items.map((t) => t.id);
    const allOn = ids.every((id) => topics.includes(id));
    setTopics((ts) => (allOn ? ts.filter((x) => !ids.includes(x)) : [...new Set([...ts, ...ids])]));
  };
  const valid = topicsForMode(curriculum, mode, topics).length > 0;
  const config = mode === 'flash'
    ? { topics, difficulty, seconds, maxCards: curriculum.defaults.flash.maxCards }
    : { topics, difficulty, count };
  const selectedLabels = available.filter((t) => topics.includes(t.id)).map((t) => t.label);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-[2px]" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={`${m.label} setup`} onClick={(e) => e.stopPropagation()}
        className="animate-rise w-full sm:max-w-2xl max-h-[92dvh] flex flex-col rounded-t-[32px] sm:rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-center gap-3 px-6 pt-6 pb-3">
          <ModeIcon mode={mode} size={26} box="w-14 h-14" />
          <div className="min-w-0">
            <h2 className="text-2xl font-black text-ink">{m.label}</h2>
            <p className="text-ink-soft font-semibold text-sm">{m.blurb}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="press ml-auto w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center"><X size={22} /></button>
        </div>

        <div className="flex-1 scroll-y px-6 pb-4 space-y-5">
          {child && (
            <div className="flex items-center gap-3 rounded-2xl bg-brand-50 border-2 border-brand-100 px-4 py-3">
              <span className="text-4xl leading-none" aria-hidden="true">{child.avatar}</span>
              <div className="flex-1 min-w-0"><div className="text-xs font-extrabold uppercase tracking-widest text-ink-muted">Learning today</div><div className="text-xl font-black text-ink truncate">{child.name}</div></div>
              <button type="button" onClick={onNotMe} className="press min-h-11 px-4 rounded-xl bg-white border border-line font-extrabold text-ink-soft">Not {child.name}?</button>
            </div>
          )}
          {/* Difficulty */}
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-ink-muted mb-2">Level</div>
            <div className="grid grid-cols-3 gap-2">
              {curriculum.difficulties.map((d) => (
                <button key={d.id} type="button" onClick={() => setDifficulty(d.id)}
                  className={`press text-left rounded-2xl border-2 p-3 min-h-[88px] ${difficulty === d.id ? 'border-brand-500 bg-brand-50' : 'border-line bg-white'}`}>
                  <div className={`font-extrabold ${difficulty === d.id ? 'text-brand-700' : 'text-ink'}`}>{d.label}</div>
                  <div className="text-xs text-ink-soft font-semibold leading-snug mt-0.5">{d.detail}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Length */}
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-ink-muted mb-2">{mode === 'flash' ? 'Timer' : 'Number of problems'}</div>
            <div className="flex flex-wrap gap-2">
              {(mode === 'flash' ? curriculum.secondsOptions : curriculum.countOptions[mode]).map((n) => {
                const on = mode === 'flash' ? seconds === n : count === n;
                return (
                  <button key={n} type="button" onClick={() => (mode === 'flash' ? setSeconds(n) : setCount(n))}
                    className={`press min-w-16 h-12 px-4 rounded-2xl border-2 font-extrabold tabular ${on ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line text-ink'}`}>
                    {mode === 'flash' ? (n >= 60 ? `${n / 60} min` : `${n}s`) : n}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter drawer */}
          <div className="rounded-3xl border-2 border-line overflow-hidden">
            <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
              className="w-full min-h-16 px-4 flex items-center gap-3 bg-slate-50 text-left">
              <SlidersHorizontal size={22} className="text-brand-600" />
              <span className="flex-1 min-w-0">
                <span className="block font-extrabold text-ink">Customize / Filter Topics</span>
                <span className="block text-xs font-semibold text-ink-soft truncate">
                  {topics.length === available.length ? `All ${available.length} topics` : selectedLabels.length ? selectedLabels.join(', ') : 'No topics selected'}
                </span>
              </span>
              <ChevronDown size={22} className={`text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div className="p-4 space-y-4 animate-rise">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setTopics(available.map((t) => t.id))} className="press h-10 px-4 rounded-xl bg-slate-100 text-sm font-extrabold">Select all</button>
                  <button type="button" onClick={() => setTopics([])} className="press h-10 px-4 rounded-xl bg-slate-100 text-sm font-extrabold">Clear all</button>
                </div>
                {groups.map(([group, items]) => (
                  <div key={group}>
                    <button type="button" onClick={() => toggleGroup(items)} className="text-xs font-extrabold uppercase tracking-widest text-ink-muted mb-2 min-h-8">{group} ↺</button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {items.map((t) => {
                        const on = topics.includes(t.id);
                        return (
                          <button key={t.id} type="button" role="switch" aria-checked={on} onClick={() => toggle(t.id)}
                            className={`press min-h-14 px-3 rounded-2xl border-2 flex items-center gap-3 text-left ${on ? 'border-brand-400 bg-brand-50' : 'border-line bg-white'}`}>
                            <span className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center ${on ? 'bg-brand-600 text-white' : 'border-2 border-line'}`}>{on && <Check size={18} strokeWidth={3} />}</span>
                            <span className={`font-bold ${on ? 'text-ink' : 'text-ink-soft'}`}>{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pt-3 pb-6 safe-bottom border-t border-line">
          {!valid && <p className="text-bad font-bold text-sm mb-2 text-center">Pick at least one topic to start.</p>}
          <button type="button" disabled={!valid} onClick={() => onStart(config)}
            className="press w-full h-16 rounded-2xl bg-brand-600 text-white text-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 disabled:opacity-40 disabled:shadow-none">
            <Play size={24} className="fill-white" /> Start {m.label}
          </button>
        </div>
      </div>
    </div>
  );
}
