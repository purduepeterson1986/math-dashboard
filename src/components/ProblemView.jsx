import React, { useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import Visual, { MathText } from './Visual.jsx';
import { speak, canSpeak } from '../lib/audio.js';

/** Left/top side of the play screen: story frame, prompt, big expression, visual. */
export default function ProblemView({ q, big, autoSpeak, voiceOn = true, children }) {
  useEffect(() => {
    if (autoSpeak && q?.speak) {
      const t = setTimeout(() => speak(q.speak), 250);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [q?.id, autoSpeak]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!q) return null;
  const longPrompt = (q.prompt || '').length > 70;
  return (
    <div key={q.id} className="animate-rise flex flex-col items-center gap-5 w-full max-w-[720px] mx-auto">
      {q.story && (
        <div className="flex items-center gap-2 rounded-full bg-white border border-line pl-2 pr-4 py-1.5 card-shadow">
          <span className="text-2xl leading-none">{q.story.emoji}</span>
          <span className="text-sm font-extrabold uppercase tracking-wide text-ink-soft">{q.story.title}</span>
        </div>
      )}
      {q.prompt && (
        <div className="flex items-start gap-3 w-full justify-center">
          <h2 className={`text-center font-extrabold text-ink text-balance ${big ? 'text-4xl' : longPrompt ? 'text-[1.4rem] leading-snug font-bold' : 'text-3xl'} ${q.story && longPrompt ? 'text-left bg-white rounded-3xl border border-line px-6 py-5 card-shadow' : ''}`}>
            <MathText text={q.prompt} />
          </h2>
          {q.speak && voiceOn && canSpeak() && (
            <button type="button" onClick={() => speak(q.speak)} aria-label="Read aloud"
              className="press shrink-0 w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center active:bg-brand-100">
              <Volume2 size={24} />
            </button>
          )}
        </div>
      )}
      {q.display && !q.hideDisplay && (
        <div className={`font-black tabular text-ink text-center ${big ? 'text-7xl' : 'text-6xl portrait:text-5xl'} leading-tight`}>
          <MathText text={q.display} />
        </div>
      )}
      {q.visual && (
        <div className="w-full flex justify-center items-center min-h-24 py-1">
          <Visual v={q.visual} size={big ? 'lg' : 'md'} />
        </div>
      )}
      {children}
    </div>
  );
}
