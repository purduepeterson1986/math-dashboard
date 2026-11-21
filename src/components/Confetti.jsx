import React, { useMemo } from 'react';

const COLORS = ['#5b5ff0', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#f97316'];

export default function Confetti({ count = 70 }) {
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    dur: 2.2 + Math.random() * 1.6,
    dx: `${(Math.random() - 0.5) * 30}vw`,
    rot: `${Math.random() * 900 - 450}deg`,
    color: COLORS[i % COLORS.length],
    w: 8 + Math.random() * 8,
    round: Math.random() < 0.3,
  })), [count]);
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <span key={i} className="absolute top-0 block"
          style={{ left: `${p.left}%`, width: p.w, height: p.round ? p.w : p.w * 0.45, background: p.color, borderRadius: p.round ? '50%' : 2,
            '--dx': p.dx, '--rot': p.rot, animation: `confetti-fall ${p.dur}s cubic-bezier(.2,.6,.4,1) ${p.delay}s forwards`, transform: 'translate3d(0,-10vh,0)' }} />
      ))}
    </div>
  );
}

/** Quick star burst for correct answers (Age 3 positive reinforcement). */
export function StarBurst({ show, emoji = '⭐' }) {
  const parts = useMemo(() => Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    return { dx: `${Math.cos(a) * 160}px`, dy: `${Math.sin(a) * 160}px` };
  }), []);
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-40" aria-hidden="true">
      {parts.map((p, i) => (
        <span key={i} className="absolute left-1/2 top-1/2 text-5xl" style={{ '--dx': p.dx, '--dy': p.dy, animation: 'burst 700ms ease-out forwards' }}>{emoji}</span>
      ))}
    </div>
  );
}
