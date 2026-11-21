import React, { useState } from 'react';
import { X } from 'lucide-react';
import Modal from './Modal.jsx';

/**
 * Full-screen play layout.
 * Landscape: problem on the left, input dock on the right. Portrait: problem above, dock below.
 */
export default function PlayShell({ title, subtitle, icon, progress, stats, onExit, confirmExit = true, problem, dock, footer, accent = 'brand' }) {
  const [asking, setAsking] = useState(false);
  return (
    <div className="h-[100dvh] flex flex-col bg-canvas safe-top">
      <header className="shrink-0 px-4 pt-3 pb-2">
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Exit session" onClick={() => (confirmExit ? setAsking(true) : onExit())}
            className="press w-12 h-12 rounded-2xl bg-white border border-line flex items-center justify-center text-ink-soft card-shadow">
            <X size={24} />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            {icon}
            <div className="min-w-0">
              <div className="font-extrabold text-ink truncate leading-tight">{title}</div>
              {subtitle && <div className="text-xs font-bold text-ink-muted truncate">{subtitle}</div>}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">{stats}</div>
        </div>
        {progress !== undefined && (
          <div className="mt-3 h-3 rounded-full bg-line overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className={`h-full rounded-full transition-[width] duration-300 ${accent === 'warn' ? 'bg-warn' : accent === 'bad' ? 'bg-bad' : 'bg-brand-500'}`} style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }} />
          </div>
        )}
      </header>
      <main className="flex-1 min-h-0 flex landscape:flex-row portrait:flex-col gap-3 px-4 pb-3 safe-bottom">
        <section className="flex-1 min-h-0 scroll-y rounded-[28px] bg-white/60 border border-line px-5 py-6 flex">
          <div className="m-auto w-full">{problem}</div>
        </section>
        <aside className="shrink-0 landscape:w-[min(400px,42vw)] portrait:w-full landscape:scroll-y flex flex-col gap-3 justify-end landscape:justify-center">
          {dock}
        </aside>
      </main>
      {footer}
      <Modal open={asking} onClose={() => setAsking(false)} title="Leave this session?"
        actions={[
          { label: 'Keep going', onClick: () => setAsking(false), primary: true },
          { label: 'Leave', onClick: () => { setAsking(false); onExit(); }, tone: 'bad' },
        ]}>
        Progress in this session won’t be saved.
      </Modal>
    </div>
  );
}

export function StatPill({ icon, children, tone = 'default', pulse }) {
  const tones = {
    default: 'bg-white text-ink border-line',
    good: 'bg-good-soft text-good border-good/30',
    warn: 'bg-warn-soft text-warn border-warn/30',
    bad: 'bg-bad-soft text-bad border-bad/30',
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
  };
  return (
    <div className={`h-12 px-3.5 rounded-2xl border flex items-center gap-1.5 font-extrabold tabular ${tones[tone]} ${pulse ? 'animate-pop' : ''}`}>
      {icon}{children}
    </div>
  );
}
