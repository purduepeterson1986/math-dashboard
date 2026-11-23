import React, { useMemo, useRef, useState } from 'react';
import { Lightbulb, BookOpen, FlaskConical, Shuffle, Check, X, ArrowRight, RotateCcw, CircleCheck } from 'lucide-react';
import PlayShell, { StatPill } from '../components/PlayShell.jsx';
import ProblemView from '../components/ProblemView.jsx';
import AnswerPanel from '../components/AnswerPanel.jsx';
import { StarBurst } from '../components/Confetti.jsx';
import { MathText } from '../components/Visual.jsx';
import { buildQuestionSet, makeRecord } from '../lib/session.js';
import { checkAnswer } from '../lib/answer.js';
import { sfx, speak } from '../lib/audio.js';

const META = {
  story: { title: 'Story Problems', icon: BookOpen, cls: 'bg-rose-100 text-rose-600' },
  stem: { title: 'STEM Lab', icon: FlaskConical, cls: 'bg-emerald-100 text-emerald-600' },
  mix: { title: 'Daily Mix', icon: Shuffle, cls: 'bg-violet-100 text-violet-600' },
};
const PRAISE = ['Great job!', 'You got it!', 'Super!', 'Awesome!', 'Way to go!', 'Brilliant!'];

/** Sequential runner for Story Problems, STEM Lab and Daily Mix: hints, retries, worked explanations. */
export default function Runner({ mode, curriculum, config, onFinish, onExit, settings, onToggleVoice }) {
  const big = curriculum.bigInput;
  const talk = !!curriculum.readAloud;
  const simple = curriculum.keypad === 'simple';
  const count = config.count || curriculum.defaults[mode].count;
  const questions = useMemo(() => buildQuestionSet(curriculum, mode, config, count), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [idx, setIdx] = useState(0);
  const [value, setValue] = useState('');
  const [state, setState] = useState('idle'); // idle | retry | correct | wrong
  const [hints, setHints] = useState(0);
  const [burst, setBurst] = useState(0);
  const [praise, setPraise] = useState(PRAISE[0]);
  const attempts = useRef(0);
  const records = useRef([]);
  const qStart = useRef(performance.now());
  const startedAt = useRef(performance.now());
  const bestStreak = useRef(0);
  const streak = useRef(0);

  const q = questions[idx];
  const M = META[mode];
  const Icon = M.icon;
  const hintList = q.hints || [];
  const correctSoFar = records.current.filter((r) => r.correct).length;

  const submit = (given) => {
    if (state === 'correct' || state === 'wrong') return;
    if (given === '' || given === null || given === undefined) return;
    const ok = checkAnswer(given, q);
    if (ok) {
      const firstTry = attempts.current === 0;
      records.current.push(makeRecord(q, given, firstTry, performance.now() - qStart.current, { hints, retried: !firstTry }));
      streak.current = firstTry ? streak.current + 1 : 0;
      bestStreak.current = Math.max(bestStreak.current, streak.current);
      const p = PRAISE[Math.floor(Math.random() * PRAISE.length)];
      setPraise(p);
      setState('correct');
      sfx.correct();
      if (big) setBurst((b) => b + 1);
      if (talk) speak([p, q.explanation]);
      return;
    }
    sfx.wrong();
    if (curriculum.allowRetry && attempts.current === 0) {
      attempts.current = 1;
      setState('retry');
      if (talk) speak(['Almost!', "Let's try again."]);
      // keypad: clear the wrong entry shortly so the next digits start fresh (message stays up)
      if (q.input === 'keypad') setTimeout(() => setValue(''), 1200);
      // stays on screen (wrong pick marked) until the child taps another answer
      return;
    }
    records.current.push(makeRecord(q, given, false, performance.now() - qStart.current, { hints, retried: attempts.current > 0 }));
    streak.current = 0;
    setState('wrong');
    if (talk) speak(['Good try!', q.explanation]);
  };

  const advanceRef = useRef(null);
  function advance() {
    if (advanceRef.current === idx) return;
    advanceRef.current = idx;
    if (idx + 1 >= count) {
      sfx.celebrate();
      onFinish({ questions: records.current, bestStreak: bestStreak.current, durationMs: performance.now() - startedAt.current });
      return;
    }
    setIdx((i) => i + 1);
    setValue('');
    setState('idle');
    setHints(0);
    attempts.current = 0;
    qStart.current = performance.now();
  }

  const showHint = () => {
    if (hints >= hintList.length) return;
    sfx.tap();
    if (talk) speak(hintList[hints]);
    setHints((h) => h + 1);
  };

  const answered = state === 'correct' || state === 'wrong';

  const feedback = answered && (
    <div className={`rounded-3xl border-2 p-5 animate-pop ${state === 'correct' ? 'bg-good-soft border-good/40' : 'bg-bad-soft border-bad/40'}`}>
      <div className={`flex items-center gap-2 ${big ? 'text-3xl' : 'text-2xl'} font-extrabold ${state === 'correct' ? 'text-good' : 'text-bad'}`}>
        {state === 'correct' ? <Check size={28} strokeWidth={3} /> : <X size={28} strokeWidth={3} />}
        {state === 'correct' ? praise : 'Not quite'}
      </div>
      {state === 'wrong' && q.input !== 'choice' && <div className="mt-1 text-lg font-bold text-ink">Answer: <MathText text={q.answerLabel} /></div>}
      {q.explanation && <p className={`mt-2 text-ink-soft font-semibold leading-relaxed ${big ? 'text-xl' : ''}`}><MathText text={q.explanation} /></p>}
      <button type="button" onClick={advance} autoFocus className={`press mt-4 w-full rounded-2xl bg-brand-600 text-white font-extrabold flex items-center justify-center gap-2 ${big ? 'h-20 text-2xl' : 'h-16 text-xl'}`}>
        {idx + 1 >= count ? 'Finish' : 'Next'} <ArrowRight size={big ? 28 : 22} />
      </button>
    </div>
  );

  return (
    <PlayShell
      level={`Age ${curriculum.age} · ${(curriculum.difficulties.find((x) => x.id === (config.difficulty || curriculum.defaultDifficulty)) || {}).label || ''}`}
      title={M.title}
      subtitle={`Problem ${idx + 1} of ${count}`}
      icon={<span className={`w-10 h-10 rounded-xl flex items-center justify-center ${M.cls}`}><Icon size={22} /></span>}
      progress={(idx + (answered ? 1 : 0)) / count}
      onExit={onExit}
      scratch={curriculum.age >= 5 ? q.key : null}
      voice={talk ? { on: settings.voice, onToggle: onToggleVoice } : null}
      stats={<StatPill tone="good" icon={<CircleCheck size={20} />}>{correctSoFar}</StatPill>}
      problem={(
        <ProblemView q={q} big={big} autoSpeak={talk && settings.voice} voiceOn={talk && settings.voice} revealed={answered} />
      )}
      dock={answered ? (
        <>
          {q.input === 'choice' && <AnswerPanel q={q} value={value} onChange={() => {}} onSubmit={() => {}} state={state} disabled big={big} />}
          {feedback}
        </>
      ) : (
        <>
          {state === 'retry' && (
            <div className="animate-pop rounded-3xl border-2 border-warn/40 bg-warn-soft text-warn font-extrabold text-2xl px-5 py-4 flex items-center gap-2"><RotateCcw size={22} /> Almost! Try again.</div>
          )}
          {hintList.length > 0 && !answered && (
            <div className="w-full flex flex-col gap-2">
              {hintList.slice(0, hints).map((h, i) => (
                <div key={i} className="animate-rise flex items-start gap-3 rounded-2xl bg-warn-soft border border-warn/30 px-4 py-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-warn text-white text-sm font-black flex items-center justify-center">{i + 1}</span>
                  <span className="font-semibold text-ink"><MathText text={h} /></span>
                </div>
              ))}
              {hints < hintList.length && (
                <button type="button" onClick={showHint} className="press w-full justify-center min-h-14 px-5 rounded-2xl bg-white border-2 border-warn/40 text-warn font-extrabold flex items-center gap-2">
                  <Lightbulb size={20} /> {hints === 0 ? (hintList.length > 1 ? 'Show step-by-step hint' : 'Need a hint?') : `Next step (${hintList.length - hints} left)`}
                </button>
              )}
            </div>
          )}
          <AnswerPanel q={q} value={value} onChange={setValue} onSubmit={submit} state={state} big={big} simple={simple} submitLabel="Check" />
        </>
      )}
      footer={<StarBurst key={burst} show={burst > 0 && state === 'correct'} emoji={big ? '🌟' : '⭐'} />}
    />
  );
}
