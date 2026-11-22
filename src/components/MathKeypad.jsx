import React, { useEffect, useRef } from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';
import { sfx } from '../lib/audio.js';

const MAX_LEN = 12;

/** Apply a key to the current entry, enforcing a sane numeric format. */
export function applyKey(value, key) {
  if (key === 'back') return value.slice(0, -1);
  if (key === 'clear') return '';
  if (value.length >= MAX_LEN) return value;
  const lastPart = value.split('/').pop();
  if (key === '-') {
    // toggle sign of the current part
    if (value.includes('/')) {
      const [n, d] = value.split('/');
      return `${n}/${d.startsWith('-') ? d.slice(1) : `-${d}`}`;
    }
    return value.startsWith('-') ? value.slice(1) : `-${value}`;
  }
  if (key === '.') {
    if (lastPart.includes('.')) return value;
    return value + (lastPart === '' || lastPart === '-' ? '0.' : '.');
  }
  if (key === '/') {
    if (value.includes('/') || value === '' || value === '-' || value.endsWith('.')) return value;
    return `${value}/`;
  }
  if (/^\d$/.test(key)) {
    if (lastPart === '0') return value.slice(0, -1) + key; // no leading zeros
    if (lastPart === '-0') return value.slice(0, -1) + key;
    return value + key;
  }
  return value;
}

/** Custom on-screen keypad for Age 12+. No <input>, so the iPad keyboard never appears. */
export default function MathKeypad({ value, onChange, onSubmit, submitLabel = 'Submit', disabled, allowFraction = true, compact, simple, big }) {
  const valRef = useRef(value);
  valRef.current = value;

  const press = (key) => {
    if (disabled) return;
    sfx.tap();
    valRef.current = applyKey(valRef.current, key);
    onChange(valRef.current);
  };

  // hardware keyboard support (Magic Keyboard / desktop)
  useEffect(() => {
    const h = (e) => {
      if (disabled || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (/^\d$/.test(k) || (!simple && (k === '.' || k === '/' || k === '-'))) { e.preventDefault(); valRef.current = applyKey(valRef.current, k); onChange(valRef.current); }
      else if (k === 'Backspace') { e.preventDefault(); valRef.current = applyKey(valRef.current, 'back'); onChange(valRef.current); }
      else if (k === 'Escape') { valRef.current = ''; onChange(''); }
      else if (k === 'Enter') { e.preventDefault(); onSubmit?.(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [disabled, onChange, onSubmit, simple]);

  const h = simple && big ? (compact ? 'h-14' : 'h-[72px]') : compact ? 'h-14' : 'h-16';
  const Key = ({ k, label, className = '', aria }) => (
    <button
      type="button"
      aria-label={aria || String(label ?? k)}
      disabled={disabled || (k === '/' && !allowFraction)}
      onPointerDown={(e) => { e.preventDefault(); press(k); }}
      className={`press key-shadow ${h} min-w-12 rounded-2xl ${simple && big ? 'text-4xl font-black' : 'text-2xl font-bold'} flex items-center justify-center disabled:opacity-35 ${className || 'bg-white text-ink active:bg-brand-50'}`}
    >
      {label ?? k}
    </button>
  );

  const submitBtn = (extra = '') => (
    <button
      type="button"
      disabled={disabled || !value || value === '-' || value.endsWith('/')}
      onClick={() => onSubmit?.()}
      className={`press ${h} shrink-0 rounded-2xl bg-brand-600 text-white ${simple && big ? 'text-2xl' : 'text-lg'} font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-brand-600/25 disabled:opacity-40 active:bg-brand-700 ${extra}`}
    >
      {submitLabel}<CornerDownLeft size={18} />
    </button>
  );

  // Whole numbers only (younger ages): no fraction bar, decimal point or negative sign.
  if (simple) {
    return (
      <div className="grid grid-cols-3 gap-2 select-none" role="group" aria-label="Number keypad">
        <Key k="7" /><Key k="8" /><Key k="9" />
        <Key k="4" /><Key k="5" /><Key k="6" />
        <Key k="1" /><Key k="2" /><Key k="3" />
        <Key k="back" aria="Backspace" label={<Delete size={28} />} className="bg-slate-200/80 text-ink active:bg-slate-300" />
        <Key k="0" />
        <Key k="clear" aria="Clear" label={<span className="text-lg font-bold">Clear</span>} className="bg-slate-200/80 text-ink active:bg-slate-300" />
        {submitBtn('col-span-3')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 select-none" role="group" aria-label="Number keypad">
      <Key k="7" /><Key k="8" /><Key k="9" /><Key k="back" aria="Backspace" label={<Delete size={26} />} className="bg-slate-200/80 text-ink active:bg-slate-300" />
      <Key k="4" /><Key k="5" /><Key k="6" /><Key k="clear" aria="Clear" label={<span className="text-base font-bold">Clear</span>} className="bg-slate-200/80 text-ink active:bg-slate-300" />
      <Key k="1" /><Key k="2" /><Key k="3" /><Key k="/" label={<span className="text-2xl">⁄</span>} aria="Fraction bar" className="bg-brand-50 text-brand-700 active:bg-brand-100" />
      <Key k="-" label="±" aria="Negative" className="bg-brand-50 text-brand-700 active:bg-brand-100" /><Key k="0" /><Key k="." aria="Decimal point" />
      {submitBtn()}
    </div>
  );
}
