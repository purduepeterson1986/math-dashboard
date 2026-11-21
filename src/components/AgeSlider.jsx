import React, { useRef } from 'react';
import { Minus, Plus } from 'lucide-react';
import { MIN_AGE, MAX_AGE, AGE_META, CURRICULA } from '../curriculum/index.js';
import { sfx } from '../lib/audio.js';

const AGES = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);

/** Large, tactile age slider with detents at every age. Drag, tap a tick, or use ± buttons. */
export default function AgeSlider({ age, onChange }) {
  const track = useRef(null);
  const dragging = useRef(false);
  const pct = (a) => ((a - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100;

  const set = (a) => {
    const v = Math.max(MIN_AGE, Math.min(MAX_AGE, a));
    if (v !== age) { sfx.tick(); onChange(v); }
  };
  const fromX = (clientX) => {
    const r = track.current.getBoundingClientRect();
    const t = (clientX - r.left) / r.width;
    return Math.round(MIN_AGE + t * (MAX_AGE - MIN_AGE));
  };
  const onDown = (e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); set(fromX(e.clientX)); };
  const onMove = (e) => { if (dragging.current) set(fromX(e.clientX)); };
  const onUp = () => { dragging.current = false; };
  const onKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(age + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(age - 1); }
  };
  const meta = AGE_META[age];
  const ready = !!CURRICULA[age];

  return (
    <div className="rounded-[28px] bg-white border border-line card-shadow px-4 sm:px-6 pt-4 pb-3">
      <div className="flex items-end justify-between gap-3 mb-1">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-widest text-ink-muted">Learning level</div>
          <div className="text-3xl font-black text-ink leading-tight">Age {age} <span className="text-ink-muted font-bold text-xl">· {meta.stage}</span></div>
        </div>
        <span className={`shrink-0 text-xs font-extrabold px-3 py-1.5 rounded-full ${ready ? 'bg-good-soft text-good' : 'bg-slate-100 text-ink-muted'}`}>{ready ? 'Ready to play' : 'Coming soon'}</span>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" aria-label="Younger" onClick={() => set(age - 1)} disabled={age <= MIN_AGE} className="press shrink-0 w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center disabled:opacity-30"><Minus size={22} /></button>
        <div
          ref={track}
          role="slider" tabIndex={0} aria-label="Age level" aria-valuemin={MIN_AGE} aria-valuemax={MAX_AGE} aria-valuenow={age} aria-valuetext={`Age ${age}, ${meta.stage}`}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onKey}
          className="relative flex-1 h-[76px] touch-none cursor-pointer select-none outline-none focus-visible:ring-4 focus-visible:ring-brand-200 rounded-2xl"
        >
          <div className="absolute left-0 right-0 top-[26px] h-3 rounded-full bg-line" />
          <div className="absolute left-0 top-[26px] h-3 rounded-full bg-gradient-to-r from-amber-400 via-brand-500 to-brand-600 transition-[width] duration-150" style={{ width: `${pct(age)}%` }} />
          {AGES.map((a) => (
            <div key={a} className="absolute top-0 -translate-x-1/2 flex flex-col items-center" style={{ left: `${pct(a)}%` }}>
              <span className={`mt-[22px] w-1 h-5 rounded-full ${a <= age ? 'bg-white/80' : 'bg-ink-muted/30'}`} />
              <span className={`mt-2 text-[11px] font-extrabold tabular ${a === age ? 'text-brand-700' : CURRICULA[a] ? 'text-ink' : 'text-ink-muted/70'}`}>{a}</span>
              {CURRICULA[a] && <span className="w-1.5 h-1.5 rounded-full bg-good mt-0.5" />}
            </div>
          ))}
          <div className="absolute top-[4px] -translate-x-1/2 transition-[left] duration-150 ease-out pointer-events-none" style={{ left: `${pct(age)}%` }}>
            <div className="w-[52px] h-[52px] rounded-full bg-white border-[5px] border-brand-600 shadow-lg shadow-brand-600/30 flex items-center justify-center text-lg font-black text-brand-700 tabular">{age}</div>
          </div>
        </div>
        <button type="button" aria-label="Older" onClick={() => set(age + 1)} disabled={age >= MAX_AGE} className="press shrink-0 w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center disabled:opacity-30"><Plus size={22} /></button>
      </div>
    </div>
  );
}
