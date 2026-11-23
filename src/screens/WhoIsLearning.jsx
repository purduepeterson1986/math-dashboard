import React from 'react';
import { Lock } from 'lucide-react';
import { displayName } from '../lib/profiles.js';
import { AGE_META } from '../curriculum/index.js';

const TINTS = ['from-brand-50 to-white', 'from-amber-50 to-white', 'from-emerald-50 to-white', 'from-rose-50 to-white', 'from-sky-50 to-white', 'from-violet-50 to-white'];

/** Big picture tiles so even a pre-reader can find their own. */
export default function WhoIsLearning({ profiles, onPick, onParent }) {
  return (
    <div className="min-h-[100dvh] safe-top safe-bottom px-4 sm:px-6 py-6 flex flex-col">
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
        <div className="flex items-center gap-3">
          <img src="./icon.svg" alt="" className="w-11 h-11 rounded-2xl shadow-md shadow-brand-600/20" />
          <div className="text-xl font-black tracking-tight text-ink">Lumen <span className="text-brand-600">Math Lab</span></div>
          <button type="button" onClick={onParent} aria-label="Parent Portal" className="press ml-auto h-11 px-3 rounded-2xl text-ink-muted hover:text-ink-soft flex items-center gap-1.5 text-sm font-bold">
            <Lock size={16} /> <span className="hidden sm:inline">Parent Portal</span>
          </button>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-ink text-center mt-10 mb-8">Who’s learning today?</h1>
        <div className="flex flex-wrap justify-center gap-5">
          {profiles.map((p, i) => (
            <button key={p.id} type="button" onClick={() => onPick(p.id)}
              className={`press animate-rise w-44 sm:w-52 rounded-[32px] border-2 border-line bg-gradient-to-b ${TINTS[i % TINTS.length]} p-5 flex flex-col items-center card-shadow`}
              style={{ animationDelay: `${i * 50}ms` }}>
              <span className="text-7xl leading-none" aria-hidden="true">{p.avatar}</span>
              <span className="mt-3 text-2xl font-black text-ink break-words max-w-full">{displayName(p, i)}</span>
              <span className="text-sm font-bold text-ink-muted">{AGE_META[p.age] ? `Age ${p.age}` : ''}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
