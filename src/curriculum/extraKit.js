// Small helpers shared by the extra question generators (extraEarly.js, extraMid.js).
import { pick, shuffle } from '../lib/rng.js';
import { makeChoices, NAMES } from './shared.js';

export const nm = () => pick(NAMES);
export const emo = (e, size = 0.9) => ({ type: 'emoji', emoji: e, size });
/** A picture-and-words story banner, only in Story mode. */
export const st = (mode, emoji, title) => (mode === 'story' ? { emoji, title } : undefined);
/** Multiple-choice question: `correct` and each of `wrong` are { text?, visual? }. */
export function ch(o, correct, wrong) {
  const { choices, answer } = makeChoices(correct, wrong);
  return { input: 'choice', choices, answer, answerLabel: correct.text ?? o.answerLabel, ...o };
}
/** Whole-number answer: the big tap pad for 0 to 10, the keypad above that. */
export function kid(o) {
  const a = o.answer;
  return { input: a <= 10 ? 'kidpad' : 'keypad', answerLabel: String(a), ...o, answer: String(a) };
}
/** Whole-number answer that always uses the keypad. */
export function kp(o) { return { input: 'keypad', answerLabel: Number(o.answer).toLocaleString('en-US'), ...o, answer: String(o.answer) }; }
export const txt = (t) => ({ text: String(t), big: true });
export const uniq = (arr) => [...new Set(arr)];
/** n distinct wrong numbers near `target`, never equal to it, never below `min`. */
export function nearby(target, n, min = 0, spread = 3) {
  const out = new Set();
  let guard = 0;
  while (out.size < n && guard++ < 200) {
    const v = target + (Math.floor(Math.random() * (spread * 2 + 1)) - spread);
    if (v !== target && v >= min) out.add(v);
  }
  for (let v = min; out.size < n; v++) if (v !== target) out.add(v);
  return shuffle([...out]).slice(0, n);
}
export const money = (cents) => `$${(cents / 100).toFixed(2)}`;
