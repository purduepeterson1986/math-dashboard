import { shuffle } from '../lib/rng.js';

export const NAMES = ['Ava', 'Liam', 'Maya', 'Noah', 'Zoe', 'Eli', 'Priya', 'Mateo', 'Leah', 'Omar', 'Ruby', 'Kai', 'Nora', 'Theo', 'Isla', 'Jonah', 'Amara', 'Felix'];

export const COLORS = {
  red: '#ef4444', blue: '#3b82f6', yellow: '#f5b70a', green: '#22c55e',
  purple: '#a855f7', orange: '#f97316', pink: '#ec4899', teal: '#14b8a6',
};

/**
 * Shuffle the correct option in with distractors.
 * Each option: { text?, visual? }. Returns { choices, answer } where answer is the id.
 */
export function makeChoices(correct, distractors) {
  const all = shuffle([{ ...correct, _ok: true }, ...distractors]);
  const choices = all.map((c, i) => {
    const { _ok, ...rest } = c;
    return { id: `c${i}`, ...rest };
  });
  const answer = choices[all.findIndex((c) => c._ok)].id;
  return { choices, answer };
}

/** Can `other` be a wrong answer when the right answer is `target`? (A square is also a rectangle and a rhombus.) */
export const distinctShape = (target, other) => other !== target && !(other === 'square' && (target === 'rectangle' || target === 'diamond'));

/** Plural helper: plural(3,'apple') -> '3 apples' */
export const plural = (n, word, pl) => `${n} ${n === 1 ? word : pl || `${word}s`}`;
