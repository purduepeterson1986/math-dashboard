/**
 * Age 6 — "Number Adventurers" (1st grade)
 * Pitched for advanced 1st graders: "Advanced" is the default; "Stretch" reaches into
 * 2nd grade (2-digit adding & subtracting, place value past 100, quarter hours, bar graphs).
 *
 * Questions are read aloud (many 1st graders are still learning to read). Built from the Age 5 and
 * Age 7 generators at the right levels, plus picture graphs and "how many more" comparisons.
 */
import * as A5 from './age5.js';
import * as A7 from './age7.js';
import { retopic, withSpeak, makeChoices, NAMES } from './shared.js';
import { themed6, middleEarthOn, THEME_RATE } from './middleEarth.js';
import { extraFor } from './extraWire.js';
import { patterns as A3patterns } from './age3.js';
import { growPattern, numberRule } from './extraEarly.js';
import { rand, pick, sample, chance } from '../lib/rng.js';
import { toSpeech } from '../lib/audio.js';

const lvl = (d) => (d === 'gentle' || d === 'stretch' ? d : 'ready');

/* ---------------------------- picture graphs ---------------------------- */
const GRAPH_SETS = [
  { title: 'Fruit We Picked', noun: 'apples', emoji: '🍎', rows: ['Mary', 'Tom', 'Julie', 'Bob'] },
  { title: 'Books We Read', noun: 'books', emoji: '📕', rows: ['Lisa', 'Ben', 'Karen', 'Pete'] },
  { title: 'Birds We Saw', noun: 'birds', emoji: '🐦', rows: ['Mon', 'Tue', 'Wed', 'Thu'] },
  { title: 'Shells We Found', noun: 'shells', emoji: '🐚', rows: ['Sue', 'Jim', 'Beth', 'Dan'] },
];
function graphs(mode, d) {
  const topic = 'graphs';
  if (d === 'stretch' && chance(0.5)) return A7.data(mode, 'easy');
  const set = pick(GRAPH_SETS);
  const each = d === 'stretch' ? 2 : 1;
  const n = d === 'gentle' ? 3 : 4;
  const vals = sample([1, 2, 3, 4, 5, 6, 7, 8], n).map((v) => v * each);
  const rows = set.rows.slice(0, n).map((label, i) => ({ label, value: vals[i] }));
  const visual = { type: 'picgraph', rows, emoji: set.emoji, each, title: set.title };
  const [A, B] = sample(rows, 2);
  const [hi, lo] = A.value > B.value ? [A, B] : [B, A];
  const f = pick(d === 'gentle' ? ['read', 'most'] : d === 'ready' ? ['more', 'total', 'most'] : ['read', 'more', 'total', 'most']);
  const key = `${topic}:${set.title}:${vals.join(',')}:${f}:${A.label}:${B.label}`;
  const keyHint = each > 1 ? `Look at the key: each picture means ${each}.` : 'Count the pictures in the row.';
  const what = set.noun;
  if (f === 'read') return { key, topic, input: 'keypad', prompt: `How many ${what} for ${A.label}?`, visual, answer: String(A.value), answerLabel: String(A.value), hints: [keyHint], explanation: `${A.label} has ${A.value}.` };
  if (f === 'most') {
    const top = rows.reduce((a, b) => (b.value > a.value ? b : a));
    const { choices, answer } = makeChoices({ text: top.label }, rows.filter((r) => r !== top).map((r) => ({ text: r.label })));
    return { key, topic, input: 'choice', choices, answer, answerLabel: top.label, prompt: 'Which row has the MOST?', visual, hints: [keyHint], explanation: `${top.label} has the most: ${top.value}.` };
  }
  if (f === 'more') return { key, topic, input: 'keypad', prompt: `How many more does ${hi.label} have than ${lo.label}?`, visual, answer: String(hi.value - lo.value), answerLabel: String(hi.value - lo.value), hints: [keyHint, 'Find both numbers, then take away.'], explanation: `${hi.value} take away ${lo.value} is ${hi.value - lo.value}.` };
  const total = vals.reduce((a, b) => a + b, 0);
  return { key, topic, input: 'keypad', prompt: 'How many in all?', visual, answer: String(total), answerLabel: String(total), hints: [keyHint, 'Add every row together.'], explanation: `${vals.join(' plus ')} is ${total}.` };
}

/* ------------------------ compare: how many more ------------------------ */
function howManyMore(mode, d) {
  const topic = 'compare';
  if (mode !== 'story' && chance(0.6)) return retopic(A5.compare(mode, d === 'gentle' ? 'ready' : 'stretch'), topic);
  const [p, q] = sample(NAMES, 2);
  const a = d === 'stretch' ? rand(20, 60) : d === 'gentle' ? rand(4, 10) : rand(8, 19); const b = a - (d === 'stretch' ? rand(2, 20) : d === 'gentle' ? rand(1, 3) : rand(2, 8));
  const thing = pick(['stickers', 'marbles', 'crayons', 'stamps', 'acorns']);
  const one = thing.replace(/s$/, ''); const text = `${p} has ${a} ${thing}. ${q} has ${b} ${b === 1 ? one : thing}. How many more ${thing} does ${p} have?`;
  return { key: `${topic}:more:${a}:${b}`, topic, input: 'keypad', story: mode === 'story' ? { emoji: '🧮', title: 'How Many More?' } : undefined,
    prompt: text, speak: text, answer: String(a - b), answerLabel: String(a - b), hints: [`Count up from ${b} to ${a}.`],
    explanation: `${a} take away ${b} is ${a - b}. ${p} has ${a - b} more.` };
}

/* ---------------------- Stretch time: quarter hours ---------------------- */
const ts = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
const addMin = (h, m, k) => { const t = ((h % 12) * 60 + m + k + 720) % 720; return [Math.floor(t / 60) || 12, t % 60]; };
function stretchTime(mode) {
  if (mode !== 'story' && chance(0.5)) return A7.time('worksheet', 'easy'); // read a clock to the quarter hour
  const h = rand(1, 12); const sm = pick([0, 15, 30, 45]); const dur = pick([15, 30, 45, 60]);
  const [eh, em] = addMin(h, sm, dur); const right = ts(eh, em);
  const [e, title, what] = pick([['⚽', 'Soccer Practice', 'Soccer practice'], ['🎹', 'Piano Lesson', 'Piano lesson'], ['🎬', 'Movie Time', 'The movie'], ['🏊', 'Swim Class', 'Swim class']]);
  const wrong = [addMin(h, sm, dur + 15), addMin(h, sm, dur - 15), addMin(h, sm, dur + 30)].map(([a, b]) => ts(a, b)).filter((x, i, arr) => x !== right && arr.indexOf(x) === i).slice(0, 3);
  const { choices, answer } = makeChoices({ text: right }, wrong.map((text) => ({ text })));
  const prompt = `${what} starts at ${ts(h, sm)} and lasts ${dur} minutes. What time does it end?`;
  return { key: `time:q6:${h}:${sm}:${dur}`, topic: 'time', input: 'choice', choices, answer, answerLabel: right, story: mode === 'story' ? { emoji: e, title } : undefined, prompt, visual: { type: 'clock', h, m: sm },
    hints: ['Count on by 15 minutes at a time.', '60 minutes = 1 hour.'], explanation: `${ts(h, sm)} + ${dur} minutes = ${right}.` };
}

const ALL = ['flash', 'worksheet', 'story', 'stem'];
const D5 = { gentle: 'ready', ready: 'stretch', stretch: 'stretch' };

export default {
  age: 6,
  title: 'Number Adventurers',
  tagline: 'Adding & subtracting to 20 and beyond, place value, time, money & graphs',
  accent: 'teal',
  allowRetry: true,
  bigInput: false,
  readAloud: true,
  keypad: 'simple',
  topics: [
    { id: 'add', label: 'Addition', group: 'Adding & Subtracting', modes: ALL },
    { id: 'sub', label: 'Subtraction', group: 'Adding & Subtracting', modes: ALL },
    { id: 'bonds', label: 'Make 10 & Doubles', group: 'Adding & Subtracting', modes: ['flash', 'worksheet', 'stem'] },
    { id: 'placevalue', label: 'Place Value to 120', group: 'Numbers', modes: ['flash', 'worksheet', 'stem'] },
    { id: 'compare', label: 'Comparing & How Many More', group: 'Numbers', modes: ALL },
    { id: 'skip', label: 'Counting to 120 & Skip Counting', group: 'Numbers', modes: ['flash', 'worksheet', 'stem'] },
    { id: 'time', label: 'Telling Time', group: 'Measuring & Data', modes: ['worksheet', 'story', 'stem'] },
    { id: 'measure', label: 'Measuring Length', group: 'Measuring & Data', modes: ['worksheet', 'story', 'stem'] },
    { id: 'money', label: 'Coins', group: 'Measuring & Data', modes: ['flash', 'worksheet', 'story'] },
    { id: 'graphs', label: 'Picture & Bar Graphs', group: 'Measuring & Data', modes: ['worksheet', 'stem'] },
    { id: 'shapes', label: 'Shapes, Halves & Fourths', group: 'Shapes', modes: ['flash', 'worksheet', 'stem'] },
    { id: 'fractions', label: 'Halves & Fourths', group: 'Shapes', modes: ALL },
    { id: 'patterns', label: 'Patterns & Rules', group: 'Numbers', modes: ['worksheet', 'story', 'stem'] },
  ],
  difficulties: [
    { id: 'gentle', label: 'Warm-up', detail: 'Add & subtract within 10, numbers to 100, hour & half hour' },
    { id: 'ready', label: 'Standard', detail: 'Within 20, missing numbers, tens & ones, place value to 120, picture graphs' },
    { id: 'stretch', label: 'Stretch', detail: '2nd-grade reach: 2-digit adding & subtracting, quarter hours, scaled graphs, fourths' },
  ],
  defaultDifficulty: 'ready',
  defaults: {
    flash: { seconds: 90, maxCards: 30 },
    worksheet: { count: 12 },
    story: { count: 6 },
    stem: { count: 8 },
    mix: { count: 10 },
  },
  countOptions: { worksheet: [8, 10, 12, 15], story: [4, 6, 8], stem: [6, 8, 10], mix: [8, 10, 12] },
  secondsOptions: [60, 90, 120],
  expectedMs: { flash: 7000, worksheet: 18000, story: 30000, stem: 28000, mix: 22000 },

  generate(mode, topic, difficulty = 'ready') {
    const d = lvl(difficulty);
    if (middleEarthOn() && chance(THEME_RATE)) {
      const themed = themed6(mode, topic, d);
      if (themed) return withSpeak(themed, toSpeech);
    }
    const extra = extraFor(6, mode, topic, d);
    if (extra) return withSpeak(extra, toSpeech);
    let q;
    switch (topic) {
      case 'add': q = d === 'stretch' ? A7.addition(mode, 'easy') : A5.addition(mode, D5[d]); break;
      case 'sub': q = d === 'stretch' ? A7.subtraction(mode, 'easy') : A5.subtraction(mode, D5[d]); break;
      case 'bonds': q = d === 'gentle' ? A5.bonds(mode, 'ready') : d === 'ready' ? A5.bonds(mode, 'stretch', [10, 12, 15, 20]) : A5.bonds(mode, 'stretch', [50, 100]); break;
      case 'placevalue': q = d === 'gentle' ? A5.teens(mode, 'stretch') : A7.placevalue(mode, d === 'stretch' ? 'standard' : 'easy'); break;
      case 'compare': q = howManyMore(mode, d); break;
      case 'skip': q = d === 'gentle' ? A5.skip(mode, 'ready') : d === 'ready' ? A5.skip(mode, 'stretch') : A7.skip(mode, 'easy'); break;
      case 'time':
        if (d === 'gentle') { q = A5.time('worksheet', 'ready'); if (mode === 'story') q = { ...q, story: { emoji: '⏰', title: 'What Time Is It?' } }; } // read clocks to the half hour
        else q = d === 'stretch' ? stretchTime(mode) : A5.time(mode, 'stretch', [0, 30, 30]);
        break;
      case 'measure': q = d === 'gentle' ? A5.measure(mode, 'ready', ['cubes', 'diff']) : d === 'ready' ? A5.measure(mode, 'stretch') : A7.measure(mode, mode === 'story' ? 'standard' : 'challenge'); break;
      case 'money':
        if (d === 'gentle') { q = A7.money('worksheet', 'easy', { n: [2, 4], noChange: true }); if (mode === 'story') q = { ...q, story: { emoji: '🪙', title: 'Count the Coins' } }; } // pennies, nickels, dimes
        else q = d === 'ready' ? A7.money(mode, 'easy', { n: [5, 8] }) : A7.money(mode, 'standard');
        break;
      case 'graphs': q = graphs(mode, d); break;
      case 'patterns': {
        const toKey = (x) => (x && x.input === 'kidpad' ? { ...x, input: 'keypad' } : x);
        q = d === 'gentle' ? A3patterns(mode, 'stretch') : d === 'ready' ? (chance(0.35) ? A3patterns(mode, 'stretch') : chance(0.5) ? toKey(growPattern(mode, 2)) : toKey(numberRule(mode, 1, 60))) : toKey(chance(0.5) ? numberRule(mode, 2, 120) : growPattern(mode, 2));
        break;
      }
      case 'shapes': { const m2 = mode === 'flash' ? 'worksheet' : mode; q = d === 'gentle' ? A5.shapes(mode, 'stretch', ['riddle', 'riddle', 'corners', 'sides']) : d === 'ready' ? (chance(0.6) ? A7.fractions(m2, 'easy') : A7.geometry(m2, 'easy', ['name'])) : (chance(0.65) ? A7.fractions(m2, 'standard') : A7.geometry(m2, 'standard', ['name'])); break; }
      default: return null;
    }
    return withSpeak(retopic(q, topic), toSpeech);
  },
};
