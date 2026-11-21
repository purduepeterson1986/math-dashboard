/**
 * Age 5 — "Number Builders" (Kindergarten)
 * Pitched for advanced kindergartners: "Advanced" is the default; "Stretch" reaches into
 * 1st grade (add & subtract within 20, tens & ones to 99, compare with < > =, half hours, inches).
 *
 * Every question has a plain-English `speak` (no symbols) because pre-readers hear it read aloud.
 * Answers are whole numbers: 0–10 use the big tap pad, bigger answers use the simple keypad.
 */
import { rand, pick, sample, shuffle, chance, distinctInts } from '../lib/rng.js';
import { COLORS, NAMES, makeChoices, plural, distinctShape } from './shared.js';
import { themed5, middleEarthOn, THEME_RATE } from './middleEarth.js';

const THINGS = [
  { e: '🍎', one: 'apple', many: 'apples' }, { e: '⭐', one: 'star', many: 'stars' },
  { e: '🐟', one: 'fish', many: 'fish' }, { e: '🎈', one: 'balloon', many: 'balloons' },
  { e: '🐞', one: 'ladybug', many: 'ladybugs' }, { e: '🍪', one: 'cookie', many: 'cookies' },
  { e: '🌸', one: 'flower', many: 'flowers' }, { e: '🚗', one: 'car', many: 'cars' },
  { e: '🦆', one: 'duck', many: 'ducks' }, { e: '🍓', one: 'strawberry', many: 'strawberries' },
  { e: '⚽', one: 'ball', many: 'balls' }, { e: '🐸', one: 'frog', many: 'frogs' },
  { e: '🧁', one: 'cupcake', many: 'cupcakes' }, { e: '🐚', one: 'shell', many: 'shells' },
];
const CATEGORIES = {
  fruit: ['🍎', '🍌', '🍇', '🍓', '🍊', '🍐', '🍒', '🍉'],
  animals: ['🐶', '🐱', '🐰', '🐻', '🦁', '🐸', '🐵', '🐷'],
  vehicles: ['🚗', '🚌', '🚲', '✈️', '🚂', '🚀', '🚜', '🚤'],
  clothes: ['👕', '👖', '🧦', '🧢', '👟', '🧤', '👗', '🧣'],
};
const SOLIDS = {
  sphere: ['⚽', '🏀', '🌍', '🔮', '🍊'],
  cube: ['🎲', '🧊', '📦'],
  cylinder: ['🥫', '🔋', '🥁'],
  cone: ['🍦', '🎉', '🚧'],
};
const HEAVY_LIGHT = [['🐘', '🪶', 'elephant', 'feather'], ['🚗', '⚽', 'car', 'ball'], ['🎳', '🎈', 'bowling ball', 'balloon'],
  ['🍉', '🍇', 'watermelon', 'grape'], ['🪨', '🍃', 'rock', 'leaf'], ['🐻', '🐭', 'bear', 'mouse'], ['📚', '✏️', 'stack of books', 'pencil']];
const SHAPES_2D = ['circle', 'square', 'triangle', 'rectangle', 'hexagon', 'oval', 'diamond', 'star'];
const SIDES = { triangle: 3, square: 4, rectangle: 4, hexagon: 6, diamond: 4 };

const lvl = (d) => (d === 'gentle' || d === 'stretch' ? d : 'ready');
const by = (d, g, r, s) => (d === 'gentle' ? g : d === 'stretch' ? s : r);
const name = () => pick(NAMES);
const colorNames = Object.keys(COLORS);

/** Whole-number answer: tap pad for 0–10, simple keypad above that. */
function num(o) {
  const a = o.answer;
  return { input: a <= 10 ? 'kidpad' : 'keypad', answerLabel: String(a), ...o, answer: String(a) };
}
function choose(o, correct, wrong) {
  const { choices, answer } = makeChoices(correct, wrong);
  return { input: 'choice', choices, answer, answerLabel: correct.text || o.answerLabel, ...o };
}
const bigNum = (n) => ({ text: String(n), big: true });

/* ------------------------------ Counting ------------------------------ */
export function count20(mode, d) {
  const topic = 'count20';
  const [lo, hi] = by(d, [6, 12], [11, 20], [18, 45]);
  const n = rand(lo, hi);
  const t = pick(THINGS);
  const fmt = mode === 'stem' ? pick(['countOn', 'frames']) : mode === 'story' ? 'story' : n > 20 ? 'frames' : pick(['how', 'how', 'frames']);
  if (fmt === 'countOn') {
    const start = rand(by(d, 3, 8, 15), by(d, 9, 15, 40)); const more = rand(2, by(d, 4, 5, 9));
    return num({ key: `${topic}:on:${start}:${more}`, topic, answer: start + more,
      prompt: `Start at ${start}. Count on ${more} more.`, visual: { type: 'sequence', terms: [String(start), ...Array(more - 1).fill('·')], blank: true },
      speak: `Start at ${start}. Count on ${more} more. Where do you land?`, hints: [`Say ${start}, then count ${more} more on your fingers.`],
      summary: `${start} count on ${more}`, explanation: `${start}, ${Array.from({ length: more }, (_, i) => start + i + 1).join(', ')}. You land on ${start + more}.` });
  }
  if (fmt === 'frames') {
    return num({ key: `${topic}:frames:${n}`, topic, answer: n, prompt: 'How many dots?', visual: { type: 'tenframe', count: n },
      speak: 'How many dots are there? Count the full ten frames by tens.', hints: ['Each full ten frame is 10.', 'Count the full frames by tens, then count the extra dots.'],
      summary: `${n} dots in ten frames`, explanation: n >= 10 ? `${Math.floor(n / 10)} full ten${n >= 20 ? 's' : ''} and ${n % 10} more makes ${n}.` : `There are ${n}.` });
  }
  if (fmt === 'story') {
    const who = name();
    if (n <= 20) {
      return num({ key: `${topic}:story:${t.e}:${n}`, topic, answer: n, story: { emoji: t.e, title: `${who}'s Collection` },
        prompt: `${who} lined up some ${t.many}. How many ${t.many} are there?`, visual: { type: 'objects', emoji: t.e, count: n },
        speak: `${who} lined up some ${t.many}. How many ${t.many} are there?`, hints: ['Count each row of 5.', 'Touch each one as you count.'],
        summary: `Count ${n} ${t.many}`, explanation: `There are ${n} ${t.many}.` });
    }
    return num({ key: `${topic}:story:frames:${n}`, topic, answer: n, story: { emoji: '🥚', title: `${who}'s Egg Cartons` },
      prompt: `${who} packed eggs in rows of ten. How many eggs?`, visual: { type: 'tenframe', count: n },
      speak: `${who} packed eggs in rows of ten. How many eggs are there?`, hints: ['Count the full rows by tens: 10, 20, 30.', 'Then count on the extra eggs.'],
      summary: `Count ${n} eggs`, explanation: `${Math.floor(n / 10)} tens and ${n % 10} ones is ${n}.` });
  }
  return num({ key: `${topic}:how:${t.e}:${n}`, topic, answer: n, prompt: `How many ${t.many}?`, visual: { type: 'objects', emoji: t.e, count: n },
    speak: `How many ${t.many}?`, summary: `Count ${n} ${t.many}`, explanation: `There are ${n}.` });
}

/* --------------------------- Teens / tens & ones --------------------------- */
export function teens(mode, d) {
  const topic = 'teens';
  if (d === 'stretch' || (mode === 'stem' && chance(0.5))) {
    const tens = rand(2, 9); const ones = rand(0, 9); const n = tens * 10 + ones;
    if (chance(0.5)) {
      return num({ key: `${topic}:to:${n}`, topic, answer: n, prompt: `${tens} tens and ${ones} ones. What number is it?`, visual: { type: 'base10', tens, ones },
        speak: `${tens} tens and ${ones} ones. What number is that?`, hints: ['Count the long tens by tens: 10, 20, 30.', 'Then add the little ones.'],
        summary: `${tens} tens ${ones} ones`, explanation: `${tens} tens is ${tens * 10}. Plus ${ones} is ${n}.` });
    }
    return num({ key: `${topic}:tens:${n}`, topic, answer: tens, prompt: `How many tens are in ${n}?`, display: String(n),
      speak: `How many tens are in the number ${n}?`, hints: [`The first digit of ${n} tells the tens.`],
      summary: `Tens in ${n}`, explanation: `${n} is ${tens} tens and ${ones} ones.` });
  }
  const ones = rand(1, 9); const n = 10 + ones;
  if (mode === 'flash' || chance(0.5)) {
    return num({ key: `${topic}:ten+:${ones}`, topic, answer: n, prompt: `10 and ${ones} more is…`, display: `10 + ${ones}`, visual: { type: 'tenframe', count: n },
      speak: `10 and ${ones} more is what number?`, summary: `10 and ${ones}`, explanation: `10 and ${ones} more makes ${n}.` });
  }
  return num({ key: `${topic}:ones:${n}`, topic, answer: ones, prompt: `${n} is 10 and how many more?`, display: String(n), visual: { type: 'tenframe', count: n },
    speak: `${n} is 10 and how many more?`, hints: ['One ten frame is full. Count the extra dots.'],
    summary: `${n} is 10 and ?`, explanation: `${n} is 10 and ${ones} more.` });
}

/* ------------------------------ Addition ------------------------------ */
const STORY_ADD = [
  (w, a, b, t) => [`${w} has ${plural(a, t.one, t.many)}. A friend gives ${w} ${b} more. How many now?`, 'Sharing'],
  (w, a, b, t) => [`${a} ${t.many} are in the yard. ${b} more come. How many ${t.many} now?`, 'In the Yard'],
  (w, a, b, t) => [`${w} picks ${a} ${t.many} and then ${b} more. How many in all?`, 'Picking Time'],
];
export function addition(mode, d) {
  const topic = 'add';
  const max = by(d, 10, 10, 20);
  let a = rand(by(d, 1, 0, 3), by(d, 6, 9, 15)); let b = rand(by(d, 1, 0, 2), max - a);
  if (d === 'stretch' && a + b < 11) { a = rand(6, 10); b = rand(11 - a, Math.min(10, 20 - a)); }
  const s = a + b;
  const t = pick(THINGS);
  const visual = a <= 10 && b <= 10 && b > 0 && a > 0 ? { type: 'groups', groups: [{ emoji: t.e, count: a }, { emoji: t.e, count: b }], op: '+' } : undefined;
  if (mode === 'stem') {
    const total = rand(by(d, 5, 7, 12), max); const part = rand(1, total - 1);
    return num({ key: `${topic}:missing:${part}:${total}`, topic, answer: total - part, prompt: `${part} plus what makes ${total}?`, display: `${part} + ? = ${total}`,
      visual: total <= 20 ? { type: 'tenframe', count: part } : undefined, speak: `${part} plus what number makes ${total}?`,
      hints: [`Start at ${part}. Count up to ${total}.`, 'The number of counts is your answer.'],
      summary: `${part} + ? = ${total}`, explanation: `${part} + ${total - part} = ${total}.` });
  }
  if (mode === 'story') {
    const w = name(); const tt = pick(THINGS); const [text, title] = pick(STORY_ADD)(w, a || 1, b || 1, tt);
    const A = a || 1; const B = b || 1;
    return num({ key: `${topic}:story:${A}:${B}:${tt.e}:${title}`, topic, answer: A + B, story: { emoji: tt.e, title }, prompt: text, speak: text,
      visual: A <= 10 && B <= 10 ? { type: 'groups', groups: [{ emoji: tt.e, count: A }, { emoji: tt.e, count: B }], op: '+' } : undefined,
      hints: [`Start with ${A}. Count on ${B} more.`], summary: `${A} + ${B} (story)`, explanation: `${A} and ${B} more makes ${A + B}.` });
  }
  return num({ key: `${topic}:${a}:${b}`, topic, answer: s, display: `${a} + ${b}`, prompt: mode === 'worksheet' ? 'Add.' : undefined, visual: mode === 'flash' ? undefined : visual,
    speak: `${a} plus ${b}.`, summary: `${a} + ${b}`, explanation: `${a} + ${b} = ${s}.` });
}

/* ----------------------------- Subtraction ----------------------------- */
export function subtraction(mode, d) {
  const topic = 'sub';
  const max = by(d, 8, 10, 20);
  const a = rand(by(d, 3, 4, 11), max); const b = rand(1, by(d, Math.min(4, a - 1), a - 1, Math.min(10, a - 1)));
  const r = a - b;
  const t = pick(THINGS);
  if (mode === 'stem') {
    const whole = rand(by(d, 5, 6, 12), max); const left = rand(0, whole - 1);
    return num({ key: `${topic}:missing:${whole}:${left}`, topic, answer: whole - left, prompt: `${whole} take away what leaves ${left}?`, display: `${whole} − ? = ${left}`,
      speak: `${whole} take away what number leaves ${left}?`, hints: [`Count back from ${whole} until you reach ${left}.`],
      summary: `${whole} − ? = ${left}`, explanation: `${whole} − ${whole - left} = ${left}.` });
  }
  if (mode === 'story') {
    const w = name();
    const text = pick([
      `${w} has ${plural(a, t.one, t.many)}. ${b} roll away. How many are left?`,
      `There are ${a} ${t.many}. ${w} gives away ${b}. How many are left?`,
      `${a} ${t.many} sit on a log. ${b} hop off. How many are still on the log?`,
    ]);
    return num({ key: `${topic}:story:${a}:${b}:${t.e}:${text.length}`, topic, answer: r, story: { emoji: t.e, title: 'Take Away' }, prompt: text, speak: text,
      visual: { type: 'objects', emoji: t.e, count: a, faded: b }, hints: ['The faded ones are gone.', 'Count the ones that are left.'],
      summary: `${a} − ${b} (story)`, explanation: `${a} take away ${b} leaves ${r}.` });
  }
  return num({ key: `${topic}:${a}:${b}`, topic, answer: r, display: `${a} − ${b}`, prompt: mode === 'worksheet' ? 'Subtract.' : undefined,
    visual: mode === 'flash' ? undefined : { type: 'objects', emoji: t.e, count: a, faded: b },
    speak: `${a} take away ${b}.`, summary: `${a} − ${b}`, explanation: `${a} − ${b} = ${r}.` });
}

/* ------------------------------ Make 10 ------------------------------ */
export function bonds(mode, d) {
  const topic = 'bonds';
  const whole = d === 'gentle' ? pick([5, 6, 7]) : d === 'stretch' ? pick([10, 12, 15, 20]) : pick([10, 10, 8, 9]);
  const part = rand(1, whole - 1);
  const missingRight = chance(0.5);
  if (mode === 'flash' || chance(0.4)) {
    return num({ key: `${topic}:frame:${whole}:${part}`, topic, answer: whole - part,
      prompt: `How many more to make ${whole}?`, visual: whole <= 10 ? { type: 'tenframe', count: part } : { type: 'numberbond', whole, parts: [part, null] },
      speak: `There are ${part}. How many more to make ${whole}?`, hints: whole <= 10 ? ['Count the empty boxes.'] : [`Count up from ${part} to ${whole}.`],
      summary: `${part} + ? = ${whole}`, explanation: `${part} and ${whole - part} make ${whole}.` });
  }
  return num({ key: `${topic}:bond:${whole}:${part}:${missingRight}`, topic, answer: whole - part,
    prompt: 'What number is missing?', visual: { type: 'numberbond', whole, parts: missingRight ? [part, null] : [null, part] },
    speak: `The two parts make ${whole}. One part is ${part}. What is the other part?`, hints: [`Start at ${part}. Count up to ${whole}.`],
    summary: `Number bond ${whole}: ${part} and ?`, explanation: `${part} and ${whole - part} make ${whole}.` });
}

/* --------------------------- Comparing numbers --------------------------- */
export function compare(mode, d) {
  const topic = 'compare';
  const [lo, hi] = by(d, [1, 10], [1, 20], [10, 99]);
  if (mode === 'story') {
    const [p1, p2] = sample(NAMES, 2); const [a, b] = distinctInts(2, lo, hi); const t = pick(THINGS);
    const askMore = chance(0.5);
    const win = (askMore ? a > b : a < b) ? p1 : p2;
    return choose({ key: `${topic}:story:${a}:${b}:${askMore}`, topic, story: { emoji: t.e, title: 'Who Has More?' },
      prompt: `${p1} has ${plural(a, t.one, t.many)}. ${p2} has ${plural(b, t.one, t.many)}. Who has ${askMore ? 'MORE' : 'FEWER'}?`,
      speak: `${p1} has ${a} ${a === 1 ? t.one : t.many}. ${p2} has ${b}. Who has ${askMore ? 'more' : 'fewer'}?`,
      hints: [`Which number is ${askMore ? 'bigger' : 'smaller'}, ${a} or ${b}?`], summary: `${a} vs ${b}`,
      explanation: `${Math.max(a, b)} is more than ${Math.min(a, b)}, so ${win} has ${askMore ? 'more' : 'fewer'}.` },
    { text: win }, [{ text: win === p1 ? p2 : p1 }]);
  }
  if (d === 'stretch' && (mode === 'stem' || chance(0.5))) {
    let a = rand(lo, hi); let b = chance(0.15) ? a : rand(lo, hi);
    if (a !== b && Math.floor(a / 10) !== Math.floor(b / 10) && chance(0.5)) b = Math.floor(a / 10) * 10 + (b % 10); // same tens: harder
    const sym = a > b ? '>' : a < b ? '<' : '=';
    const words = { '>': 'is greater than', '<': 'is less than', '=': 'is equal to' };
    return choose({ key: `${topic}:sym:${a}:${b}`, topic, prompt: 'Which sign goes in the box?', display: `${a} ☐ ${b}`,
      speak: `Which sign goes between ${a} and ${b}?`, hints: ['Compare the tens first. If they match, compare the ones.', 'The open mouth faces the bigger number.'],
      summary: `${a} ? ${b}`, explanation: `${a} ${words[sym]} ${b}.` },
    { text: sym, big: true }, ['>', '<', '='].filter((x) => x !== sym).map((x) => ({ text: x, big: true })));
  }
  const n = d === 'gentle' ? 2 : 3;
  const vals = distinctInts(n, lo, hi);
  const askBig = chance(0.5);
  const target = askBig ? Math.max(...vals) : Math.min(...vals);
  return choose({ key: `${topic}:${askBig}:${[...vals].sort((x, y) => x - y).join(',')}`, topic,
    prompt: `Which number is the ${askBig ? 'GREATEST' : 'LEAST'}?`, speak: `Which number is the ${askBig ? 'biggest' : 'smallest'}?`,
    summary: `${askBig ? 'Greatest' : 'Least'} of ${vals.join(', ')}`, explanation: `${target} is the ${askBig ? 'greatest' : 'least'}.` },
  bigNum(target), vals.filter((v) => v !== target).map(bigNum));
}

/* ----------------------------- Skip counting ----------------------------- */
export function skip(mode, d) {
  const topic = 'skip';
  let step; let start; let back = false;
  if (d === 'gentle') { step = pick([1, 10]); start = step === 10 ? 10 : rand(3, 14); }
  else if (d === 'ready') { step = pick([2, 5, 10]); start = step * rand(1, 5); }
  else { step = pick([2, 5, 10, 10]); back = chance(0.35); start = step === 10 ? rand(1, 9) + 10 * rand(1, 4) : step * rand(2, 12); }
  const terms = [0, 1, 2, 3].map((i) => start + (back ? -1 : 1) * i * step);
  if (back) terms.forEach((_, i) => { terms[i] = start + 40 - i * step; });
  const next = terms[3] + (back ? -step : step);
  if (next < 0) return skip(mode, d);
  return num({ key: `${topic}:${step}:${terms[0]}:${back}`, topic, answer: next, prompt: back ? 'Counting back. What comes next?' : 'What comes next?',
    visual: { type: 'sequence', terms: terms.map(String), blank: true },
    speak: `${terms.join(', ')}. What comes next?`, hints: [`The numbers go ${back ? 'down' : 'up'} by ${step} each time.`],
    summary: `${terms.join(', ')}, ?`, explanation: `Count by ${step}${back ? ' backwards' : ''}: ${terms.join(', ')}, ${next}.` });
}

/* ------------------------------- Shapes ------------------------------- */
export function shapes(mode, d) {
  const topic = 'shapes';
  const fmt = mode === 'stem' ? pick(d === 'gentle' ? ['solid', 'sides'] : ['solid', 'sides', 'corners']) : mode === 'story' ? 'solid' : pick(['find', 'solid', 'find']);
  const pool = by(d, SHAPES_2D.slice(0, 5), SHAPES_2D.slice(0, 7), SHAPES_2D);
  if (fmt === 'solid') {
    const solids = Object.keys(SOLIDS);
    const want = pick(solids);
    const right = pick(SOLIDS[want]);
    const wrong = sample(solids.filter((s) => s !== want), d === 'gentle' ? 2 : 3).map((s) => pick(SOLIDS[s]));
    const who = name();
    return choose({ key: `${topic}:solid:${want}:${right}`, topic, story: mode === 'story' ? { emoji: '🔍', title: `${who}'s Shape Hunt` } : undefined,
      prompt: mode === 'story' ? `${who} is looking for something shaped like a ${want.toUpperCase()}. Which one?` : `Which one is shaped like a ${want.toUpperCase()}?`,
      speak: mode === 'story' ? `${who} is on a shape hunt. ${who} wants something shaped like a ${want}. Which one is it?` : `Which one is shaped like a ${want}?`,
      hints: [{ sphere: 'A sphere is round like a ball.', cube: 'A cube is like a box with square sides.', cylinder: 'A cylinder is like a can.', cone: 'A cone has a point on top and a circle on the bottom.' }[want]],
      answerLabel: want, summary: `Find a ${want}`, explanation: `That one is shaped like a ${want}.` },
    { visual: { type: 'emoji', emoji: right, size: 0.8 } }, wrong.map((e) => ({ visual: { type: 'emoji', emoji: e, size: 0.8 } })));
  }
  if (fmt === 'sides' || fmt === 'corners') {
    const s = pick(Object.keys(SIDES).filter((x) => pool.includes(x) || d === 'stretch'));
    const word = fmt === 'sides' ? 'sides' : 'corners';
    return num({ key: `${topic}:${fmt}:${s}`, topic, answer: SIDES[s], prompt: `How many ${word} does this ${s} have?`,
      visual: { type: 'shape', shape: s, color: pick(colorNames) }, speak: `How many ${word} does a ${s} have?`,
      hints: [`Touch each ${word === 'sides' ? 'side' : 'corner'} as you count.`], summary: `${word} of a ${s}`, explanation: `A ${s} has ${SIDES[s]} ${word}.` });
  }
  const target = pick(pool);
  const others = sample(pool.filter((x) => distinctShape(target, x)), by(d, 2, 3, 3));
  return choose({ key: `${topic}:find:${target}:${others.join('')}`, topic, prompt: `Tap the ${target.toUpperCase()}`, speak: `Tap the ${target}.`,
    answerLabel: target, summary: `Find the ${target}`, explanation: `That's the ${target}!` },
  { visual: { type: 'shape', shape: target, color: pick(colorNames) } }, others.map((x) => ({ visual: { type: 'shape', shape: x, color: pick(colorNames) } })));
}

/* ----------------------------- Measurement ----------------------------- */
const STICK_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#f97316'];
export function measure(mode, d) {
  const topic = 'measure';
  const fmt = mode === 'story' ? pick(['heavier', 'diff']) : mode === 'stem' ? pick(by(d, ['cubes', 'longest'], ['cubes', 'longest', 'diff'], ['ruler', 'diff', 'cubes'])) : pick(by(d, ['longest', 'cubes'], ['cubes', 'longest', 'heavier'], ['ruler', 'cubes', 'diff']));
  if (fmt === 'cubes') {
    const len = rand(2, by(d, 6, 9, 10)); const e = pick(['🖍️', '✏️', '🖌️', '🥕']);
    return num({ key: `${topic}:cubes:${len}:${e}`, topic, answer: len, prompt: 'How many cubes long is it?', visual: { type: 'cubes', length: len, emoji: e },
      speak: 'How many cubes long is it?', hints: ['Count the cubes under it.'], summary: `${len} cubes long`, explanation: `It is ${len} cubes long.` });
  }
  if (fmt === 'ruler') {
    const len = rand(2, 9);
    return num({ key: `${topic}:ruler:${len}`, topic, answer: len, prompt: 'How many inches long is the pencil?', visual: { type: 'ruler', length: len, unit: 'in' },
      speak: 'How many inches long is the pencil?', hints: ['Look at the number under the tip of the pencil.'], summary: `Pencil ${len} in`, explanation: `It starts at 0 and ends at ${len}, so it is ${len} inches long.` });
  }
  if (fmt === 'diff') {
    const a = rand(4, by(d, 7, 9, 10)); const b = rand(1, a - 1); const cols = sample(['red', 'blue', 'green', 'yellow'], 2);
    const text = `The ${cols[0]} crayon is ${a} cubes long. The ${cols[1]} crayon is ${b} cubes long. How many cubes longer is the ${cols[0]} crayon?`;
    return num({ key: `${topic}:diff:${a}:${b}`, topic, answer: a - b, story: mode === 'story' ? { emoji: '🖍️', title: 'Crayon Contest' } : undefined,
      prompt: text, speak: text, visual: { type: 'emojiset', items: ['🖍️'] }, hints: [`Count up from ${b} to ${a}.`],
      summary: `${a} vs ${b} cubes`, explanation: `${a} − ${b} = ${a - b}. The ${cols[0]} crayon is ${a - b} cubes longer.` });
  }
  if (fmt === 'heavier') {
    const [h, l, hn, ln] = pick(HEAVY_LIGHT); const askH = chance(0.5);
    return choose({ key: `${topic}:heavy:${hn}:${askH}`, topic, story: mode === 'story' ? { emoji: '⚖️', title: 'Heavy or Light?' } : undefined,
      prompt: `Which is ${askH ? 'HEAVIER' : 'LIGHTER'}?`, speak: `A ${hn} and a ${ln}. Which one is ${askH ? 'heavier' : 'lighter'}?`,
      answerLabel: askH ? hn : ln, summary: `${hn} vs ${ln}`, explanation: `A ${hn} is heavier than a ${ln}.` },
    { visual: { type: 'emoji', emoji: askH ? h : l, size: 0.9 }, text: askH ? hn : ln }, [{ visual: { type: 'emoji', emoji: askH ? l : h, size: 0.9 }, text: askH ? ln : hn }]);
  }
  const lens = distinctInts(by(d, 2, 3, 3), 3, 9);
  const askLong = chance(0.5);
  const target = askLong ? Math.max(...lens) : Math.min(...lens);
  const cols = sample(STICK_COLORS, lens.length);
  return choose({ key: `${topic}:sticks:${[...lens].sort().join(',')}:${askLong}`, topic, prompt: `Tap the ${askLong ? 'LONGEST' : 'SHORTEST'} stick`,
    speak: `Tap the ${askLong ? 'longest' : 'shortest'} stick.`, answerLabel: askLong ? 'longest' : 'shortest', summary: `${askLong ? 'Longest' : 'Shortest'} stick`,
    explanation: `That stick is the ${askLong ? 'longest' : 'shortest'}.` },
  { visual: { type: 'stick', len: target, color: cols[0] } }, lens.filter((l) => l !== target).map((l, i) => ({ visual: { type: 'stick', len: l, color: cols[i + 1] } })));
}

/* -------------------------- Sorting & classifying -------------------------- */
const COLOR_SHAPES = { red: ['🔴', '🟥'], blue: ['🔵', '🟦'], green: ['🟢', '🟩'], yellow: ['🟡', '🟨'] };
export function sorting(mode, d) {
  const topic = 'sorting';
  const fmt = mode === 'stem' ? pick(['odd', 'attr']) : mode === 'story' ? 'count' : pick(['odd', 'count', 'attr']);
  if (fmt === 'odd') {
    const [cat, other] = sample(Object.keys(CATEGORIES), 2);
    const main = sample(CATEGORIES[cat], 3); const odd = pick(CATEGORIES[other]);
    return choose({ key: `${topic}:odd:${cat}:${other}:${main.join('')}`, topic, prompt: "Which one doesn't belong?", speak: "Which one does not belong?",
      hints: [`Three of them are ${cat}.`], answerLabel: other, summary: `Odd one out among ${cat}`,
      explanation: `The others are ${cat}. That one is not.` },
    { visual: { type: 'emoji', emoji: odd, size: 0.8 } }, main.map((e) => ({ visual: { type: 'emoji', emoji: e, size: 0.8 } })));
  }
  if (fmt === 'attr' && d !== 'gentle') {
    // two attributes: color AND shape
    const cols = sample(Object.keys(COLOR_SHAPES), by(d, 2, 2, 3));
    const items = [];
    cols.forEach((c) => { items.push(...Array(rand(1, 4)).fill(COLOR_SHAPES[c][0]), ...Array(rand(1, 4)).fill(COLOR_SHAPES[c][1])); });
    const c = pick(cols); const sq = chance(0.5);
    const ans = items.filter((e) => e === COLOR_SHAPES[c][sq ? 1 : 0]).length;
    const mixed = shuffle(items);
    return num({ key: `${topic}:attr:${mixed.join('')}:${c}:${sq}`, topic, answer: ans, prompt: `How many ${c.toUpperCase()} ${sq ? 'SQUARES' : 'CIRCLES'}?`,
      visual: { type: 'emojiset', items: mixed }, speak: `How many ${c} ${sq ? 'squares' : 'circles'} are there?`,
      hints: [`Look for shapes that are ${c} AND ${sq ? 'square' : 'round'}.`], summary: `Count ${c} ${sq ? 'squares' : 'circles'}`,
      explanation: `There are ${ans} ${c} ${sq ? 'squares' : 'circles'}.` });
  }
  const [cat, other] = sample(['fruit', 'animals'], 2);
  const a = rand(2, by(d, 5, 7, 9)); const b = rand(2, 6);
  const items = shuffle([...Array.from({ length: a }, () => pick(CATEGORIES[cat])), ...Array.from({ length: b }, () => pick(CATEGORIES[other]))]);
  const who = name();
  const text = `${who} sorts the toys and snacks. How many ${cat === 'fruit' ? 'pieces of fruit' : 'animals'} are there?`;
  return num({ key: `${topic}:count:${items.join('')}`, topic, answer: a, story: mode === 'story' ? { emoji: '🧺', title: 'Sorting Time' } : undefined,
    prompt: mode === 'story' ? text : `How many ${cat === 'fruit' ? 'FRUITS' : 'ANIMALS'}?`, visual: { type: 'emojiset', items },
    speak: mode === 'story' ? text : `How many ${cat === 'fruit' ? 'fruits' : 'animals'} are there?`, hints: [`Only count the ${cat}.`],
    summary: `Count the ${cat}`, explanation: `There are ${a} ${cat === 'fruit' ? 'fruits' : 'animals'}.` });
}

/* -------------------------------- Time -------------------------------- */
const tstr = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
export function time(mode, d) {
  const topic = 'time';
  const h = rand(1, 12);
  const m = d === 'gentle' ? 0 : d === 'ready' ? pick([0, 0, 30]) : pick([0, 30]);
  if (mode === 'story' || (d === 'stretch' && mode === 'stem')) {
    const later = 1; const nh = (h % 12) + later;
    const who = name();
    const text = `${who} starts reading at the time on the clock. ${who} reads for 1 hour. What time is it then?`;
    const wrong = [tstr(h, m), tstr(((h + 1) % 12) + 1, m), tstr(nh, m === 0 ? 30 : 0)].filter((x, i, arr) => x !== tstr(nh, m) && arr.indexOf(x) === i);
    return choose({ key: `${topic}:later:${h}:${m}`, topic, story: { emoji: '📖', title: 'Reading Time' }, prompt: text, speak: text, visual: { type: 'clock', h, m },
      hints: ['The short hand moves to the next number after 1 hour.'], summary: `1 hour after ${tstr(h, m)}`,
      explanation: `1 hour after ${tstr(h, m)} is ${tstr(nh, m)}.` },
    { text: tstr(nh, m) }, wrong.slice(0, 2).map((x) => ({ text: x })));
  }
  const opts = new Set([tstr(h, m)]);
  const cand = [tstr((h % 12) + 1, m), tstr(h, m === 0 ? 30 : 0), tstr(((h + 10) % 12) + 1, m), tstr(m === 0 ? 12 - (h % 12) || 12 : h, m)];
  for (const c of cand) { if (opts.size >= by(d, 3, 3, 4)) break; opts.add(c); }
  return choose({ key: `${topic}:read:${h}:${m}`, topic, prompt: 'What time is it?', visual: { type: 'clock', h, m },
    speak: 'What time does the clock show?', hints: [m === 0 ? "The long hand points to 12, so it's o'clock." : 'The long hand points to 6, so it is half past.', 'The short hand shows the hour.'],
    summary: `Clock at ${tstr(h, m)}`, explanation: m === 0 ? `It is ${h} o'clock, ${tstr(h, m)}.` : `It is half past ${h}, ${tstr(h, m)}.` },
  { text: tstr(h, m) }, [...opts].slice(1).map((x) => ({ text: x })));
}

const ALL = ['flash', 'worksheet', 'story', 'stem'];

export default {
  age: 5,
  title: 'Number Builders',
  tagline: 'Counting to 20, adding, shapes, measuring & time',
  accent: 'emerald',
  allowRetry: true,
  bigInput: true,
  readAloud: true,
  keypad: 'simple',
  topics: [
    { id: 'count20', label: 'Counting to 20 & Beyond', group: 'Numbers', modes: ALL },
    { id: 'teens', label: 'Teen Numbers & Tens', group: 'Numbers', modes: ['flash', 'worksheet', 'stem'] },
    { id: 'compare', label: 'Comparing Numbers', group: 'Numbers', modes: ALL },
    { id: 'skip', label: 'Counting by 2s, 5s & 10s', group: 'Numbers', modes: ['flash', 'worksheet', 'stem'] },
    { id: 'add', label: 'Addition', group: 'Adding & Subtracting', modes: ALL },
    { id: 'sub', label: 'Subtraction', group: 'Adding & Subtracting', modes: ALL },
    { id: 'bonds', label: 'Make 10 (Number Bonds)', group: 'Adding & Subtracting', modes: ['flash', 'worksheet', 'stem'] },
    { id: 'shapes', label: '2D & 3D Shapes', group: 'Shapes, Measuring & Time', modes: ALL },
    { id: 'measure', label: 'Measure & Compare', group: 'Shapes, Measuring & Time', modes: ['worksheet', 'story', 'stem'] },
    { id: 'sorting', label: 'Sorting & Classifying', group: 'Shapes, Measuring & Time', modes: ['worksheet', 'story', 'stem'] },
    { id: 'time', label: 'Telling Time', group: 'Shapes, Measuring & Time', modes: ['worksheet', 'story', 'stem'] },
  ],
  difficulties: [
    { id: 'gentle', label: 'Warm-up', detail: 'Count to 12, add & subtract within 10, make 5, o’clock' },
    { id: 'ready', label: 'Advanced', detail: 'Count to 20, teen numbers, make 10, skip count by 2s/5s/10s, half hours' },
    { id: 'stretch', label: 'Stretch', detail: '1st-grade reach: within 20, tens & ones to 99, < > =, inches, 1 hour later' },
  ],
  defaultDifficulty: 'ready',
  defaults: {
    flash: { seconds: 90, maxCards: 20 },
    worksheet: { count: 10 },
    story: { count: 6 },
    stem: { count: 8 },
    mix: { count: 10 },
  },
  countOptions: { worksheet: [8, 10, 12, 15], story: [4, 6, 8], stem: [6, 8, 10], mix: [8, 10, 12] },
  secondsOptions: [60, 90, 120],
  expectedMs: { flash: 8000, worksheet: 15000, story: 20000, stem: 20000, mix: 18000 },

  generate(mode, topic, difficulty = 'ready') {
    const d = lvl(difficulty);
    if (middleEarthOn() && chance(THEME_RATE)) {
      const themed = themed5(mode, topic, d);
      if (themed) return themed;
    }
    switch (topic) {
      case 'count20': return count20(mode, d);
      case 'teens': return teens(mode, d);
      case 'compare': return compare(mode, d);
      case 'skip': return skip(mode, d);
      case 'add': return addition(mode, d);
      case 'sub': return subtraction(mode, d);
      case 'bonds': return bonds(mode, d);
      case 'shapes': return shapes(mode, d);
      case 'measure': return measure(mode, d);
      case 'sorting': return sorting(mode, d);
      case 'time': return time(mode, d);
      default: return null;
    }
  },
};
