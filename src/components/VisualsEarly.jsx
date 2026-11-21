import React from 'react';
import { ART } from '../curriculum/middleEarthArt.js';

/* Visuals for the early grades (Ages 5–7): clocks, coins, rulers, arrays,
   place-value blocks, fraction shapes, bar graphs and number bonds. */

const INK = '#1d2140';
const BRAND = '#5b5ff0';

/* ------------------------------- Clock ------------------------------- */
export function Clock({ h, m, px = 220 }) {
  const C = 100;
  const hourA = ((h % 12) + m / 60) * 30; // degrees from 12
  const minA = m * 6;
  const hand = (angle, len) => {
    const r = ((angle - 90) * Math.PI) / 180;
    return { x2: C + len * Math.cos(r), y2: C + len * Math.sin(r) };
  };
  return (
    <svg viewBox="0 0 200 200" width={px} height={px} role="img" aria-label="Clock">
      <circle cx={C} cy={C} r="94" fill="#fff" stroke={INK} strokeWidth="6" />
      {Array.from({ length: 60 }, (_, i) => {
        const r = ((i * 6 - 90) * Math.PI) / 180;
        const big = i % 5 === 0;
        return <line key={i} x1={C + (big ? 78 : 84) * Math.cos(r)} y1={C + (big ? 78 : 84) * Math.sin(r)} x2={C + 89 * Math.cos(r)} y2={C + 89 * Math.sin(r)} stroke={big ? INK : '#b8bccf'} strokeWidth={big ? 3 : 1.5} />;
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1;
        const r = ((n * 30 - 90) * Math.PI) / 180;
        return <text key={n} x={C + 63 * Math.cos(r)} y={C + 63 * Math.sin(r) + 7} textAnchor="middle" fontSize="20" fontWeight="800" fill={INK}>{n}</text>;
      })}
      <line x1={C} y1={C} {...hand(hourA, 46)} stroke={INK} strokeWidth="8" strokeLinecap="round" />
      <line x1={C} y1={C} {...hand(minA, 72)} stroke={BRAND} strokeWidth="5" strokeLinecap="round" />
      <circle cx={C} cy={C} r="7" fill={INK} />
    </svg>
  );
}

/* ------------------------------- Coins ------------------------------- */
const COIN = {
  100: { name: 'dollar', label: '$1', bill: true },
  25: { name: 'quarter', label: '25¢', r: 30, fill: '#cfd4de', ring: '#9aa1b5' },
  10: { name: 'dime', label: '10¢', r: 21, fill: '#d9dde6', ring: '#9aa1b5' },
  5: { name: 'nickel', label: '5¢', r: 26, fill: '#c3c8d3', ring: '#8d93a8' },
  1: { name: 'penny', label: '1¢', r: 23, fill: '#d08a4e', ring: '#9c5d2c' },
};
export function Coins({ coins, small }) {
  const k = small ? 0.75 : 1.45;
  return (
    <div className="flex flex-wrap items-end justify-center gap-3 max-w-[560px]">
      {coins.map((c, i) => {
        const s = COIN[c];
        if (s.bill) {
          return (
            <div key={i} className="flex flex-col items-center">
              <div className="rounded-lg border-2 border-green-800/50 bg-green-200 text-green-900 font-black flex items-center justify-center" style={{ width: 96 * k, height: 46 * k, fontSize: 20 * k }}>$1</div>
              <span className="text-[11px] font-bold text-ink-muted mt-0.5">dollar</span>
            </div>
          );
        }
        const d = s.r * 2 * k;
        return (
          <div key={i} className="flex flex-col items-center">
            <div className="rounded-full flex items-center justify-center font-black" style={{ width: d, height: d, background: `radial-gradient(circle at 35% 30%, #fff9, ${s.fill} 60%)`, border: `3px solid ${s.ring}`, color: c === 1 ? '#fff' : INK, fontSize: Math.max(11, s.r * 0.55 * k) }}>{s.label}</div>
            <span className="text-[11px] font-bold text-ink-muted mt-0.5">{s.name}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------- Ruler ------------------------------- */
export function Ruler({ length, start = 0, unit = 'in', color = '#f59e0b', label }) {
  const max = Math.max(6, Math.ceil(start + length) + 1);
  const W = 520; const pad = 20; const u = (W - pad * 2) / max;
  const x = (v) => pad + v * u;
  return (
    <svg viewBox={`0 0 ${W} 150`} className="w-full max-w-[560px]" role="img" aria-label={`Object over a ruler in ${unit}`}>
      {/* object (a pencil) */}
      <rect x={x(start)} y="22" width={length * u - 14} height="30" rx="6" fill={color} />
      <polygon points={`${x(start + length) - 14},22 ${x(start + length)},37 ${x(start + length) - 14},52`} fill="#f2d6a7" />
      <circle cx={x(start + length) - 2} cy="37" r="3" fill={INK} />
      <rect x={x(start)} y="22" width="10" height="30" rx="3" fill="#f9a8d4" />
      {label && <text x={x(start) + (length * u) / 2} y="16" textAnchor="middle" fontSize="13" fontWeight="800" fill="#565b7a">{label}</text>}
      {/* ruler */}
      <rect x={pad - 8} y="64" width={W - pad * 2 + 16} height="66" rx="6" fill="#fef3c7" stroke="#d4a72c" strokeWidth="2" />
      {Array.from({ length: max * 2 + 1 }, (_, i) => {
        const v = i / 2;
        const whole = i % 2 === 0;
        return (
          <g key={i}>
            <line x1={x(v)} y1="64" x2={x(v)} y2={whole ? 90 : 78} stroke={INK} strokeWidth={whole ? 2 : 1.2} />
            {whole && <text x={x(v)} y="110" textAnchor="middle" fontSize="16" fontWeight="800" fill={INK}>{v}</text>}
          </g>
        );
      })}
      <text x={W - pad} y="126" textAnchor="end" fontSize="12" fontWeight="800" fill="#8a6d1d">{unit === 'in' ? 'inches' : 'centimeters'}</text>
      <line x1={x(start)} y1="52" x2={x(start)} y2="64" stroke={BRAND} strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1={x(start + length)} y1="52" x2={x(start + length)} y2="64" stroke={BRAND} strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
}

/** Object measured with a row of cubes (Age 5). */
export function CubeMeasure({ length, emoji = '🖍️' }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="h-8 rounded-lg bg-amber-400 flex items-center justify-end pr-1 text-lg" style={{ width: length * 40 }}>{emoji}</div>
      <div className="flex">{Array.from({ length }, (_, i) => <div key={i} className="w-10 h-10 border-2 border-sky-700 bg-sky-300" />)}</div>
    </div>
  );
}

/** A colored stick of a given length (for longer/shorter choices). */
export function Stick({ len, color = '#22c55e' }) {
  return <div className="h-6 rounded-full" style={{ width: len * 20, background: color }} />;
}

/* ------------------------------- Array ------------------------------- */
export function ArrayGrid({ rows, cols, emoji, count }) {
  const cell = Math.max(22, Math.min(46, 300 / Math.max(rows, cols)));
  return (
    <div className="inline-grid gap-1 p-3 rounded-2xl bg-white border border-line" style={{ gridTemplateColumns: `repeat(${cols}, ${cell}px)` }}>
      {Array.from({ length: count ?? rows * cols }, (_, i) => (
        <span key={i} className="flex items-center justify-center leading-none" style={{ width: cell, height: cell, fontSize: cell * 0.8 }}>
          {emoji || <span className="block rounded-full bg-brand-500" style={{ width: cell * 0.7, height: cell * 0.7 }} />}
        </span>
      ))}
    </div>
  );
}

/* --------------------------- Place-value blocks --------------------------- */
export function Base10({ hundreds = 0, tens = 0, ones = 0 }) {
  const flat = 64; const g = flat / 10;
  const items = [];
  let x = 0;
  for (let i = 0; i < hundreds; i++) {
    items.push(
      <g key={`h${i}`} transform={`translate(${x},0)`}>
        <rect width={flat} height={flat} fill="#93c5fd" stroke="#1d4ed8" strokeWidth="1.5" />
        {Array.from({ length: 9 }, (_, k) => <g key={k}><line x1={(k + 1) * g} y1="0" x2={(k + 1) * g} y2={flat} stroke="#1d4ed8" strokeWidth=".6" /><line x1="0" y1={(k + 1) * g} x2={flat} y2={(k + 1) * g} stroke="#1d4ed8" strokeWidth=".6" /></g>)}
      </g>,
    );
    x += flat + 8;
  }
  for (let i = 0; i < tens; i++) {
    items.push(
      <g key={`t${i}`} transform={`translate(${x},0)`}>
        <rect width={g} height={flat} fill="#86efac" stroke="#15803d" strokeWidth="1.2" />
        {Array.from({ length: 9 }, (_, k) => <line key={k} x1="0" y1={(k + 1) * g} x2={g} y2={(k + 1) * g} stroke="#15803d" strokeWidth=".6" />)}
      </g>,
    );
    x += g + 5;
  }
  if (ones) x += 4;
  for (let i = 0; i < ones; i++) {
    const col = Math.floor(i / 5); const row = i % 5;
    items.push(<rect key={`o${i}`} x={x + col * (g + 3)} y={flat - (row + 1) * (g + 3)} width={g} height={g} fill="#fcd34d" stroke="#b45309" strokeWidth="1" />);
  }
  const width = x + (ones ? Math.ceil(ones / 5) * (g + 3) : 0) + 2;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox={`-2 -2 ${Math.max(width, 20) + 4} ${flat + 4}`} style={{ width: Math.min(520, (Math.max(width, 20) + 4) * 1.6), maxWidth: '100%' }} role="img" aria-label={`${hundreds} hundreds, ${tens} tens, ${ones} ones`}>{items}</svg>
      <div className="flex gap-3 text-xs font-bold text-ink-muted">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-300 border border-blue-700" />hundred</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-3 bg-green-300 border border-green-700" />ten</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-300 border border-amber-700" />one</span>
      </div>
    </div>
  );
}

/* ----------------------------- Fraction shape ----------------------------- */
export function FractionShape({ parts, shaded, kind = 'circle', px = 150 }) {
  if (kind === 'rect') {
    return (
      <div className="flex border-[3px] border-ink rounded-lg overflow-hidden" style={{ width: px * 1.3, height: px * 0.5 }} role="img" aria-label={`${shaded} of ${parts} parts shaded`}>
        {Array.from({ length: parts }, (_, i) => <div key={i} className={`flex-1 ${i < parts - 1 ? 'border-r-[3px] border-ink' : ''}`} style={{ background: i < shaded ? BRAND : '#fff' }} />)}
      </div>
    );
  }
  const R = 70; const C = 75;
  return (
    <svg viewBox="0 0 150 150" width={px} height={px} role="img" aria-label={`${shaded} of ${parts} parts shaded`}>
      {parts === 1 ? <circle cx={C} cy={C} r={R} fill={shaded ? BRAND : '#fff'} stroke={INK} strokeWidth="3" />
        : Array.from({ length: parts }, (_, i) => {
          const a0 = (i / parts) * 2 * Math.PI - Math.PI / 2; const a1 = ((i + 1) / parts) * 2 * Math.PI - Math.PI / 2;
          const large = a1 - a0 > Math.PI ? 1 : 0;
          return <path key={i} d={`M${C},${C} L${C + R * Math.cos(a0)},${C + R * Math.sin(a0)} A${R},${R} 0 ${large} 1 ${C + R * Math.cos(a1)},${C + R * Math.sin(a1)} Z`} fill={i < shaded ? BRAND : '#fff'} stroke={INK} strokeWidth="3" strokeLinejoin="round" />;
        })}
    </svg>
  );
}

/* ------------------------------- Bar graph ------------------------------- */
/** Vertical bar graph with a y-axis scale and NO value labels (reading it is the skill). */
export function BarGraph({ items, step = 1, title }) {
  const maxV = Math.max(...items.map((d) => d.value));
  const top = Math.ceil((maxV + step) / step) * step;
  const H = 200; const W = 60 + items.length * 74; const base = H - 10; const plotTop = 14;
  const y = (v) => base - (v / top) * (base - plotTop);
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const COLORS = ['#5b5ff0', '#f59e0b', '#10b981', '#ec4899', '#3b82f6'];
  return (
    <div className="w-full flex flex-col items-center">
      {title && <div className="text-base font-extrabold text-ink-soft mb-1">{title}</div>}
      <svg viewBox={`0 0 ${W} ${H + 46}`} className="w-full" style={{ maxWidth: Math.min(560, W * 1.3) }} role="img" aria-label={title || 'Bar graph'}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1="40" y1={y(t)} x2={W - 6} y2={y(t)} stroke="#e4e6f0" strokeWidth="1" />
            <text x="34" y={y(t) + 4} textAnchor="end" fontSize="11" fontWeight="700" fill="#8a8fa8">{t}</text>
          </g>
        ))}
        <line x1="40" y1={plotTop - 4} x2="40" y2={base} stroke="#565b7a" strokeWidth="2" />
        <line x1="40" y1={base} x2={W - 6} y2={base} stroke="#565b7a" strokeWidth="2" />
        {items.map((d, i) => {
          const cx = 60 + i * 74 + 22;
          return (
            <g key={d.label}>
              <path d={`M${cx - 20},${base} V${y(d.value) + 4} Q${cx - 20},${y(d.value)} ${cx - 16},${y(d.value)} H${cx + 16} Q${cx + 20},${y(d.value)} ${cx + 20},${y(d.value) + 4} V${base} Z`} fill={COLORS[i % COLORS.length]} />
              <text x={cx} y={base + 24} textAnchor="middle" fontSize="20">{d.emoji}</text>
              <text x={cx} y={base + 40} textAnchor="middle" fontSize="11" fontWeight="800" fill={INK}>{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ------------------------------ Number bond ------------------------------ */
export function NumberBond({ whole, parts }) {
  const node = (x, y, v, r) => (
    <g>
      <circle cx={x} cy={y} r={r} fill={v === null ? '#eef0ff' : '#fff'} stroke={v === null ? BRAND : INK} strokeWidth="3" strokeDasharray={v === null ? '6 4' : undefined} />
      <text x={x} y={y + 11} textAnchor="middle" fontSize="30" fontWeight="900" fill={v === null ? BRAND : INK}>{v === null ? '?' : v}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 240 190" className="w-full max-w-[260px]" role="img" aria-label="Number bond">
      <line x1="120" y1="50" x2="60" y2="140" stroke="#8a8fa8" strokeWidth="3" />
      <line x1="120" y1="50" x2="180" y2="140" stroke="#8a8fa8" strokeWidth="3" />
      {node(120, 45, whole, 38)}
      {node(60, 145, parts[0], 32)}
      {node(180, 145, parts[1], 32)}
    </svg>
  );
}

/* ------------------------- Middle-earth characters ------------------------- */
// Drawings imported from the Middle Earth game (see scripts/extract-middle-earth-art.mjs).

const VB_W = 50;
/** One character, `px` tall for the tallest (Gandalf); `toScale` keeps true relative heights. */
export function Character({ id, px = 140, toScale = false, label }) {
  const a = ART[id];
  if (!a) return null;
  const top = toScale ? 90 : a.h + 6;
  const height = px;
  const vbH = top + 6;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`-25 ${-top} ${VB_W} ${vbH}`} height={height} width={(height * VB_W) / vbH} role="img" aria-label={a.name}
        dangerouslySetInnerHTML={{ __html: `<ellipse cx="0" cy="1.5" rx="13" ry="3" fill="rgba(40,30,10,.18)"/>${a.svg}` }} />
      {label && <span className="text-sm font-extrabold text-ink mt-0.5">{a.name}</span>}
    </div>
  );
}

/** Characters standing side by side at their true relative heights. */
export function Lineup({ ids, px = 200, labels = true }) {
  return (
    <div className="flex items-end justify-center gap-4">
      {ids.map((id, i) => <Character key={i} id={id} px={px} toScale label={labels} />)}
    </div>
  );
}

/** A group to count: small characters in rows of 5. */
export function Crowd({ ids, size = 'lg', px: fixed, toScale }) {
  const base = size === 'lg' ? 100 : size === 'md' ? 80 : 50;
  const px = fixed || (toScale ? Math.round(base * 1.5) : base);
  const perRow = ids.length <= 5 ? ids.length : 5;
  return (
    <div className="inline-grid justify-center gap-x-1 gap-y-2" style={{ gridTemplateColumns: `repeat(${perRow}, auto)` }}>
      {ids.map((id, i) => <Character key={i} id={id} px={px} toScale={toScale} />)}
    </div>
  );
}

/* ------------------------------ Picture graph ------------------------------ */
/** Rows of pictures; `each` says how many one picture stands for (half pictures allowed when each is even). */
export function PictureGraph({ rows, emoji, each = 1, title }) {
  return (
    <div className="w-full max-w-[520px] rounded-2xl bg-white border border-line overflow-hidden">
      {title && <div className="px-4 py-2 text-base font-extrabold text-ink-soft border-b border-line text-center">{title}</div>}
      {rows.map((r) => {
        const full = Math.floor(r.value / each); const half = r.value % each !== 0;
        return (
          <div key={r.label} className="flex items-center gap-3 px-4 py-2 border-b border-line last:border-b-0">
            <span className="w-20 shrink-0 text-right font-extrabold text-ink">{r.label}</span>
            <span className="flex flex-wrap gap-1 text-3xl leading-none">
              {Array.from({ length: full }, (_, i) => <span key={i}>{emoji}</span>)}
              {half && <span className="inline-block overflow-hidden" style={{ width: '0.55em' }}>{emoji}</span>}
            </span>
          </div>
        );
      })}
      <div className="px-4 py-1.5 bg-slate-50 text-sm font-bold text-ink-soft text-center">Key: {emoji} = {each}</div>
    </div>
  );
}

/* -------------------------------- Area grid -------------------------------- */
/** A rectangle on a grid of unit squares (count the squares, or multiply rows × columns). */
export function AreaGrid({ w, h, unit = '', labels = false, lshape }) {
  const c = Math.max(20, Math.min(58, 380 / Math.max(w, h)));
  const cut = lshape || null; // { cw, ch } removed from the top-right corner
  const cells = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (cut && x >= w - cut.cw && y < cut.ch) continue;
      cells.push(<rect key={`${x}-${y}`} x={x * c} y={y * c} width={c} height={c} fill="#c7d2fe" stroke="#4a49d9" strokeWidth="1.5" />);
    }
  }
  const pad = labels ? 30 : 4;
  return (
    <svg viewBox={`${-pad} ${-pad} ${w * c + pad * 2} ${h * c + pad * 2}`} style={{ width: Math.min(480, w * c + pad * 2) }} className="max-w-full" role="img" aria-label="Shape on a grid">
      {cells}
      {labels && <text x={(w * c) / 2} y={-10} textAnchor="middle" fontSize="15" fontWeight="800" fill={INK}>{w}{unit ? ` ${unit}` : ''}</text>}
      {labels && <text x={-10} y={(h * c) / 2 + 5} textAnchor="end" fontSize="15" fontWeight="800" fill={INK}>{h}{unit ? ` ${unit}` : ''}</text>}
    </svg>
  );
}

/* ---------------------------- Fraction number line ---------------------------- */
export function FractionLine({ den, mark, max = 1 }) {
  const W = 500; const pad = 30; const parts = den * max; const u = (W - pad * 2) / parts;
  return (
    <svg viewBox={`0 0 ${W} 90`} className="w-full max-w-[520px]" role="img" aria-label="Number line">
      <line x1={pad} y1="45" x2={W - pad} y2="45" stroke={INK} strokeWidth="3" />
      {Array.from({ length: parts + 1 }, (_, i) => {
        const whole = i % den === 0;
        return (
          <g key={i}>
            <line x1={pad + i * u} y1={whole ? 30 : 36} x2={pad + i * u} y2={whole ? 60 : 54} stroke={INK} strokeWidth={whole ? 3 : 2} />
            {whole && <text x={pad + i * u} y="82" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>{i / den}</text>}
          </g>
        );
      })}
      <circle cx={pad + mark * u} cy="45" r="9" fill="#e0444e" stroke="#fff" strokeWidth="3" />
      <text x={pad + mark * u} y="20" textAnchor="middle" fontSize="16" fontWeight="900" fill="#e0444e">?</text>
    </svg>
  );
}
