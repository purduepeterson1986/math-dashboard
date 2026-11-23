import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

/* Predict-and-test animations. The child guesses first; once they answer, the scene plays what really happens
   (Replay runs it again). Where the screen gives no "answered" signal, a "Test it!" button is shown instead.
   Everything is plain SVG + CSS keyframes (see index.css): no video files, nothing to download. */

const INK = '#1d2140';
const GROUND = 170;
const reduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const COL = { red: '#ef4444', blue: '#3b82f6', yellow: '#f5b70a', green: '#22c55e', purple: '#a855f7', orange: '#f97316' };
const col = (c) => COL[c] || c || '#3b82f6';
/** Animation style: instant (jump to the end) when the device asks for reduced motion. */
const anim = (go, name, secs, extra = '') => (go ? { animation: `${name} ${reduced() ? 0.01 : secs}s ${extra} forwards` } : {});

function Ground() {
  return (
    <>
      <rect x="0" y={GROUND} width="320" height="30" fill="#e6d6ae" />
      <line x1="0" y1={GROUND} x2="320" y2={GROUND} stroke="#c9b27a" strokeWidth="3" />
    </>
  );
}

/* ------------------------------- stack: will it stay up? ------------------------------- */
const STACKS = {
  bigOnSmall: { base: { w: 46, h: 46 }, top: { w: 120, h: 36, off: 0 }, fall: { ex: 8, er: 7, dx: 88, dy: 46, rot: 0 } },
  smallOnBig: { base: { w: 150, h: 46 }, top: { w: 48, h: 46, off: 0 } },
  blockOnBlock: { base: { w: 92, h: 42 }, top: { w: 92, h: 42, off: 0 } },
  ballOnBlock: { base: { w: 104, h: 50 }, ball: 24, fall: { ex: 58, er: 260, dx: 128, dy: 50, rot: 540 } },
  blockOnBall: { baseBall: 34, top: { w: 100, h: 30, off: 0 }, fall: { ex: 14, er: 14, dx: 74, dy: 68, rot: 0 } },
  hangingOff: { base: { w: 80, h: 46 }, top: { w: 110, h: 36, off: 56 }, fall: { ex: 6, er: 16, dx: 44, dy: 46, rot: 0 } },
};

function Stack({ v, go }) {
  const s = STACKS[v.scene];
  const baseTop = GROUND - (s.base ? s.base.h : s.baseBall * 2);
  const fall = s.fall;
  const fallStyle = fall && go ? { '--ex': `${fall.ex}px`, '--er': `${fall.er}deg`, '--dx': `${fall.dx}px`, '--dy': `${fall.dy}px`, '--rot': `${fall.rot}deg`, ...anim(true, 'fallOff', 1.5, 'cubic-bezier(.45,0,.8,.6)') } : {};
  const stayStyle = !fall && go ? anim(true, 'wobbleStay', 1.4) : {};
  const box = { transformBox: 'fill-box', transformOrigin: s.ball ? 'center' : 'center bottom' };
  return (
    <>
      <Ground />
      {s.base && <rect x={160 - s.base.w / 2} y={GROUND - s.base.h} width={s.base.w} height={s.base.h} rx="5" fill={col(v.baseColor)} stroke={INK} strokeWidth="3" />}
      {s.baseBall && <circle cx="160" cy={GROUND - s.baseBall} r={s.baseBall} fill={col(v.baseColor)} stroke={INK} strokeWidth="3" />}
      <g style={{ ...box, ...fallStyle, ...stayStyle }}>
        {s.top && <rect x={160 + s.top.off - s.top.w / 2} y={baseTop - s.top.h} width={s.top.w} height={s.top.h} rx="5" fill={col(v.topColor)} stroke={INK} strokeWidth="3" />}
        {s.ball && <circle cx="160" cy={baseTop - s.ball} r={s.ball} fill={col(v.topColor)} stroke={INK} strokeWidth="3" />}
        {s.ball && <path d={`M ${160 - s.ball} ${baseTop - s.ball} H ${160 + s.ball} M 160 ${baseTop - 2 * s.ball} V ${baseTop}`} stroke={INK} strokeWidth="2" opacity=".35" />}
      </g>
    </>
  );
}

/* ------------------------------- seesaw: which side goes down? ------------------------------- */
function Seesaw({ v, go }) {
  const a = v.heavier === 'left' ? -13 : 13;
  const side = (s, x) => {
    if (s.blocks) {
      return Array.from({ length: s.blocks }, (_, i) => <rect key={i} x={x - 17} y={116 - (i + 1) * 21} width="34" height="19" rx="3" fill={col(s.color)} stroke={INK} strokeWidth="2.5" />);
    }
    return <text x={x} y="112" textAnchor="middle" fontSize={s.size || 54}>{s.emoji}</text>;
  };
  return (
    <>
      <Ground />
      <polygon points="160,122 128,170 192,170" fill="#a78bfa" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <g style={{ transformOrigin: '160px 122px', ...(go ? { '--a': `${a}deg`, ...anim(true, 'tilt', 1.5, 'ease-in-out') } : {}) }}>
        {side(v.left, 72)}
        {side(v.right, 248)}
        <rect x="30" y="118" width="260" height="11" rx="5" fill="#f59e0b" stroke={INK} strokeWidth="3" />
      </g>
      <circle cx="160" cy="123" r="6" fill={INK} />
    </>
  );
}

/* ------------------------------- float: sink or float? ------------------------------- */
function Tub({ v, go }) {
  const surface = 108;
  const y0 = 66;
  const dy = v.floats ? surface - y0 - 4 : 168 - y0 - 6;
  return (
    <>
      <rect x="58" y="90" width="204" height="86" rx="16" fill="#fff" stroke={INK} strokeWidth="3" />
      <g style={{ transformOrigin: `160px ${y0 - 18}px`, ...(go ? { '--dy': `${dy}px`, ...anim(true, v.floats ? 'dropTo' : 'sinkTo', v.floats ? 0.8 : 1.9, 'ease-in') } : {}) }}>
        <g style={{ transformOrigin: `160px ${y0 - 18}px`, ...(go && v.floats ? { animation: `bob 2.2s ease-in-out ${reduced() ? 0 : 0.8}s infinite` } : {}) }}>
          <text x="160" y={y0} textAnchor="middle" fontSize="50">{v.emoji}</text>
        </g>
      </g>
      <rect x="60" y={surface} width="200" height="66" fill="#59b7ff" opacity=".55" />
      <path d={`M 60 ${surface} q 12 -8 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0`} fill="none" stroke="#2f8de0" strokeWidth="3" />
      <rect x="58" y="90" width="204" height="86" rx="16" fill="none" stroke={INK} strokeWidth="3" />
      <line x1="40" y1="178" x2="280" y2="178" stroke="#c9b27a" strokeWidth="4" strokeLinecap="round" />
    </>
  );
}

/* ------------------------------- lanes: ramp races and who rolls ------------------------------- */
function Car({ color }) {
  return (
    <g>
      <rect x="-20" y="-26" width="40" height="14" rx="4" fill={col(color)} stroke={INK} strokeWidth="2.5" />
      <rect x="-9" y="-35" width="20" height="11" rx="4" fill={col(color)} stroke={INK} strokeWidth="2.5" />
      <circle cx="-11" cy="-7" r="6.5" fill={INK} /><circle cx="12" cy="-7" r="6.5" fill={INK} />
    </g>
  );
}

function Lanes({ v, go }) {
  const n = v.lanes.length;
  const W = 320 / n;
  const rampW = W - 22;
  const raw = v.lanes.map((l) => {
    const th = Math.atan2(l.h, rampW);
    const D = Math.hypot(rampW, l.h) - 62;
    return { th, D, t: Math.sqrt(D / Math.sin(th)) };
  });
  const tMin = Math.min(...raw.map((r) => r.t));
  return (
    <>
      <Ground />
      {v.lanes.map((l, i) => {
        const x0 = i * W + 11;
        const r = raw[i];
        const topY = GROUND - l.h;
        const s0 = 24;
        const px = x0 + s0 * Math.cos(r.th);
        const py = topY + s0 * Math.sin(r.th);
        const secs = 1.25 * (r.t / tMin) ** 1.5;
        const moves = v.kind === 'race' || l.rolls;
        const style = {
          '--x0': `${px}px`, '--y0': `${py}px`, '--dx': `${r.D * Math.cos(r.th)}px`, '--dy': `${r.D * Math.sin(r.th)}px`, '--th': `${(r.th * 180) / Math.PI}deg`,
          transform: `translate(${px}px, ${py}px) rotate(${(r.th * 180) / Math.PI}deg)`,
          ...(go && moves ? anim(true, 'slideDown', secs, 'ease-in') : {}),
        };
        return (
          <g key={i}>
            <polygon points={`${x0},${topY} ${x0 + rampW},${GROUND} ${x0},${GROUND}`} fill="#d9a766" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
            <text x={x0 + rampW - 4} y={GROUND - 4} fontSize="20" textAnchor="middle">🏁</text>
            <g style={style}>
              {v.kind === 'race' ? <Car color={l.color} /> : (
                <g style={{ transformOrigin: '0px -17px', ...(go && l.rolls ? { '--spin': `${Math.round((r.D / 17) * 57)}deg`, ...anim(true, 'spinTo', secs, 'ease-in') } : go ? anim(true, 'wobbleStay', 1.2) : {}) }}>
                  <text x="0" y="-3" textAnchor="middle" fontSize={n === 3 ? 30 : 36}>{l.emoji}</text>
                </g>
              )}
            </g>
          </g>
        );
      })}
    </>
  );
}

/* ------------------------------- more scenes: magnet, melt, mix, plant, wind, push/pull ------------------------------- */
/** Several animations at once: [[name, secs, delaySecs, easing]]. Reduced motion jumps straight to the end. */
const anims = (go, list) => (go ? { animation: list.map(([n, s, d = 0, e = 'ease']) => `${n} ${reduced() ? 0.01 : s}s ${e} ${reduced() ? 0 : d}s forwards`).join(', ') } : {});
const BOTTOM = { transformBox: 'fill-box', transformOrigin: 'center bottom' };

function MagnetScene({ v, go }) {
  return (
    <>
      <Ground />
      <g style={anims(go, [['mgGo', 2.8, 0, 'ease-in-out']])}>
        <text x="52" y="160" textAnchor="middle" fontSize="50">🧲</text>
      </g>
      <g style={v.sticks ? anims(go, [['mgSnap', 2.8, 0, 'ease-in-out']]) : anims(go, [['wobbleStay', 0.9, 1.1]])}>
        <text x="238" y="160" textAnchor="middle" fontSize="46">{v.emoji}</text>
      </g>
    </>
  );
}

function Melt({ v, go }) {
  return (
    <>
      <rect x="0" y="0" width="320" height={GROUND} fill={v.hot ? '#fff4c9' : '#e0f3ff'} />
      <Ground />
      {v.hot ? <text x="262" y="62" textAnchor="middle" fontSize="54">☀️</text> : (
        <>
          <text x="60" y="52" fontSize="34">❄️</text><text x="250" y="70" fontSize="40">❄️</text><text x="150" y="40" fontSize="26">❄️</text>
        </>
      )}
      {v.melts && <ellipse cx="160" cy="166" rx="52" ry="7" fill="#8ecbff" style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: 'scale(.05)', ...anims(go, [['puddleGrow', 2.2, 0.6, 'ease-out']]) }} />}
      <g style={{ ...BOTTOM, ...(v.melts ? anims(go, [['meltDown', 2.6, 0, 'ease-in']]) : anims(go, [['wobbleStay', 1.1]])) }}>
        <text x="160" y="160" textAnchor="middle" fontSize="76">{v.emoji}</text>
      </g>
    </>
  );
}

function Mix({ v, go }) {
  const a = col(v.a); const b = col(v.b); const r = col(v.result);
  return (
    <>
      <circle cx="160" cy="95" r="54" fill={r} stroke={INK} strokeWidth="3" style={{ opacity: 0, transformBox: 'fill-box', transformOrigin: 'center', ...anims(go, [['popIn', 0.7, 1.2, 'ease-out']]) }} />
      <g style={{ '--mx': '66px', ...anims(go, [['slideBy', 1.2, 0, 'ease-in'], ['fadeOut', 0.3, 1.1]]) }}>
        <circle cx="86" cy="95" r="40" fill={a} stroke={INK} strokeWidth="3" />
      </g>
      <g style={{ '--mx': '-66px', ...anims(go, [['slideBy', 1.2, 0, 'ease-in'], ['fadeOut', 0.3, 1.1]]) }}>
        <circle cx="234" cy="95" r="40" fill={b} stroke={INK} strokeWidth="3" />
      </g>
      <text x="160" y="108" textAnchor="middle" fontSize="34" fontWeight="900" fill={INK} style={go ? { opacity: 0 } : undefined}>+</text>
    </>
  );
}

function Plant({ v, go }) {
  const grows = v.grows;
  const stemStyle = { ...BOTTOM, transform: 'scaleY(.04)', ...(grows ? anims(go, [['growUp', 2.2, 0.2, 'ease-out']]) : anims(go, [['wilt', 2.8, 0.2, 'ease-in-out']])) };
  return (
    <>
      <rect x="0" y="0" width="320" height={GROUND} fill="#eaf7ff" />
      <Ground />
      {v.sun && <text x="52" y="62" textAnchor="middle" fontSize="52">☀️</text>}
      {v.water && [118, 158, 198].map((x, i) => <text key={x} x={x} y="34" textAnchor="middle" fontSize="26" style={go ? { animation: `rain 1.4s linear ${i * 0.45}s infinite` } : undefined}>💧</text>)}
      <g style={stemStyle}><rect x="156" y="66" width="8" height="78" rx="4" fill={grows ? '#22a45d' : '#a8a35a'} /></g>
      {grows && <g style={{ opacity: 0, ...anims(go, [['popIn', 0.6, 1.5, 'ease-out']]) }}><ellipse cx="136" cy="98" rx="20" ry="9" fill="#4ade80" stroke="#15803d" strokeWidth="2" transform="rotate(-25 136 98)" /><ellipse cx="184" cy="92" rx="20" ry="9" fill="#4ade80" stroke="#15803d" strokeWidth="2" transform="rotate(25 184 92)" /></g>}
      {grows && <g style={{ opacity: 0, transformBox: 'fill-box', transformOrigin: 'center', ...anims(go, [['popIn', 0.6, 2.0, 'ease-out']]) }}><text x="160" y="76" textAnchor="middle" fontSize="40">🌼</text></g>}
      <path d="M 128 142 L 192 142 L 182 172 L 138 172 Z" fill="#c2693a" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <rect x="124" y="136" width="72" height="12" rx="4" fill="#d9824f" stroke={INK} strokeWidth="3" />
    </>
  );
}

function Wind({ v, go }) {
  const xs = v.items.length === 3 ? [150, 205, 260] : [175, 245];
  return (
    <>
      <Ground />
      <line x1="42" y1="122" x2="42" y2="170" stroke={INK} strokeWidth="5" />
      <g style={{ transformOrigin: '42px 106px', ...(go ? { animation: 'fanSpin .5s linear infinite' } : {}) }}>
        {[0, 90, 180, 270].map((r) => <ellipse key={r} cx="42" cy="86" rx="9" ry="19" fill="#60a5fa" stroke={INK} strokeWidth="2.5" transform={`rotate(${r} 42 106)`} />)}
      </g>
      <circle cx="42" cy="106" r="7" fill={INK} />
      {go && [92, 118, 144].map((x, i) => <text key={x} x={x} y={112 + (i % 2) * 12} fontSize="24" style={{ opacity: 0, ...anims(true, [['popIn', 0.5, i * 0.25]]) }}>💨</text>)}
      {v.items.map((it, i) => {
        const wx = 292 - xs[i];
        return (
          <g key={i} style={it.blows ? { '--wx': `${wx}px`, '--wy': '-6px', ...anims(go, [['windAway', 2.2, 0.6, 'ease-in']]) } : anims(go, [['wobbleStay', 1.2, 0.8]])}>
            <g style={{ transformBox: 'fill-box', transformOrigin: 'center', ...(go && it.blows ? { '--spin': '520deg', ...anims(true, [['spinTo', 2.2, 0.6, 'ease-in']]) } : {}) }}><text x={xs[i]} y="160" textAnchor="middle" fontSize="46">{it.emoji}</text></g>
          </g>
        );
      })}
    </>
  );
}

function Wagon({ x }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x="-30" y="-28" width="60" height="20" rx="4" fill="#ef4444" stroke={INK} strokeWidth="3" />
      <circle cx="-17" cy="-7" r="8" fill="#374151" stroke={INK} strokeWidth="2" /><circle cx="17" cy="-7" r="8" fill="#374151" stroke={INK} strokeWidth="2" />
    </g>
  );
}

function Push({ v, go }) {
  const s = v.scene;
  const ball = s === 'strong' || s === 'weak';
  const x0 = s === 'pull' ? 210 : ball ? 108 : 100;
  const mx = s === 'pull' ? -92 : s === 'push' ? 126 : s === 'strong' ? 176 : 34;
  const rope = s === 'pull' ? x0 - 30 - 78 : 0;
  const secs = s === 'weak' ? 1.4 : 2.0;
  return (
    <>
      <Ground />
      <text x="40" y="164" textAnchor="middle" fontSize="58">🧒</text>
      {s === 'pull' && (
        <rect x="76" y="141" width={rope} height="4" rx="2" fill="#92400e" style={{ transformBox: 'fill-box', transformOrigin: 'left center', ...(go ? { '--s': (rope + mx) / rope, ...anims(true, [['ropeShrink', secs, 0, 'ease-in-out']]) } : {}) }} />
      )}
      <g transform={`translate(0 ${GROUND})`}>
        <g style={{ '--mx': `${mx}px`, ...anims(go, [['slideBy', secs, 0.1, ball ? 'ease-out' : 'ease-in-out']]) }}>
          {ball ? (
            <g style={{ transformOrigin: `${x0}px -18px`, ...(go ? { '--spin': `${Math.round(mx * 5)}deg`, ...anims(true, [['spinTo', secs, 0.1, 'ease-out']]) } : {}) }}>
              <text x={x0} y="-4" textAnchor="middle" fontSize="38">⚽</text>
            </g>
          ) : <Wagon x={x0} />}
        </g>
      </g>
    </>
  );
}

/* ------------------------------- wrapper ------------------------------- */
export default function Motion({ v, revealed }) {
  const manual = revealed === undefined;
  const [run, setRun] = useState(0); // bumping this remounts the scene so it starts from the set-up picture
  const [go, setGo] = useState(false);
  const [played, setPlayed] = useState(false);
  const timer = useRef(null);
  const start = (delay) => {
    clearTimeout(timer.current);
    setGo(false); setRun((r) => r + 1); setPlayed(true);
    timer.current = setTimeout(() => setGo(true), delay);
  };
  useEffect(() => {
    clearTimeout(timer.current);
    if (revealed) start(500);
    else { setGo(false); setPlayed(false); }
    return () => clearTimeout(timer.current);
  }, [revealed]); // eslint-disable-line react-hooks/exhaustive-deps

  const Scene = { stack: Stack, seesaw: Seesaw, float: Tub, race: Lanes, roll: Lanes, magnet: MagnetScene, melt: Melt, mix: Mix, plant: Plant, wind: Wind, push: Push }[v.kind];
  const label = v.alt || 'A science experiment';
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="rounded-3xl bg-gradient-to-b from-sky-50 to-white border-2 border-line card-shadow overflow-hidden w-full max-w-[460px]">
        <svg key={run} viewBox="0 0 320 190" className="w-full h-auto block" role="img" aria-label={label}>
          {Scene && <Scene v={v} go={go} />}
        </svg>
      </div>
      {manual && !played && (
        <button type="button" onClick={() => start(150)} className="press h-12 px-5 rounded-2xl bg-emerald-500 text-white font-extrabold text-lg flex items-center gap-2"><Play size={20} /> Test it!</button>
      )}
      {!manual && !played && <p className="text-ink-soft font-extrabold text-base">🤔 Make your guess. Then we'll test it!</p>}
      {played && (
        <button type="button" onClick={() => start(150)} className="press h-11 px-4 rounded-2xl bg-white border-2 border-line text-ink font-extrabold flex items-center gap-2"><RotateCcw size={18} /> Watch again</button>
      )}
    </div>
  );
}
