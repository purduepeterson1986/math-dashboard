import React from 'react';
import { sfx } from '../lib/audio.js';

const DOT_COLORS = ['#ef4444', '#f97316', '#f5b70a', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#ef4444', '#f97316'];

function Dots({ n }) {
  if (n === 0) return <span className="h-3" />;
  return (
    <span className="flex flex-wrap justify-center gap-[3px] max-w-[64px]">
      {Array.from({ length: n }, (_, i) => <span key={i} className="w-2 h-2 rounded-full bg-current opacity-70" />)}
    </span>
  );
}

/** Giant 0–10 number buttons for Age 3. One tap answers. */
export default function KidPad({ onPick, disabled, picked, state }) {
  return (
    <div className="grid grid-cols-4 landscape:grid-cols-3 gap-2.5 select-none" role="group" aria-label="Pick a number">
      {Array.from({ length: 11 }, (_, n) => {
        const isPicked = picked === n;
        const tone = isPicked && state === 'correct' ? 'bg-good text-white ring-4 ring-good/30' : isPicked && state === 'wrong' ? 'bg-bad text-white animate-shake' : 'bg-white';
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => { sfx.tap(); onPick(n); }}
            aria-label={`${n}`}
            className={`press key-shadow min-h-[84px] rounded-3xl flex flex-col items-center justify-center gap-1 ${tone} ${n === 10 ? 'col-span-1' : ''}`}
            style={{ color: isPicked ? undefined : DOT_COLORS[n] }}
          >
            <span className="text-4xl font-black leading-none">{n}</span>
            <Dots n={n} />
          </button>
        );
      })}
    </div>
  );
}
