import React, { useMemo } from 'react';
import { COLORS } from '../curriculum/shared.js';
import { Clock, Coins, Ruler, CubeMeasure, Stick, ArrayGrid, Base10, FractionShape, BarGraph, NumberBond, Character, Lineup, Crowd } from './VisualsEarly.jsx';

/* ---------------------------- MathText ---------------------------- */
/** Renders strings containing [[n/d]] tokens as stacked fractions. */
export function MathText({ text, className = '' }) {
  if (text === null || text === undefined) return null;
  const parts = String(text).split(/(\[\[-?\d+\/\d+\]\])/g);
  return (
    <span className={className}>
      {parts.map((p, i) => {
        const m = p.match(/^\[\[(-?\d+)\/(\d+)\]\]$/);
        if (!m) return <React.Fragment key={i}>{p}</React.Fragment>;
        const neg = m[1].startsWith('-');
        return (
          <span key={i} className="inline-flex items-center align-middle mx-[0.12em]">
            {neg && <span className="mr-[0.08em]">−</span>}
            <span className="inline-flex flex-col items-center leading-none text-[0.8em]">
              <span className="px-[0.15em]">{neg ? m[1].slice(1) : m[1]}</span>
              <span className="h-[0.08em] min-h-[2px] w-full bg-current rounded-full my-[0.1em]" />
              <span className="px-[0.15em]">{m[2]}</span>
            </span>
          </span>
        );
      })}
    </span>
  );
}

/* ----------------------------- Shapes ----------------------------- */
function polyPoints(n, r = 44, cx = 50, cy = 50, rot = -90, inner) {
  const pts = [];
  const total = inner ? n * 2 : n;
  for (let i = 0; i < total; i++) {
    const rr = inner && i % 2 ? inner : r;
    const a = ((rot + (360 / total) * i) * Math.PI) / 180;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}
export function ShapeSVG({ shape, color = 'blue', size = 1, rotate = 0, px = 96 }) {
  const fill = COLORS[color] || color;
  const s = px * size;
  const common = { fill, stroke: 'rgba(0,0,0,.18)', strokeWidth: 2.5, strokeLinejoin: 'round' };
  let el;
  switch (shape) {
    case 'circle': el = <circle cx="50" cy="50" r="42" {...common} />; break;
    case 'square': el = <rect x="10" y="10" width="80" height="80" rx="5" {...common} />; break;
    case 'rectangle': el = <rect x="3" y="24" width="94" height="52" rx="5" {...common} />; break;
    case 'triangle': el = <polygon points="50,8 93,88 7,88" {...common} />; break;
    case 'star': el = <polygon points={polyPoints(5, 46, 50, 53, -90, 19)} {...common} />; break;
    case 'heart': el = <path d="M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C40 8 46 14 50 22 C54 14 60 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88Z" {...common} />; break;
    case 'oval': el = <ellipse cx="50" cy="50" rx="45" ry="30" {...common} />; break;
    case 'diamond': el = <polygon points="50,4 88,50 50,96 12,50" {...common} />; break;
    case 'hexagon': el = <polygon points={polyPoints(6, 45, 50, 50, 0)} {...common} />; break;
    default: el = <circle cx="50" cy="50" r="40" {...common} />;
  }
  return (
    <svg viewBox="0 0 100 100" width={s} height={s} style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }} aria-label={shape} role="img">
      {el}
    </svg>
  );
}

/* --------------------------- helpers --------------------------- */
const SZ = {
  lg: { emoji: 56, shape: 120, gap: 'gap-2' },
  md: { emoji: 40, shape: 92, gap: 'gap-1.5' },
  sm: { emoji: 30, shape: 72, gap: 'gap-1' },
};
function seeded(n) {
  let x = n * 9301 + 49297;
  return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
}

function Objects({ v, size }) {
  const count = v.count;
  const em = (v.compact ? SZ.sm : SZ[size]).emoji * (count > 10 ? 0.8 : 1);
  const positions = useMemo(() => {
    if (!v.scatter) return null;
    const r = seeded(count * 31 + (v.emoji?.codePointAt(0) || 0));
    const cols = Math.ceil(Math.sqrt(count * 1.6));
    const rows = Math.ceil(count / cols);
    const cells = [];
    for (let i = 0; i < rows * cols; i++) cells.push(i);
    // shuffle cells deterministically, take count, jitter
    for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
    return { cols, rows, pts: cells.slice(0, count).map((c) => ({ c: c % cols, r: Math.floor(c / cols), dx: (r() - 0.5) * 0.4, dy: (r() - 0.5) * 0.4 })) };
  }, [count, v.scatter, v.emoji]);

  if (positions) {
    const { cols, rows, pts } = positions;
    const cell = em * 1.25;
    return (
      <div className="relative mx-auto" style={{ width: cols * cell, height: rows * cell }}>
        {pts.map((p, i) => (
          <span key={i} className="absolute leading-none select-none" style={{ fontSize: em, left: (p.c + 0.5 + p.dx) * cell - em / 2, top: (p.r + 0.5 + p.dy) * cell - em / 2 }}>
            {v.emoji}
          </span>
        ))}
      </div>
    );
  }
  const perRow = count <= 5 ? count : 5;
  return (
    <div className="inline-grid justify-center mx-auto" style={{ gridTemplateColumns: `repeat(${perRow}, auto)`, gap: em * 0.18 }}>
      {Array.from({ length: count }, (_, i) => {
        const faded = v.faded && i >= count - v.faded;
        return (
          <span key={i} className="relative leading-none select-none text-center" style={{ fontSize: em, opacity: faded ? 0.25 : 1 }}>
            {v.emoji}
            {faded && <span className="absolute inset-0 flex items-center justify-center text-bad font-black" style={{ fontSize: em * 0.9 }}>╱</span>}
          </span>
        );
      })}
    </div>
  );
}

function TenFrame({ count, size }) {
  const frames = Math.max(1, Math.ceil(count / 10));
  if (frames > 1) {
    return (
      <div className="flex flex-wrap justify-center gap-3">
        {Array.from({ length: frames }, (_, f) => <TenFrame key={f} count={Math.min(10, count - f * 10)} size={frames > 2 || size !== 'lg' ? 'sm' : 'md'} />)}
      </div>
    );
  }
  const cell = size === 'lg' ? 64 : size === 'md' ? 52 : 34;
  return (
    <div className="inline-grid grid-cols-5 border-4 border-ink/70 rounded-lg overflow-hidden bg-white">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="flex items-center justify-center border border-ink/30" style={{ width: cell, height: cell }}>
          {i < count && <div className="rounded-full bg-rose-500 shadow-inner" style={{ width: cell * 0.68, height: cell * 0.68 }} />}
        </div>
      ))}
    </div>
  );
}

function Balance({ v }) {
  const W = 420; const H = 230;
  const Side = ({ s, cx }) => {
    const items = [];
    const xs = s.x || 0; const us = s.units || 0;
    const condensed = xs + us > 12;
    if (condensed) {
      return (
        <g>
          {xs > 0 && (<g><rect x={cx - 70} y={110} width={58} height={44} rx={6} fill="#6366f1" /><text x={cx - 41} y={139} textAnchor="middle" fill="#fff" fontWeight="800" fontSize="20">{xs}x</text></g>)}
          {us > 0 && (<g><circle cx={cx + (xs ? 32 : 0)} cy={132} r={24} fill="#f59e0b" /><text x={cx + (xs ? 32 : 0)} y={139} textAnchor="middle" fill="#fff" fontWeight="800" fontSize="18">{us}</text></g>)}
        </g>
      );
    }
    const all = [...Array(xs).fill('x'), ...Array(us).fill('u')];
    const perRow = 6;
    all.forEach((t, i) => {
      const row = Math.floor(i / perRow); const col = i % perRow;
      const rowCount = Math.min(perRow, all.length - row * perRow);
      const x = cx - (rowCount * 24) / 2 + col * 24 + 12;
      const y = 150 - row * 26;
      items.push(t === 'x'
        ? <g key={i}><rect x={x - 11} y={y - 22} width={22} height={22} rx={4} fill="#6366f1" /><text x={x} y={y - 6} textAnchor="middle" fill="#fff" fontSize="13" fontWeight="800">x</text></g>
        : <g key={i}><circle cx={x} cy={y - 10} r={10} fill="#f59e0b" /><text x={x} y={y - 6} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">1</text></g>);
    });
    return <g>{items}</g>;
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[460px]" role="img" aria-label="Balance scale">
      <polygon points={`${W / 2 - 40},${H - 8} ${W / 2 + 40},${H - 8} ${W / 2},${H - 70}`} fill="#cbd0e1" />
      <rect x={W / 2 - 6} y={60} width={12} height={H - 120} fill="#9aa1bd" rx={4} />
      <rect x={30} y={154} width={W - 60} height={8} rx={4} fill="#565b7a" />
      <path d={`M30 162 Q105 196 180 162`} fill="#e8eaf3" stroke="#565b7a" strokeWidth="3" />
      <path d={`M${W - 180} 162 Q${W - 105} 196 ${W - 30} 162`} fill="#e8eaf3" stroke="#565b7a" strokeWidth="3" />
      <Side s={v.left} cx={105} />
      <Side s={v.right} cx={W - 105} />
      <g fontSize="12" fill="#565b7a" fontWeight="700">
        <rect x={10} y={8} width={14} height={14} rx={3} fill="#6366f1" /><text x={30} y={20}>= x (unknown)</text>
        <circle cx={140} cy={15} r={7} fill="#f59e0b" /><text x={152} y={20}>= 1 unit</text>
      </g>
    </svg>
  );
}

const TAPE_COLORS = ['#6366f1', '#f59e0b', '#10b981'];
function Tape({ v }) {
  const unitsTotal = v.parts.reduce((a, p) => a + p.units, 0);
  return (
    <div className="w-full max-w-[520px] space-y-2">
      {v.parts.map((p, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-24 text-right text-sm font-bold text-ink-soft capitalize">{p.label}</div>
          <div className="flex-1 flex gap-[2px]">
            {Array.from({ length: unitsTotal }, (_, k) => (
              <div key={k} className="h-9 flex-1 rounded-[4px]" style={{ background: k < p.units ? TAPE_COLORS[i] : 'transparent' }} />
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3 pt-1">
        <div className="w-24" />
        <div className="flex-1 border-t-2 border-dashed border-ink-muted text-center text-sm font-bold text-ink-soft pt-1">Total: {v.total}</div>
      </div>
    </div>
  );
}

function Grid({ v }) {
  const r = v.range || 7;
  const S = 320; const pad = 16; const span = S - pad * 2; const u = span / (2 * r);
  const X = (x) => pad + (x + r) * u; const Y = (y) => pad + (r - y) * u;
  const ticks = Array.from({ length: 2 * r + 1 }, (_, i) => i - r);
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-[440px] bg-white rounded-xl" role="img" aria-label="Coordinate grid">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={X(t)} y1={pad} x2={X(t)} y2={S - pad} stroke="#e4e6f0" strokeWidth="1" />
          <line x1={pad} y1={Y(t)} x2={S - pad} y2={Y(t)} stroke="#e4e6f0" strokeWidth="1" />
        </g>
      ))}
      <line x1={pad} y1={Y(0)} x2={S - pad} y2={Y(0)} stroke="#565b7a" strokeWidth="2" />
      <line x1={X(0)} y1={pad} x2={X(0)} y2={S - pad} stroke="#565b7a" strokeWidth="2" />
      {ticks.filter((t) => t !== 0 && t % 2 === 0).map((t) => (
        <g key={`l${t}`} fontSize="9" fill="#8a8fa8" fontWeight="600">
          <text x={X(t)} y={Y(0) + 12} textAnchor="middle">{t}</text>
          <text x={X(0) - 4} y={Y(t) + 3} textAnchor="end">{t}</text>
        </g>
      ))}
      <text x={S - pad} y={Y(0) - 5} textAnchor="end" fontSize="11" fontWeight="800" fill="#565b7a">x</text>
      <text x={X(0) + 6} y={pad + 9} fontSize="11" fontWeight="800" fill="#565b7a">y</text>
      {v.showQuadrants && (
        <g fontSize="16" fontWeight="800" fill="#c5cafe" textAnchor="middle">
          <text x={X(r / 2)} y={Y(r / 2)}>I</text><text x={X(-r / 2)} y={Y(r / 2)}>II</text>
          <text x={X(-r / 2)} y={Y(-r / 2)}>III</text><text x={X(r / 2)} y={Y(-r / 2)}>IV</text>
        </g>
      )}
      {v.polygon && <polygon points={v.polygon.map((p) => `${X(p.x)},${Y(p.y)}`).join(' ')} fill="rgba(91,95,240,.12)" stroke="#5b5ff0" strokeWidth="2" />}
      {(v.segments || []).map(([a, b], i) => <line key={i} x1={X(a.x)} y1={Y(a.y)} x2={X(b.x)} y2={Y(b.y)} stroke="#5b5ff0" strokeWidth="2.5" strokeDasharray="6 4" />)}
      {(v.points || []).map((p, i) => (
        <g key={i}>
          <circle cx={X(p.x)} cy={Y(p.y)} r="6" fill={p.color === 'ink' ? '#1d2140' : '#e0444e'} stroke="#fff" strokeWidth="2" />
          <text x={X(p.x) + 8} y={Y(p.y) - 7} fontSize="14" fontWeight="800" fill="#1d2140" stroke="#fff" strokeWidth="3" paintOrder="stroke">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

const MARBLE_HEX = { red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#facc15', purple: '#a855f7' };
function Marbles({ v }) {
  const all = v.groups.flatMap((g) => Array(g.count).fill(g.color));
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative rounded-b-[48px] rounded-t-2xl border-4 border-amber-700/60 bg-amber-50 px-4 pt-6 pb-4 max-w-[320px]">
        <div className="flex flex-wrap justify-center gap-1.5">
          {all.map((c, i) => (
            <span key={i} className="w-7 h-7 rounded-full" style={{ background: `radial-gradient(circle at 35% 30%, #fff8, ${MARBLE_HEX[c]} 55%)` }} />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3 text-sm font-bold text-ink-soft">
        {v.groups.map((g) => (
          <span key={g.color} className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: MARBLE_HEX[g.color] }} />{g.count} {g.color}</span>
        ))}
      </div>
    </div>
  );
}

function Bars({ values }) {
  const max = Math.max(...values.filter((x) => x !== null), 1);
  return (
    <div className="flex items-end gap-2 h-40 px-2 border-b-2 border-ink/20">
      {values.map((val, i) => (
        <div key={i} className="flex flex-col items-center justify-end h-full w-10">
          <span className="text-xs font-bold text-ink-soft mb-1 tabular">{val === null ? '?' : val}</span>
          <div className={`w-full rounded-t-[4px] ${val === null ? 'border-2 border-dashed border-brand-400 bg-brand-50' : 'bg-brand-500'}`}
            style={{ height: `${((val === null ? max * 0.6 : val) / max) * 80}%` }} />
        </div>
      ))}
    </div>
  );
}

function Pie({ parts, shaded }) {
  const R = 70; const C = 80;
  const slices = Array.from({ length: parts }, (_, i) => {
    const a0 = (i / parts) * 2 * Math.PI - Math.PI / 2; const a1 = ((i + 1) / parts) * 2 * Math.PI - Math.PI / 2;
    return `M${C},${C} L${C + R * Math.cos(a0)},${C + R * Math.sin(a0)} A${R},${R} 0 0 1 ${C + R * Math.cos(a1)},${C + R * Math.sin(a1)} Z`;
  });
  return (
    <svg viewBox="0 0 160 160" className="w-40" role="img" aria-label={`${shaded} of ${parts} slices eaten`}>
      {slices.map((d, i) => <path key={i} d={d} fill={i < shaded ? '#f1f2f7' : '#fbbf24'} stroke="#b45309" strokeWidth="2" />)}
    </svg>
  );
}

function Figure({ children, w = 320, h = 200, label }) {
  return <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[360px]" role="img" aria-label={label}>{children}</svg>;
}
const dim = { fontSize: 15, fontWeight: 800, fill: '#1d2140' };

function Geometry({ v }) {
  if (v.type === 'rect') {
    const ar = v.w / v.h; const W = ar >= 1 ? 240 : 240 * ar; const H = ar >= 1 ? 240 / ar : 240;
    const w = Math.max(W, 80); const h = Math.min(Math.max(H, 60), 150);
    return (
      <Figure label="rectangle"><rect x={160 - w / 2} y={100 - h / 2} width={w} height={h} fill="#e0e3ff" stroke="#5b5ff0" strokeWidth="3" rx="2" />
        <text x={160} y={100 - h / 2 - 8} textAnchor="middle" {...dim}>{v.w} {v.unit}</text>
        <text x={160 + w / 2 + 8} y={104} {...dim}>{v.h} {v.unit}</text></Figure>
    );
  }
  if (v.type === 'triangle') {
    return (
      <Figure label="triangle"><polygon points="40,170 280,170 110,30" fill="#dcfce7" stroke="#12a26b" strokeWidth="3" />
        <line x1="110" y1="30" x2="110" y2="170" stroke="#12a26b" strokeWidth="2" strokeDasharray="5 4" />
        <rect x="110" y="156" width="14" height="14" fill="none" stroke="#12a26b" strokeWidth="2" />
        <text x="160" y="192" textAnchor="middle" {...dim}>base {v.b} {v.unit}</text>
        <text x="116" y="105" {...dim}>h = {v.h}</text></Figure>
    );
  }
  if (v.type === 'trapezoid') {
    return (
      <Figure label="trapezoid"><polygon points="40,160 280,160 220,50 100,50" fill="#fff4dc" stroke="#d98a06" strokeWidth="3" />
        <line x1="100" y1="50" x2="100" y2="160" stroke="#d98a06" strokeWidth="2" strokeDasharray="5 4" />
        <text x="160" y="42" textAnchor="middle" {...dim}>{v.a} {v.unit}</text>
        <text x="160" y="182" textAnchor="middle" {...dim}>{v.b} {v.unit}</text>
        <text x="106" y="110" {...dim}>h = {v.h}</text></Figure>
    );
  }
  if (v.type === 'prism') {
    return (
      <Figure label="rectangular prism">
        <polygon points="60,80 220,80 270,40 110,40" fill="#c5cafe" stroke="#4a49d9" strokeWidth="2.5" />
        <polygon points="220,80 270,40 270,140 220,180" fill="#a5abf9" stroke="#4a49d9" strokeWidth="2.5" />
        <rect x="60" y="80" width="160" height="100" fill="#e0e3ff" stroke="#4a49d9" strokeWidth="2.5" />
        <text x="140" y="198" textAnchor="middle" {...dim}>{v.l} {v.unit}</text>
        <text x="280" y="100" {...dim}>{v.h}</text>
        <text x="254" y="54" textAnchor="start" {...dim} transform="translate(8,-14)">{v.w}</text>
      </Figure>
    );
  }
  if (v.type === 'lshape') {
    const s = 220 / Math.max(v.W, v.H); const W = v.W * s; const H = v.H * s; const cw = v.cw * s; const ch = v.ch * s;
    const x0 = 160 - W / 2; const y0 = 100 - H / 2 + 6;
    return (
      <Figure label="L-shaped room" h={220}>
        <polygon points={`${x0},${y0} ${x0 + W - cw},${y0} ${x0 + W - cw},${y0 + ch} ${x0 + W},${y0 + ch} ${x0 + W},${y0 + H} ${x0},${y0 + H}`} fill="#fdecee" stroke="#e0444e" strokeWidth="3" />
        <rect x={x0 + W - cw} y={y0} width={cw} height={ch} fill="none" stroke="#e0444e" strokeWidth="1.5" strokeDasharray="5 4" />
        <text x={x0 + W / 2} y={y0 + H + 18} textAnchor="middle" {...dim}>{v.W} {v.unit}</text>
        <text x={x0 - 8} y={y0 + H / 2} textAnchor="end" {...dim}>{v.H}</text>
        <text x={x0 + W - cw / 2} y={y0 - 6} textAnchor="middle" {...dim} fontSize="12">{v.cw}</text>
        <text x={x0 + W + 6} y={y0 + ch / 2 + 4} {...dim} fontSize="12">{v.ch}</text>
      </Figure>
    );
  }
  if (v.type === 'circle') {
    return (
      <Figure label="circle"><circle cx="160" cy="100" r="80" fill="#e3f7ee" stroke="#12a26b" strokeWidth="3" />
        <line x1="160" y1="100" x2="240" y2="100" stroke="#12a26b" strokeWidth="2.5" /><circle cx="160" cy="100" r="4" fill="#12a26b" />
        <text x="200" y="92" textAnchor="middle" {...dim}>r = {v.r} {v.unit}</text></Figure>
    );
  }
  return null;
}

/* ------------------------------ main ------------------------------ */
export default function Visual({ v, size = 'lg' }) {
  if (!v) return null;
  const S = SZ[size] || SZ.lg;
  switch (v.type) {
    case 'objects': return <Objects v={v} size={size} />;
    case 'groups':
      return (
        <div className="flex items-center justify-center flex-wrap gap-4">
          {v.groups.map((g, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-5xl font-black text-ink-muted">{v.op}</span>}
              <div className="rounded-2xl bg-white/70 border-2 border-line px-3 py-2"><Objects v={{ type: 'objects', emoji: g.emoji, count: g.count }} size={size === 'lg' ? 'md' : 'sm'} /></div>
            </React.Fragment>
          ))}
        </div>
      );
    case 'emoji': return <span className="leading-none select-none" style={{ fontSize: S.emoji * 1.7 * (v.size || 1) }}>{v.emoji}</span>;
    case 'shape': return <ShapeSVG shape={v.shape} color={v.color} size={v.size || 1} rotate={v.rotate} px={S.shape} />;
    case 'sized': return <span className="leading-none select-none inline-flex items-end justify-center" style={{ fontSize: S.emoji * 1.9 * v.scale, height: S.emoji * 1.9 }}>{v.emoji}</span>;
    case 'tenframe': return <TenFrame count={v.count} size={size} />;
    case 'clock': return <Clock h={v.h} m={v.m} px={size === 'lg' ? 240 : size === 'md' ? 210 : 110} />;
    case 'coins': return <Coins coins={v.coins} small={size === 'sm'} />;
    case 'ruler': return <Ruler {...v} />;
    case 'cubes': return <CubeMeasure length={v.length} emoji={v.emoji} />;
    case 'stick': return <Stick len={v.len} color={v.color} />;
    case 'array': return <ArrayGrid rows={v.rows} cols={v.cols} emoji={v.emoji} count={v.count} />;
    case 'base10': return <Base10 hundreds={v.hundreds} tens={v.tens} ones={v.ones} />;
    case 'fracshape': return <FractionShape parts={v.parts} shaded={v.shaded} kind={v.kind} px={size === 'lg' ? 150 : size === 'md' ? 120 : 90} />;
    case 'bargraph': return <BarGraph items={v.items} step={v.step} title={v.title} />;
    case 'numberbond': return <NumberBond whole={v.whole} parts={v.parts} />;
    case 'character': return <Character id={v.id} px={v.px || (size === 'lg' ? 170 : size === 'md' ? 130 : 96)} toScale={v.toScale} label={v.label} />;
    case 'lineup': return <Lineup ids={v.ids} px={size === 'sm' ? 120 : 200} labels={v.labels !== false} />;
    case 'crowd': return <Crowd ids={v.ids} size={size} px={v.px} toScale={v.toScale} />;
    case 'emojiset': return <div className="flex flex-wrap justify-center gap-2 max-w-[480px]" style={{ fontSize: size === 'lg' ? 48 : 34 }}>{v.items.map((e, i) => <span key={i} className="leading-none">{e}</span>)}</div>;
    case 'pattern':
      return (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {v.items.map((it, i) => (
            <div key={i} className={`flex items-center justify-center rounded-2xl ${it ? 'bg-white/60' : 'border-4 border-dashed border-brand-400 bg-brand-50 animate-pulse'}`} style={{ width: S.shape * 0.78, height: S.shape * 0.78 }}>
              {it ? <Visual v={{ ...it, size: it.type === 'shape' ? 0.7 : 0.55 }} size={size} /> : <span className="text-4xl font-black text-brand-500">?</span>}
            </div>
          ))}
        </div>
      );
    case 'sequence':
      return (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {v.terms.map((t, i) => (
            <div key={i} className="min-w-16 h-16 px-3 flex items-center justify-center rounded-xl bg-white border-2 border-line text-3xl font-extrabold tabular card-shadow">{t}</div>
          ))}
          {v.more && <span className="text-3xl font-black text-ink-muted px-1">…</span>}
          {v.blank && <div className="w-16 h-16 flex items-center justify-center rounded-xl border-4 border-dashed border-brand-400 bg-brand-50 text-3xl font-black text-brand-500">?</div>}
        </div>
      );
    case 'balance': return <Balance v={v} />;
    case 'tape': return <Tape v={v} />;
    case 'grid': return <Grid v={v} />;
    case 'marbles': return <Marbles v={v} />;
    case 'bars': return <Bars values={v.values} />;
    case 'pie': return <Pie parts={v.parts} shaded={v.shaded} />;
    case 'dice': return <div className="text-6xl flex gap-3">{v.coin && <span>🪙</span>}{Array.from({ length: v.count }, (_, i) => <span key={i}>🎲</span>)}</div>;
    case 'clues':
      return (
        <ol className="w-full max-w-[520px] space-y-2">
          {v.items.map((c, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl bg-white border border-line px-4 py-3 card-shadow">
              <span className="shrink-0 w-7 h-7 rounded-full bg-brand-500 text-white text-sm font-black flex items-center justify-center">{i + 1}</span>
              <span className="text-lg font-semibold text-ink">{c}</span>
            </li>
          ))}
        </ol>
      );
    default: return <Geometry v={v} />;
  }
}
