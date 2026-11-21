import { shuffle } from '../lib/rng.js';

export const NAMES = ['Mary', 'Karen', 'Lisa', 'Julie', 'Ben', 'Tom', 'Pete', 'Bob', 'Anne', 'Sue', 'Jane', 'Beth', 'Kate', 'Amy', 'Nancy', 'Linda', 'Carol', 'Ruth', 'Jill', 'Joan', 'Meg', 'Liz', 'Dan', 'Jim', 'Joe', 'Max', 'Ned', 'Tim', 'Dave', 'Mike', 'Nick', 'Paul', 'Mark', 'John', 'Jack', 'Luke', 'Matt', 'Steve', 'Greg', 'Ken', 'Rob', 'Ted', 'Al', 'Hank', 'Frank', 'Henry'];

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

/** Reuse a question from another age's generator under this age's topic id. */
export const retopic = (q, topic) => (q ? { ...q, topic, key: `${topic}|${q.key}` } : q);

/** For read-aloud ages: give a question a plain-English `speak` built from its prompt if it has none. */
export function withSpeak(q, toSpeech) {
  if (!q || q.speak) return q;
  const seq = q.visual?.type === 'sequence' ? `${q.visual.terms.filter((t) => t !== '·').join(', ')}.` : null;
  const parts = [seq, q.prompt, q.display && !q.prompt?.includes(q.display) ? q.display : null].filter(Boolean)
    .map((t) => toSpeech(String(t).replace(/☐/g, 'box')));
  return { ...q, speak: parts.join('. ').replace(/\.\./g, '.') };
}
