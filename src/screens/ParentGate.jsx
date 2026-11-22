import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Lock, ArrowLeft, Delete } from 'lucide-react';
import MathKeypad from '../components/MathKeypad.jsx';
import AnswerDisplay from '../components/AnswerDisplay.jsx';
import { rand } from '../lib/rng.js';
import { sfx } from '../lib/audio.js';
import { useVersion } from '../lib/update.js';

/** Parent gate: 4-digit PIN if one is set, otherwise a grown-up math question. */
export default function ParentGate({ pin, onPass, onCancel }) {
  const version = useVersion();
  const [useMath, setUseMath] = useState(!pin);
  const [entry, setEntry] = useState('');
  const [wrong, setWrong] = useState(false);
  const problem = useMemo(() => { const a = rand(13, 29); const b = rand(4, 9); const c = rand(11, 49); return { a, b, c, ans: a * b + c }; }, [useMath]); // eslint-disable-line react-hooks/exhaustive-deps

  const fail = () => { sfx.wrong(); setWrong(true); setTimeout(() => { setWrong(false); put(''); }, 600); };
  const entryRef = useRef('');
  const put = (v) => { entryRef.current = v; setEntry(v); };
  const pressPin = (d) => {
    if (wrong) return;
    sfx.tap();
    const next = (entryRef.current + d).slice(0, 4);
    put(next);
    if (next.length === 4) { if (next === pin) onPass(); else fail(); }
  };

  // Hardware keyboard (iPad keyboard / Mac): digits, Backspace and Enter work on the PIN screen too.
  const kb = useRef();
  kb.current = { wrong, pressPin, fail };
  useEffect(() => {
    if (useMath) return undefined;
    const onKey = (e) => {
      const { wrong: w, pressPin: press, fail: bad } = kb.current;
      const en = entryRef.current;
      if (/^\d$/.test(e.key)) { e.preventDefault(); press(e.key); }
      else if (e.key === 'Backspace') { e.preventDefault(); put(entryRef.current.slice(0, -1)); }
      else if (e.key === 'Enter') { e.preventDefault(); if (w) return; if (en === pin) onPass(); else bad(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [useMath, pin, onPass]);

  return (
    <div className="min-h-[100dvh] bg-canvas safe-top relative flex items-center justify-center p-4">
      <p className="absolute top-[calc(env(safe-area-inset-top)+0.75rem)] right-4 text-[11px] font-semibold text-slate-400 select-text">Version {version}</p>
      <div className="w-full max-w-md rounded-[32px] bg-white border border-line card-shadow p-6 animate-pop">
        <button type="button" onClick={onCancel} className="press h-11 px-3 -ml-2 rounded-xl text-ink-soft font-bold flex items-center gap-1"><ArrowLeft size={20} /> Back</button>
        <div className="flex flex-col items-center text-center mt-2 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center"><Lock size={30} /></div>
          <h1 className="text-2xl font-black mt-3">Parent Portal</h1>
          <p className="text-ink-soft font-semibold">{useMath ? 'Grown-ups only: solve to continue.' : 'Enter your 4-digit PIN'}</p>
        </div>

        {useMath ? (
          <div className="space-y-3">
            <div className="text-center text-4xl font-black tabular">{problem.a} × {problem.b} + {problem.c} = ?</div>
            <AnswerDisplay value={entry} state={wrong ? 'wrong' : 'idle'} />
            <MathKeypad value={entry} onChange={setEntry} allowFraction={false} compact submitLabel="Enter"
              onSubmit={() => (Number(entry) === problem.ans ? onPass() : fail())} />
          </div>
        ) : (
          <div className="space-y-5">
            <div className={`flex justify-center gap-4 ${wrong ? 'animate-shake' : ''}`}>
              {[0, 1, 2, 3].map((i) => <span key={i} className={`w-5 h-5 rounded-full ${i < entry.length ? (wrong ? 'bg-bad' : 'bg-brand-600') : 'bg-line'}`} />)}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <button key={d} type="button" onPointerDown={(e) => { e.preventDefault(); pressPin(d); }} className="press key-shadow h-16 rounded-2xl bg-slate-50 text-2xl font-bold">{d}</button>
              ))}
              <span />
              <button type="button" onPointerDown={(e) => { e.preventDefault(); pressPin('0'); }} className="press key-shadow h-16 rounded-2xl bg-slate-50 text-2xl font-bold">0</button>
              <button type="button" aria-label="Delete" onClick={() => put(entryRef.current.slice(0, -1))} className="press h-16 rounded-2xl bg-slate-100 flex items-center justify-center"><Delete /></button>
            </div>
          </div>
        )}
        {pin && (
          <button type="button" onClick={() => { setUseMath((m) => !m); put(''); }} className="mt-4 w-full min-h-12 text-sm font-bold text-brand-600">
            {useMath ? 'Use PIN instead' : 'Forgot PIN? Answer a math question instead'}
          </button>
        )}
      </div>
    </div>
  );
}
