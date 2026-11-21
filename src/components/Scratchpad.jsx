import React, { useEffect, useRef, useState } from 'react';
import { Pencil, Eraser, Undo2, Trash2, Check } from 'lucide-react';

const COLORS = [
  { id: '#1f2347', label: 'Black' },
  { id: '#2563eb', label: 'Blue' },
  { id: '#dc2626', label: 'Red' },
  { id: '#16a34a', label: 'Green' },
];

/** Header button that turns pen mode on or off. */
export function PenButton({ on, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} aria-label={on ? 'Close scratchpad' : 'Open scratchpad'}
      className={`press h-12 px-3.5 rounded-2xl border flex items-center gap-1.5 font-extrabold card-shadow ${on ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-line text-ink-muted'}`}>
      <Pencil size={22} /><span className="text-sm">{on ? 'Pen on' : 'Pen off'}</span>
    </button>
  );
}

/**
 * Drawing layer that sits over the problem. Ink is kept per question (inkRef: {[key]: strokes}),
 * stays visible when the pen is off, and never blocks taps unless the pen is on.
 * Once a stylus is seen, finger touches are ignored so a resting palm can't draw.
 */
export default function Scratchpad({ qKey, active, inkRef, onClose }) {
  const canvas = useRef(null);
  const wrap = useRef(null);
  const [tool, setTool] = useState({ color: COLORS[0].id, erase: false });
  const [, bump] = useState(0);
  const penSeen = useRef(false);
  const live = useRef(null); // stroke being drawn
  const activeId = useRef(null);

  const strokes = () => (inkRef.current[qKey] ||= []);

  const paint = () => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const all = live.current ? [...strokes(), live.current] : strokes();
    for (const s of all) {
      ctx.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over';
      ctx.strokeStyle = s.color; ctx.fillStyle = s.color;
      ctx.lineWidth = s.erase ? 28 : 4;
      const p = s.pts;
      if (p.length === 1) { ctx.beginPath(); ctx.arc(p[0][0], p[0][1], ctx.lineWidth / 2, 0, 7); ctx.fill(); continue; }
      ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
      for (let i = 1; i < p.length; i++) {
        const mx = (p[i - 1][0] + p[i][0]) / 2; const my = (p[i - 1][1] + p[i][1]) / 2;
        ctx.quadraticCurveTo(p[i - 1][0], p[i - 1][1], mx, my);
      }
      ctx.lineTo(p[p.length - 1][0], p[p.length - 1][1]);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  useEffect(() => {
    const c = canvas.current; const w = wrap.current;
    if (!c || !w) return undefined;
    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      const r = w.getBoundingClientRect();
      c.width = Math.max(1, Math.round(r.width * dpr));
      c.height = Math.max(1, Math.round(r.height * dpr));
      paint();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(w);
    return () => ro.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { live.current = null; paint(); }, [qKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const pos = (e) => {
    const r = canvas.current.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const down = (e) => {
    if (!active) return;
    if (e.pointerType === 'pen') penSeen.current = true;
    if (e.pointerType === 'touch' && penSeen.current) return; // palm rejection
    if (activeId.current !== null) return;
    activeId.current = e.pointerId;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    live.current = { color: tool.color, erase: tool.erase, pts: [pos(e)] };
    paint();
  };
  const move = (e) => {
    if (e.pointerId !== activeId.current || !live.current) return;
    const co = e.nativeEvent.getCoalescedEvents?.();
    const evs = co && co.length ? co : [e.nativeEvent];
    const r = canvas.current.getBoundingClientRect();
    for (const ev of evs) live.current.pts.push([ev.clientX - r.left, ev.clientY - r.top]);
    paint();
  };
  const up = (e) => {
    if (e.pointerId !== activeId.current) return;
    activeId.current = null;
    if (live.current) { strokes().push(live.current); live.current = null; }
    paint(); bump((n) => n + 1);
  };

  const undo = () => { strokes().pop(); paint(); bump((n) => n + 1); };
  const clear = () => { inkRef.current[qKey] = []; paint(); bump((n) => n + 1); };
  const hasInk = strokes().length > 0;

  return (
    <div ref={wrap} className="absolute inset-0 rounded-[28px] overflow-hidden" style={{ pointerEvents: active ? 'auto' : 'none' }}>
      <canvas ref={canvas} className="absolute inset-0 w-full h-full"
        style={{ touchAction: active ? 'none' : 'auto', pointerEvents: active ? 'auto' : 'none', cursor: active ? 'crosshair' : 'default' }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
      {active && (
        <div className="absolute left-3 bottom-3 right-3 flex justify-center pointer-events-none">
          <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-3xl bg-white/95 border border-line card-shadow p-2">
            {COLORS.map((c) => (
              <button key={c.id} type="button" aria-label={`${c.label} pen`} onClick={() => setTool({ color: c.id, erase: false })}
                className={`press w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${!tool.erase && tool.color === c.id ? 'border-ink' : 'border-transparent'}`}>
                <span className="w-7 h-7 rounded-full" style={{ background: c.id }} />
              </button>
            ))}
            <button type="button" aria-label="Eraser" aria-pressed={tool.erase} onClick={() => setTool((t) => ({ ...t, erase: true }))}
              className={`press w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${tool.erase ? 'border-ink bg-brand-50' : 'border-transparent'}`}><Eraser size={24} /></button>
            <button type="button" aria-label="Undo" disabled={!hasInk} onClick={undo}
              className="press w-12 h-12 rounded-2xl flex items-center justify-center disabled:opacity-30"><Undo2 size={24} /></button>
            <button type="button" aria-label="Clear all" disabled={!hasInk} onClick={clear}
              className="press w-12 h-12 rounded-2xl flex items-center justify-center text-bad disabled:opacity-30"><Trash2 size={24} /></button>
            <button type="button" aria-label="Done" onClick={onClose}
              className="press h-12 px-4 rounded-2xl bg-brand-600 text-white font-extrabold flex items-center gap-1"><Check size={20} />Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
