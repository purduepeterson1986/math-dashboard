import React from 'react';
import { Hammer, ArrowRight } from 'lucide-react';
import { AGE_META, CURRICULA } from '../curriculum/index.js';

export default function ComingSoon({ age, onPickAge }) {
  const meta = AGE_META[age];
  const ready = Object.keys(CURRICULA).map(Number);
  return (
    <div className="animate-rise rounded-[28px] border-2 border-dashed border-line bg-white/70 p-8 sm:p-12 text-center flex flex-col items-center gap-4">
      <div className="w-20 h-20 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center animate-float"><Hammer size={40} /></div>
      <div>
        <div className="text-xs font-extrabold uppercase tracking-widest text-ink-muted">Age {age} · {meta.stage}</div>
        <h2 className="text-3xl font-black text-ink mt-1">Curriculum module coming soon</h2>
        <p className="text-ink-soft font-semibold mt-2 max-w-lg">This level is being built. Here’s what’s planned:</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 max-w-xl">
        {meta.planned.map((t) => <span key={t} className="px-3 py-1.5 rounded-full bg-slate-100 text-ink-soft text-sm font-bold">{t}</span>)}
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {ready.map((a) => (
          <button key={a} type="button" onClick={() => onPickAge(a)} className="press min-h-12 px-5 rounded-2xl bg-brand-600 text-white font-extrabold flex items-center gap-2">
            Try Age {a} <ArrowRight size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}
