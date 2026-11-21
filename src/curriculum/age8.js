/**
 * Age 8 — "Math Trailblazers" (3rd grade)
 * Pitched for advanced 3rd graders: "Advanced" is the default; "Challenge" reaches into
 * 4th grade (facts to 12×12, ×/÷ by multiples of 10, 2-digit × 1-digit, equivalent fractions,
 * L-shaped areas, graphs that count by 2s).
 *
 * All typed answers are whole numbers, so the simple keypad is enough; fractions are tap-to-choose
 * or "fill in the missing number".
 */
import * as A7 from './age7.js';
import { retopic, makeChoices, NAMES } from './shared.js';
import { themed8, middleEarthOn, THEME_RATE } from './middleEarth.js';
import { rand, pick, sample, shuffle, chance, gcd } from '../lib/rng.js';

const L = (d) => (d === 'easy' || d === 'challenge' ? d : 'standard');
const by = (d, e, s, c) => (d === 'easy' ? e : d === 'challenge' ? c : s);
const nm = () => pick(NAMES);
const fmt = (n) => n.toLocaleString('en-US');
const kp = (o) => ({ input: 'keypad', answerLabel: fmt(o.answer), ...o, answer: String(o.answer) });
function choose(o, correct, wrong) {
  const { choices, answer } = makeChoices(correct, wrong);
  return { input: 'choice', choices, answer, answerLabel: correct.text, ...o };
}

/* ------------------------------ Multiplication ------------------------------ */
const FACTS = { easy: [2, 3, 4, 5, 10], standard: [2, 3, 4, 5, 6, 7, 8, 9, 10], challenge: [6, 7, 8, 9, 11, 12] };
const GROUP_STORIES = [
  ['🍪', 'Bake Sale', (r, c) => `There are ${r} trays with ${c} cookies on each tray. How many cookies?`],
  ['🚗', 'Parking Lot', (r, c) => `A parking lot has ${r} rows with ${c} cars in each row. How many cars?`],
  ['🌱', 'Garden', (r, c) => `${nm()} plants ${r} rows of carrots with ${c} carrots in each row. How many carrots?`],
  ['🎟️', 'Movie Night', (r, c) => `${r} friends each buy ${c} tickets. How many tickets in all?`],
];
function mul(mode, d) {
  const topic = 'mul';
  const a = pick(FACTS[d]); const b = rand(2, by(d, 10, 10, 12));
  if (mode === 'story') {
    const [e, title, text] = pick(GROUP_STORIES);
    return kp({ key: `mul:story:${title}:${a}:${b}`, topic, story: { emoji: e, title }, prompt: text(b, a), answer: a * b,
      hints: [`${b} groups of ${a}.`, `Skip count by ${a} ${b} times.`], explanation: `${b} × ${a} = ${a * b}.` });
  }
  if (mode === 'stem') {
    const f = pick(by(d, ['array', 'missing'], ['array', 'missing', 'distribute'], ['distribute', 'tens', 'missing']));
    if (f === 'array') {
      return kp({ key: `mul:array:${b}:${a}`, topic, prompt: `${b} rows of ${a}. How many in all?`, visual: { type: 'array', rows: b, cols: a }, answer: a * b,
        hints: [`Count one row: ${a}. Then skip count by ${a}.`], explanation: `${b} × ${a} = ${a * b}.` });
    }
    if (f === 'missing') {
      return kp({ key: `mul:miss:${a}:${b}`, topic, prompt: 'What number is missing?', display: `${a} × ? = ${a * b}`, answer: b,
        hints: [`Count by ${a} until you reach ${a * b}.`], explanation: `${a} × ${b} = ${a * b}.` });
    }
    if (f === 'tens') {
      const t = rand(2, 9) * 10; const k = rand(2, 9);
      return kp({ key: `mul:tens:${k}:${t}`, topic, prompt: 'Use a fact you know!', display: `${k} × ${t}`, answer: k * t,
        hints: [`${k} × ${t / 10} = ${(k * t) / 10}.`, 'Now make it ten times bigger.'], explanation: `${k} × ${t / 10} = ${(k * t) / 10}, so ${k} × ${t} = ${k * t}.` });
    }
    // distributive: 7 × 14 = 7 × 10 + 7 × 4
    const k = rand(3, 9); const n = rand(12, by(d, 15, 19, 39));
    return kp({ key: `mul:dist:${k}:${n}`, topic, prompt: 'Break it apart to multiply.', display: `${k} × ${n}`, answer: k * n,
      hints: [`${k} × ${n} = ${k} × ${n - (n % 10)} + ${k} × ${n % 10}.`], explanation: `${k} × ${n - (n % 10)} = ${k * (n - (n % 10))} and ${k} × ${n % 10} = ${k * (n % 10)}. Together: ${k * n}.` });
  }
  if (d === 'challenge' && mode === 'worksheet' && chance(0.4)) {
    const k = rand(3, 9); const n = rand(12, 99);
    return kp({ key: `mul:2d:${k}:${n}`, topic, display: `${n} × ${k}`, answer: k * n, explanation: `${n} × ${k} = ${k * n}.` });
  }
  return kp({ key: `mul:${a}:${b}`, topic, display: chance(0.5) ? `${a} × ${b}` : `${b} × ${a}`, answer: a * b, explanation: `${a} × ${b} = ${a * b}.` });
}

/* -------------------------------- Division -------------------------------- */
function div(mode, d) {
  const topic = 'div';
  const a = pick(FACTS[d]); const q = rand(2, by(d, 10, 10, 12));
  if (mode === 'story') {
    const T = pick([
      ['🍕', 'Pizza Party', `${a * q} slices of pizza are shared equally by ${a} friends. How many slices does each friend get?`],
      ['🚐', 'Field Trip', `${a * q} students ride in vans. Each van holds ${a}. How many vans are full?`],
      ['🖍️', 'Art Class', `${nm()} puts ${a * q} crayons into boxes of ${a}. How many boxes?`],
    ]);
    return kp({ key: `div:story:${T[1]}:${a}:${q}`, topic, story: { emoji: T[0], title: T[1] }, prompt: T[2], answer: q,
      hints: [`What times ${a} makes ${a * q}?`], explanation: `${a * q} ÷ ${a} = ${q}, because ${a} × ${q} = ${a * q}.` });
  }
  if (mode === 'stem' || (d === 'challenge' && chance(0.4))) {
    if (d === 'challenge') {
      const k = rand(2, 9); const n = rand(11, 30);
      return kp({ key: `div:big:${k}:${n}`, topic, prompt: 'Divide.', display: `${k * n} ÷ ${k}`, answer: n,
        hints: [`Split ${k * n} into tens and ones you can divide by ${k}.`], explanation: `${k} × ${n} = ${k * n}, so ${k * n} ÷ ${k} = ${n}.` });
    }
    return kp({ key: `div:fam:${a}:${q}`, topic, prompt: 'Use the fact family.', display: `${a} × ${q} = ${a * q}, so ${a * q} ÷ ${a} = ?`, answer: q,
      explanation: `Multiplication and division are opposites: ${a * q} ÷ ${a} = ${q}.` });
  }
  return kp({ key: `div:${a}:${q}`, topic, display: `${a * q} ÷ ${a}`, answer: q, hints: [`${a} × ? = ${a * q}`], explanation: `${a} × ${q} = ${a * q}, so ${a * q} ÷ ${a} = ${q}.` });
}

/* ---------------------------- Fractions ---------------------------- */
function fractions(mode, d) {
  const topic = 'fractions';
  const f = pick(by(d, ['name', 'line', 'compare'], ['line', 'equiv', 'compare', 'name'], ['equiv', 'line', 'compareSame', 'ofset']));
  if (f === 'name' || f === 'ofset') return retopic(A7.fractions(mode, f === 'ofset' ? 'challenge' : 'standard'), topic);
  if (f === 'line') {
    const den = pick(by(d, [2, 3, 4], [3, 4, 6, 8], [4, 6, 8])); const max = d === 'challenge' ? 2 : 1;
    let mark = rand(1, den * max - 1); if (mark % den === 0) mark += 1;
    const label = `[[${mark}/${den}]]`;
    const seen = [[mark, den]]; const wrong = [];
    for (const [a, b] of [[mark + 1, den], [mark, den + 2], [Math.max(1, mark - 1), den], [den, mark + den], [mark + 2, den]]) {
      if (wrong.length >= 3 || seen.some(([x, y]) => x * b === a * y)) continue; // no two choices with the same value
      seen.push([a, b]); wrong.push(`[[${a}/${b}]]`);
    }
    return choose({ key: `frac:line:${den}:${mark}:${max}`, topic, prompt: 'What fraction is at the red dot?', visual: { type: 'fracline', den, mark, max },
      hints: [`Each whole is cut into ${den} equal parts.`, 'Count the jumps from 0 to the dot.'], explanation: `The dot is ${mark} jumps of [[1/${den}]] from 0: ${label}.` },
    { text: label }, wrong.map((x) => ({ text: x })));
  }
  if (f === 'equiv') {
    const [n, dd] = pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5]]); const k = rand(2, 4);
    return kp({ key: `frac:eq:${n}:${dd}:${k}`, topic, prompt: 'Fill in the missing number.', display: `[[${n}/${dd}]] = ?/${dd * k}`,
      visual: { type: 'fracshape', parts: dd * k, shaded: n * k, kind: 'rect' }, answer: n * k,
      hints: [`${dd} × ${k} = ${dd * k}, so multiply the top by ${k} too.`], explanation: `[[${n}/${dd}]] = [[${n * k}/${dd * k}]] because both parts were multiplied by ${k}.` });
  }
  if (f === 'compareSame') {
    const den = pick([4, 5, 6, 8, 10]); const [a, b] = sample(Array.from({ length: den - 1 }, (_, i) => i + 1), 2);
    const big = Math.max(a, b);
    return choose({ key: `frac:cmpn:${den}:${a}:${b}`, topic, prompt: 'Which fraction is GREATER?', hints: ['Same-size pieces: more pieces is more.'],
      explanation: `Both are ${den}ths, and ${big} pieces is more than ${Math.min(a, b)}.` }, { text: `[[${big}/${den}]]` }, [{ text: `[[${Math.min(a, b)}/${den}]]` }]);
  }
  return retopic(A7.fractions(mode, 'standard'), topic);
}

/* ---------------------------- Area & perimeter ---------------------------- */
function area(mode, d) {
  const topic = 'area';
  const f = mode === 'story' ? pick(['garden', 'fence']) : pick(by(d, ['count', 'count', 'perim'], ['formula', 'perim', 'count', 'missing'], ['lshape', 'missing', 'formula', 'perim']));
  const w = rand(2, by(d, 6, 9, 12)); const h = rand(2, by(d, 5, 8, 10));
  if (f === 'count') return kp({ key: `area:count:${w}:${h}`, topic, prompt: 'What is the area? Count the square units.', visual: { type: 'areagrid', w, h }, answer: w * h,
    hints: [`There are ${h} rows of ${w}.`], explanation: `${h} rows × ${w} = ${w * h} square units.` });
  if (f === 'formula') return kp({ key: `area:formula:${w}:${h}`, topic, prompt: 'Find the area of the rectangle in square feet.', visual: { type: 'rect', w, h, unit: 'ft' }, answer: w * h,
    hints: ['Area = length × width.'], explanation: `${w} × ${h} = ${w * h} square feet.` });
  if (f === 'perim') return kp({ key: `area:perim:${w}:${h}`, topic, prompt: 'Find the perimeter in centimeters.', visual: { type: 'rect', w, h, unit: 'cm' }, answer: 2 * (w + h),
    hints: ['Add all 4 sides.'], explanation: `${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} cm.` });
  if (f === 'missing') {
    const askP = chance(0.5);
    return kp({ key: `area:miss:${w}:${h}:${askP}`, topic, prompt: askP ? `A rectangle has a perimeter of ${2 * (w + h)} m. One side is ${w} m. How long is the other side?` : `A rectangle has an area of ${w * h} square meters. One side is ${w} m. How long is the other side?`,
      answer: h, hints: askP ? [`Two sides together are half the perimeter: ${w + h}.`] : [`${w} × ? = ${w * h}`], explanation: askP ? `${w + h} − ${w} = ${h} m.` : `${w * h} ÷ ${w} = ${h} m.` });
  }
  if (f === 'lshape') {
    const W = rand(5, 9); const H = rand(4, 8); const cw = rand(2, W - 2); const ch = rand(1, H - 2);
    return kp({ key: `area:L:${W}:${H}:${cw}:${ch}`, topic, prompt: 'What is the area of this shape in square units?', visual: { type: 'areagrid', w: W, h: H, lshape: { cw, ch } }, answer: W * H - cw * ch,
      hints: ['Find the big rectangle, then take away the missing corner.', `${W} × ${H} = ${W * H}.`], explanation: `${W * H} − ${cw} × ${ch} = ${W * H - cw * ch} square units.` });
  }
  if (f === 'fence') return kp({ key: `area:fence:${w}:${h}`, topic, story: { emoji: '🐕', title: 'Dog Pen' }, prompt: `${nm()} builds a dog pen ${w + 2} feet long and ${h + 1} feet wide. How many feet of fence go all the way around?`,
    answer: 2 * (w + 2 + h + 1), hints: ['Perimeter: add all 4 sides.'], explanation: `2 × (${w + 2} + ${h + 1}) = ${2 * (w + h + 3)} feet.` });
  return kp({ key: `area:garden:${w}:${h}`, topic, story: { emoji: '🥕', title: 'Garden Plot' }, prompt: `A garden is ${w + 2} meters long and ${h + 1} meters wide. What is its area in square meters?`,
    answer: (w + 2) * (h + 1), hints: ['Area = length × width.'], explanation: `${w + 2} × ${h + 1} = ${(w + 2) * (h + 1)} square meters.` });
}

/* ------------------------- Mass & liquid volume ------------------------- */
function massVolume(mode, d) {
  const topic = 'mass';
  const T = pick([
    () => { const k = rand(2, by(d, 5, 9, 12)); const per = rand(2, by(d, 5, 9, 25)); return ['🍎', 'Apple Crates', `Each crate of apples weighs ${per} kilograms. How many kilograms do ${k} crates weigh?`, k * per, [`${k} × ${per}`]]; },
    () => { const a = rand(by(d, 120, 250, 450), by(d, 400, 800, 950)); const b = rand(by(d, 50, 100, 150), a - 20); return ['⚖️', 'Weighing', `A bag of flour weighs ${a} grams. A bag of sugar weighs ${b} grams. How much heavier is the flour, in grams?`, a - b, [`${a} − ${b}`]]; },
    () => { const per = rand(2, 6); const k = rand(3, by(d, 6, 9, 12)); return ['🪣', 'Filling the Tank', `A bucket holds ${per} liters. How many liters do ${k} buckets hold?`, per * k, [`${k} × ${per}`]]; },
    () => { const k = rand(2, 9); const per = rand(3, 9); return ['🥤', 'Juice Jugs', `${k * per} liters of juice are poured equally into ${k} jugs. How many liters in each jug?`, per, [`${k * per} ÷ ${k}`]]; },
  ])();
  const [e, title, text, ans, hints] = T;
  return kp({ key: `mass:${title}:${ans}:${text.length}`, topic, story: mode === 'story' ? { emoji: e, title } : undefined, prompt: text, answer: ans, hints, explanation: `${hints[0]} = ${ans}.` });
}

/* ---------------------------- Number patterns ---------------------------- */
function patterns(mode, d) {
  const topic = 'patterns';
  const f = pick(by(d, ['skip', 'evenodd'], ['skip', 'table', 'evenodd', 'puzzle'], ['table', 'puzzle', 'skip', 'twoStep']));
  if (f === 'skip') return retopic(A7.skip(mode, d === 'easy' ? 'standard' : 'challenge'), topic);
  if (f === 'evenodd') return retopic(A7.evenodd(mode === 'stem' ? 'worksheet' : mode, 'challenge'), topic);
  if (f === 'puzzle') return retopic(A7.puzzles('stem', 'challenge'), topic);
  if (f === 'table') {
    const k = rand(2, 9); const start = rand(1, 4); const ins = [start, start + 1, start + 2, start + rand(4, 6)];
    return kp({ key: `pat:table:${k}:${ins.join(',')}`, topic, prompt: `The rule is "multiply by ${k}". What number comes out for ${ins[3]}?`,
      visual: { type: 'sequence', terms: ins.slice(0, 3).map((x) => `${x}→${x * k}`), blank: true }, answer: ins[3] * k,
      explanation: `${ins[3]} × ${k} = ${ins[3] * k}.` });
  }
  const a = rand(3, 9); const b = rand(2, 6); const c = rand(5, 30);
  return kp({ key: `pat:two:${a}:${b}:${c}`, topic, prompt: `${nm()} has ${c} stickers and gets ${a} packs with ${b} stickers in each. How many stickers now?`,
    answer: c + a * b, hints: [`First: ${a} × ${b} = ${a * b}.`, `Then add ${c}.`], explanation: `${c} + ${a} × ${b} = ${c} + ${a * b} = ${c + a * b}.` });
}

const ALL = ['flash', 'worksheet', 'story', 'stem'];
const D7 = { easy: 'standard', standard: 'challenge', challenge: 'challenge' };

export default {
  age: 8,
  title: 'Math Trailblazers',
  tagline: 'Multiplication & division, fractions, area, time & measurement',
  accent: 'violet',
  allowRetry: true,
  bigInput: false,
  readAloud: false,
  keypad: 'simple',
  topics: [
    { id: 'mul', label: 'Multiplication', group: 'Multiply & Divide', modes: ALL },
    { id: 'div', label: 'Division', group: 'Multiply & Divide', modes: ALL },
    { id: 'patterns', label: 'Patterns & Puzzles', group: 'Multiply & Divide', modes: ['worksheet', 'stem'] },
    { id: 'add', label: 'Adding to 1,000', group: 'Numbers to 1,000', modes: ['flash', 'worksheet', 'story'] },
    { id: 'sub', label: 'Subtracting to 1,000', group: 'Numbers to 1,000', modes: ['flash', 'worksheet', 'story'] },
    { id: 'rounding', label: 'Place Value & Rounding', group: 'Numbers to 1,000', modes: ['flash', 'worksheet', 'stem'] },
    { id: 'fractions', label: 'Fractions', group: 'Fractions & Geometry', modes: ['worksheet', 'stem'] },
    { id: 'area', label: 'Area & Perimeter', group: 'Fractions & Geometry', modes: ['worksheet', 'story', 'stem'] },
    { id: 'geometry', label: 'Shapes & Quadrilaterals', group: 'Fractions & Geometry', modes: ['worksheet', 'stem'] },
    { id: 'time', label: 'Time & Elapsed Time', group: 'Measurement & Data', modes: ['flash', 'worksheet', 'story', 'stem'] },
    { id: 'mass', label: 'Mass & Liquid Volume', group: 'Measurement & Data', modes: ['worksheet', 'story'] },
    { id: 'data', label: 'Scaled Graphs', group: 'Measurement & Data', modes: ['worksheet', 'stem'] },
  ],
  difficulties: [
    { id: 'easy', label: 'Warm-up', detail: '× and ÷ by 2, 3, 4, 5, 10; halves to fourths; count square units' },
    { id: 'standard', label: 'Advanced', detail: 'All facts to 10 × 10, fractions on a number line, area & perimeter, elapsed time' },
    { id: 'challenge', label: 'Challenge', detail: '4th-grade reach: facts to 12, × by tens, 2-digit × 1-digit, equivalent fractions, L-shapes' },
  ],
  defaultDifficulty: 'standard',
  defaults: {
    flash: { seconds: 60, maxCards: 50 },
    worksheet: { count: 15 },
    story: { count: 6 },
    stem: { count: 8 },
    mix: { count: 12 },
  },
  countOptions: { worksheet: [10, 15, 20], story: [4, 6, 8], stem: [6, 8, 10], mix: [8, 12, 16] },
  secondsOptions: [60, 90, 120],
  expectedMs: { flash: 5000, worksheet: 25000, story: 45000, stem: 40000, mix: 30000 },

  generate(mode, topic, difficulty = 'standard') {
    const d = L(difficulty);
    if (middleEarthOn() && chance(THEME_RATE)) {
      const themed = themed8(mode, topic, d);
      if (themed) return themed;
    }
    switch (topic) {
      case 'mul': return mul(mode, d);
      case 'div': return div(mode, d);
      case 'patterns': return patterns(mode, d);
      case 'add': return retopic(A7.addition(mode, D7[d]), topic);
      case 'sub': return retopic(A7.subtraction(mode, D7[d]), topic);
      case 'rounding': return retopic(A7.placevalue(mode, d === 'easy' ? 'standard' : 'challenge'), topic);
      case 'fractions': return fractions(mode, d);
      case 'area': return area(mode, d);
      case 'geometry': return retopic(A7.geometry(mode, 'challenge'), topic);
      case 'time': return retopic(A7.time(mode, D7[d]), topic);
      case 'mass': return massVolume(mode, d);
      case 'data': return retopic(A7.data(mode, 'challenge'), topic);
      default: return null;
    }
  },
};

export { shuffle, gcd };
