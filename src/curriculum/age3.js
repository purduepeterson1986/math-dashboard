/**
 * Age 3 — "Little Explorers"
 * Pitched for advanced preschoolers: "Stretch" reaches into Pre-K/Kindergarten
 * (adding & taking away within 10, ABC/AABB patterns, counting backwards, shape attributes).
 */
import { rand, pick, sample, shuffle, chance, distinctInts } from '../lib/rng.js';
import { COLORS, NAMES, makeChoices, plural, distinctShape } from './shared.js';
import { themed3, middleEarthOn, THEME_RATE } from './middleEarth.js';
import { extraFor } from './extraWire.js';

const CRITTERS = [
  { e: '🐶', one: 'puppy', many: 'puppies' }, { e: '🐱', one: 'kitty', many: 'kitties' },
  { e: '🐰', one: 'bunny', many: 'bunnies' }, { e: '🐥', one: 'chick', many: 'chicks' },
  { e: '🐸', one: 'frog', many: 'frogs' }, { e: '🐢', one: 'turtle', many: 'turtles' },
  { e: '🐠', one: 'fish', many: 'fish' }, { e: '🦋', one: 'butterfly', many: 'butterflies' },
  { e: '🐞', one: 'ladybug', many: 'ladybugs' }, { e: '🐝', one: 'bee', many: 'bees' },
  { e: '🦆', one: 'duck', many: 'ducks' }, { e: '🐻', one: 'bear', many: 'bears' },
];
const TREATS = [
  { e: '🍎', one: 'apple', many: 'apples' }, { e: '🍓', one: 'strawberry', many: 'strawberries' },
  { e: '🍌', one: 'banana', many: 'bananas' }, { e: '🍪', one: 'cookie', many: 'cookies' },
  { e: '🧁', one: 'cupcake', many: 'cupcakes' }, { e: '🥕', one: 'carrot', many: 'carrots' },
  { e: '🍊', one: 'orange', many: 'oranges' }, { e: '🍇', one: 'bunch of grapes', many: 'bunches of grapes' },
  { e: '⭐', one: 'star', many: 'stars' }, { e: '🎈', one: 'balloon', many: 'balloons' },
  { e: '⚽', one: 'ball', many: 'balls' }, { e: '🌸', one: 'flower', many: 'flowers' },
  { e: '🚗', one: 'car', many: 'cars' }, { e: '🐚', one: 'shell', many: 'shells' },
];
const THINGS = [...CRITTERS, ...TREATS];

const SHAPES_BY_LEVEL = {
  gentle: ['circle', 'square', 'triangle', 'star'],
  ready: ['circle', 'square', 'triangle', 'star', 'rectangle', 'heart'],
  stretch: ['circle', 'square', 'triangle', 'star', 'rectangle', 'heart', 'oval', 'diamond', 'hexagon'],
};
const SHAPE_NAMES = {
  circle: 'circle', square: 'square', triangle: 'triangle', star: 'star', rectangle: 'rectangle',
  heart: 'heart', oval: 'oval', diamond: 'diamond', hexagon: 'hexagon',
};
const REAL_SHAPES = [
  { e: '🍕', shape: 'triangle', what: 'pizza slice' }, { e: '🍪', shape: 'circle', what: 'cookie' },
  { e: '🚪', shape: 'rectangle', what: 'door' }, { e: '⏰', shape: 'circle', what: 'clock' },
  { e: '🥚', shape: 'oval', what: 'egg' }, { e: '🪁', shape: 'diamond', what: 'kite' },
  { e: '📺', shape: 'rectangle', what: 'TV' }, { e: '🧀', shape: 'triangle', what: 'cheese wedge' },
  { e: '🍩', shape: 'circle', what: 'donut' }, { e: '💌', shape: 'rectangle', what: 'letter' },
  { e: '⚾', shape: 'circle', what: 'baseball' }, { e: '🔶', shape: 'diamond', what: 'sign' },
];
const BIG_SMALL = [
  ['🐘', '🐭', 'elephant', 'mouse'], ['🌳', '🌷', 'tree', 'flower'], ['🚌', '🚲', 'bus', 'bike'],
  ['🐳', '🐟', 'whale', 'fish'], ['🏠', '🐶', 'house', 'puppy'], ['🦒', '🐇', 'giraffe', 'bunny'],
  ['⛰️', '🪨', 'mountain', 'rock'], ['🐻', '🐝', 'bear', 'bee'], ['✈️', '🪁', 'airplane', 'kite'],
  ['🍉', '🍒', 'watermelon', 'cherry'], ['🦕', '🐸', 'dinosaur', 'frog'], ['🚢', '🦆', 'ship', 'duck'],
];

const colorNames = Object.keys(COLORS);
const pickColor = (except = []) => pick(colorNames.filter((c) => !except.includes(c)));
const lvl = (d) => (d === 'gentle' || d === 'stretch' ? d : 'ready');
const name = () => pick(NAMES);

/* ------------------------------ topics ------------------------------ */

export function counting(topic, mode, d, lo, hi) {
  const t = pick(THINGS);
  const n = rand(lo, hi);
  const scatter = d === 'stretch' || chance(0.3);
  let fmt = mode === 'stem' ? pick(['frame', 'find']) : mode === 'story' ? 'story' : pick(['howMany', 'howMany', 'find']);
  if (d === 'stretch' && fmt === 'howMany' && chance(0.5)) fmt = 'frame';

  if (fmt === 'find') {
    const opts = distinctInts(d === 'gentle' ? 2 : 3, Math.max(1, n - 3), Math.min(d === 'gentle' ? Math.max(5, n) : 10, n + 3), [n]);
    const { choices, answer } = makeChoices(
      { visual: { type: 'objects', emoji: t.e, count: n, compact: true } },
      opts.map((c) => ({ visual: { type: 'objects', emoji: t.e, count: c, compact: true } })),
    );
    return {
      key: `${topic}:find:${t.e}:${n}`, topic, input: 'choice', choices, answer, answerLabel: `${n}`,
      prompt: `Tap the group with ${n}`, display: String(n), hideDisplay: true, speak: `Tap the group with ${n} ${n === 1 ? t.one : t.many}.`,
      summary: `Find the group of ${n}`, explanation: `That group has ${n}.`,
    };
  }
  if (fmt === 'frame') {
    const five = d === 'gentle' && n <= 5;
    return {
      key: `${topic}:frame:${five ? 'five:' : ''}${n}`, topic, input: 'kidpad', answer: n, answerLabel: `${n}`,
      prompt: five ? 'How many dots in the five frame?' : 'How many dots in the ten frame?', visual: { type: 'tenframe', count: n, five },
      speak: five ? 'How many dots are in the five frame?' : 'How many dots are in the ten frame?', summary: `Ten frame showing ${n}`,
      explanation: n > 5 ? `The top row has 5, plus ${n - 5} more makes ${n}.` : `Count them: ${n}.`,
    };
  }
  if (fmt === 'story') {
    const c = pick(CRITTERS);
    const who = name();
    return {
      key: `${topic}:story:${c.e}:${n}`, topic, input: 'kidpad', answer: n, answerLabel: `${n}`,
      story: { emoji: c.e, title: `${who}'s Walk` },
      prompt: `${who} sees some ${c.many} on a walk. How many ${c.many}?`,
      visual: { type: 'objects', emoji: c.e, count: n, scatter },
      speak: `${who} sees some ${c.many} on a walk. How many ${c.many} are there?`,
      hints: ['Touch each one as you count.', 'Say the numbers out loud: 1, 2, 3…'],
      summary: `Count ${n} ${c.many}`, explanation: `There are ${n} ${c.many}.`,
    };
  }
  return {
    key: `${topic}:how:${t.e}:${n}`, topic, input: 'kidpad', answer: n, answerLabel: `${n}`,
    prompt: `How many ${t.many}?`, visual: { type: 'objects', emoji: t.e, count: n, scatter },
    speak: `How many ${t.many}?`, summary: `Count ${n} ${t.many}`, explanation: `There are ${n}.`,
  };
}

export function numerals(mode, d, lo = 1) {
  const topic = 'numerals';
  const max = d === 'gentle' ? 5 : d === 'stretch' ? 20 : 10;
  const fmt = mode === 'stem' ? pick(['next', 'back']) : mode === 'story' ? 'story' : pick(['find', 'match', 'next']);
  const n = rand(lo, max);

  if (fmt === 'next' || fmt === 'back') {
    const back = fmt === 'back' && d !== 'gentle';
    const start = back ? rand(Math.max(4, lo), max) : rand(Math.min(lo, max - 3), max - 3);
    const seq = back ? [start, start - 1, start - 2] : [start, start + 1, start + 2];
    const ans = back ? start - 3 : start + 3;
    return {
      key: `${topic}:${back ? 'back' : 'next'}:${start}`, topic, input: ans > 10 ? 'keypad' : 'kidpad', answer: ans, answerLabel: `${ans}`,
      prompt: back ? 'Counting down! What comes next?' : 'What number comes next?',
      visual: { type: 'sequence', terms: seq.map(String), blank: true },
      speak: `${seq.join(', ')}. What comes next?`, summary: `${seq.join(', ')}, ?`,
      explanation: `${seq.join(', ')}, ${ans}!`,
    };
  }
  const opts = distinctInts(d === 'gentle' ? 2 : 3, 1, max, [n]);
  if (fmt === 'match') {
    const t = pick(THINGS);
    const m = d === 'stretch' ? rand(6, 10) : Math.min(n, 10);
    const o = distinctInts(d === 'gentle' ? 2 : 3, 1, d === 'gentle' ? 5 : 10, [m]);
    const { choices, answer } = makeChoices({ text: String(m), big: true }, o.map((x) => ({ text: String(x), big: true })));
    return {
      key: `${topic}:match:${m}`, topic, input: 'choice', choices, answer, answerLabel: `${m}`,
      prompt: 'Which number matches?', visual: { type: 'objects', emoji: t.e, count: m },
      speak: 'Count them. Which number matches?', summary: `Match ${m} objects to a numeral`, explanation: `There are ${m}, so the number is ${m}.`,
    };
  }
  const { choices, answer } = makeChoices({ text: String(n), big: true }, opts.map((x) => ({ text: String(x), big: true })));
  if (fmt === 'story') {
    const who = name();
    return {
      key: `${topic}:story:${n}`, topic, input: 'choice', choices, answer, answerLabel: `${n}`,
      story: { emoji: '🎂', title: 'Birthday Candles' },
      prompt: `${who} is turning ${n}! Tap the number ${n}.`, speak: `${who} is turning ${n}! Tap the number ${n}.`,
      visual: { type: 'objects', emoji: '🕯️', count: Math.min(n, 10), compact: true },
      hints: [`Look for the number that says ${n}.`], summary: `Find the numeral ${n}`, explanation: `That's ${n}!`,
    };
  }
  return {
    key: `${topic}:find:${n}`, topic, input: 'choice', choices, answer, answerLabel: `${n}`,
    prompt: `Find the number ${n}`, speak: `Find the number ${n}.`, summary: `Find the numeral ${n}`, explanation: `That's ${n}!`,
  };
}

export function shapes(mode, d) {
  const topic = 'shapes';
  const pool = SHAPES_BY_LEVEL[lvl(d)];
  const fmt = mode === 'stem' ? pick(d === 'gentle' ? ['match'] : ['match', 'sides', 'odd']) : mode === 'story' ? 'real' : 'find';
  const nOpts = d === 'gentle' ? 3 : 4;

  if (fmt === 'real') {
    const r = pick(REAL_SHAPES.filter((x) => pool.includes(x.shape)));
    const others = sample(pool.filter((s) => distinctShape(r.shape, s)), nOpts - 1);
    const { choices, answer } = makeChoices(
      { visual: { type: 'shape', shape: r.shape, color: pickColor() } },
      others.map((s) => ({ visual: { type: 'shape', shape: s, color: pickColor() } })),
    );
    return {
      key: `${topic}:real:${r.what}`, topic, input: 'choice', choices, answer, answerLabel: SHAPE_NAMES[r.shape],
      story: { emoji: r.e, title: 'Shape Detective' }, visual: { type: 'emoji', emoji: r.e },
      prompt: `What shape is the ${r.what}?`, speak: `What shape is the ${r.what}? Tap the matching shape.`,
      hints: ['Look at the edges. Are they curved or straight?'], summary: `Shape of a ${r.what}`,
      explanation: `A ${r.what} looks like a ${SHAPE_NAMES[r.shape]}.`,
    };
  }
  if (fmt === 'sides') {
    const facts = [
      { q: 'has 3 sides', s: 'triangle' }, { q: 'is round with no corners', s: 'circle' },
      { q: 'has 4 sides that are all the same', s: 'square' }, { q: 'has 6 sides', s: 'hexagon' },
      { q: 'has 5 points', s: 'star' },
    ].filter((f) => pool.includes(f.s));
    const f = pick(facts);
    const others = sample(pool.filter((s) => s !== f.s && !(f.s === 'square' && s === 'rectangle') && !(f.s === 'circle' && s === 'oval')), nOpts - 1);
    const { choices, answer } = makeChoices(
      { visual: { type: 'shape', shape: f.s, color: pickColor() } },
      others.map((s) => ({ visual: { type: 'shape', shape: s, color: pickColor() } })),
    );
    return {
      key: `${topic}:sides:${f.s}`, topic, input: 'choice', choices, answer, answerLabel: SHAPE_NAMES[f.s],
      prompt: `Which shape ${f.q}?`, speak: `Which shape ${f.q}?`, summary: `Shape that ${f.q}`,
      explanation: `A ${SHAPE_NAMES[f.s]} ${f.q}.`,
    };
  }
  if (fmt === 'odd') {
    const main = pick(pool);
    const odd = pick(pool.filter((s) => s !== main));
    const { choices, answer } = makeChoices(
      { visual: { type: 'shape', shape: odd, color: pickColor() } },
      sample(colorNames, 3).map((c, k) => ({ visual: { type: 'shape', shape: main, color: c, size: [0.7, 0.85, 1][k] } })),
    );
    return {
      key: `${topic}:odd:${main}:${odd}`, topic, input: 'choice', choices, answer, answerLabel: SHAPE_NAMES[odd],
      prompt: "Which one doesn't belong?", speak: "Which one doesn't belong?", summary: `Odd one out: ${odd} among ${main}s`,
      explanation: `The others are all ${SHAPE_NAMES[main]}s. The ${SHAPE_NAMES[odd]} is different.`,
    };
  }
  const tPool = d === 'gentle' ? pool : d === 'ready' ? pool.filter((s) => s !== 'circle' && s !== 'square') : ['rectangle', 'heart', 'oval', 'diamond', 'hexagon'];
  const target = pick(tPool);
  const others = sample(pool.filter((s) => distinctShape(target, s) && !(target === 'oval' && s === 'circle') && !(target === 'circle' && s === 'oval')), nOpts - 1);
  if (fmt === 'match') {
    const c = pickColor();
    const { choices, answer } = makeChoices(
      { visual: { type: 'shape', shape: target, color: pickColor([c]), size: 0.75, rotate: d === 'stretch' && target !== 'circle' ? pick([20, 45, 90]) : 0 } },
      others.map((s) => ({ visual: { type: 'shape', shape: s, color: c } })),
    );
    return {
      key: `${topic}:match:${target}:${c}`, topic, input: 'choice', choices, answer, answerLabel: SHAPE_NAMES[target],
      prompt: 'Find the same shape (the color can change!)', visual: { type: 'shape', shape: target, color: c },
      speak: 'Find the same shape. The color can be different!', summary: `Match a ${target}`,
      explanation: `Both are ${SHAPE_NAMES[target]}s, even with different colors and sizes.`,
    };
  }
  const { choices, answer } = makeChoices(
    { visual: { type: 'shape', shape: target, color: pickColor() } },
    others.map((s) => ({ visual: { type: 'shape', shape: s, color: pickColor() } })),
  );
  return {
    key: `${topic}:find:${target}:${others.join('')}`, topic, input: 'choice', choices, answer, answerLabel: SHAPE_NAMES[target],
    prompt: `Tap the ${SHAPE_NAMES[target].toUpperCase()}`, speak: `Tap the ${SHAPE_NAMES[target]}.`,
    summary: `Find the ${target}`, explanation: `That's the ${SHAPE_NAMES[target]}!`,
  };
}

export function sizes(mode, d) {
  const topic = 'size';
  if (mode === 'story' && d === 'gentle') {
    const [bigE, smallE, bigN, smallN] = pick(BIG_SMALL);
    const askBig = chance(0.5);
    const { choices, answer } = makeChoices(
      { visual: { type: 'emoji', emoji: askBig ? bigE : smallE, size: 1 }, text: askBig ? bigN : smallN },
      [{ visual: { type: 'emoji', emoji: askBig ? smallE : bigE, size: 1 }, text: askBig ? smallN : bigN }],
    );
    return {
      key: `${topic}:real:${bigN}:${askBig}`, topic, input: 'choice', choices, answer, answerLabel: askBig ? bigN : smallN,
      story: { emoji: '🔍', title: 'Real-Life Sizes' },
      prompt: `Which is ${askBig ? 'BIGGER' : 'SMALLER'} in real life?`,
      speak: `A ${bigN} and a ${smallN}. Which is ${askBig ? 'bigger' : 'smaller'} in real life?`,
      hints: ['The pictures are the same size, so think about the real thing!'],
      summary: `${bigN} vs ${smallN}: which is ${askBig ? 'bigger' : 'smaller'}`,
      explanation: `A ${bigN} is much bigger than a ${smallN}.`,
    };
  }
  const t = pick(THINGS);
  const n = d === 'gentle' ? 2 : d === 'stretch' ? 4 : 3;
  const scales = n === 2 ? [0.45, 1] : n === 3 ? [0.4, 0.68, 1] : [0.35, 0.55, 0.77, 1];
  const ask = mode === 'stem' && n >= 3 ? pick(['biggest', 'smallest', 'middle']) : pick(['biggest', 'smallest']);
  const idx = ask === 'biggest' ? scales.length - 1 : ask === 'smallest' ? 0 : n === 3 ? 1 : pick([1, 2]);
  const word2 = (w) => (n === 2 ? (w === 'biggest' ? 'bigger' : 'smaller') : w);
  const askText = ask === 'middle' ? (n === 3 ? 'MIDDLE-sized' : 'not biggest or smallest') : word2(ask).toUpperCase();
  const all = scales.map((s, i) => ({ visual: { type: 'sized', emoji: t.e, scale: s }, i }));
  const { choices, answer } = makeChoices(all[idx], all.filter((_, i) => i !== idx));
  return {
    key: `${topic}:${ask}:${t.e}:${n}`, topic, input: 'choice', choices: choices.map(({ i, ...c }) => c), answer,
    story: mode === 'story' ? { emoji: t.e, title: 'Size Parade' } : undefined,
    answerLabel: ask, prompt: `Tap the ${askText} ${t.one}`, speak: `Tap the ${ask === 'middle' ? 'middle sized' : word2(ask)} ${t.one}.`,
    summary: `Find the ${ask} ${t.one}`,
    explanation: ask === 'middle' ? 'It is bigger than the smallest and smaller than the biggest.' : `That one is the ${ask}!`,
  };
}

const PATTERN_TYPES = { gentle: ['AB'], ready: ['AB', 'AAB', 'ABB'], stretch: ['ABC', 'AABB', 'ABB', 'AAB', 'ABBC'] };

export function patterns(mode, d) {
  const topic = 'patterns';
  const type = pick(PATTERN_TYPES[lvl(d)]);
  const letters = [...new Set(type.split(''))];
  const useEmoji = mode === 'story' || chance(0.4);
  let units;
  if (useEmoji) {
    units = sample(THINGS, letters.length).map((t) => ({ emoji: t.e }));
  } else {
    const shapes = sample(['circle', 'square', 'triangle', 'star', 'heart'], letters.length);
    const cols = sample(colorNames, letters.length);
    units = shapes.map((s, i) => ({ shape: s, color: cols[i] }));
  }
  const map = Object.fromEntries(letters.map((l, i) => [l, units[i]]));
  const len = type.length * 2 + rand(1, type.length);
  const seq = Array.from({ length: len }, (_, i) => map[type[i % type.length]]);
  // stretch STEM: missing item can be in the middle
  const blankAt = mode === 'stem' && d === 'stretch' && chance(0.5) ? rand(2, len - 2) : len - 1;
  const answerUnit = seq[blankAt];
  const shown = seq.map((u, i) => (i === blankAt ? null : u)).slice(0, Math.max(blankAt + 1, len - 1));
  const distract = useEmoji ? { emoji: pick(THINGS.filter((t) => !units.some((u) => u.emoji === t.e))).e }
    : { shape: pick(['circle', 'square', 'triangle', 'star', 'heart'].filter((s) => !units.some((u) => u.shape === s))), color: pickColor() };
  const toVisual = (u) => (u.emoji ? { type: 'emoji', emoji: u.emoji, size: 0.8 } : { type: 'shape', shape: u.shape, color: u.color, size: 0.8 });
  const wrongUnits = units.filter((u) => u !== answerUnit);
  const { choices, answer } = makeChoices({ visual: toVisual(answerUnit) }, [...wrongUnits, distract].map((u) => ({ visual: toVisual(u) })));
  const sig = `${type}:${units.map((u) => u.emoji || u.shape + u.color).join('')}:${blankAt === len - 1 ? 'end' : 'mid'}`;
  return {
    key: `${topic}:${sig}`, topic, input: 'choice', choices, answer, answerLabel: `${type} pattern`,
    story: mode === 'story' ? { emoji: '📿', title: `${name()}'s Necklace` } : undefined,
    prompt: blankAt === len - 1 ? 'What comes next?' : "What's missing?",
    visual: { type: 'pattern', items: shown.map((u) => (u ? toVisual(u) : null)) },
    speak: mode === 'story' ? 'Help finish the pattern! What comes next?' : blankAt === len - 1 ? 'Look at the pattern. What comes next?' : 'Look at the pattern. What is missing?',
    hints: [`Say the pattern out loud. It goes ${type.split('').join('-')}.`],
    summary: `${type} pattern`, explanation: `The pattern repeats: ${type.split('').join(' ')}.`,
  };
}

export function compare(mode, d) {
  const topic = 'compare';
  const gap = d === 'gentle' ? rand(2, 3) : d === 'stretch' ? 1 : rand(1, 2);
  const max = d === 'gentle' ? 5 : 10;
  const a = rand(d === 'gentle' ? 1 : d === 'ready' ? 3 : 5, max - gap);
  const b = a + gap;
  const askMore = chance(0.5);
  const t = pick(THINGS);

  if (mode === 'stem' && d !== 'gentle') {
    const n = d === 'stretch' ? rand(5, 9) : rand(3, 7);
    const t2 = pick(THINGS.filter((x) => x.e !== t.e));
    const wrong = d === 'stretch' ? [n - 1, n + 1] : distinctInts(2, Math.max(1, n - 3), n + 3, [n]);
    const { choices, answer } = makeChoices(
      { visual: { type: 'objects', emoji: t2.e, count: n, compact: true, scatter: true } },
      wrong.map((w) => ({ visual: { type: 'objects', emoji: t2.e, count: w, compact: true, scatter: true } })),
    );
    return {
      key: `${topic}:same:${t.e}:${n}`, topic, input: 'choice', choices, answer, answerLabel: `${n}`,
      prompt: 'Which group has the SAME number?', visual: { type: 'objects', emoji: t.e, count: n },
      speak: 'Which group has the same number?', summary: `Match a group of ${n}`,
      hints: ['Count the top group first. Then find a group with that many.'],
      explanation: `Both groups have ${n}.`,
    };
  }
  if (mode === 'story') {
    const [p1, p2] = sample(NAMES, 2);
    const food = pick(TREATS.slice(0, 8)); // snacks you can eat
    const { choices, answer } = makeChoices(
      { text: askMore ? p2 : p1, visual: { type: 'objects', emoji: food.e, count: askMore ? b : a, compact: true } },
      [{ text: askMore ? p1 : p2, visual: { type: 'objects', emoji: food.e, count: askMore ? a : b, compact: true } }],
    );
    return {
      key: `${topic}:story:${food.e}:${a}:${b}:${askMore}`, topic, input: 'choice', choices, answer, answerLabel: askMore ? p2 : p1,
      story: { emoji: food.e, title: 'Snack Time' },
      prompt: `${p1} has ${plural(a, food.one, food.many)}. ${p2} has ${plural(b, food.one, food.many)}. Who has ${askMore ? 'MORE' : 'FEWER'}?`,
      speak: `${p1} has ${a}. ${p2} has ${b}. Who has ${askMore ? 'more' : 'fewer'}?`,
      hints: ['Count each group.', `${b} is more than ${a}.`], summary: `${a} vs ${b}: who has ${askMore ? 'more' : 'fewer'}`,
      explanation: `${b} is more than ${a}, so ${askMore ? p2 : p1} has ${askMore ? 'more' : 'fewer'}.`,
    };
  }
  const { choices, answer } = makeChoices(
    { visual: { type: 'objects', emoji: t.e, count: askMore ? b : a, compact: true } },
    [{ visual: { type: 'objects', emoji: t.e, count: askMore ? a : b, compact: true } }],
  );
  return {
    key: `${topic}:${t.e}:${a}:${b}:${askMore}`, topic, input: 'choice', choices, answer, answerLabel: askMore ? `${b}` : `${a}`,
    prompt: `Which has ${askMore ? 'MORE' : 'FEWER'}?`, speak: `Which group has ${askMore ? 'more' : 'fewer'} ${t.many}?`,
    summary: `${a} vs ${b}: ${askMore ? 'more' : 'fewer'}`, explanation: `${b} is more than ${a}.`,
  };
}

export function oneMore(mode, d) {
  const topic = 'oneMore';
  const t = pick(mode === 'story' ? TREATS : THINGS);
  let a; let b; let op;
  if (d === 'gentle') { op = '+'; a = rand(1, 4); b = 1; }
  else if (d === 'ready') { op = pick(['+', '-']); a = op === '+' ? rand(3, 9) : rand(4, 10); b = 1; }
  else { op = pick(['+', '-']); if (op === '+') { a = rand(2, 6); b = rand(2, 10 - a); } else { a = rand(6, 10); b = rand(2, a - 2); } }
  const ans = op === '+' ? a + b : a - b;
  const who = name();
  const visual = op === '+'
    ? { type: 'groups', groups: [{ emoji: t.e, count: a }, { emoji: t.e, count: b }], op: '+' }
    : { type: 'objects', emoji: t.e, count: a, faded: b };
  const word = (n) => (n === 1 ? t.one : t.many);
  const prompt = mode === 'story'
    ? (op === '+' ? `${who} has ${plural(a, t.one, t.many)}. A friend gives ${b} more. How many now?`
      : `${who} has ${plural(a, t.one, t.many)}. ${who} eats ${b}. How many are left?`)
    : (op === '+' ? (b === 1 ? `${a} and 1 more is…?` : `${a} and ${b} more is…?`)
      : (b === 1 ? `${a} take away 1 is…?` : `${a} take away ${b} is…?`));
  return {
    key: `${topic}:${op}:${a}:${b}:${mode === 'story' ? t.e : ''}`, topic, input: 'kidpad', answer: ans, answerLabel: `${ans}`,
    story: mode === 'story' ? { emoji: t.e, title: op === '+' ? 'Sharing' : 'Munch Time' } : undefined,
    prompt, visual, speak: prompt.replace('…?', '?'),
    hints: op === '+' ? [`Start at ${a}. Count up ${b}.`] : [`Start with ${a}. The faded ones are gone. Count what's left.`],
    summary: `${a} ${op === '+' ? '+' : '−'} ${b}`, explanation: `${a} ${op === '+' ? 'plus' : 'take away'} ${b} is ${ans} ${word(ans)}.`,
  };
}

const ALL = ['flash', 'worksheet', 'story', 'stem'];

export default {
  age: 3,
  title: 'Little Explorers',
  tagline: 'Counting, shapes, sizes & patterns',
  accent: 'amber',
  allowRetry: true,
  bigInput: true,
  readAloud: true,
  keypad: 'simple',
  topics: [
    { id: 'count5', label: 'Counting 1–5', group: 'Numbers', icon: 'Hand', modes: ALL },
    { id: 'count10', label: 'Counting 6–10', group: 'Numbers', icon: 'Grid3x3', modes: ALL },
    { id: 'numerals', label: 'Number Recognition', group: 'Numbers', icon: 'Hash', modes: ALL },
    { id: 'oneMore', label: 'One More & Take Away', group: 'Numbers', icon: 'PlusCircle', modes: ['flash', 'worksheet', 'story'] },
    { id: 'compare', label: 'More or Fewer', group: 'Numbers', icon: 'Scale', modes: ALL },
    { id: 'shapes', label: 'Shape Recognition', group: 'Shapes & Sizes', icon: 'Shapes', modes: ALL },
    { id: 'size', label: 'Size Comparison', group: 'Shapes & Sizes', icon: 'Ruler', modes: ALL },
    { id: 'position', label: 'Position Words', group: 'Shapes & Sizes', icon: 'Move', modes: ALL },
    { id: 'patterns', label: 'Simple Patterns', group: 'Shapes & Sizes', icon: 'Repeat', modes: ['worksheet', 'story', 'stem'] },
    { id: 'tryit', label: 'Try It & See', group: 'Science Lab', icon: 'FlaskConical', modes: ['stem'] },
  ],
  difficulties: [
    { id: 'gentle', label: 'Warm-up', detail: 'Numbers to 5 (a peek at 6), AB patterns, 2–3 choices' },
    { id: 'ready', label: 'Standard', detail: 'Numbers to 10, one more / one less, AAB & ABB patterns' },
    { id: 'stretch', label: 'Stretch', detail: 'Add & take away within 10, teens, ABC & AABB patterns, odd-one-out' },
  ],
  defaultDifficulty: 'ready',
  defaults: {
    flash: { seconds: 90, maxCards: 15 },
    worksheet: { count: 10 },
    story: { count: 6 },
    stem: { count: 8 },
    mix: { count: 10 },
  },
  countOptions: { worksheet: [6, 8, 10, 12], story: [4, 6, 8], stem: [6, 8, 10], mix: [8, 10, 12] },
  secondsOptions: [60, 90, 120],
  expectedMs: { flash: 8000, worksheet: 12000, story: 15000, stem: 15000, mix: 14000 },

  generate(mode, topic, difficulty = 'ready') {
    const d = lvl(difficulty);
    if (middleEarthOn() && chance(THEME_RATE)) {
      const themed = themed3(mode, topic, d);
      if (themed) return themed;
    }
    const extra = extraFor(3, mode, topic, d);
    if (extra) return extra;
    switch (topic) {
      case 'count5': return counting('count5', mode, d, ...(d === 'gentle' ? [1, 3] : d === 'ready' ? [2, 5] : [4, 5]));
      case 'count10': return counting('count10', mode, d, ...(d === 'gentle' ? [5, 6] : d === 'ready' ? [6, 8] : [8, 10]));
      case 'numerals': return numerals(mode, d, d === 'ready' ? 3 : d === 'stretch' ? 10 : 1);
      case 'shapes': return shapes(mode, d);
      case 'size': return sizes(mode, d);
      case 'patterns': return patterns(mode, d);
      case 'compare': return compare(mode, d);
      case 'oneMore': return oneMore(mode, d);
      default: return null;
    }
  },
};

export { shuffle };
