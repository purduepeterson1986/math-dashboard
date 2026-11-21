import React from 'react';

/** Read-only answer box (replaces a text input — the native keyboard never opens). */
export default function AnswerDisplay({ value, state, placeholder = 'Your answer', hint }) {
  const ring = state === 'correct' ? 'border-good bg-good-soft' : state === 'wrong' ? 'border-bad bg-bad-soft animate-shake' : 'border-brand-200 bg-white';
  let content = value ? value.replace(/-/g, '−') : '';
  let frac = null;
  if (value && value.includes('/')) {
    const [n, d] = content.split('/');
    frac = (
      <span className="inline-flex flex-col items-center leading-none text-[0.75em]">
        <span>{n || ' '}</span><span className="h-[3px] w-full min-w-8 bg-current rounded my-1" /><span className={d ? '' : 'text-ink-muted/50'}>{d || '?'}</span>
      </span>
    );
  }
  return (
    <div>
      <div role="status" aria-live="polite" className={`h-20 rounded-2xl border-[3px] ${ring} flex items-center justify-end px-5 text-4xl font-extrabold tabular transition-colors`}>
        {value ? frac || content : <span className="text-ink-muted/60 text-xl font-semibold">{placeholder}</span>}
        {state !== 'correct' && state !== 'wrong' && <span className="w-[3px] h-10 bg-brand-500 ml-1 animate-pulse rounded" />}
      </div>
      {hint && <p className="mt-1.5 text-xs text-ink-muted font-semibold text-right">{hint}</p>}
    </div>
  );
}
