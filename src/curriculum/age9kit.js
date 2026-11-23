// Small helpers shared by the Age 9 generators (age9.js, age9a.js, age9b.js).
import { rand, pick, sample, shuffle, chance } from '../lib/rng.js';
import { makeChoices, NAMES } from './shared.js';

export { rand, pick, sample, shuffle, chance };
/** Pick by level: easy / standard / challenge. */
export const by = (d, e, s, c) => (d === 'easy' ? e : d === 'challenge' ? c : s);
export const nm = () => pick(NAMES);
/** Two different names. */
export const two = () => sample(NAMES, 2);
export const fmt = (n) => Number(n).toLocaleString('en-US');
/** Typed whole-number answer. */
export const kp = (o) => ({ input: 'keypad', answerLabel: fmt(o.answer), ...o, answer: String(o.answer) });
/** A story banner, only in Story mode. */
export const st = (mode, emoji, title) => (mode === 'story' ? { emoji, title } : undefined);
/** Multiple choice. `wrong` may hold repeats or the right answer: both are dropped. At most 3 wrong options are used. */
export function choose(o, correct, wrong) {
  const seen = new Set([correct.text]);
  const w = [];
  for (const x of wrong) {
    if (x?.text === undefined || seen.has(x.text)) continue;
    seen.add(x.text); w.push(x);
  }
  const { choices, answer } = makeChoices(correct, w.slice(0, 3));
  return { input: 'choice', choices, answer, answerLabel: correct.text, ...o };
}
/** Multiple choice from plain strings. */
export const pickText = (o, right, wrongs) => choose(o, { text: right }, wrongs.map((text) => ({ text })));
/** Unique wrong numbers near `n` (never n, never below `min`). */
export function near(n, offsets, min = 0) {
  const out = [];
  for (const o of shuffle(offsets)) { const v = n + o; if (v !== n && v >= min && !out.includes(v)) out.push(v); }
  return out;
}
/** Break a number into its place values: 3,405 -> [3000, 400, 5]. */
export const places = (n) => String(n).split('').map((c, i, a) => Number(c) * 10 ** (a.length - 1 - i)).filter(Boolean);
/** Product explained by partial products. */
export function explainMul(a, b) {
  const [big, small] = a >= b ? [a, b] : [b, a];
  const parts = places(small).map((p) => [p, big * p]);
  if (small < 10) return `${fmt(big)} × ${small}: ` + places(big).map((p) => `${fmt(p)} × ${small} = ${fmt(p * small)}`).join(', ') + `. Add: ${fmt(a * b)}.`;
  return `${fmt(big)} × ${small}: ` + parts.map(([p, v]) => `${fmt(big)} × ${fmt(p)} = ${fmt(v)}`).join(', ') + `. Add: ${fmt(a * b)}.`;
}
/** Digits 0-9 in random order with no repeats; used when "the value of the 7" must be unambiguous. */
export function distinctNumber(len) {
  let ds;
  do { ds = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, len); } while (ds[0] === 0);
  return ds;
}
/** A number in words, up to 9,999,999. */
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function below1000(n) {
  const parts = [];
  if (n >= 100) { parts.push(`${ONES[Math.floor(n / 100)]} hundred`); n %= 100; }
  if (n >= 20) { parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '')); } else if (n > 0) parts.push(ONES[n]);
  return parts.join(' ');
}
export function inWords(n) {
  if (n === 0) return 'zero';
  const out = [];
  if (n >= 1e6) { out.push(`${below1000(Math.floor(n / 1e6))} million`); n %= 1e6; }
  if (n >= 1000) { out.push(`${below1000(Math.floor(n / 1000))} thousand`); n %= 1000; }
  if (n > 0) out.push(below1000(n));
  return out.join(' ');
}
/** Clock text: ts(9, 5) -> "9:05". */
export const ts = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
/** Decimal text, trimmed of trailing zeros but keeping at least one decimal place: 0.50 -> "0.5", 3 -> "3.0". */
export function dec(x, places = 3) {
  let s = (Math.round(x * 10 ** places) / 10 ** places).toFixed(places);
  s = s.replace(/0+$/, '');
  if (s.endsWith('.')) s += '0';
  return s;
}
export const money = (cents) => `$${(cents / 100).toFixed(2)}`;
