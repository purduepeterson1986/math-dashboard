import React, { useMemo, useState } from 'react';
import { Star, Target, Clock3, Gauge, Flame, ThumbsUp, Wrench, RotateCcw, Home as HomeIcon, Crosshair, ChevronDown, Check, X, Lightbulb } from 'lucide-react';
import Confetti from '../components/Confetti.jsx';
import ModeIcon from '../components/ModeIcon.jsx';
import { MathText } from '../components/Visual.jsx';
import { modeById } from '../curriculum/index.js';
import { analyzeSession, formatDuration } from '../lib/diagnostics.js';

function Tile({ icon, label, value, sub }) {
  return (
    <div className="rounded-3xl bg-white border border-line p-4 card-shadow">
      <div className="flex items-center gap-2 text-ink-muted text-xs font-extrabold uppercase tracking-widest">{icon}{label}</div>
      <div className="mt-1 text-3xl font-black text-ink tabular">{value}</div>
      {sub && <div className="text-xs font-bold text-ink-muted">{sub}</div>}
    </div>
  );
}

export default function Summary({ session, curriculum, onAgain, onHome, onTarget }) {
  const [showAll, setShowAll] = useState(false);
  const a = useMemo(() => analyzeSession(session, curriculum), [session, curriculum]);
  const acc = Math.round(session.accuracy * 100);
  const avg = session.total ? session.durationMs / session.total : 0;
  const mode = modeById(session.mode);
  const headline = acc >= 90 ? 'Outstanding!' : acc >= 75 ? 'Great work!' : acc >= 50 ? 'Good effort!' : 'Keep practicing!';
  const label = (id) => curriculum.topics.find((t) => t.id === id)?.label || id;

  return (
    <div className="min-h-[100dvh] bg-canvas safe-top safe-bottom">
      {acc >= 75 && <Confetti />}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="rounded-[32px] bg-gradient-to-br from-brand-600 to-brand-500 text-white p-6 sm:p-8 shadow-xl shadow-brand-600/25 animate-pop">
          <div className="flex items-center gap-3 text-white/80 font-bold">
            <ModeIcon mode={session.mode} box="w-10 h-10" size={20} /> {mode?.label} · Age {session.age}{session.targeted ? ' · Targeted practice' : ''}
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3">
            <div>
              <div className="text-4xl sm:text-5xl font-black">{headline}</div>
              <div className="mt-1 text-xl font-bold text-white/85">{session.score} of {session.total} correct</div>
            </div>
            <div className="ml-auto flex gap-1" aria-label={`${session.stars} of 3 stars`}>
              {[1, 2, 3].map((i) => (
                <Star key={i} size={56} className={`${i <= session.stars ? 'fill-amber-300 text-amber-300' : 'text-white/30'} ${i <= session.stars ? 'animate-pop' : ''}`} style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Tile icon={<Target size={14} />} label="Accuracy" value={`${acc}%`} sub={`${session.score}/${session.total}`} />
          <Tile icon={<Clock3 size={14} />} label="Total time" value={formatDuration(session.durationMs)} />
          <Tile icon={<Gauge size={14} />} label="Avg / question" value={`${(avg / 1000).toFixed(1)}s`} />
          <Tile icon={<Flame size={14} />} label="Best streak" value={session.bestStreak || 0} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white border border-line p-5 card-shadow">
            <h3 className="flex items-center gap-2 text-lg font-black text-good"><ThumbsUp size={20} /> What went well</h3>
            {a.wentWell.length ? (
              <ul className="mt-3 space-y-2">{a.wentWell.map((w) => (
                <li key={w.topic} className="rounded-2xl bg-good-soft px-4 py-3"><div className="font-extrabold text-ink">{w.label}</div><div className="text-sm text-ink-soft font-semibold">{w.text}</div></li>
              ))}</ul>
            ) : <p className="mt-3 text-ink-soft font-semibold">Keep going: strengths will show up here as accuracy climbs.</p>}
          </div>
          <div className="rounded-3xl bg-white border border-line p-5 card-shadow">
            <h3 className="flex items-center gap-2 text-lg font-black text-bad"><Wrench size={20} /> Needs work</h3>
            {a.needsWork.length ? (
              <ul className="mt-3 space-y-2">{a.needsWork.map((w) => (
                <li key={w.topic} className="rounded-2xl bg-bad-soft px-4 py-3"><div className="font-extrabold text-ink">{w.label}</div><div className="text-sm text-ink-soft font-semibold"><MathText text={w.text} /></div></li>
              ))}</ul>
            ) : <p className="mt-3 text-ink-soft font-semibold">Nothing flagged. Nice and solid!</p>}
          </div>
        </div>

        {a.notes.length > 0 && (
          <div className="rounded-3xl bg-warn-soft border border-warn/20 p-4 flex gap-3">
            <Lightbulb className="text-warn shrink-0" />
            <ul className="text-ink font-semibold space-y-1">{a.notes.map((n) => <li key={n}>{n}</li>)}</ul>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onAgain} className="press flex-1 min-w-[180px] h-16 rounded-2xl bg-brand-600 text-white text-lg font-black flex items-center justify-center gap-2"><RotateCcw size={22} /> Play again</button>
          {a.needsWork.length > 0 && (
            <button type="button" onClick={() => onTarget(a.needsWork.map((w) => w.topic))} className="press flex-1 min-w-[180px] h-16 rounded-2xl bg-white border-2 border-brand-200 text-brand-700 text-lg font-black flex items-center justify-center gap-2"><Crosshair size={22} /> Practice weak spots</button>
          )}
          <button type="button" onClick={onHome} className="press flex-1 min-w-[180px] h-16 rounded-2xl bg-white border-2 border-line text-ink text-lg font-black flex items-center justify-center gap-2"><HomeIcon size={22} /> Home</button>
        </div>

        <div className="rounded-3xl bg-white border border-line card-shadow overflow-hidden">
          <button type="button" onClick={() => setShowAll((s) => !s)} aria-expanded={showAll} className="w-full min-h-16 px-5 flex items-center justify-between font-black text-ink">
            Question-by-question review <ChevronDown className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </button>
          {showAll && (
            <ul className="divide-y divide-line border-t border-line">
              {session.questions.map((q, i) => (
                <li key={i} className="px-5 py-3 flex items-center gap-3">
                  <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${q.correct ? 'bg-good text-white' : 'bg-bad text-white'}`}>{q.correct ? <Check size={18} strokeWidth={3} /> : <X size={18} strokeWidth={3} />}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-ink truncate"><MathText text={q.prompt} /></span>
                    <span className="block text-xs font-bold text-ink-muted">{label(q.topic)}{q.hints ? ` · ${q.hints} hint${q.hints > 1 ? 's' : ''}` : ''}{q.retried ? ' · 2nd try' : ''}</span>
                  </span>
                  <span className="text-right text-sm font-bold tabular">
                    {!q.correct && <span className="block text-good">Ans: <MathText text={q.answer} /></span>}
                    <span className="block text-ink-muted">{(q.ms / 1000).toFixed(1)}s</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
