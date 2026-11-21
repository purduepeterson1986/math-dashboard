import React, { useMemo } from 'react';
import { ChevronRight, Target, Trophy, Clock3 } from 'lucide-react';
import AgeSlider from '../components/AgeSlider.jsx';
import ComingSoon from '../components/ComingSoon.jsx';
import ModeIcon, { modeStyle } from '../components/ModeIcon.jsx';
import { MODES, getCurriculum } from '../curriculum/index.js';
import { masteryForAge, weakTopics } from '../lib/diagnostics.js';

export default function Home({ age, onAge, sessions, onPickMode, onQuickStart }) {
  const cur = getCurriculum(age);
  const mine = useMemo(() => sessions.filter((s) => s.age === age), [sessions, age]);
  const weak = useMemo(() => (cur ? weakTopics(masteryForAge(mine, cur), 3) : []), [mine, cur]);
  const acc = mine.length ? Math.round((mine.reduce((a, s) => a + s.score, 0) / Math.max(1, mine.reduce((a, s) => a + s.total, 0))) * 100) : null;
  const byMode = (m) => mine.filter((s) => s.mode === m);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-5">
      <AgeSlider age={age} onChange={onAge} />

      {!cur ? <ComingSoon age={age} onPickAge={onAge} /> : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3 px-1">
            <div>
              <h1 className="text-3xl font-black text-ink">{cur.title}</h1>
              <p className="text-ink-soft font-semibold">{cur.tagline}</p>
            </div>
            <div className="flex gap-2">
              <div className="h-11 px-3 rounded-2xl bg-white border border-line flex items-center gap-2 text-sm font-extrabold"><Trophy size={18} className="text-amber-500" />{mine.length} sessions</div>
              {acc !== null && <div className="h-11 px-3 rounded-2xl bg-white border border-line flex items-center gap-2 text-sm font-extrabold"><Target size={18} className="text-brand-600" />{acc}% accuracy</div>}
            </div>
          </div>

          {weak.length > 0 && (
            <button type="button" onClick={() => onQuickStart('worksheet', weak)}
              className="press w-full text-left rounded-[28px] bg-gradient-to-r from-brand-600 to-brand-500 text-white p-5 flex items-center gap-4 shadow-lg shadow-brand-600/25">
              <span className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center"><Target size={28} /></span>
              <span className="flex-1 min-w-0">
                <span className="block text-xs font-extrabold uppercase tracking-widest text-white/70">Recommended focus</span>
                <span className="block text-xl font-black truncate">{weak.map((id) => cur.topics.find((t) => t.id === id)?.label).join(' · ')}</span>
              </span>
              <ChevronRight size={28} />
            </button>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-3 landscape:grid-cols-3 gap-4">
            {MODES.map((m, i) => {
              const done = byMode(m.id);
              const last = done[0];
              const st = modeStyle(m.id);
              return (
                <button key={m.id} type="button" onClick={() => onPickMode(m.id)}
                  className={`press animate-rise text-left rounded-[28px] border-2 border-line ${st.ring} bg-gradient-to-br ${st.grad} p-5 min-h-[168px] flex flex-col card-shadow ${m.id === 'mix' ? 'col-span-2 lg:col-span-1 landscape:col-span-1' : ''}`}
                  style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="flex items-start justify-between">
                    <ModeIcon mode={m.id} size={28} box="w-14 h-14" />
                    <ChevronRight className="text-ink-muted" />
                  </div>
                  <div className="mt-auto pt-4">
                    <div className="text-xl font-black text-ink">{m.label}</div>
                    <div className="text-sm font-semibold text-ink-soft leading-snug">{m.blurb}</div>
                    {last && (
                      <div className="mt-2 text-xs font-bold text-ink-muted flex items-center gap-1">
                        <Clock3 size={13} /> Last: {Math.round(last.accuracy * 100)}% · {done.length} played
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
