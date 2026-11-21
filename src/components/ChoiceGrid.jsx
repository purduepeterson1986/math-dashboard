import React from 'react';
import { Check, X } from 'lucide-react';
import Visual, { MathText } from './Visual.jsx';
import { sfx } from '../lib/audio.js';

/**
 * Tap-selection cards. `reveal` shows correct/incorrect state after answering.
 * `big` = Age 3 extra-large cards.
 */
export default function ChoiceGrid({ choices, onPick, picked, answer, reveal, disabled, big }) {
  const n = choices.length;
  const cols = n <= 2 ? 'grid-cols-2' : n === 3 ? (big ? 'grid-cols-3 landscape:grid-cols-1 portrait:grid-cols-3' : 'grid-cols-1') : 'grid-cols-2';
  const textOnly = choices.every((c) => !c.visual);
  return (
    <div className={`grid ${textOnly && !big ? 'grid-cols-1' : cols} gap-3`} role="group" aria-label="Answer choices">
      {choices.map((c) => {
        const isPicked = picked === c.id;
        const isAnswer = c.id === answer;
        let tone = 'bg-white border-line hover:border-brand-200';
        if (reveal === 'full' && isAnswer) tone = 'bg-good-soft border-good';
        else if (reveal && isPicked && !isAnswer) tone = 'bg-bad-soft border-bad animate-shake';
        else if (isPicked) tone = 'bg-brand-50 border-brand-500';
        return (
          <button
            key={c.id}
            type="button"
            disabled={disabled}
            onClick={() => { sfx.tap(); onPick(c.id); }}
            className={`press relative card-shadow rounded-3xl border-[3px] ${tone} flex flex-col items-center justify-center gap-1 px-3 ${big ? 'min-h-[132px] portrait:min-h-[200px] py-3' : textOnly ? 'min-h-[64px] py-3' : 'min-h-[110px] py-3'}`}
          >
            {c.visual && <Visual v={c.visual} size={big ? 'lg' : 'sm'} />}
            {c.text && (
              <span className={`${c.big ? 'text-6xl font-black' : c.visual ? 'text-lg font-bold text-ink-soft' : 'text-xl font-bold'} text-ink`}>
                <MathText text={c.text} />
              </span>
            )}
            {reveal === 'full' && isAnswer && <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-good text-white flex items-center justify-center"><Check size={18} strokeWidth={3} /></span>}
            {reveal && isPicked && !isAnswer && <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-bad text-white flex items-center justify-center"><X size={18} strokeWidth={3} /></span>}
          </button>
        );
      })}
    </div>
  );
}
