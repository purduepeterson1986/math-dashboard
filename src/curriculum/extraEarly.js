// Extra question types for the early ages (3 to 6): new topics (position words, patterns, halves and fourths) and
// more variety for topics that had small pools. Every generator takes (mode, lv) where lv is 0, 1 or 2
// (Warm-up, Standard, Stretch) and returns a question in the app's usual shape, with a plain-English `speak`.
import { rand, pick, sample, shuffle, chance } from '../lib/rng.js';
import { ch, kid, nm, st, emo, txt, nearby, uniq } from './extraKit.js';

const lvl = (n, a, b, c) => (n === 0 ? a : n === 1 ? b : c);
const spoken = (t) => t.replace(/[A-Z]{2,}/g, (w) => w.toLowerCase());

/* ------------------------------ Position words ------------------------------ */
const PIC = [['🐱', 'cat'], ['🐶', 'dog'], ['🐰', 'bunny'], ['🐸', 'frog'], ['🐥', 'chick'], ['🦆', 'duck'], ['🍎', 'apple'], ['⚽', 'ball'],
  ['🚗', 'car'], ['🌳', 'tree'], ['🏠', 'house'], ['⭐', 'star'], ['🎈', 'balloon'], ['🌸', 'flower'], ['🍌', 'banana'], ['🐢', 'turtle'],
  ['🦋', 'butterfly'], ['🍪', 'cookie']];
const ORD = ['first', 'second', 'third', 'fourth', 'fifth'];
const optPic = (p) => ({ visual: emo(p[0], 0.9) });

/** "Which one is above the cat?", "Which is between…", "Which is third from the left?" with a little picture scene. */
export function position(mode, lv) {
  const topic = 'position';
  const fmt = pick(lvl(lv, ['top', 'bottom', 'above', 'below'], ['middle', 'above', 'below', 'next', 'between', 'first', 'last'], ['left', 'right', 'between', 'ordinal', 'ordinal', 'leftOf', 'rightOf']));
  const n = fmt === 'ordinal' ? pick([4, 5]) : fmt === 'between' ? (lv === 1 ? 3 : pick([3, 4, 5])) : (fmt === 'leftOf' || fmt === 'rightOf') ? pick([3, 4, 5]) : fmt === 'middle' ? 3 : lv === 0 ? 2 : 3;
  const pool = sample(PIC, n + 2);
  const scene = pool.slice(0, n); const spares = pool.slice(n);
  const vertical = ['top', 'bottom', 'above', 'below', 'middle'].includes(fmt);
  let ans; let prompt; let named = []; let hint; let why;
  const others = (skip) => scene.filter((p) => !skip.includes(p));
  if (fmt === 'top') { ans = scene[0]; prompt = 'Which one is on TOP?'; hint = 'Top means the highest one.'; why = 'is on top'; }
  else if (fmt === 'bottom') { ans = scene[n - 1]; prompt = 'Which one is on the BOTTOM?'; hint = 'Bottom means the lowest one.'; why = 'is on the bottom'; }
  else if (fmt === 'above') { const i = rand(1, n - 1); ans = scene[i - 1]; named = [scene[i]]; prompt = `Which one is RIGHT ABOVE the ${scene[i][1]}?`; hint = 'Above means higher up, right over it.'; why = `is right above the ${scene[i][1]}`; }
  else if (fmt === 'below') { const i = rand(0, n - 2); ans = scene[i + 1]; named = [scene[i]]; prompt = `Which one is RIGHT BELOW the ${scene[i][1]}?`; hint = 'Below means lower down, right under it.'; why = `is right below the ${scene[i][1]}`; }
  else if (fmt === 'middle') { ans = scene[1]; prompt = 'Which one is in the MIDDLE?'; hint = 'The middle one has one above it and one below it.'; why = 'is in the middle'; }
  else if (fmt === 'next') { const end = chance(0.5) ? 0 : n - 1; ans = scene[end === 0 ? 1 : n - 2]; named = [scene[end]]; prompt = `Which one is NEXT TO the ${scene[end][1]}?`; hint = 'Next to means right beside it.'; why = `is next to the ${scene[end][1]}`; }
  else if (fmt === 'between') { const j = rand(1, n - 2); ans = scene[j]; named = [scene[j - 1], scene[j + 1]]; prompt = `Which one is BETWEEN the ${scene[j - 1][1]} and the ${scene[j + 1][1]}?`; hint = 'Between means in the middle of the two.'; why = `is between the ${scene[j - 1][1]} and the ${scene[j + 1][1]}`; }
  else if (fmt === 'first') { ans = scene[0]; prompt = 'Which one is FIRST in line? Start on the left.'; hint = 'First is the one at the very start, on the left.'; why = 'is first'; }
  else if (fmt === 'last') { ans = scene[n - 1]; prompt = 'Which one is LAST in line? The line starts on the left.'; hint = 'Last is the one at the very end, on the right.'; why = 'is last'; }
  else if (fmt === 'left') { ans = scene[0]; prompt = 'Which one is on the LEFT?'; hint = 'Left is the side of your left hand.'; why = 'is on the left'; }
  else if (fmt === 'right') { ans = scene[n - 1]; prompt = 'Which one is on the RIGHT?'; hint = 'Right is the side of your right hand.'; why = 'is on the right'; }
  else if (fmt === 'ordinal') { const i = rand(1, n - 1); ans = scene[i]; prompt = `Which one is ${ORD[i].toUpperCase()} from the left?`; hint = `Count from the left: ${ORD.slice(0, i + 1).join(', ')}.`; why = `is ${ORD[i]} from the left`; }
  else if (fmt === 'leftOf') { const k = rand(1, n - 1); ans = scene[k - 1]; named = [scene[k]]; prompt = `Which one is on the LEFT of the ${scene[k][1]}?`; hint = 'Look at the side to the left of it.'; why = `is on the left of the ${scene[k][1]}`; }
  else { const k = rand(0, n - 2); ans = scene[k + 1]; named = [scene[k]]; prompt = `Which one is on the RIGHT of the ${scene[k][1]}?`; hint = 'Look at the side to the right of it.'; why = `is on the right of the ${scene[k][1]}`; }
  const want = lv === 0 ? 2 : fmt === 'ordinal' || n >= 5 ? 4 : 3;
  const wrong = uniq([...shuffle(others([ans, ...named])), ...spares]).filter((p) => p !== ans).slice(0, want - 1);
  const rows = vertical ? scene.map((p) => [p[0]]) : [scene.map((p) => p[0])];
  return ch({
    key: `pos:${fmt}:${scene.map((p) => p[0]).join('')}`, topic, story: st(mode, '🧭', 'Where Is It?'), prompt, speak: spoken(prompt),
    visual: { type: 'layout', rows }, hints: [hint], summary: `Position: ${fmt}`, explanation: `The ${ans[1]} ${why}.`, answerLabel: ans[1],
  }, optPic(ans), wrong.map(optPic));
}

/* ------------------------------ Patterns: growing & rules ------------------------------ */
export function growPattern(mode, lv) {
  const topic = 'patterns';
  const e = pick(['🔵', '⭐', '🍎', '🐟', '🌼', '🍪', '🔺', '🐞']);
  const step = lvl(lv, 1, pick([1, 2]), pick([2, 3]));
  const start = rand(1, lvl(lv, 3, 4, 5));
  const counts = [0, 1, 2].map((i) => start + i * step);
  const which = lv === 2 && chance(0.4) ? 5 : 4;
  const ans = start + (which - 1) * step;
  const nth = which === 5 ? 'fifth' : 'next';
  const prompt = which === 5 ? 'Each group has more. How many will be in the FIFTH group?' : 'Each group has more. How many will be in the NEXT group?';
  return kid({
    key: `grow:${e}:${start}:${step}:${which}`, topic, story: st(mode, '🧩', 'Growing Groups'), answer: ans, prompt,
    speak: `Each group has more. How many will be in the ${nth} group?`,
    visual: { type: 'groups', groups: counts.map((c) => ({ emoji: e, count: c })), op: '→' },
    hints: [`Each group has ${step} more than the one before.`, `${counts.join(', ')}…`], summary: `Growing pattern +${step}`,
    explanation: `The groups grow by ${step}: ${counts.join(', ')}, then ${Array.from({ length: which - 3 }, (_, i) => start + (3 + i) * step).join(', ')}. The answer is ${ans}.`,
  });
}

const RULES0 = [['add', 1], ['add', 2], ['add', 10]];
const RULES1 = [['add', 2], ['add', 3], ['add', 4], ['add', 5], ['add', 10], ['sub', 1], ['sub', 2]];
const RULES2 = [['add', 3], ['add', 4], ['add', 6], ['add', 7], ['add', 9], ['add', 11], ['sub', 3], ['sub', 5], ['sub', 10], ['double', 2]];
export function numberRule(mode, lv, max = 100) {
  const topic = 'patterns';
  const [kind, k] = pick(lvl(lv, RULES0, RULES1, RULES2));
  let terms;
  if (kind === 'double') { const s = rand(1, 4); terms = [s, s * 2, s * 4, s * 8, s * 16]; }
  else {
    const dir = kind === 'add' ? 1 : -1;
    const start = kind === 'add' ? rand(0, Math.min(20, max - 5 * k)) : rand(5 * k + 2, Math.min(max, 5 * k + 40));
    terms = Array.from({ length: 5 }, (_, i) => start + dir * i * k);
  }
  const ruleText = kind === 'add' ? `add ${k}` : kind === 'sub' ? `subtract ${k}` : 'double each time';
  const shown = terms.slice(0, 4); const next = terms[4];
  if (lv >= 1 && chance(0.4)) {
    const wrongRules = kind === 'double' ? ['add 2', 'add 4', 'subtract 2'] : [kind === 'add' ? `add ${k + 1}` : `subtract ${k + 1}`, kind === 'add' ? `subtract ${k}` : `add ${k}`, kind === 'add' ? `add ${Math.max(1, k - 1)}` : `subtract ${Math.max(1, k - 1)}`];
    const wrong = uniq(wrongRules).filter((w) => w !== ruleText).slice(0, 3);
    return ch({
      key: `rule:which:${terms[0]}:${kind}:${k}`, topic, story: st(mode, '🧩', 'Number Rules'), prompt: `${shown.join(', ')}… What is the rule?`,
      speak: `${shown.join(', ')}. What is the rule?`, visual: { type: 'sequence', terms: shown.map(String), blank: true },
      hints: ['Look at how much the numbers change each time.'], summary: `Rule for ${shown.join(', ')}`, answerLabel: ruleText,
      explanation: `${shown[0]} to ${shown[1]} is ${ruleText}.`,
    }, { text: ruleText }, wrong.map((text) => ({ text })));
  }
  return kid({
    key: `rule:next:${terms[0]}:${kind}:${k}`, topic, story: st(mode, '🧩', 'Number Rules'), answer: next, prompt: 'What number comes next?',
    speak: `${shown.join(', ')}. What number comes next?`, visual: { type: 'sequence', terms: shown.map(String), blank: true },
    hints: [`The rule is ${ruleText}.`], summary: `${shown.join(', ')}, ?`, explanation: `The rule is ${ruleText}. After ${shown[3]} comes ${next}.`,
  });
}

/* ------------------------------ Halves & fourths ------------------------------ */
const FOOD = [['🍕', 'pizza'], ['🍪', 'cookie'], ['🍫', 'chocolate bar'], ['🥪', 'sandwich'], ['🎂', 'cake'], ['🍉', 'watermelon'], ['🥧', 'pie']];
const SETS = [['🍎', 'apples'], ['⚽', 'balls'], ['🐟', 'fish'], ['🍪', 'cookies'], ['⭐', 'stars'], ['🎈', 'balloons'], ['🚗', 'cars'], ['🍓', 'strawberries']];
const F = (n, d) => `[[${n}/${d}]]`;

export function halvesFourths(mode, lv) {
  const topic = 'fractions';
  const kind = pick(['circle', 'rect']);
  const [fe, food] = pick(FOOD); const [se, things] = pick(SETS);
  const fmt = pick(lvl(lv, ['shadedHalf', 'shareHalf', 'wholeHalves', 'setHalf', 'setHalf', 'wordHalves', 'whichHalf', 'whichHalf'],
    ['shadedFourth', 'shareFourth', 'wholeFourths', 'setHalf', 'setFourth', 'bigger', 'halfShaded', 'whichHalf', 'wordFourths'],
    ['equiv', 'threeVsOne', 'manyHalves', 'manyFourths', 'setFourth', 'setHalf', 'eaten', 'leftover', 'twoOfFour']));
  const fs = (parts, shaded) => ({ type: 'fracshape', parts, shaded, kind });
  const base = { topic, story: st(mode, fe, 'Fair Shares') };
  if (fmt === 'wordHalves') {
    return ch({ ...base, key: 'frac:wordHalves', prompt: 'When you cut something into 2 equal parts, each part is called a…', speak: 'When you cut something into two equal parts, each part is called a what?', visual: fs(2, 1),
      hints: ['Two equal parts means halves.'], summary: 'Name for 1 of 2 parts', explanation: 'Each of 2 equal parts is called a half.', answerLabel: 'half' }, { text: 'half' }, [{ text: 'whole' }, { text: 'fourth' }]);
  }
  if (fmt === 'wordFourths') {
    return ch({ ...base, key: 'frac:wordFourths', prompt: 'When you cut something into 4 equal parts, each part is called a…', speak: 'When you cut something into four equal parts, each part is called a what?', visual: fs(4, 1),
      hints: ['Four equal parts means fourths. Another word is quarters.'], summary: 'Name for 1 of 4 parts', explanation: 'Each of 4 equal parts is called a fourth, or a quarter.', answerLabel: 'fourth' }, { text: 'fourth' }, [{ text: 'half' }, { text: 'whole' }]);
  }
  if (fmt === 'whichHalf') {
    const wrong = sample([fs(4, 1), fs(4, 3), fs(2, 2), fs(3, 1)], 2);
    return ch({ ...base, key: `frac:whichHalf:${kind}:${wrong.map((w) => w.parts + '' + w.shaded).join('')}`, prompt: 'Which picture shows one half shaded?', speak: 'Which picture shows one half shaded?', hints: ['One half means 1 of 2 equal parts.'], summary: 'Find one half', explanation: 'One of two equal parts is shaded: one half.', answerLabel: 'one half' },
    { visual: fs(2, 1) }, wrong.map((w) => ({ visual: w })));
  }
  if (fmt === 'shadedHalf') {
    return ch({ ...base, key: `frac:shadedHalf:${kind}`, prompt: 'What fraction of the shape is shaded?', speak: 'What fraction of the shape is shaded? Is it one half or one fourth?', visual: fs(2, 1),
      hints: ['The shape has 2 equal parts. 1 part is shaded.'], summary: 'Shaded half', explanation: 'The shape has 2 equal parts and 1 is shaded: one half.' },
    { text: F(1, 2) }, [{ text: F(1, 4) }]);
  }
  if (fmt === 'shareHalf') {
    return ch({ ...base, key: `frac:shareHalf:${food}`, prompt: `2 friends share a ${food} equally. What fraction does each friend get?`, speak: `Two friends share a ${food} equally. What fraction does each friend get?`, visual: fs(2, 1),
      hints: ['Cut it into 2 equal parts.'], summary: `Share a ${food} between 2`, explanation: `Each friend gets 1 of 2 equal parts: one half.` },
    { text: F(1, 2) }, [{ text: F(1, 4) }, { text: F(1, 3) }]);
  }
  if (fmt === 'wholeHalves') {
    return kid({ ...base, key: `frac:wholeHalves:${food}`, answer: 2, prompt: `How many halves make one whole ${food}?`, speak: `How many halves make one whole ${food}?`, visual: fs(2, 2),
      hints: ['Two halves put together make a whole.'], summary: 'Halves in a whole', explanation: 'Two halves make one whole.' });
  }
  if (fmt === 'setHalf') {
    const n = pick(lvl(lv, [2, 4, 6, 8, 10], [4, 6, 8, 10, 12, 14, 16], [12, 14, 16, 18, 20, 24, 30]));
    return kid({ ...base, key: `frac:setHalf:${n}:${se}`, answer: n / 2, prompt: `Here are ${n} ${things}. What is half of ${n}?`, speak: `Here are ${n} ${things}. What is half of ${n}?`,
      visual: { type: 'objects', emoji: se, count: Math.min(n, 20) }, hints: ['Share them equally into 2 groups.'], summary: `Half of ${n}`, explanation: `${n} shared into 2 equal groups is ${n / 2} in each group.` });
  }
  if (fmt === 'shadedFourth') {
    const k = rand(1, 3);
    const wrong = [1, 2, 3].filter((x) => x !== k).map((x) => ({ text: F(x, 4) }));
    return ch({ ...base, key: `frac:shadedFourth:${k}:${kind}`, prompt: 'What fraction of the shape is shaded?', speak: 'What fraction of the shape is shaded? The shape has four equal parts.', visual: fs(4, k),
      hints: ['Count all the equal parts. Then count the shaded ones.'], summary: `Shaded ${k} of 4`, explanation: `There are 4 equal parts and ${k} ${k === 1 ? 'is' : 'are'} shaded: ${k} fourths.` },
    { text: F(k, 4) }, wrong);
  }
  if (fmt === 'shareFourth') {
    return ch({ ...base, key: `frac:shareFourth:${food}`, prompt: `4 friends share a ${food} equally. What fraction does each friend get?`, speak: `Four friends share a ${food} equally. What fraction does each friend get?`, visual: fs(4, 1),
      hints: ['Cut it into 4 equal parts.'], summary: `Share a ${food} between 4`, explanation: 'Each friend gets 1 of 4 equal parts: one fourth.' },
    { text: F(1, 4) }, [{ text: F(1, 2) }, { text: F(1, 3) }]);
  }
  if (fmt === 'wholeFourths') {
    return kid({ ...base, key: `frac:wholeFourths:${food}`, answer: 4, prompt: `How many fourths make one whole ${food}?`, speak: `How many fourths make one whole ${food}?`, visual: fs(4, 4),
      hints: ['Count the 4 equal parts.'], summary: 'Fourths in a whole', explanation: 'Four fourths make one whole. Fourths are also called quarters.' });
  }
  if (fmt === 'setFourth') {
    const n = pick(lvl(lv, [4, 8], [4, 8, 12, 16], [12, 16, 20, 24, 28, 32, 36, 40]));
    return kid({ ...base, key: `frac:setFourth:${n}:${se}`, answer: n / 4, prompt: `${n} ${things} are shared equally among 4 friends. How many does each friend get?`, speak: `${n} ${things} are shared equally among four friends. How many does each friend get?`,
      visual: { type: 'objects', emoji: se, count: Math.min(n, 20) }, hints: ['One fourth is 1 of 4 equal groups.'], summary: `One fourth of ${n}`, explanation: `${n} shared among 4 is ${n / 4} each. One fourth of ${n} is ${n / 4}.` });
  }
  if (fmt === 'bigger') {
    return ch({ ...base, key: `frac:bigger:${kind}`, prompt: 'Which piece is BIGGER?', speak: 'Which piece is bigger? A piece when you share with two friends, or a piece when you share with four friends?', hints: ['Fewer friends sharing means bigger pieces.'],
      summary: 'Compare one half and one fourth', explanation: 'One half is bigger than one fourth. Cutting into fewer pieces makes bigger pieces.', answerLabel: F(1, 2) },
    { text: F(1, 2), visual: fs(2, 1) }, [{ text: F(1, 4), visual: fs(4, 1) }]);
  }
  if (fmt === 'halfShaded') {
    const k = pick([1, 2, 3, 4]); const yes = k === 2;
    return ch({ ...base, key: `frac:halfShaded:${k}:${kind}`, prompt: 'Is exactly one half of the shape shaded?', speak: 'Is exactly one half of the shape shaded?', visual: fs(4, k),
      hints: ['One half is 2 out of the 4 equal parts.'], summary: 'Is it a half?', explanation: yes ? '2 of 4 equal parts is one half.' : `${k} of 4 equal parts is not one half.`, answerLabel: yes ? 'Yes' : 'No' },
    { text: yes ? 'Yes' : 'No' }, [{ text: yes ? 'No' : 'Yes' }]);
  }
  if (fmt === 'equiv') {
    return ch({ ...base, key: `frac:equiv:${kind}`, prompt: '2 fourths is the same as one…?', speak: 'Two fourths is the same as one what?', visual: fs(4, 2),
      hints: ['Shade 2 of the 4 parts. What fraction is that?'], summary: '2 fourths', explanation: '2 fourths is the same as one half.', answerLabel: 'half' },
    { text: 'half' }, [{ text: 'whole' }, { text: 'fourth' }]);
  }
  if (fmt === 'threeVsOne') {
    return ch({ ...base, key: `frac:threeVsOne:${kind}`, prompt: 'Which is more of the pizza: 3 fourths or 1 half?', speak: 'Which is more: three fourths, or one half?', hints: ['One half is the same as 2 fourths.'],
      summary: '3 fourths vs 1 half', explanation: '3 fourths is more than 2 fourths, and 2 fourths is one half.', answerLabel: F(3, 4) },
    { text: F(3, 4), visual: fs(4, 3) }, [{ text: F(1, 2), visual: fs(2, 1) }]);
  }
  if (fmt === 'manyHalves' || fmt === 'manyFourths') {
    const w = rand(2, 5); const per = fmt === 'manyHalves' ? 2 : 4; const word = fmt === 'manyHalves' ? 'halves' : 'fourths';
    return kid({ ...base, key: `frac:${fmt}:${w}`, answer: w * per, prompt: `How many ${word} are in ${w} wholes?`, speak: `How many ${word} are in ${w} wholes?`, visual: fs(per, per),
      hints: [`Each whole has ${per} ${word}.`], summary: `${word} in ${w} wholes`, explanation: `${w} wholes with ${per} ${word} each: ${w} times ${per} is ${w * per}.` });
  }
  if (fmt === 'eaten' || fmt === 'leftover') {
    const k = rand(1, 3); const ask = fmt === 'eaten' ? k : 4 - k;
    const wrong = [1, 2, 3].filter((x) => x !== ask).map((x) => ({ text: F(x, 4) }));
    return ch({ ...base, key: `frac:${fmt}:${k}:${food}`, prompt: `A ${food} is cut into 4 equal slices. ${k === 1 ? 'Someone eats 1 slice' : `Someone eats ${k} slices`}. What fraction ${fmt === 'eaten' ? 'was eaten' : 'is left'}?`,
      speak: `A ${food} is cut into four equal slices. ${k === 1 ? 'Someone eats one slice' : `Someone eats ${k} slices`}. What fraction ${fmt === 'eaten' ? 'was eaten' : 'is left'}?`, visual: fs(4, k),
      hints: ['The shaded parts are the slices that were eaten.'], summary: `${fmt === 'eaten' ? 'Eaten' : 'Left over'}: ${ask} of 4`, explanation: fmt === 'eaten' ? `${k} of the 4 slices were eaten: ${k} fourths.` : `4 slices, ${k} eaten, so ${4 - k} are left: ${4 - k} fourths.` },
    { text: F(ask, 4) }, wrong);
  }
  const k = rand(1, 3);
  return ch({ ...base, key: `frac:twoOfFour:${k}:${kind}`, prompt: 'This shape has 4 equal parts. Which fraction names the shaded part?', speak: 'This shape has four equal parts. Which fraction names the shaded part?', visual: fs(4, k),
    hints: ['Top number: how many are shaded. Bottom number: how many equal parts in all.'], summary: `${k} of 4 shaded`, explanation: `${k} of 4 equal parts are shaded: ${k} fourths.` },
  { text: F(k, 4) }, [1, 2, 3].filter((x) => x !== k).map((x) => ({ text: F(x, 4) })));
}

/* ------------------------------ More variety for thin topics ------------------------------ */
const bigNums = (xs) => xs.map((x) => txt(x));

export function numeralsMore(mode, lv) {
  const topic = 'numerals';
  const hi = lvl(lv, 6, 10, 20); const lo = lvl(lv, 1, 1, 5);
  const fmt = pick(['bigger', 'smaller', 'between', 'before', 'after', 'dots', 'dots', 'missing', 'missing']);
  const pair = () => { let a = rand(lo, hi); let b = rand(lo, hi); while (b === a) b = rand(lo, hi); return [a, b]; };
  if (fmt === 'bigger' || fmt === 'smaller') {
    const [a, b] = pair(); const want = fmt === 'bigger' ? Math.max(a, b) : Math.min(a, b);
    return ch({ key: `num:${fmt}:${Math.min(a, b)}:${Math.max(a, b)}`, topic, story: st(mode, '🔢', 'Number Showdown'), prompt: `Which number is ${fmt === 'bigger' ? 'BIGGER' : 'SMALLER'}?`, speak: `Which number is ${fmt}?`,
      hints: [fmt === 'bigger' ? 'Bigger means more.' : 'Smaller means less.'], summary: `${fmt} of ${a} and ${b}`, explanation: `${want} is ${fmt} than ${want === a ? b : a}.`, answerLabel: String(want) },
    txt(want), [txt(want === a ? b : a)]);
  }
  if (fmt === 'missing') {
    const s = rand(lo, hi - 3); const seq = [s, s + 1, s + 2, s + 3]; const h = rand(0, 3);
    return kid({ key: `num:missing:${s}:${h}`, topic, answer: seq[h], prompt: 'What number is missing?', speak: `What number is missing? ${seq.map((x, i) => (i === h ? 'what number' : x)).join(', ')}.`, visual: { type: 'sequence', terms: seq.map((x, i) => (i === h ? '?' : String(x))), blank: false },
      hints: ['Say the numbers in order and listen for the gap.'], summary: seq.map((x, i) => (i === h ? '?' : x)).join(', '), explanation: `${seq.join(', ')}.` });
  }
  if (fmt === 'between') {
    const a = rand(lo, hi - 2);
    return kid({ key: `num:between:${a}`, topic, answer: a + 1, prompt: `What number goes in the middle? ${a}, ?, ${a + 2}`, speak: `What number goes in the middle? ${a}, what number, ${a + 2}.`,
      visual: { type: 'sequence', terms: [String(a), '?', String(a + 2)], blank: false }, hints: ['Count up from the first number.'], summary: `${a}, ?, ${a + 2}`, explanation: `${a}, ${a + 1}, ${a + 2}.` });
  }
  if (fmt === 'before') {
    const n = rand(lo + 1, hi);
    return kid({ key: `num:before:${n}`, topic, answer: n - 1, prompt: `What number comes just BEFORE ${n}?`, speak: `What number comes just before ${n}?`,
      visual: { type: 'sequence', terms: ['?', String(n)], blank: false }, hints: [`Count back one from ${n}.`], summary: `Before ${n}`, explanation: `${n - 1} comes right before ${n}.` });
  }
  if (fmt === 'after') {
    const n = rand(lo, hi - 1);
    return kid({ key: `num:after:${n}`, topic, answer: n + 1, prompt: `What number comes just AFTER ${n}?`, speak: `What number comes just after ${n}?`,
      visual: { type: 'sequence', terms: [String(n), '?'], blank: false }, hints: [`Count up one from ${n}.`], summary: `After ${n}`, explanation: `${n + 1} comes right after ${n}.` });
  }
  const n = rand(Math.max(lo, 1), Math.min(hi, 10)); const opts = nearby(n, lvl(lv, 2, 3, 3), 1, 3);
  return ch({ key: `num:dots:${n}`, topic, story: st(mode, '🔟', 'Count the Dots'), prompt: 'How many dots are there?', speak: 'How many dots are there?', visual: { type: 'tenframe', count: n },
    hints: ['Count each dot once.'], summary: `Ten frame with ${n}`, explanation: `There are ${n} dots.`, answerLabel: String(n) }, txt(n), bigNums(opts));
}

const RANKS = {
  big: { word: ['BIGGEST', 'SMALLEST', 'BIGGER', 'SMALLER'], items: [['🏠', 'house'], ['🚗', 'car'], ['🐶', 'dog'], ['🐱', 'cat'], ['🐭', 'mouse'], ['🐜', 'ant']] },
  tall: { word: ['TALLEST', 'SHORTEST', 'TALLER', 'SHORTER'], items: [['🏢', 'building'], ['🌳', 'tree'], ['🧒', 'child'], ['🐕', 'dog'], ['🐁', 'mouse']] },
  long: { word: ['LONGEST', 'SHORTEST', 'LONGER', 'SHORTER'], items: [['🚂', 'train'], ['🐍', 'snake'], ['✏️', 'pencil'], ['🐛', 'caterpillar'], ['🐜', 'ant']] },
  heavy: { word: ['HEAVIEST', 'LIGHTEST', 'HEAVIER', 'LIGHTER'], items: [['🐘', 'elephant'], ['🚗', 'car'], ['🐕', 'dog'], ['🍎', 'apple'], ['🪶', 'feather']] },
};
export function sizesMore(mode, lv) {
  const topic = 'size';
  const attr = pick(Object.keys(RANKS)); const R = RANKS[attr];
  const n = lvl(lv, 2, 3, 4);
  const idx = sample([...R.items.keys()], n).sort((a, b) => a - b); // low index = biggest
  const picks = idx.map((i) => R.items[i]);
  const askTop = chance(0.5);
  const second = lv === 2 && n >= 3 && chance(0.4);
  const target = second ? picks[askTop ? 1 : n - 2] : askTop ? picks[0] : picks[n - 1];
  const w = n === 2 ? (askTop ? R.word[2] : R.word[3]) : second ? (askTop ? `SECOND ${R.word[0]}` : `SECOND ${R.word[1]}`) : askTop ? R.word[0] : R.word[1];
  const prompt = `Tap the ${w}`;
  return ch({ key: `size2:${attr}:${picks.map((p) => p[0]).join('')}:${w}`, topic, story: st(mode, '📏', 'Compare Them'), prompt, speak: spoken(prompt), hints: ['Think about the real animals and things, not the size of the picture.'],
    summary: `${w} of ${picks.map((p) => p[1]).join(', ')}`, explanation: `The ${target[1]} is the ${w.toLowerCase()}.`, answerLabel: target[1] }, optPic(target), picks.filter((p) => p !== target).map(optPic));
}

export function oneMoreMore(mode, lv) {
  const topic = 'oneMore';
  const e = pick(['🐥', '🍎', '🐟', '⭐', '🍪', '🚗', '🌼', '🐞']); const f = pick(['🐸', '🍌', '🎈', '⚽', '🐢', '🍓']);
  const fmt = pick(lvl(lv, ['frame', 'inAll', 'inAll', 'afterWord'], ['frame', 'inAll', 'oneLess', 'doubles', 'toTen'], ['frame', 'inAll', 'oneLess', 'doubles', 'toTen', 'more2']));
  if (fmt === 'frame') {
    const n = rand(1, lvl(lv, 4, 9, 9));
    return kid({ key: `om:frame:${n}`, topic, answer: n + 1, prompt: `Here are ${n} dots. What is one more?`, speak: `Here are ${n} dots. What is one more?`, visual: { type: 'tenframe', count: n },
      hints: ['One more means add 1 more dot.'], summary: `One more than ${n}`, explanation: `${n} and 1 more is ${n + 1}.` });
  }
  if (fmt === 'inAll') {
    const max = lvl(lv, 5, 10, 10); const a = rand(1, max - 1); const b = rand(1, max - a);
    return kid({ key: `om:inAll:${a}:${b}:${e}${f}`, topic, story: st(mode, e, 'Count Them All'), answer: a + b, prompt: 'How many in all?', speak: 'How many are there in all?',
      visual: { type: 'groups', groups: [{ emoji: e, count: a }, { emoji: f, count: b }], op: '+' }, hints: ['Count the first group. Then keep counting the second group.'], summary: `${a} and ${b}`, explanation: `${a} and ${b} makes ${a + b}.` });
  }
  if (fmt === 'afterWord') {
    const n = rand(1, 5);
    return kid({ key: `om:after:${n}`, topic, answer: n + 1, prompt: `One more than ${n} is…?`, speak: `One more than ${n} is what number?`, visual: { type: 'objects', emoji: e, count: n },
      hints: ['Count them. Then count one more.'], summary: `One more than ${n}`, explanation: `${n} and one more is ${n + 1}.` });
  }
  if (fmt === 'oneLess') {
    const n = rand(2, 10);
    return kid({ key: `om:less:${n}:${e}`, topic, answer: n - 1, prompt: `What is one LESS than ${n}?`, speak: `What is one less than ${n}?`, visual: { type: 'objects', emoji: e, count: n, faded: 1 },
      hints: ['One of the pictures is faded. Count the ones that are left.'], summary: `One less than ${n}`, explanation: `${n} take away 1 is ${n - 1}.` });
  }
  if (fmt === 'doubles') {
    const n = rand(1, 5);
    return kid({ key: `om:double:${n}:${e}`, topic, answer: n * 2, prompt: `${n} and ${n} more. How many in all?`, speak: `${n} and ${n} more. How many in all?`,
      visual: { type: 'groups', groups: [{ emoji: e, count: n }, { emoji: e, count: n }], op: '+' }, hints: ['Two equal groups. Count them all.'], summary: `Double ${n}`, explanation: `${n} and ${n} makes ${n * 2}.` });
  }
  if (fmt === 'toTen') {
    const n = rand(5, 9);
    return kid({ key: `om:toTen:${n}`, topic, answer: 10 - n, prompt: `There are ${n} dots. How many more make 10?`, speak: `There are ${n} dots. How many more dots make ten?`, visual: { type: 'tenframe', count: n },
      hints: ['Count the empty spaces in the ten frame.'], summary: `${n} and ? make 10`, explanation: `${n} and ${10 - n} make 10.` });
  }
  const a = rand(1, 7);
  return kid({ key: `om:more2:${a}:${e}`, topic, answer: a + 2, prompt: `${a} and 2 more is…?`, speak: `${a} and two more is what number?`, visual: { type: 'groups', groups: [{ emoji: e, count: a }, { emoji: e, count: 2 }], op: '+' },
    hints: [`Start at ${a}. Count up 2.`], summary: `${a} and 2 more`, explanation: `${a} and 2 more is ${a + 2}.` });
}

const SH_SIDES = { triangle: 3, square: 4, rectangle: 4, diamond: 4, pentagon: 5, hexagon: 6 };
const SH_COLORS = ['red', 'blue', 'green', 'purple', 'orange', 'yellow'];
const shapeVis = (shape, color, size = 0.85) => ({ type: 'shape', shape, color, size });
export function shapesMore(mode, lv) {
  const topic = 'shapes';
  const pool = lvl(lv, ['triangle', 'square', 'rectangle'], ['triangle', 'square', 'rectangle', 'diamond', 'pentagon'], ['triangle', 'square', 'rectangle', 'diamond', 'pentagon', 'hexagon']);
  const fmt = pick(lvl(lv, ['sides', 'odd', 'count', 'real'], ['sides', 'odd', 'count', 'color', 'real', 'sides'], ['sides', 'odd', 'count', 'color', 'compose', 'sides', 'corners']));
  if (fmt === 'sides' || fmt === 'corners') {
    const s = pick(pool); const word = fmt === 'sides' ? 'sides' : 'corners';
    return kid({ key: `sh:${fmt}:${s}`, topic, story: st(mode, '🔷', 'Shape Detective'), answer: SH_SIDES[s], prompt: `How many ${word} does this ${s} have?`, speak: `How many ${word} does this ${s} have?`, visual: shapeVis(s, pick(SH_COLORS), 1),
      hints: [`Touch and count each ${fmt === 'sides' ? 'straight side' : 'pointy corner'}.`], summary: `${s} ${word}`, explanation: `A ${s} has ${SH_SIDES[s]} ${word}.` });
  }
  if (fmt === 'odd') {
    const [a, b] = sample(pool, 2); const cols = sample(SH_COLORS, 4);
    const n = lvl(lv, 3, 4, 4);
    return ch({ key: `sh:odd:${a}:${b}:${cols.slice(0, n).join('')}`, topic, story: st(mode, '🔷', 'Odd One Out'), prompt: `Which one is NOT a ${a}?`, speak: `Which one is not a ${a}?`, hints: [`Look for the shape with a different number of sides than a ${a}.`],
      summary: `Not a ${a}`, explanation: `The ${b} is the odd one out. The others are ${a}s.`, answerLabel: b },
    { visual: shapeVis(b, cols[0]) }, cols.slice(1, n).map((c) => ({ visual: shapeVis(a, c) })));
  }
  if (fmt === 'count') {
    const [a, b, c] = sample(pool, 3); const types = lv === 0 ? [a, b] : [a, b, c];
    const total = lvl(lv, rand(4, 5), 6, 8); const items = Array.from({ length: total }, () => pick(types)); const target = pick(uniq(items));
    return kid({ key: `sh:count:${target}:${items.join('').length}:${items.map((x) => x[0]).join('')}`, topic, answer: items.filter((x) => x === target).length, prompt: `How many ${target}s are there?`, speak: `How many ${target}s are there?`,
      visual: { type: 'pattern', items: items.map((s, i) => shapeVis(s, SH_COLORS[(i * 2) % SH_COLORS.length], 0.7)) }, hints: ['Point to each one as you count.'], summary: `Count the ${target}s`, explanation: `There are ${items.filter((x) => x === target).length} ${target}s.` });
  }
  if (fmt === 'color') {
    const s = pick(pool); const col = pick(SH_COLORS); const other = pick(pool.filter((x) => x !== s)); const col2 = pick(SH_COLORS.filter((x) => x !== col));
    return ch({ key: `sh:color:${s}:${col}:${other}:${col2}`, topic, prompt: `Tap the ${col} ${s}`, speak: `Tap the ${col} ${s}.`, hints: [`It has to be a ${s} and it has to be ${col}.`],
      summary: `${col} ${s}`, explanation: 'That one is the right shape and the right color.', answerLabel: `${col} ${s}` },
    { visual: shapeVis(s, col) }, [{ visual: shapeVis(s, col2) }, { visual: shapeVis(other, col) }, { visual: shapeVis(other, col2) }]);
  }
  if (fmt === 'real') {
    const R = [['🍕', 'triangle', 'pizza slice'], ['🚪', 'rectangle', 'door'], ['🪁', 'diamond', 'kite'], ['📺', 'rectangle', 'TV'], ['🧀', 'triangle', 'cheese wedge'], ['🖼️', 'rectangle', 'picture frame'], ['🍫', 'rectangle', 'chocolate bar'], ['⛵', 'triangle', 'sail']];
    const [e, s, what] = pick(R); const wrong = sample(pool.filter((x) => x !== s && !(s === 'rectangle' && x === 'square')), 2);
    return ch({ key: `sh:real:${what}`, topic, prompt: `What shape is a ${what}?`, speak: `What shape is a ${what}?`, visual: { type: 'emoji', emoji: e, size: 1 }, hints: ['Think about the outline.'],
      summary: `Shape of a ${what}`, explanation: `A ${what} is shaped like a ${s}.`, answerLabel: s }, { visual: shapeVis(s, pick(SH_COLORS)) }, wrong.map((w) => ({ visual: shapeVis(w, pick(SH_COLORS)) })));
  }
  const C = [['2 triangles', 'a square', ['a circle', 'a star']], ['2 squares', 'a rectangle', ['a triangle', 'a circle']], ['2 half circles', 'a circle', ['a square', 'a triangle']], ['4 small squares', 'a big square', ['a circle', 'a triangle']]];
  const [parts, make, wrong] = pick(C);
  return ch({ key: `sh:compose:${parts}`, topic, prompt: `Put ${parts} together. What shape can you make?`, speak: `Put ${parts} together. What shape can you make?`, hints: ['Picture the pieces fitting side by side.'],
    summary: `${parts} make ${make}`, explanation: `${parts} can make ${make}.`, answerLabel: make }, { text: make }, wrong.map((text) => ({ text })));
}

export function skipMore(mode, lv, steps = [2, 5, 10], max = 60) {
  const topic = 'skip';
  const fmt = pick(['missing', 'hands', 'pairs', 'coins', 'nth', 'which', 'back']);
  const step = pick(steps);
  if (fmt === 'hands') {
    const n = rand(2, 5);
    return kid({ key: `sk:hands:${n}`, topic, story: st(mode, '✋', 'Count by Fives'), answer: 5 * n, prompt: `1 hand has 5 fingers. How many fingers on ${n} hands?`, speak: `One hand has five fingers. How many fingers are on ${n} hands?`,
      visual: { type: 'objects', emoji: '✋', count: n }, hints: ['Count by 5s: 5, 10, 15…'], summary: `${n} hands`, explanation: `Count by 5s ${n} times: ${Array.from({ length: n }, (_, i) => 5 * (i + 1)).join(', ')}.` });
  }
  if (fmt === 'pairs') {
    const n = rand(2, 6);
    return kid({ key: `sk:pairs:${n}`, topic, story: st(mode, '👟', 'Count the Shoes'), answer: 2 * n, prompt: `There are ${n} pairs of shoes. How many shoes in all?`, speak: `There are ${n} pairs of shoes. How many shoes in all?`,
      visual: { type: 'objects', emoji: '👟', count: 2 * n }, hints: ['Count by 2s.'], summary: `${n} pairs`, explanation: `Count by 2s: ${Array.from({ length: n }, (_, i) => 2 * (i + 1)).join(', ')}.` });
  }
  if (fmt === 'coins') {
    const c = pick([5, 10]); const n = rand(2, 6); const name = c === 5 ? 'nickels' : 'dimes';
    return kid({ key: `sk:coins:${c}:${n}`, topic, answer: c * n, prompt: `${n} ${name}. How many cents in all?`, speak: `${n} ${name}. How many cents in all?`, visual: { type: 'coins', coins: Array(n).fill(c) },
      hints: [`Count by ${c}s.`], summary: `${n} ${name}`, explanation: `${n} ${name} is ${c * n} cents.` });
  }
  const start = step * rand(0, Math.max(1, Math.floor((max - step * 6) / step)));
  const terms = Array.from({ length: 6 }, (_, i) => start + (i + (start === 0 ? 1 : 0)) * step);
  if (fmt === 'nth') {
    const k = rand(4, 6);
    return kid({ key: `sk:nth:${step}:${terms[0]}:${k}`, topic, answer: terms[k - 1], prompt: `Count by ${step}s, starting at ${terms[0]}. What is number ${k} in the list?`, speak: `Count by ${step}s, starting at ${terms[0]}. What is number ${k} in the list?`,
      hints: [`${terms.slice(0, k - 1).join(', ')}…`], summary: `Number ${k} counting by ${step}s from ${terms[0]}`, explanation: `${terms.slice(0, k).join(', ')}. Number ${k} is ${terms[k - 1]}.` });
  }
  if (fmt === 'which') {
    const seq = terms.slice(0, 4); const bad1 = [seq[0], seq[1], seq[2] + 1, seq[3] + 1]; const bad2 = [seq[0], seq[1] + 1, seq[2], seq[3] + 2]; const bad3 = [seq[0], seq[1], seq[2], seq[3] + step];
    const wrong = [bad1, bad2, bad3].map((s) => s.join(', ')).filter((s) => s !== seq.join(', '));
    return ch({ key: `sk:which:${step}:${seq[0]}`, topic, prompt: `Which row counts by ${step}s?`, speak: `Which row counts by ${step}s?`, hints: [`Each number is ${step} more than the one before.`],
      summary: `Counting by ${step}s`, explanation: `${seq.join(', ')} goes up by ${step} each time.`, answerLabel: seq.join(', ') }, txt(seq.join(', ')), uniq(wrong).slice(0, 2).map(txt));
  }
  if (fmt === 'back') {
    const s0 = terms[5]; const seq = [s0, s0 - step, s0 - 2 * step, s0 - 3 * step]; const ans = s0 - 4 * step;
    if (ans < 0) return skipMore(mode, lv, steps, max);
    return kid({ key: `sk:back:${step}:${s0}`, topic, answer: ans, prompt: 'Counting back. What comes next?', speak: `${seq.join(', ')}. What comes next?`, visual: { type: 'sequence', terms: seq.map(String), blank: true },
      hints: [`The numbers go down by ${step} each time.`], summary: `${seq.join(', ')}, ?`, explanation: `Count back by ${step}: ${seq.join(', ')}, ${ans}.` });
  }
  const hole = rand(1, 3); const shown = terms.slice(0, 5).map((t, i) => (i === hole + 1 ? '?' : String(t)));
  return kid({ key: `sk:missing:${step}:${terms[0]}:${hole}`, topic, answer: terms[hole + 1], prompt: `Count by ${step}s. What number is missing?`, speak: `Count by ${step}s. ${shown.map((t) => (t === '?' ? 'what number' : t)).join(', ')}. What number is missing?`,
    visual: { type: 'sequence', terms: shown, blank: false }, hints: [`Each number is ${step} more than the one before.`], summary: `${shown.join(', ')}`, explanation: `Counting by ${step}s: ${terms.slice(0, 5).join(', ')}.` });
}

export function teensMore(mode, lv) {
  const topic = 'teens';
  const hi = lvl(lv, 15, 19, 19);
  const fmt = pick(['dots', 'dots', 'word', 'after', 'before', 'bigger', 'between', 'blocks', 'onesIn', 'moreThanTen', 'tensIn', 'onesIn']);
  const n = rand(11, hi);
  const words = { 11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen' };
  if (fmt === 'onesIn') return kid({ key: `tn:onesIn:${n}`, topic, answer: n - 10, prompt: `How many ones are in ${n}?`, speak: `How many ones are in ${n}?`, visual: { type: 'base10', tens: 1, ones: n - 10 }, hints: ['The long block is the ten. Count the little ones.'], summary: `Ones in ${n}`, explanation: `${n} is 1 ten and ${n - 10} ones.` });
  if (fmt === 'tensIn') return kid({ key: `tn:tensIn:${n}`, topic, answer: 1, prompt: `How many tens are in ${n}?`, speak: `How many tens are in ${n}?`, visual: { type: 'base10', tens: 1, ones: n - 10 }, hints: ['Every teen number has one ten.'], summary: `Tens in ${n}`, explanation: `${n} is 1 ten and ${n - 10} ones.` });
  if (fmt === 'moreThanTen') {
    const m = pick([6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19]); const more = m > 10;
    return ch({ key: `tn:vs10:${m}`, topic, prompt: `Is ${m} more than 10 or less than 10?`, speak: `Is ${m} more than ten or less than ten?`, hints: ['Count up to 10. Is the number before or after 10?'], summary: `${m} compared to 10`, explanation: `${m} is ${more ? 'more' : 'less'} than 10.`, answerLabel: more ? 'more than 10' : 'less than 10' },
    { text: more ? 'more than 10' : 'less than 10' }, [{ text: more ? 'less than 10' : 'more than 10' }]);
  }
  if (fmt === 'dots') return kid({ key: `tn:dots:${n}`, topic, story: st(mode, '🔟', 'Ten and More'), answer: n, prompt: 'How many dots are there?', speak: 'How many dots are there?', visual: { type: 'tenframe', count: n }, hints: ['One ten frame is full. That is 10. Count the extra dots.'], summary: `Dots: ${n}`, explanation: `10 and ${n - 10} more is ${n}.` });
  if (fmt === 'word') {
    const wrong = uniq([n - 10, n + 1 > 19 ? n - 1 : n + 1, (n % 10) * 10 + 1]).filter((x) => x !== n && x > 0).slice(0, 2);
    return ch({ key: `tn:word:${n}`, topic, prompt: `Which number is ${words[n]}?`, speak: `Which number is ${words[n]}?`, hints: ['Teen numbers start with a 1 for the ten.'], summary: `Find ${n}`, explanation: `${words[n]} is written ${n}.`, answerLabel: String(n) }, txt(n), wrong.map(txt));
  }
  if (fmt === 'after') { const m = rand(11, 18); return kid({ key: `tn:after:${m}`, topic, answer: m + 1, prompt: `What comes just AFTER ${m}?`, speak: `What comes just after ${m}?`, hints: [`Count up one from ${m}.`], summary: `After ${m}`, explanation: `${m + 1} comes after ${m}.` }); }
  if (fmt === 'before') { const m = rand(12, 19); return kid({ key: `tn:before:${m}`, topic, answer: m - 1, prompt: `What comes just BEFORE ${m}?`, speak: `What comes just before ${m}?`, hints: [`Count back one from ${m}.`], summary: `Before ${m}`, explanation: `${m - 1} comes before ${m}.` }); }
  if (fmt === 'bigger') {
    let a = rand(11, hi); let b = rand(11, hi); while (b === a) b = rand(11, hi);
    return ch({ key: `tn:bigger:${Math.min(a, b)}:${Math.max(a, b)}`, topic, prompt: 'Which number is BIGGER?', speak: 'Which number is bigger?', hints: ['Compare the ones. Both have a ten.'], summary: `${a} or ${b}`, explanation: `${Math.max(a, b)} is bigger than ${Math.min(a, b)}.`, answerLabel: String(Math.max(a, b)) }, txt(Math.max(a, b)), [txt(Math.min(a, b))]);
  }
  if (fmt === 'between') { const m = rand(11, 17); return kid({ key: `tn:between:${m}`, topic, answer: m + 1, prompt: `What goes in the middle? ${m}, ?, ${m + 2}`, speak: `What goes in the middle? ${m}, what number, ${m + 2}.`, visual: { type: 'sequence', terms: [String(m), '?', String(m + 2)], blank: false }, hints: ['Count up.'], summary: `${m}, ?, ${m + 2}`, explanation: `${m}, ${m + 1}, ${m + 2}.` }); }
  return kid({ key: `tn:blocks:${n}`, topic, answer: n, prompt: 'What number do the blocks show?', speak: 'What number do the blocks show?', visual: { type: 'base10', tens: 1, ones: n - 10 }, hints: ['One long block is 10. Count the little ones.'], summary: `10 and ${n - 10}`, explanation: `1 ten and ${n - 10} ones is ${n}.` });
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const UNITS = [['a movie', 'hours'], ['brushing your teeth', 'minutes'], ['a heartbeat', 'seconds'], ['a vacation', 'days'], ['a nap', 'hours'], ['tying a shoe', 'seconds'], ['a soccer game', 'minutes'], ['a school year', 'months'], ['blinking your eyes', 'seconds'], ['a long car trip', 'hours']];
export function timeMore(mode, lv) {
  const topic = 'time';
  const fmt = pick(lvl(lv, ['dayAfter', 'dayBefore', 'whichClock', 'unit', 'daysWeek', 'timeOfDay', 'longer', 'season', 'timeOfDay'], ['dayAfter', 'dayBefore', 'between', 'whichClock', 'unit', 'monthAfter', 'daysWeek'], ['daysLater', 'between', 'whichClock', 'unit', 'monthAfter', 'monthBefore', 'monthsYear', 'daysFrom']));
  if (fmt === 'timeOfDay') {
    const A = [['eat breakfast', 'morning'], ['go to bed', 'night'], ['eat lunch', 'afternoon'], ['see the stars', 'night'], ['watch the sunrise', 'morning'], ['eat dinner', 'evening'], ['play outside after school', 'afternoon'], ['put on pajamas', 'night'], ['wake up', 'morning'], ['have a bedtime story', 'night']];
    const [what, right] = pick(A); const wrong = sample(['morning', 'afternoon', 'evening', 'night'].filter((x) => x !== right), 2);
    return ch({ key: `tm:tod:${what}`, topic, prompt: `When do you usually ${what}?`, speak: `When do you usually ${what}?`, hints: ['Think about the sun and the sky.'], summary: `When: ${what}`, explanation: `You usually ${what} in the ${right}${right === 'night' ? '' : ''}.`, answerLabel: right }, { text: right }, wrong.map((text) => ({ text })));
  }
  if (fmt === 'longer') {
    const P = [['blinking your eyes', 'a night of sleep'], ['clapping your hands', 'a school day'], ['tying a shoe', 'watching a movie'], ['a sneeze', 'a vacation'], ['eating one grape', 'a soccer game'], ['saying your name', 'a long car trip'], ['a hiccup', 'a bath']];
    const [short, long] = pick(P);
    return ch({ key: `tm:longer:${short}`, topic, prompt: 'Which takes LONGER?', speak: 'Which takes longer?', hints: ['Think about how long each one lasts.'], summary: `${short} or ${long}`, explanation: `${long[0].toUpperCase() + long.slice(1)} takes longer than ${short}.`, answerLabel: long }, { text: long }, [{ text: short }]);
  }
  if (fmt === 'season') {
    const S = [['snow falls', 'winter'], ['flowers start to bloom', 'spring'], ['leaves turn red and fall', 'fall'], ['we go swimming at the beach', 'summer'], ['it is the coldest time of year', 'winter'], ['baby animals are born and plants grow', 'spring']];
    const [what, right] = pick(S); const wrong = sample(['winter', 'spring', 'summer', 'fall'].filter((x) => x !== right), 2);
    return ch({ key: `tm:season:${what}`, topic, prompt: `Which season is it when ${what}?`, speak: `Which season is it when ${what}?`, hints: ['Think about the weather.'], summary: `Season: ${what}`, explanation: `That happens in ${right}.`, answerLabel: right }, { text: right }, wrong.map((text) => ({ text })));
  }
  const di = rand(0, 6);
  const dayNames = (i, k) => DAYS[(i + k + 7) % 7];
  if (fmt === 'dayAfter' || fmt === 'dayBefore') {
    const k = fmt === 'dayAfter' ? 1 : -1; const right = dayNames(di, k);
    return ch({ key: `tm:${fmt}:${DAYS[di]}`, topic, story: st(mode, '📅', 'Days of the Week'), prompt: `What day comes ${fmt === 'dayAfter' ? 'AFTER' : 'BEFORE'} ${DAYS[di]}?`, speak: `What day comes ${fmt === 'dayAfter' ? 'after' : 'before'} ${DAYS[di]}?`,
      hints: ['Say the days in order: Sunday, Monday, Tuesday…'], summary: `${fmt === 'dayAfter' ? 'After' : 'Before'} ${DAYS[di]}`, explanation: `${right} comes ${fmt === 'dayAfter' ? 'after' : 'before'} ${DAYS[di]}.`, answerLabel: right },
    { text: right }, sample(DAYS.filter((d) => d !== right && d !== DAYS[di]), 2).map((text) => ({ text })));
  }
  if (fmt === 'daysWeek') return kid({ key: 'tm:daysWeek', topic, answer: 7, prompt: 'How many days are in one week?', speak: 'How many days are in one week?', hints: ['Say them: Sunday, Monday, Tuesday…'], summary: 'Days in a week', explanation: 'There are 7 days in a week.' });
  if (fmt === 'between') {
    const a = rand(0, 4); const mid = DAYS[a + 1]; const last = DAYS[a + 2];
    return ch({ key: `tm:between:${DAYS[a]}`, topic, prompt: `Which day is between ${DAYS[a]} and ${last}?`, speak: `Which day is between ${DAYS[a]} and ${last}?`, hints: ['Say the days in order.'], summary: `Between ${DAYS[a]} and ${last}`, explanation: `${mid} comes between ${DAYS[a]} and ${last}.`, answerLabel: mid },
    { text: mid }, sample(DAYS.filter((d) => ![mid, DAYS[a], last].includes(d)), 2).map((text) => ({ text })));
  }
  if (fmt === 'daysLater') {
    const k = rand(2, 4); const right = dayNames(di, k);
    return ch({ key: `tm:later:${DAYS[di]}:${k}`, topic, prompt: `What day is ${k} days after ${DAYS[di]}?`, speak: `What day is ${k} days after ${DAYS[di]}?`, hints: [`Count ${k} days on from ${DAYS[di]}.`], summary: `${k} days after ${DAYS[di]}`, explanation: `${DAYS[di]}, then ${Array.from({ length: k }, (_, i) => dayNames(di, i + 1)).join(', ')}. The answer is ${right}.`, answerLabel: right },
    { text: right }, sample(DAYS.filter((d) => d !== right), 2).map((text) => ({ text })));
  }
  if (fmt === 'daysFrom') {
    const k = rand(2, 4); const a = rand(0, 6 - k);
    return kid({ key: `tm:daysFrom:${DAYS[a]}:${k}`, topic, answer: k, prompt: `How many days from ${DAYS[a]} to ${DAYS[a + k]}?`, speak: `How many days from ${DAYS[a]} to ${DAYS[a + k]}?`, hints: ['Count the days after the first one.'], summary: `${DAYS[a]} to ${DAYS[a + k]}`, explanation: `${DAYS[a]} to ${DAYS[a + k]} is ${k} days.` });
  }
  if (fmt === 'monthAfter' || fmt === 'monthBefore') {
    const mi = rand(1, 10); const k = fmt === 'monthAfter' ? 1 : -1; const right = MONTHS[mi + k];
    return ch({ key: `tm:${fmt}:${MONTHS[mi]}`, topic, prompt: `Which month comes ${k === 1 ? 'AFTER' : 'BEFORE'} ${MONTHS[mi]}?`, speak: `Which month comes ${k === 1 ? 'after' : 'before'} ${MONTHS[mi]}?`, hints: ['Say the months in order: January, February, March…'], summary: `${k === 1 ? 'After' : 'Before'} ${MONTHS[mi]}`, explanation: `${right} comes ${k === 1 ? 'after' : 'before'} ${MONTHS[mi]}.`, answerLabel: right },
    { text: right }, sample(MONTHS.filter((m) => m !== right && m !== MONTHS[mi]), 2).map((text) => ({ text })));
  }
  if (fmt === 'monthsYear') return kid({ key: 'tm:monthsYear', topic, answer: 12, prompt: 'How many months are in one year?', speak: 'How many months are in one year?', hints: ['Say the months: January, February, March…'], summary: 'Months in a year', explanation: 'There are 12 months in a year.' });
  if (fmt === 'unit') {
    const [what, right] = pick(UNITS); const all = ['seconds', 'minutes', 'hours', 'days', 'months'];
    const wrong = sample(all.filter((u) => u !== right), lvl(lv, 1, 2, 2));
    return ch({ key: `tm:unit:${what}`, topic, prompt: `Which would you use to tell how long ${what} takes?`, speak: `Which would you use to tell how long ${what} takes?`, hints: ['Think: is it very quick, or very long?'], summary: `Units for ${what}`, explanation: `${what[0].toUpperCase() + what.slice(1)} is best measured in ${right}.`, answerLabel: right },
    { text: right }, wrong.map((text) => ({ text })));
  }
  const kinds = lv === 0 ? [0] : lv === 1 ? [0, 30] : [0, 15, 30, 45];
  const m = pick(kinds); const h = rand(1, 12); const label = m === 0 ? `${h} o'clock` : m === 30 ? `half past ${h}` : m === 15 ? `quarter past ${h}` : `quarter to ${h % 12 + 1}`;
  const opts = []; for (let g = 0; g < 40 && opts.length < 2; g++) { const hh = rand(1, 12); const mm = pick(kinds); if ((hh !== h || mm !== m) && !opts.some((o) => o[0] === hh && o[1] === mm)) opts.push([hh, mm]); }
  const clk = (hh, mm) => ({ visual: { type: 'clock', h: hh, m: mm } });
  return ch({ key: `tm:whichClock:${h}:${m}`, topic, prompt: `Which clock shows ${label}?`, speak: `Which clock shows ${label}?`, hints: m === 0 ? ['The long hand points to 12.'] : m === 30 ? ['The long hand points to 6.'] : ['Look at where the long hand points.'], summary: `Find ${label}`,
    explanation: `This clock shows ${label}.`, answerLabel: label }, clk(h, m), opts.map(([hh, mm]) => clk(hh, mm)));
}

const TOOLS = [['how long a pencil is', '📏', 'ruler'], ['how heavy a puppy is', '⚖️', 'scale'], ['how much milk is in a recipe', '🥛', 'measuring cup'], ['what time it is', '⏰', 'clock'], ['how hot or cold it is outside', '🌡️', 'thermometer'], ['how tall a plant is', '📏', 'ruler'], ['how heavy an apple is', '⚖️', 'scale']];
export function measureMore(mode, lv) {
  const topic = 'measure';
  const fmt = pick(lvl(lv, ['tool', 'cubes', 'real'], ['tool', 'cubes', 'real', 'moreCubes'], ['tool', 'cubes', 'moreCubes', 'real', 'units']));
  if (fmt === 'tool') {
    const [what, e, name] = pick(TOOLS); const others = uniq(TOOLS.filter((t) => t[1] !== e).map((t) => t[1] + '|' + t[2])).map((s) => s.split('|'));
    const wrong = sample(others, lvl(lv, 1, 2, 3));
    return ch({ key: `ms:tool:${name}:${what}`, topic, story: st(mode, '🧰', 'Measuring Tools'), prompt: `What would you use to measure ${what}?`, speak: `What would you use to measure ${what}?`, hints: ['Think about what each tool is for.'], summary: `Tool for ${what}`, explanation: `Use a ${name} to measure ${what}.`, answerLabel: name },
    { visual: emo(e, 1), text: name }, wrong.map(([we, wn]) => ({ visual: emo(we, 1), text: wn })));
  }
  if (fmt === 'cubes') {
    const n = lvl(lv, 2, 3, 3); const lens = sample([2, 3, 4, 5, 6, 7, 8, 9, 10], n); const askLong = chance(0.5); const target = askLong ? Math.max(...lens) : Math.min(...lens);
    const w = n === 2 ? (askLong ? 'LONGER' : 'SHORTER') : askLong ? 'LONGEST' : 'SHORTEST';
    return ch({ key: `ms:cubes:${lens.slice().sort().join('-')}:${w}`, topic, prompt: `Which row of cubes is ${w}?`, speak: `Which row of cubes is ${w.toLowerCase()}?`, hints: ['Count the cubes in each row.'], summary: `${w} row`, explanation: `The row with ${target} cubes is the ${w.toLowerCase()}.`, answerLabel: `${target} cubes` },
    { visual: { type: 'cubes', length: target, emoji: '' } }, lens.filter((x) => x !== target).map((x) => ({ visual: { type: 'cubes', length: x, emoji: '' } })));
  }
  if (fmt === 'moreCubes') {
    const a = rand(4, 10); const b = rand(1, a - 1);
    return kid({ key: `ms:more:${a}:${b}`, topic, answer: a - b, prompt: `The blue row has ${a} cubes. The red row has ${b} cubes. How many MORE cubes are in the blue row?`, speak: `The blue row has ${a} cubes. The red row has ${b} cubes. How many more cubes are in the blue row?`,
      visual: { type: 'groups', groups: [{ emoji: '🟦', count: a }, { emoji: '🟥', count: b }], op: 'vs' }, hints: [`Find the difference between ${a} and ${b}.`], summary: `${a} cubes vs ${b} cubes`, explanation: `${a} minus ${b} is ${a - b}.` });
  }
  if (fmt === 'units') {
    const U = [['How long is a classroom?', 'feet', ['pounds', 'cups']], ['How heavy is a bag of apples?', 'pounds', ['inches', 'cups']], ['How much water fits in a bucket?', 'cups', ['inches', 'pounds']], ['How long is a crayon?', 'inches', ['pounds', 'cups']]];
    const [q, right, wrong] = pick(U);
    return ch({ key: `ms:units:${q}`, topic, prompt: `${q} What do we measure it in?`, speak: `${q} What do we measure it in?`, hints: ['Length, weight and amount of liquid each use different units.'], summary: q, explanation: `We measure that in ${right}.`, answerLabel: right }, { text: right }, wrong.map((text) => ({ text })));
  }
  const attr = pick(['tall', 'long', 'heavy']); const R = RANKS[attr]; const [i, j] = sample([...R.items.keys()], 2).sort((a, b) => a - b); const askBig = chance(0.5);
  const right = askBig ? R.items[i] : R.items[j]; const wrongP = askBig ? R.items[j] : R.items[i]; const w = askBig ? R.word[2] : R.word[3];
  return ch({ key: `ms:real:${attr}:${R.items[i][0]}${R.items[j][0]}:${w}`, topic, prompt: `Which is ${w}?`, speak: `Which is ${w.toLowerCase()}?`, hints: ['Think about the real things.'], summary: `${w}: ${R.items[i][1]} or ${R.items[j][1]}`, explanation: `The ${right[1]} is ${w.toLowerCase()}.`, answerLabel: right[1] }, optPic(right), [optPic(wrongP)]);
}

export function bondsMore(mode, lv, wholes) {
  const topic = 'bonds';
  const W = wholes || lvl(lv, [5, 6, 7], [8, 9, 10], [10, 12, 14, 16, 18, 20]);
  const fmt = pick(['missing', 'missing', 'frame', 'family', 'doubles', 'pair', 'three']);
  const w = pick(W);
  if (fmt === 'missing') {
    const a = rand(1, w - 1);
    return kid({ key: `bd:missing:${w}:${a}`, topic, story: st(mode, '🔗', 'Number Bonds'), answer: w - a, prompt: `${a} and ? make ${w}`, speak: `${a} and what number make ${w}?`, visual: { type: 'numberbond', whole: w, parts: [a, null] },
      hints: [`Count up from ${a} to ${w}.`], summary: `${a} + ? = ${w}`, explanation: `${a} and ${w - a} make ${w}.` });
  }
  if (fmt === 'frame') {
    const n = rand(1, 9);
    return kid({ key: `bd:frame:${n}`, topic, answer: 10 - n, prompt: `How many more dots make 10?`, speak: 'How many more dots make ten?', visual: { type: 'tenframe', count: n }, hints: ['Count the empty spaces.'], summary: `${n} and ? make 10`, explanation: `${n} and ${10 - n} make 10.` });
  }
  if (fmt === 'family') {
    const a = rand(1, w - 1); const b = w - a;
    return kid({ key: `bd:family:${a}:${b}`, topic, answer: a, prompt: `${a} + ${b} = ${w}. So ${w} − ${b} = ?`, speak: `${a} plus ${b} equals ${w}. So ${w} minus ${b} equals what number?`, hints: ['Adding and taking away undo each other.'], summary: `${w} − ${b}`, explanation: `Since ${a} + ${b} = ${w}, we know ${w} − ${b} = ${a}.` });
  }
  if (fmt === 'doubles') {
    const n = rand(1, Math.min(10, Math.floor(w / 2)));
    return kid({ key: `bd:double:${n}`, topic, answer: 2 * n, prompt: `Double ${n}. What is ${n} + ${n}?`, speak: `Double ${n}. What is ${n} plus ${n}?`, visual: { type: 'groups', groups: [{ emoji: '🔵', count: n }, { emoji: '🔵', count: n }], op: '+' }, hints: ['Doubles means the same number twice.'], summary: `Double ${n}`, explanation: `${n} + ${n} = ${2 * n}.` });
  }
  if (fmt === 'pair') {
    const a = rand(1, w - 1); const wrong = uniq([`${a} + ${w - a + 1}`, `${a + 1} + ${w - a + 1}`, `${a} + ${Math.max(1, w - a - 1)}`]).filter((x) => x !== `${a} + ${w - a}`).slice(0, 2);
    return ch({ key: `bd:pair:${w}:${a}`, topic, prompt: `Which pair of numbers makes ${w}?`, speak: `Which pair of numbers makes ${w}?`, hints: ['Add each pair and see which one equals the whole.'], summary: `Pair for ${w}`, explanation: `${a} + ${w - a} = ${w}.`, answerLabel: `${a} + ${w - a}` }, txt(`${a} + ${w - a}`), wrong.map(txt));
  }
  const a = rand(1, 4); const b = rand(1, 4); const c = rand(1, 5);
  return kid({ key: `bd:three:${a}:${b}:${c}`, topic, answer: a + b + c, prompt: `${a} + ${b} + ${c} = ?`, speak: `${a} plus ${b} plus ${c} equals what number?`, hints: ['Add two numbers first. Then add the last one.'], summary: `${a} + ${b} + ${c}`, explanation: `${a} + ${b} = ${a + b}, and ${a + b} + ${c} = ${a + b + c}.` });
}

const COINS = { 1: 'penny', 5: 'nickel', 10: 'dime', 25: 'quarter', 100: 'dollar' };
export function moneyMore(mode, lv) {
  const topic = 'money';
  const have = lvl(lv, [1, 5, 10], [1, 5, 10, 25], [1, 5, 10, 25, 100]);
  const fmt = pick(lvl(lv, ['identify', 'value', 'more', 'trade', 'whichWorth', 'sameValue', 'mixed'], ['identify', 'value', 'more', 'trade', 'count', 'whichWorth', 'sameValue', 'mixed'], ['identify', 'value', 'trade', 'count', 'enough', 'sameValue', 'mixed']));
  const coin = (c) => ({ visual: { type: 'coins', coins: [c] } });
  if (fmt === 'whichWorth') {
    const c = pick(have.filter((x) => x < 100));
    return ch({ key: `mn:worth:${c}`, topic, prompt: `Which coin is worth ${c} cent${c === 1 ? '' : 's'}?`, speak: `Which coin is worth ${c} cent${c === 1 ? '' : 's'}?`, hints: ['A penny is 1, a nickel is 5, a dime is 10, a quarter is 25.'], summary: `Coin worth ${c}¢`, explanation: `The ${COINS[c]} is worth ${c} cents.`, answerLabel: COINS[c] },
    coin(c), sample(have.filter((x) => x !== c && x < 100), 2).map(coin));
  }
  if (fmt === 'sameValue') {
    const t = pick([5, 10].filter((x) => have.includes(x))); const eq = t === 5 ? Array(5).fill(1) : pick([[5, 5], Array(10).fill(1)]); const wrongs = t === 5 ? [Array(4).fill(1), [1, 1], [10]] : [[5], [5, 1, 1], Array(8).fill(1)];
    return ch({ key: `mn:same:${t}:${eq.join('')}`, topic, prompt: `Which is worth the same as a ${COINS[t]}?`, speak: `Which is worth the same as a ${COINS[t]}?`, hints: ['Add up the coins in each choice.'], summary: `Same as a ${COINS[t]}`, explanation: `These coins add up to ${t} cents, the same as a ${COINS[t]}.`, answerLabel: `${t} cents` },
    { visual: { type: 'coins', coins: eq } }, sample(wrongs, 2).map((cs) => ({ visual: { type: 'coins', coins: cs } })));
  }
  if (fmt === 'mixed') {
    const kinds = have.filter((x) => x < 100 && x <= 25); const n = rand(2, lvl(lv, 4, 5, 6)); const cs = Array.from({ length: n }, () => pick(kinds)).sort((a, b) => b - a); const total = cs.reduce((a, b) => a + b, 0);
    return kid({ key: `mn:mixed:${cs.join('-')}`, topic, answer: total, prompt: 'How many cents are in all?', speak: 'How many cents are in all?', visual: { type: 'coins', coins: cs }, hints: ['Count the biggest coins first, then the smaller ones.'], summary: `Coins: ${total}¢`, explanation: `Added up, the coins are worth ${total} cents.` });
  }
  if (fmt === 'identify') {
    const c = pick(have);
    return ch({ key: `mn:identify:${c}`, topic, story: st(mode, '🪙', 'Meet the Coins'), prompt: `Which coin is a ${COINS[c].toUpperCase()}?`, speak: `Which coin is a ${COINS[c]}?`, hints: ['Look at the size and color of each coin.'], summary: `Find the ${COINS[c]}`, explanation: `That is the ${COINS[c]}.`, answerLabel: COINS[c] },
    coin(c), sample(have.filter((x) => x !== c), Math.min(have.length - 1, lvl(lv, 2, 2, 3))).map(coin));
  }
  if (fmt === 'value') {
    const c = pick(have.filter((x) => x < 100));
    return kid({ key: `mn:value:${c}`, topic, answer: c, prompt: `How many cents is a ${COINS[c]} worth?`, speak: `How many cents is a ${COINS[c]} worth?`, visual: { type: 'coins', coins: [c] }, hints: ['A penny is 1, a nickel is 5, a dime is 10, a quarter is 25.'], summary: `Value of a ${COINS[c]}`, explanation: `A ${COINS[c]} is worth ${c} cents.` });
  }
  if (fmt === 'more') {
    const [a, b] = sample(have.filter((x) => x < 100), 2); const big = Math.max(a, b); const small = Math.min(a, b);
    return ch({ key: `mn:more:${small}:${big}`, topic, prompt: 'Which coin is worth MORE?', speak: 'Which coin is worth more?', hints: ['Remember: penny 1, nickel 5, dime 10, quarter 25.'], summary: `${COINS[small]} or ${COINS[big]}`, explanation: `A ${COINS[big]} is worth ${big} cents. A ${COINS[small]} is worth ${small}.`, answerLabel: COINS[big] }, coin(big), [coin(small)]);
  }
  if (fmt === 'trade') {
    const T = [[5, 'pennies', 'a nickel', 5], [10, 'pennies', 'a dime', 10], [2, 'nickels', 'a dime', 10], [4, 'quarters', 'a dollar', 100], [10, 'dimes', 'a dollar', 100], [5, 'nickels', 'a quarter', 25]].filter((t) => have.includes(t[3]));
    const [n, name, what] = pick(T);
    return kid({ key: `mn:trade:${name}:${what}`, topic, answer: n, prompt: `How many ${name} are worth the same as ${what}?`, speak: `How many ${name} are worth the same as ${what}?`, hints: ['Count up by the value of each coin.'], summary: `${name} for ${what}`, explanation: `${n} ${name} are worth the same as ${what}.` });
  }
  if (fmt === 'count') {
    const c = pick(have.filter((x) => x < 100)); const n = rand(2, lvl(lv, 4, 5, 6));
    return kid({ key: `mn:count:${c}:${n}`, topic, answer: c * n, prompt: `${n} ${COINS[c]}${n === 1 ? '' : c === 1 ? 's' : 's'}. How many cents?`.replace('pennys', 'pennies'), speak: `${n} ${c === 1 ? 'pennies' : COINS[c] + 's'}. How many cents?`, visual: { type: 'coins', coins: Array(n).fill(c) },
      hints: [`Count by ${c}s.`], summary: `${n} ${COINS[c]}s`, explanation: `${n} ${COINS[c]}s is ${c * n} cents.` });
  }
  const price = rand(11, 29); const coinsHave = pick([[10, 5], [10, 10], [25], [10, 5, 5]]); const total = coinsHave.reduce((a, b) => a + b, 0); const yes = total >= price;
  return ch({ key: `mn:enough:${price}:${coinsHave.join('-')}`, topic, prompt: `You have these coins. A sticker costs ${price}¢. Do you have enough?`, speak: `You have these coins. A sticker costs ${price} cents. Do you have enough?`, visual: { type: 'coins', coins: coinsHave },
    hints: ['Add up the coins first.'], summary: `Enough for ${price}¢?`, explanation: `The coins add up to ${total} cents. ${yes ? 'That is enough' : 'That is not enough'} for ${price} cents.`, answerLabel: yes ? 'Yes' : 'No' },
  { text: yes ? 'Yes' : 'No' }, [{ text: yes ? 'No' : 'Yes' }]);
}
