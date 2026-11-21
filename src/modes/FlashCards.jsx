import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Flame, Timer, Zap, Check } from 'lucide-react';
import PlayShell, { StatPill } from '../components/PlayShell.jsx';
import ProblemView from '../components/ProblemView.jsx';
import AnswerPanel from '../components/AnswerPanel.jsx';
import { StarBurst } from '../components/Confetti.jsx';
import { createQuestionStream, makeRecord } from '../lib/session.js';
import { checkAnswer } from '../lib/answer.js';
import { sfx } from '../lib/audio.js';
import { MathText } from '../components/Visual.jsx';

export default function FlashCards({ curriculum, config, onFinish, onExit, settings, onToggleVoice }) {
  const big = curriculum.bigInput;
  const talk = !!curriculum.readAloud;
  const simple = curriculum.keypad === 'simple';
  const seconds = config.seconds || curriculum.defaults.flash.seconds;
  const maxCards = config.maxCards || curriculum.defaults.flash.maxCards;
  const next = useMemo(() => createQuestionStream(curriculum, 'flash', config), []); // eslint-disable-line react-hooks/exhaustive-deps

  const [phase, setPhase] = useState('countdown');
  const [count, setCount] = useState(3);
  const [q, setQ] = useState(() => next());
  const [value, setValue] = useState('');
  const [state, setState] = useState('idle');
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [burst, setBurst] = useState(0);

  const records = useRef([]);
  const startedAt = useRef(0);
  const qStart = useRef(0);
  const done = useRef(false);
  const bestRef = useRef(0);

  // 3-2-1 countdown
  useEffect(() => {
    if (phase !== 'countdown') return undefined;
    if (count === 0) { setPhase('play'); startedAt.current = performance.now(); qStart.current = performance.now(); return undefined; }
    sfx.tick();
    const t = setTimeout(() => setCount((c) => c - 1), 700);
    return () => clearTimeout(t);
  }, [phase, count]);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    sfx.celebrate();
    onFinish({ questions: records.current, bestStreak: bestRef.current, durationMs: Math.min(performance.now() - startedAt.current, seconds * 1000) });
  }, [onFinish, seconds]);

  // timer
  useEffect(() => {
    if (phase !== 'play') return undefined;
    const id = setInterval(() => {
      const e = performance.now() - startedAt.current;
      setElapsed(e);
      if (e >= seconds * 1000) finish();
    }, 100);
    return () => clearInterval(id);
  }, [phase, seconds, finish]);

  const submit = (given) => {
    if (state !== 'idle' || phase !== 'play' || done.current) return;
    if (given === '' || given === null || given === undefined) return;
    const ok = checkAnswer(given, q);
    records.current.push(makeRecord(q, given, ok, performance.now() - qStart.current));
    if (ok) {
      const s = streak + 1;
      setStreak(s);
      if (s > bestRef.current) { bestRef.current = s; setBest(s); }
      if (s % 5 === 0) { sfx.streak(); setPulse((p) => p + 1); } else sfx.correct();
      if (big) setBurst((b) => b + 1);
    } else {
      setStreak(0);
      sfx.wrong();
    }
    setState(ok ? 'correct' : 'wrong');
    setTimeout(() => {
      if (done.current) return;
      if (records.current.length >= maxCards) { finish(); return; }
      setQ(next());
      setValue('');
      setState('idle');
      qStart.current = performance.now();
    }, ok ? (big ? 1200 : 280) : (big ? 2500 : 1300));
  };

  const remaining = Math.max(0, seconds * 1000 - elapsed);
  const secsLeft = Math.ceil(remaining / 1000);
  const correct = records.current.filter((r) => r.correct).length;

  if (phase === 'countdown') {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center gap-6 bg-canvas">
        <div className="text-ink-soft text-xl font-extrabold">Get ready!</div>
        <div key={count} className="animate-pop w-44 h-44 rounded-full bg-brand-600 text-white text-8xl font-black flex items-center justify-center shadow-2xl shadow-brand-600/30">
          {count || 'Go!'}
        </div>
        <div className="text-ink-muted font-bold">{seconds} seconds · up to {maxCards} cards</div>
      </div>
    );
  }

  return (
    <PlayShell
      title="Flash Cards"
      subtitle={`${records.current.length} answered · ${correct} correct`}
      icon={<span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center"><Zap size={22} /></span>}
      progress={remaining / (seconds * 1000)}
      accent={secsLeft <= 10 ? 'bad' : 'brand'}
      onExit={onExit}
      voice={talk ? { on: settings.voice, onToggle: onToggleVoice } : null}
      stats={(
        <>
          <StatPill tone={streak >= 3 ? 'warn' : 'default'} pulse={pulse} icon={<Flame size={20} className={streak >= 3 ? 'text-warn' : 'text-ink-muted'} />}>{streak}<span className="text-xs font-bold text-ink-muted ml-1 hidden sm:inline">best {best}</span></StatPill>
          <StatPill tone={secsLeft <= 10 ? 'bad' : 'brand'} icon={<Timer size={20} />}>{Math.floor(secsLeft / 60)}:{String(secsLeft % 60).padStart(2, '0')}</StatPill>
        </>
      )}
      problem={(
        <div className="relative">
          <ProblemView q={q} big={big} autoSpeak={talk && settings.voice} voiceOn={talk && settings.voice} />
          {state !== 'idle' && (
            <div className={`mt-5 mx-auto w-fit rounded-2xl px-5 py-3 font-extrabold text-xl animate-pop flex items-center gap-2 ${state === 'correct' ? 'bg-good-soft text-good' : 'bg-bad-soft text-bad'}`}>
              {state === 'correct' ? <><Check size={24} strokeWidth={3} /> {big ? 'Great job!' : 'Correct'}</> : <>Answer: <MathText text={q.answerLabel} /></>}
            </div>
          )}
        </div>
      )}
      dock={<AnswerPanel q={q} value={value} onChange={setValue} onSubmit={submit} state={state} disabled={state !== 'idle'} big={big} simple={simple} submitLabel="Go" compact={!big} />}
      footer={<StarBurst key={burst} show={burst > 0 && state === 'correct'} />}
    />
  );
}
