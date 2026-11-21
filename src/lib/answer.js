import { gcd } from './rng.js';

const NUM = /^-?(\d+\.?\d*|\.\d+)$/;

/** Parse keypad text ("3/4", "-0.5", ".25", "12") into a number, or null. */
export function parseValue(raw) {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).replace(/[\s,]/g, '').replace(/−/g, '-');
  if (!s) return null;
  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length !== 2 || !NUM.test(parts[0]) || !NUM.test(parts[1])) return null;
    const n = parseFloat(parts[0]);
    const d = parseFloat(parts[1]);
    if (d === 0) return null;
    return n / d;
  }
  if (!NUM.test(s)) return null;
  return parseFloat(s);
}

function isSimplified(raw) {
  const s = String(raw).replace(/\s/g, '').replace(/−/g, '-');
  if (!s.includes('/')) return true; // whole numbers / decimals count as simplest
  const [n, d] = s.split('/');
  if (!/^-?\d+$/.test(n) || !/^-?\d+$/.test(d)) return false;
  return gcd(parseInt(n, 10), parseInt(d, 10)) === 1 && Math.abs(parseInt(d, 10)) !== 1;
}

/** Is `given` a correct answer to question `q`? */
export function checkAnswer(given, q) {
  if (given === null || given === undefined || given === '') return false;
  if (q.input === 'choice') return String(given) === String(q.answer);
  const g = parseValue(given);
  const a = parseValue(q.answer);
  if (g === null || a === null) return false;
  const tol = q.tolerance ?? 1e-6;
  const ok = Math.abs(g - a) <= tol + 1e-9 * Math.abs(a);
  if (!ok) return false;
  if (q.mustSimplify && !isSimplified(given)) return false;
  return true;
}

/** Human label for what the student entered. */
export function givenLabel(given, q) {
  if (given === null || given === undefined || given === '') return '—';
  if (q.input === 'choice') {
    const c = q.choices?.find((x) => x.id === given);
    return c ? c.text ?? c.label ?? '(picture)' : String(given);
  }
  return String(given).replace(/-/g, '−');
}
