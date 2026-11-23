import React, { useMemo, useRef, useState } from 'react';
import { ChevronLeft, CornerDownLeft, Flag, ClipboardList, ListChecks, Check, X, AlertTriangle } from 'lucide-react';
import PlayShell, { StatPill } from '../components/PlayShell.jsx';
import ProblemView from '../components/ProblemView.jsx';
import AnswerPanel from '../components/AnswerPanel.jsx';
import Modal from '../components/Modal.jsx';
import { MathText } from '../components/Visual.jsx';
import Visual from '../components/Visual.jsx';
import { buildQuestionSet, makeRecord } from '../lib/session.js';
import { checkAnswer, givenLabel } from '../lib/answer.js';
import { sfx } from '../lib/audio.js';

export default function Worksheet({ curriculum, config, onFinish, onExit, settings, onToggleVoice }) {
  const big = curriculum.bigInput;
  const talk = !!curriculum.readAloud;
  const simple = curriculum.keypad === 'simple';
  const count = config.count || curriculum.defaults.worksheet.count;
  const questions = useMemo(() => buildQuestionSet(curriculum, 'worksheet', config, count), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState(() => Array(count).fill(''));
  const [flags, setFlags] = useState(() => new Set());
  const [phase, setPhase] = useState('work'); // work | review | graded
  const [confirm, setConfirm] = useState(false);
  const time = useRef(Array(count).fill(0));
  const entered = useRef(performance.now());
  const startedAt = useRef(performance.now());
  const graded = useRef(null);

  const logTime = () => {
    const now = performance.now();
    time.current[idx] += now - entered.current;
    entered.current = now;
  };
  const go = (i) => {
    if (i < 0 || i >= count) return;
    logTime();
    setIdx(i);
  };
  const setAnswer = (v) => setAnswers((a) => { const c = [...a]; c[idx] = v; return c; });
  const answeredCount = answers.filter((a) => a !== '' && a !== null).length;
  const q = questions[idx];

  const toReview = () => { logTime(); setPhase('review'); };
  const grade = () => {
    setConfirm(false);
    const records = questions.map((qq, i) => makeRecord(qq, answers[i], checkAnswer(answers[i], qq), time.current[i], { skipped: !answers[i] }));
    graded.current = { records, durationMs: performance.now() - startedAt.current };
    const score = records.filter((r) => r.correct).length;
    if (score / count >= 0.7) sfx.celebrate(); else sfx.correct();
    setPhase('graded');
  };

  const navigator = (
    <div className="flex flex-wrap gap-2 justify-center">
      {questions.map((qq, i) => {
        const has = answers[i] !== '';
        const cur = i === idx;
        const fl = flags.has(i);
        return (
          <button key={qq.id} type="button" onClick={() => go(i)} aria-label={`Problem ${i + 1}${has ? ', answered' : ''}${fl ? ', flagged' : ''}`}
            className={`press relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-extrabold tabular border-2 ${cur ? 'border-brand-600 bg-brand-600 text-white' : has ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-line bg-white text-ink-soft'}`}>
            {i + 1}
            {has && <span className={`absolute bottom-0.5 right-0.5 ${cur ? 'text-white' : 'text-good'}`} aria-hidden="true"><Check size={12} strokeWidth={4} /></span>}
            {fl && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-warn text-white flex items-center justify-center"><Flag size={11} strokeWidth={3} /></span>}
          </button>
        );
      })}
    </div>
  );

  if (phase === 'review' || phase === 'graded') {
    const isGraded = phase === 'graded';
    const recs = graded.current?.records;
    const score = recs ? recs.filter((r) => r.correct).length : 0;
    return (
      <div className="h-[100dvh] flex flex-col bg-canvas safe-top">
        <header className="shrink-0 px-4 pt-3 pb-3 flex items-center gap-3">
          {!isGraded && (
            <button type="button" onClick={() => { entered.current = performance.now(); setPhase('work'); }} className="press h-12 px-4 rounded-2xl bg-white border border-line font-extrabold flex items-center gap-1 card-shadow">
              <ChevronLeft size={20} /> Back to problems
            </button>
          )}
          <h1 className="text-2xl font-extrabold">{isGraded ? `Graded: ${score} / ${count}` : 'Review your worksheet'}</h1>
          <div className="ml-auto">
            {isGraded ? (
              <button type="button" onClick={() => onFinish({ questions: recs, durationMs: graded.current.durationMs })} className="press h-12 px-6 rounded-2xl bg-brand-600 text-white font-extrabold">See summary</button>
            ) : (
              <button type="button" onClick={() => (answeredCount < count ? setConfirm(true) : grade())} className="press h-12 px-6 rounded-2xl bg-brand-600 text-white font-extrabold flex items-center gap-2">
                <ListChecks size={20} /> Submit worksheet
              </button>
            )}
          </div>
        </header>
        <div className="flex-1 scroll-y px-4 pb-8 safe-bottom">
          <div className="grid gap-3 md:grid-cols-2 max-w-5xl mx-auto">
            {questions.map((qq, i) => {
              const r = recs?.[i];
              const has = answers[i] !== '';
              return (
                <button key={qq.id} type="button" disabled={isGraded} onClick={() => { setIdx(i); entered.current = performance.now(); setPhase('work'); }}
                  className={`text-left rounded-2xl border-2 bg-white p-4 card-shadow flex gap-3 ${r ? (r.correct ? 'border-good/50' : 'border-bad/50') : has ? 'border-line' : 'border-warn/60'}`}>
                  <span className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-black ${r ? (r.correct ? 'bg-good text-white' : 'bg-bad text-white') : 'bg-slate-100 text-ink-soft'}`}>
                    {r ? (r.correct ? <Check size={20} strokeWidth={3} /> : <X size={20} strokeWidth={3} />) : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-ink"><MathText text={qq.display || qq.prompt} /></span>
                    {qq.display && qq.prompt && <span className="block text-sm text-ink-muted font-semibold"><MathText text={qq.prompt} /></span>}
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className={`font-extrabold ${has ? 'text-ink' : 'text-bad'}`}>{has ? <>Your answer: <MathText text={givenLabel(answers[i], qq)} /></> : 'Not answered'}</span>
                      {r && !r.correct && <span className="font-extrabold text-good">Correct: <MathText text={qq.answerLabel} /></span>}
                      {flags.has(i) && !r && <span className="text-warn font-bold flex items-center gap-1"><Flag size={14} /> flagged</span>}
                    </span>
                    {r && !r.correct && qq.explanation && <span className="block mt-1 text-sm text-ink-soft"><MathText text={qq.explanation} /></span>}
                    {qq.input === 'choice' && qq.choices.some((c) => c.visual) && r && !r.correct && (
                      <span className="mt-2 flex gap-2 items-center">{qq.choices.filter((c) => c.id === qq.answer).map((c) => <span key={c.id} className="inline-block"><Visual v={c.visual} size="sm" /></span>)}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <Modal open={confirm} onClose={() => setConfirm(false)} title="Some problems are blank"
          actions={[{ label: 'Keep working', onClick: () => setConfirm(false) }, { label: 'Submit anyway', primary: true, onClick: grade }]}>
          <span className="flex items-start gap-2"><AlertTriangle className="text-warn shrink-0" /> {count - answeredCount} problem{count - answeredCount > 1 ? 's are' : ' is'} unanswered and will be marked incorrect.</span>
        </Modal>
      </div>
    );
  }

  // Next always goes to the next question that still has no answer (looking forward from here, then wrapping
  // round to the start). Usually that is simply the next number, but not when the student is checking their work.
  // When nothing is left unanswered it steps to the next number, and from the last question it becomes "Review".
  const allAnswered = answeredCount === count;
  const atEnd = idx === count - 1 && allAnswered;
  const goNext = () => {
    for (let k = 1; k < count; k++) {
      const i = (idx + k) % count;
      if (answers[i] === '' || answers[i] == null) return go(i);
    }
    return idx < count - 1 ? go(idx + 1) : toReview();
  };

  return (
    <PlayShell
      level={`Age ${curriculum.age} · ${(curriculum.difficulties.find((x) => x.id === (config.difficulty || curriculum.defaultDifficulty)) || {}).label || ''}`}
      title="Worksheet"
      subtitle={`${answeredCount} of ${count} answered`}
      icon={<span className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center"><ClipboardList size={22} /></span>}
      progress={answeredCount / count}
      onExit={onExit}
      scratch={curriculum.age >= 5 ? q.key : null}
      voice={talk ? { on: settings.voice, onToggle: onToggleVoice } : null}
      stats={<StatPill tone="brand">#{idx + 1}<span className="text-ink-muted font-bold">/{count}</span></StatPill>}
      problem={(
        <div className="flex flex-col gap-6">
          <ProblemView q={q} big={big} autoSpeak={talk && settings.voice} voiceOn={talk && settings.voice} />
        </div>
      )}
      dock={(
        <>
          <AnswerPanel q={q} value={answers[idx]} onChange={setAnswer} instant={false} big={big} simple={simple}
            onSubmit={goNext} submitLabel={atEnd ? 'Review' : 'Next'} compact />
          {q.input !== 'keypad' && (
            // Picture / choice / tap-a-number questions get the same Next button the keypad has: greyed out until something is picked
            <button type="button" disabled={answers[idx] === '' || answers[idx] == null} onClick={goNext}
              className="press h-14 min-h-14 shrink-0 w-full rounded-2xl bg-brand-600 text-white text-lg font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-brand-600/25 disabled:opacity-40 active:bg-brand-700">
              {atEnd ? 'Review' : 'Next'}<CornerDownLeft size={18} />
            </button>
          )}
          <div className="shrink-0 rounded-2xl bg-white/70 border border-line p-3 space-y-2">
            <div className="text-center">
              <div className="text-xs font-extrabold uppercase tracking-widest text-ink-muted">Question #</div>
              <div className="text-xs font-semibold text-ink-muted">Tap a number to jump to that question.</div>
            </div>
            {navigator}
            <button type="button" aria-pressed={flags.has(idx)} onClick={() => setFlags((f) => { const n = new Set(f); if (n.has(idx)) n.delete(idx); else n.add(idx); return n; })}
              className={`press min-h-14 w-full rounded-2xl border font-extrabold flex items-center justify-center gap-3 px-3 py-1.5 ${flags.has(idx) ? 'bg-warn-soft border-warn/40 text-warn' : 'bg-white border-line text-ink-soft'}`}>
              <Flag size={32} className="shrink-0" />
              <span className="text-left leading-tight">
                {flags.has(idx) ? <>Flagged<br />Tap to unflag</> : <>Tap this flag to mark this question<br />to come back to</>}
              </span>
            </button>
          </div>
          <button type="button" onClick={toReview}
            className="press h-14 min-h-14 shrink-0 w-full rounded-2xl bg-white border-2 border-brand-600 text-brand-700 text-lg font-extrabold flex items-center justify-center gap-2">
            <ListChecks size={20} /> Review my answers
          </button>
        </>
      )}
    />
  );
}
