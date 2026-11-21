/**
 * Age 7 — "Math Explorers" (2nd grade)
 * Pitched for advanced 2nd graders: "Advanced" is the default; "Challenge" reaches into
 * 3rd grade (3-digit regrouping across zeros, rounding, multiplication & division facts,
 * time to the minute & elapsed time, fraction of a set, scaled bar graphs).
 *
 * All typed answers are whole numbers (money in cents), so the simple keypad is enough.
 * Fractions and times are tap-to-choose.
 */
import { rand, pick, sample, shuffle, chance, distinctInts } from '../lib/rng.js';
import { NAMES, makeChoices, distinctShape } from './shared.js';
import { themed7, middleEarthOn, THEME_RATE } from './middleEarth.js';

const L = (d) => (d === 'easy' || d === 'challenge' ? d : 'standard');
const by = (d, e, s, c) => (d === 'easy' ? e : d === 'challenge' ? c : s);
const nm = () => pick(NAMES);
const fmt = (n) => n.toLocaleString('en-US');
const cents = (c) => (c >= 100 ? `$${Math.floor(c / 100)}.${String(c % 100).padStart(2, '0')}` : `${c}¢`);

function kp(o) { return { input: 'keypad', answerLabel: fmt(o.answer), ...o, answer: String(o.answer) }; }
function choose(o, correct, wrong) {
  const { choices, answer } = makeChoices(correct, wrong);
  return { input: 'choice', choices, answer, answerLabel: correct.text || o.answerLabel, ...o };
}
const regroups = (a, b) => String(a).split('').reverse().some((d, i) => Number(d) + Number(String(b).split('').reverse()[i] || 0) >= 10);

/* ------------------------------ Addition ------------------------------ */
export function addition(mode, d) {
  const topic = 'add';
  if (mode === 'story') return addStory(d);
  let a; let b; let c = 0;
  if (mode === 'flash') {
    if (d === 'easy') { a = rand(11, 89); b = rand(2, 9); }
    else if (d === 'standard') { a = rand(12, 79); b = rand(11, 99 - a); if (b < 11) b = 11; }
    else { a = rand(25, 99); b = rand(25, 99); }
  } else if (d === 'easy') { a = rand(12, 69); b = rand(11, 29); }
  else if (d === 'standard') { a = rand(105, 689); b = rand(27, 299); }
  else if (chance(0.4)) { a = rand(102, 499); b = rand(46, 299); c = rand(11, 99); }
  else { a = rand(256, 699); b = rand(158, 299); }
  const s = a + b + c;
  const disp = c ? `${a} + ${b} + ${c}` : `${a} + ${b}`;
  return kp({ key: `add:${a}:${b}:${c}`, topic, display: disp, prompt: mode === 'worksheet' ? (regroups(a, b) ? 'Add. Regroup if you need to.' : 'Add.') : undefined, answer: s,
    explanation: `${disp} = ${fmt(s)}${regroups(a, b) ? ' (regroup 10 ones into a ten, or 10 tens into a hundred)' : ''}.` });
}
function addStory(d) {
  const w = nm();
  const T = pick([
    () => { const a = rand(by(d, 24, 120, 245), by(d, 68, 380, 560)); const b = rand(by(d, 13, 85, 178), by(d, 39, 260, 399));
      return ['📚', 'Library Books', `The library has ${a} picture books and ${b} chapter books. How many books in all?`, a + b, [`Add ${a} + ${b}.`]]; },
    () => { const a = rand(by(d, 15, 45, 126), by(d, 45, 98, 349)); const b = rand(by(d, 12, 37, 98), by(d, 40, 89, 287)); const c2 = d === 'easy' ? 0 : rand(20, 99);
      return ['🎟️', 'School Fair', `The fair sold ${a} tickets on Friday${c2 ? `, ${b} on Saturday, and ${c2} on Sunday` : ` and ${b} on Saturday`}. How many tickets in all?`, a + b + c2,
        c2 ? [`Add two numbers first: ${a} + ${b} = ${a + b}.`, `Then add ${c2}.`] : [`Add ${a} + ${b}.`]]; },
    () => { const a = rand(by(d, 20, 48, 150), by(d, 60, 95, 480)); const b = rand(by(d, 10, 26, 90), by(d, 39, 88, 350));
      return ['🏃', 'Fun Run', `${w} ran ${a} laps last month and ${b} laps this month. How many laps in all?`, a + b, [`Add ${a} + ${b}.`]]; },
  ])();
  const [e, title, text, ans, hints] = T;
  return kp({ key: `add:story:${title}:${ans}:${text.length}`, topic: 'add', story: { emoji: e, title }, prompt: text, answer: ans, hints, explanation: `The total is ${fmt(ans)}.` });
}

/* ----------------------------- Subtraction ----------------------------- */
export function subtraction(mode, d) {
  const topic = 'sub';
  if (mode === 'story') return subStory(d);
  let a; let b;
  if (mode === 'flash') {
    if (d === 'easy') { a = rand(20, 99); b = rand(2, 9); }
    else if (d === 'standard') { a = rand(40, 99); b = rand(11, a - 5); }
    else { a = rand(100, 200); b = rand(25, 99); }
  } else if (d === 'easy') { a = rand(40, 99); b = rand(12, a - 6); }
  else if (d === 'standard') { a = rand(300, 900); b = rand(108, a - 40); }
  else { a = pick([300, 400, 500, 600, 700, 800, 900, 1000]) + pick([0, 0, 2, 4, 5]); b = rand(127, a - 60); } // across zeros
  return kp({ key: `sub:${a}:${b}`, topic, display: `${a} − ${b}`, prompt: mode === 'worksheet' ? 'Subtract.' : undefined, answer: a - b,
    explanation: `${a} − ${b} = ${fmt(a - b)}. Check: ${fmt(a - b)} + ${b} = ${a}.` });
}
function subStory(d) {
  const w = nm();
  const a = rand(by(d, 35, 210, 400), by(d, 99, 650, 1000)); const b = rand(by(d, 12, 75, 145), a - by(d, 8, 30, 60));
  const T = pick([
    ['🎈', 'Balloon Pop', `There were ${a} balloons at the party. ${b} popped. How many balloons are left?`],
    ['🍎', 'Apple Orchard', `The orchard picked ${a} apples. They sold ${b}. How many apples are left?`],
    ['🧩', 'Puzzle Time', `${w}'s puzzle has ${a} pieces. ${w} has placed ${b}. How many pieces are left?`],
  ]);
  return kp({ key: `sub:story:${a}:${b}:${T[1]}`, topic: 'sub', story: { emoji: T[0], title: T[1] }, prompt: T[2], answer: a - b,
    hints: [`Subtract: ${a} − ${b}.`, `Check by adding your answer to ${b}.`], explanation: `${a} − ${b} = ${fmt(a - b)}.` });
}

/* ------------------------------ Place value ------------------------------ */
const PLACE = ['ones', 'tens', 'hundreds', 'thousands'];
export function placevalue(mode, d) {
  const topic = 'placevalue';
  const forms = mode === 'flash' ? by(d, ['value', 'tensMore'], ['value', 'expanded', 'tensMore'], ['round', 'value', 'tensMore'])
    : by(d, ['blocks', 'value', 'expanded'], ['blocks', 'value', 'expanded', 'compare', 'tensMore'], ['round', 'compare', 'expanded', 'value', 'blocks']);
  const f = pick(forms);
  const n = d === 'easy' ? rand(21, 99) : d === 'standard' ? rand(102, 999) : rand(1002, 9999);
  if (f === 'blocks') {
    const h = rand(d === 'easy' ? 0 : 1, by(d, 0, 6, 9)); const t = rand(0, 9); const o = rand(0, 9); const v = h * 100 + t * 10 + o;
    if (v < 11) return placevalue(mode, d);
    return kp({ key: `pv:blocks:${v}`, topic, prompt: 'What number do the blocks show?', visual: { type: 'base10', hundreds: h, tens: t, ones: o }, answer: v,
      hints: ['Count hundreds by 100s, tens by 10s, then ones.'], explanation: `${h ? `${h} hundreds + ` : ''}${t} tens + ${o} ones = ${v}.` });
  }
  if (f === 'value') {
    const s = String(n); const i = rand(0, s.length - 1); const digit = Number(s[i]);
    // the digit must appear only once, or "the value of the 8 in 4,882" has two answers
    if (digit === 0 || s.split(String(digit)).length > 2) return placevalue(mode, d);
    const place = s.length - 1 - i; const val = digit * 10 ** place;
    return kp({ key: `pv:value:${n}:${i}`, topic, prompt: `What is the VALUE of the ${digit} in ${fmt(n)}?`, display: fmt(n), answer: val,
      hints: [`The ${digit} is in the ${PLACE[place]} place.`], explanation: `The ${digit} is in the ${PLACE[place]} place, so it is worth ${fmt(val)}.` });
  }
  if (f === 'expanded') {
    const parts = String(n).split('').map((c, i, arr) => Number(c) * 10 ** (arr.length - 1 - i)).filter((x) => x);
    const sh = shuffle(parts);
    return kp({ key: `pv:exp:${n}`, topic, prompt: 'What number is this?', display: sh.map(fmt).join(' + '), answer: n,
      explanation: `${sh.map(fmt).join(' + ')} = ${fmt(n)}.` });
  }
  if (f === 'tensMore') {
    const k = pick(d === 'easy' ? [10] : [10, 100]); const more = chance(0.5);
    const base = d === 'easy' ? rand(20, 89) : rand(110, 890);
    const ans = more ? base + k : base - k;
    return kp({ key: `pv:tm:${base}:${k}:${more}`, topic, prompt: `What is ${k} ${more ? 'more' : 'less'} than ${base}?`, display: `${base} ${more ? '+' : '−'} ${k}`, answer: ans,
      hints: [`Only the ${k === 10 ? 'tens' : 'hundreds'} digit changes.`], explanation: `${base} ${more ? '+' : '−'} ${k} = ${ans}.` });
  }
  if (f === 'compare') {
    let a = n; let b = chance(0.2) ? n : n + pick([-1, 1]) * pick([1, 9, 10, 90, 100, 300]);
    if (b < 100) b = n + 10;
    const sym = a > b ? '>' : a < b ? '<' : '=';
    return choose({ key: `pv:cmp:${a}:${b}`, topic, prompt: 'Which sign goes in the box?', display: `${fmt(a)} ☐ ${fmt(b)}`,
      hints: ['Compare the biggest place first.'], explanation: `${fmt(a)} ${sym} ${fmt(b)}.` },
    { text: sym, big: true }, ['>', '<', '='].filter((x) => x !== sym).map((x) => ({ text: x, big: true })));
  }
  // rounding
  const to = pick([10, 100]); const v = rand(to === 10 ? 11 : 110, to === 10 ? 989 : 989);
  if (v % to === 0) return placevalue(mode, d);
  const r = Math.round(v / to) * to;
  return kp({ key: `pv:round:${v}:${to}`, topic, prompt: `Round ${v} to the nearest ${to}.`, display: String(v), answer: r,
    hints: [`It is between ${Math.floor(v / to) * to} and ${Math.ceil(v / to) * to}.`, '5 or more rounds up.'], explanation: `${v} is closer to ${r}.` });
}

/* ------------------------------ Odd & even ------------------------------ */
export function evenodd(mode, d) {
  const topic = 'evenodd';
  if (d !== 'easy' && chance(0.4)) {
    const a = rand(3, by(d, 20, 40, 99)); const b = rand(3, by(d, 20, 40, 99)); const even = (a + b) % 2 === 0;
    return choose({ key: `eo:sum:${a}:${b}`, topic, prompt: `Is ${a} + ${b} odd or even?`, hints: ['odd + odd = even, even + even = even, odd + even = odd.'],
      explanation: `${a} + ${b} = ${a + b}, which is ${even ? 'even' : 'odd'}.` }, { text: even ? 'Even' : 'Odd' }, [{ text: even ? 'Odd' : 'Even' }]);
  }
  const n = rand(by(d, 2, 11, 101), by(d, 20, 99, 999)); const even = n % 2 === 0;
  if (n <= 20 && d === 'easy') {
    return choose({ key: `eo:pairs:${n}`, topic, prompt: 'Can these be put in pairs? Odd or even?', visual: { type: 'array', rows: 2, cols: Math.ceil(n / 2), emoji: undefined, count: n },
      explanation: `${n} is ${even ? 'even: every dot has a partner' : 'odd: one dot is left over'}.` }, { text: even ? 'Even' : 'Odd' }, [{ text: even ? 'Odd' : 'Even' }]);
  }
  return choose({ key: `eo:${n}`, topic, prompt: 'Odd or even?', display: String(n), hints: ['Look at the ones digit: 0, 2, 4, 6, 8 are even.'],
    explanation: `The ones digit is ${n % 10}, so ${n} is ${even ? 'even' : 'odd'}.` }, { text: even ? 'Even' : 'Odd' }, [{ text: even ? 'Odd' : 'Even' }]);
}

/* ----------------------------- Skip counting ----------------------------- */
export function skip(mode, d) {
  const topic = 'skip';
  const step = pick(by(d, [2, 5, 10], [5, 10, 100, 3, 4], [3, 4, 6, 25, 50, 100]));
  const back = d !== 'easy' && chance(0.3);
  const start = step === 100 ? rand(1, 4) * 100 + pick([0, 0, 20, 50]) : step * rand(1, 8) + (step >= 10 && d !== 'easy' ? rand(1, 9) : 0);
  let terms = [0, 1, 2, 3].map((i) => start + i * step);
  if (back) terms = terms.reverse();
  const next = back ? terms[3] - step : terms[3] + step;
  if (next < 0) return skip(mode, d);
  return kp({ key: `skip:${step}:${terms[0]}:${back}`, topic, prompt: back ? 'Counting back. What comes next?' : 'What comes next?',
    visual: { type: 'sequence', terms: terms.map(fmt), blank: true }, answer: next, hints: [`The pattern goes ${back ? 'down' : 'up'} by ${step}.`],
    explanation: `${back ? 'Subtract' : 'Add'} ${step} each time: next is ${fmt(next)}.` });
}

/* ------------------------- Arrays, groups, × and ÷ ------------------------- */
const GROUPS = [['🍪', 'cookies', 'plates'], ['🌷', 'tulips', 'rows'], ['🥚', 'eggs', 'nests'], ['⚽', 'balls', 'bins'], ['🍓', 'strawberries', 'bowls']];
export function arrays(mode, d) {
  const topic = 'arrays';
  const f = pick(by(d, ['array', 'repeated'], ['array', 'repeated', 'facts'], ['facts', 'divide', 'array', 'divide']));
  const facts = by(d, [2, 5, 10], [2, 3, 4, 5, 10], [3, 4, 6, 7, 8, 9]);
  if (f === 'array' || (mode === 'stem' && f !== 'divide')) {
    const r = rand(2, by(d, 5, 6, 9)); const c = rand(2, by(d, 5, 8, 9)); const [e] = pick(GROUPS);
    return kp({ key: `arr:${r}:${c}:${e}`, topic, prompt: `${r} rows of ${c}. How many in all?`, visual: { type: 'array', rows: r, cols: c, emoji: e }, answer: r * c,
      hints: [`Add ${c} for each row: ${Array(r).fill(c).join(' + ')}.`], explanation: `${r} × ${c} = ${r * c}.` });
  }
  if (f === 'repeated') {
    const g = rand(2, 5); const k = pick(facts);
    return kp({ key: `arr:rep:${g}:${k}`, topic, display: Array(g).fill(k).join(' + '), prompt: 'Add the equal groups.', answer: g * k,
      explanation: `${g} groups of ${k} is ${g * k}.` });
  }
  if (f === 'divide') {
    const k = pick(facts); const q = rand(2, by(d, 5, 6, 9)); const [e, what, cont] = pick(GROUPS);
    if (mode === 'story' || mode === 'stem') {
      return kp({ key: `arr:share:${k}:${q}:${e}`, topic, story: { emoji: e, title: 'Fair Shares' },
        prompt: `${nm()} shares ${k * q} ${what} equally into ${k} ${cont}. How many ${what} in each?`, answer: q,
        hints: [`Deal them out one at a time into ${k} groups.`, `What times ${k} is ${k * q}?`], explanation: `${k * q} ÷ ${k} = ${q}.` });
    }
    return kp({ key: `arr:div:${k}:${q}`, topic, display: `${k * q} ÷ ${k}`, answer: q, hints: [`What times ${k} makes ${k * q}?`], explanation: `${k} × ${q} = ${k * q}, so ${k * q} ÷ ${k} = ${q}.` });
  }
  const a = pick(facts); const b = rand(2, by(d, 5, 10, 10));
  if (mode === 'story') {
    const [e, what, cont] = pick(GROUPS);
    return kp({ key: `arr:story:${a}:${b}:${e}`, topic, story: { emoji: e, title: 'Equal Groups' }, prompt: `There are ${b} ${cont} with ${a} ${what} in each. How many ${what} in all?`,
      answer: a * b, hints: [`${b} groups of ${a}.`, `Skip count by ${a}, ${b} times.`], explanation: `${b} × ${a} = ${a * b}.` });
  }
  return kp({ key: `arr:fact:${a}:${b}`, topic, display: chance(0.5) ? `${a} × ${b}` : `${b} × ${a}`, answer: a * b, explanation: `${a} × ${b} = ${a * b}.` });
}

/* -------------------------------- Money -------------------------------- */
export function money(mode, d) {
  const topic = 'money';
  const kinds = by(d, [10, 5, 1], [25, 10, 5, 1], [100, 25, 10, 5, 1]);
  if (mode === 'story' || (d !== 'easy' && mode === 'stem')) {
    const price = rand(by(d, 12, 25, 115), by(d, 45, 95, 450));
    const paid = d === 'easy' ? 50 : price < 100 ? 100 : Math.ceil(price / 100) * 100;
    const items = ['a pencil', 'a sticker book', 'a yo-yo', 'a bouncy ball', 'a juice box', 'a toy car'];
    return kp({ key: `money:change:${price}:${paid}`, topic, story: { emoji: '🛒', title: 'Making Change' },
      prompt: `${nm()} buys ${pick(items)} for ${cents(price)} and pays with ${cents(paid)}. How much change, in cents?`, answer: paid - price,
      hints: [`Count up from ${cents(price)} to ${cents(paid)}.`, '100 cents = 1 dollar.'], explanation: `${paid} − ${price} = ${paid - price}¢ change.` });
  }
  const n = rand(by(d, 3, 4, 5), by(d, 6, 8, 9));
  const coins = Array.from({ length: n }, () => pick(kinds)).sort((a, b) => b - a);
  const total = coins.reduce((a, b) => a + b, 0);
  return kp({ key: `money:count:${coins.join(',')}`, topic, prompt: 'How many cents in all?', visual: { type: 'coins', coins }, answer: total, hint: 'Answer in cents (1 dollar = 100¢)',
    hints: ['Start with the biggest coins and count on.', 'Quarter 25¢, dime 10¢, nickel 5¢, penny 1¢.'], explanation: `${coins.join(' + ')} = ${total}¢${total >= 100 ? ` (${cents(total)})` : ''}.` });
}

/* -------------------------------- Time -------------------------------- */
const ts = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
const addMin = (h, m, k) => { const t = ((h % 12) * 60 + m + k + 720) % 720; return [Math.floor(t / 60) || 12, t % 60]; };
export function time(mode, d) {
  const topic = 'time';
  const h = rand(1, 12);
  const m = d === 'easy' ? pick([0, 15, 30, 45]) : d === 'standard' ? 5 * rand(0, 11) : rand(0, 59);
  if (mode === 'story' || (mode === 'stem' && d !== 'easy')) {
    const dur = pick(by(d, [30, 60], [15, 30, 45, 60, 90], [25, 35, 50, 75, 105]));
    const sm = 5 * rand(0, 11);
    const [eh, em] = addMin(h, sm, dur);
    const acts = [['⚽', 'Soccer Practice', 'Soccer practice'], ['🎹', 'Piano Lesson', 'Piano lesson'], ['🎬', 'Movie Time', 'The movie'], ['🏊', 'Swim Class', 'Swim class']];
    const [e, title, what] = pick(acts);
    const wrong = [addMin(h, sm, dur + 10), addMin(h, sm, dur - 10), addMin(h, sm, dur + 60)].map(([a, b]) => ts(a, b));
    return choose({ key: `time:elapsed:${h}:${sm}:${dur}`, topic, story: { emoji: e, title }, prompt: `${what} starts at ${ts(h, sm)} and lasts ${dur} minutes. What time does it end?`,
      visual: { type: 'clock', h, m: sm }, hints: ['Count forward by hours first, then by minutes.', '60 minutes = 1 hour.'], explanation: `${ts(h, sm)} + ${dur} minutes = ${ts(eh, em)}.` },
    { text: ts(eh, em) }, [...new Set(wrong)].filter((x) => x !== ts(eh, em)).slice(0, 3).map((x) => ({ text: x })));
  }
  const right = ts(h, m);
  const [h2] = addMin(h, 0, 60);
  const cand = [ts(h2, m), ts(h, (m + 30) % 60), ts(Math.round(m / 5) % 12 || 12, (h % 12) * 5), ts(h, (m + 5) % 60)];
  const wrong = [...new Set(cand)].filter((x) => x !== right).slice(0, 3);
  return choose({ key: `time:read:${h}:${m}`, topic, prompt: 'What time does the clock show?', visual: { type: 'clock', h, m },
    hints: ['The short hand shows the hour.', 'Count the long hand by 5s from the 12.'], explanation: `The hour hand is ${m >= 30 ? 'past' : 'at'} ${h} and the minute hand shows ${m} minutes: ${right}.` },
  { text: right }, wrong.map((x) => ({ text: x })));
}

/* ----------------------------- Measurement ----------------------------- */
export function measure(mode, d) {
  const topic = 'measure';
  const unit = pick(['in', 'cm']);
  if (mode === 'story') {
    const a = rand(by(d, 20, 45, 120), by(d, 60, 99, 300)); const b = rand(by(d, 8, 15, 45), a - 5);
    const u = unit === 'in' ? 'inches' : 'centimeters';
    const T = pick([
      ['🎀', 'Ribbon', `${nm()} has a ribbon ${a} ${u} long and cuts off ${b} ${u}. How long is it now?`, a - b],
      ['🌻', 'Sunflowers', `One sunflower is ${a} ${u} tall. Another is ${b} ${u} tall. How much taller is the first one?`, a - b],
      ['🚂', 'Toy Train', `A toy train track is ${a} ${u} long. ${nm()} adds ${b} more ${u}. How long is it now?`, a + b],
    ]);
    return kp({ key: `meas:story:${a}:${b}:${T[1]}`, topic, story: { emoji: T[0], title: T[1] }, prompt: T[2], answer: T[3], hints: ['Is it getting longer or shorter? Add or subtract.'],
      explanation: `The answer is ${T[3]} ${u}.` });
  }
  const len = rand(2, by(d, 6, 9, 9)); const start = d === 'challenge' ? rand(1, 3) : 0;
  return kp({ key: `meas:ruler:${len}:${start}:${unit}`, topic, prompt: `How long is the pencil in ${unit === 'in' ? 'inches' : 'centimeters'}?`,
    visual: { type: 'ruler', length: len, start, unit }, answer: len,
    hints: start ? [`It doesn't start at 0! It starts at ${start}.`, 'Subtract the start from the end.'] : ['Read the number at the tip of the pencil.'],
    explanation: start ? `It goes from ${start} to ${start + len}: ${start + len} − ${start} = ${len}.` : `It ends at ${len}.` });
}

/* ------------------------------- Fractions ------------------------------- */
const FR = { 2: 'half', 3: 'third', 4: 'fourth', 6: 'sixth', 8: 'eighth' };
export function fractions(mode, d) {
  const topic = 'fractions';
  const f = pick(by(d, ['name'], ['name', 'name', 'compare'], ['name', 'compare', 'ofset', 'ofset']));
  if (f === 'ofset') {
    const den = pick([2, 3, 4]); const k = rand(2, 6); const total = den * k;
    return kp({ key: `fr:set:${den}:${total}`, topic, prompt: `What is ${'[[1/' + den + ']]'} of ${total}?`, visual: { type: 'array', rows: den, cols: k, emoji: '🍪' }, answer: k,
      hints: [`Split ${total} into ${den} equal rows.`], explanation: `${total} split into ${den} equal groups is ${k} in each group.` });
  }
  if (f === 'compare') {
    const [a, b] = sample(d === 'challenge' ? [2, 3, 4, 6, 8] : [2, 3, 4], 2);
    const bigger = a < b ? a : b;
    return choose({ key: `fr:cmp:${Math.min(a, b)}:${Math.max(a, b)}`, topic, prompt: 'Which fraction is BIGGER?',
      visual: { type: 'emojiset', items: ['🍕'] }, hints: ['The more pieces you cut, the smaller each piece is.'],
      explanation: `[[1/${bigger}]] is bigger: fewer pieces means each piece is bigger.` },
    { text: `[[1/${bigger}]]`, visual: { type: 'fracshape', parts: bigger, shaded: 1 } }, [{ text: `[[1/${a === bigger ? b : a}]]`, visual: { type: 'fracshape', parts: a === bigger ? b : a, shaded: 1 } }]);
  }
  const den = pick(by(d, [2, 3, 4], [2, 3, 4, 6], [3, 4, 6, 8]));
  const num = d === 'easy' ? 1 : rand(1, den - 1);
  const kind = pick(['circle', 'rect']);
  const label = `[[${num}/${den}]]`;
  const cand = [[den - num, den], [num, den + 1], [den, num + den], [1, num + 1], [num + 1, den], [1, den + 2]];
  const seen = [[num, den]];
  const wrongs = [];
  for (const [a, b] of cand) {
    if (a <= 0 || a >= b || seen.some(([x, y]) => x * b === a * y)) continue; // skip equal values (2/6 = 1/3)
    seen.push([a, b]); wrongs.push(`[[${a}/${b}]]`);
  }
  return choose({ key: `fr:name:${num}:${den}:${kind}`, topic, prompt: 'What fraction is shaded?', visual: { type: 'fracshape', parts: den, shaded: num, kind },
    hints: ['The bottom number is how many equal parts in all.', 'The top number is how many are shaded.'],
    explanation: `${num} of ${den} equal parts are shaded: ${label}.` }, { text: label }, wrongs.slice(0, 3).map((x) => ({ text: x })));
}

/* --------------------------- Shapes & attributes --------------------------- */
const POLY = { triangle: 3, square: 4, rectangle: 4, hexagon: 6, diamond: 4 };
const SOLID = [['cube', '🎲', 6, 8], ['rectangular prism', '📦', 6, 8]];
export function geometry(mode, d) {
  const topic = 'geometry';
  const f = pick(by(d, ['sides', 'name'], ['sides', 'vertices', 'name', 'quad'], ['faces', 'vertices', 'quad', 'total']));
  if (f === 'faces') {
    const [n, e, faces, verts] = pick(SOLID); const askF = chance(0.5);
    return kp({ key: `geo:solid:${n}:${askF}`, topic, prompt: `How many ${askF ? 'faces' : 'vertices (corners)'} does a ${n} have?`, visual: { type: 'emoji', emoji: e }, answer: askF ? faces : verts,
      hints: [askF ? 'Count the flat sides: top, bottom, front, back, left, right.' : 'Count the corners on top, then the bottom.'], explanation: `A ${n} has ${faces} faces and ${verts} vertices.` });
  }
  if (f === 'total') {
    const a = pick(Object.keys(POLY)); const b = pick(Object.keys(POLY)); const k = rand(2, 4);
    return kp({ key: `geo:total:${a}:${b}:${k}`, topic, prompt: `${nm()} draws ${k} ${a}s and 1 ${b}. How many sides in all?`, answer: k * POLY[a] + POLY[b],
      hints: [`Each ${a} has ${POLY[a]} sides.`], explanation: `${k} × ${POLY[a]} + ${POLY[b]} = ${k * POLY[a] + POLY[b]}.` });
  }
  if (f === 'quad') {
    const quads = ['square', 'rectangle', 'diamond']; const right = pick(quads);
    const nots = sample(['triangle', 'hexagon', 'circle', 'star', 'oval'], 3);
    return choose({ key: `geo:quad:${right}:${nots.join('')}`, topic, prompt: 'Which shape is a QUADRILATERAL (4 sides)?', answerLabel: right,
      explanation: `A ${right} has 4 sides, so it is a quadrilateral.` },
    { visual: { type: 'shape', shape: right, color: 'blue' } }, nots.map((s) => ({ visual: { type: 'shape', shape: s, color: pick(['red', 'green', 'orange', 'purple']) } })));
  }
  if (f === 'name') {
    const s = pick(Object.keys(POLY).filter((x) => x !== 'diamond'));
    const others = sample(Object.keys(POLY).filter((x) => distinctShape(s, x) && !(s === 'square' && x === 'rectangle') && x !== 'diamond').concat(['pentagon', 'circle']), 3);
    return choose({ key: `geo:name:${s}`, topic, prompt: 'What is this shape called?', visual: { type: 'shape', shape: s, color: 'teal' }, explanation: `It is a ${s}.` },
      { text: s }, others.map((x) => ({ text: x })));
  }
  const s = pick(Object.keys(POLY));
  return kp({ key: `geo:${f}:${s}`, topic, prompt: `How many ${f === 'sides' ? 'sides' : 'vertices (corners)'} does this shape have?`, visual: { type: 'shape', shape: s, color: 'purple' }, answer: POLY[s],
    explanation: `A ${s === 'diamond' ? 'rhombus' : s} has ${POLY[s]} ${f === 'sides' ? 'sides' : 'vertices'}.` });
}

/* ------------------------------- Bar graphs ------------------------------- */
const SETS = [
  { title: 'Favorite Fruit', items: [['Apple', '🍎'], ['Banana', '🍌'], ['Grapes', '🍇'], ['Orange', '🍊']] },
  { title: 'Pets in Our Class', items: [['Dog', '🐶'], ['Cat', '🐱'], ['Fish', '🐟'], ['Bird', '🐦']] },
  { title: 'Favorite Sport', items: [['Soccer', '⚽'], ['Swim', '🏊'], ['Bike', '🚲'], ['Hoops', '🏀']] },
];
export function data(mode, d) {
  const topic = 'data';
  const set = pick(SETS); const step = d === 'challenge' ? 2 : 1;
  const n = by(d, 3, 4, 4);
  const vals = distinctInts(n, 2, by(d, 8, 10, 10)).map((v) => v * step);
  const items = set.items.slice(0, n).map(([label, emoji], i) => ({ label, emoji, value: vals[i] }));
  const visual = { type: 'bargraph', items, step, title: set.title };
  const f = pick(by(d, ['read', 'most'], ['more', 'total', 'read'], ['more', 'total', 'fewer']));
  const [A, B] = sample(items, 2);
  const key = `data:${set.title}:${vals.join(',')}:${f}:${A.label}:${B.label}`;
  const scaleHint = step > 1 ? 'Careful: each line on the graph counts by 2.' : 'Read the number at the top of each bar.';
  if (f === 'read') return kp({ key, topic, prompt: `How many chose ${A.label}?`, visual, answer: A.value, hints: [scaleHint], explanation: `The ${A.label} bar reaches ${A.value}.` });
  if (f === 'most') {
    const top = items.reduce((a, b) => (b.value > a.value ? b : a));
    return choose({ key, topic, prompt: 'Which one has the MOST?', visual, explanation: `${top.label} has the tallest bar.` }, { text: top.label }, items.filter((x) => x !== top).map((x) => ({ text: x.label })));
  }
  const [hi, lo] = A.value > B.value ? [A, B] : [B, A];
  if (f === 'more' || f === 'fewer') {
    return kp({ key, topic, prompt: f === 'more' ? `How many MORE chose ${hi.label} than ${lo.label}?` : `How many FEWER chose ${lo.label} than ${hi.label}?`, visual, answer: hi.value - lo.value,
      hints: [scaleHint, 'Find both numbers, then subtract.'], explanation: `${hi.value} − ${lo.value} = ${hi.value - lo.value}.` });
  }
  const total = items.reduce((a, b) => a + b.value, 0);
  return kp({ key, topic, prompt: 'How many in all?', visual, answer: total, hints: [scaleHint, 'Add all the bars together.'], explanation: `${items.map((x) => x.value).join(' + ')} = ${total}.` });
}

/* ---------------------------- Number puzzles ---------------------------- */
export function puzzles(mode, d) {
  const topic = 'puzzles';
  const f = pick(by(d, ['missing', 'riddle'], ['missing', 'riddle', 'balance'], ['missing', 'riddle', 'balance', 'twostep']));
  if (f === 'missing') {
    const total = rand(by(d, 20, 50, 200), by(d, 60, 150, 900)); const part = rand(by(d, 5, 15, 60), total - 5);
    const left = chance(0.5);
    return kp({ key: `pz:miss:${part}:${total}:${left}`, topic, prompt: 'What number is missing?', display: left ? `? + ${part} = ${total}` : `${part} + ? = ${total}`, answer: total - part,
      hints: [`Think: ${total} − ${part}.`], explanation: `${total} − ${part} = ${total - part}.` });
  }
  if (f === 'balance') {
    const x = rand(2, 9); const a = rand(2, 3); const b = rand(1, 6);
    return kp({ key: `pz:bal:${a}:${b}:${x}`, topic, prompt: 'The scale is balanced. How much does one box weigh?', visual: { type: 'balance', left: { x: a, units: b }, right: { x: 0, units: a * x + b } }, answer: x,
      hints: [`Take ${b} weight${b > 1 ? 's' : ''} off both sides.`, `Now ${a} boxes = ${a * x}. Share it equally.`], explanation: `${a} boxes + ${b} = ${a * x + b}, so ${a} boxes = ${a * x} and 1 box = ${x}.` });
  }
  if (f === 'twostep') {
    const a = rand(10, 40); const b = rand(5, 20); const c = rand(3, 15);
    return kp({ key: `pz:two:${a}:${b}:${c}`, topic, story: { emoji: '🚌', title: 'The Bus Ride' },
      prompt: `${a} kids are on the bus. At the first stop, ${b} get on. At the next stop, ${c} get off. How many kids are on the bus now?`, answer: a + b - c,
      hints: [`First: ${a} + ${b} = ${a + b}.`, `Then subtract ${c}.`], explanation: `${a} + ${b} − ${c} = ${a + b - c}.` });
  }
  // riddle with a unique answer
  for (let t = 0; t < 40; t++) {
    const tens = rand(1, 9); const ones = rand(0, 9); const n = tens * 10 + ones;
    const clues = [
      { t: `My tens digit is ${tens}.`, f: (x) => Math.floor(x / 10) === tens },
      { t: ones > tens ? `My ones digit is ${ones - tens} more than my tens digit.` : ones < tens ? `My ones digit is ${tens - ones} less than my tens digit.` : 'My two digits are the same.', f: (x) => (x % 10) - Math.floor(x / 10) === ones - tens },
      { t: n % 2 ? 'I am odd.' : 'I am even.', f: (x) => x % 2 === n % 2 },
      { t: `The sum of my digits is ${tens + ones}.`, f: (x) => Math.floor(x / 10) + (x % 10) === tens + ones },
      { t: `I am between ${n - rand(3, 9)} and ${n + rand(3, 9)}.`, f: null },
    ];
    clues[4].f = ((lo, hi) => (x) => x > lo && x < hi)(...clues[4].t.match(/\d+/g).map(Number));
    const pickClues = d === 'challenge' ? sample([clues[1], clues[2], clues[3], clues[4]], 3) : [clues[0], pick([clues[1], clues[2], clues[3]])];
    const fits = Array.from({ length: 90 }, (_, i) => i + 10).filter((x) => pickClues.every((c) => c.f(x)));
    if (fits.length === 1 && fits[0] === n) {
      return kp({ key: `pz:riddle:${n}:${pickClues.map((c) => c.t).join('|')}`, topic, prompt: 'I am a 2-digit number. Who am I?', visual: { type: 'clues', items: pickClues.map((c) => c.t) }, answer: n,
        hints: ['Use one clue at a time to cross out numbers.'], explanation: `Only ${n} fits every clue.` });
    }
  }
  return puzzles(mode, 'easy');
}

/* ------------------------------ Registry ------------------------------ */
export default {
  age: 7,
  title: 'Math Explorers',
  tagline: 'Big numbers, money, time, arrays, fractions & graphs',
  accent: 'sky',
  allowRetry: true,
  bigInput: false,
  readAloud: false,
  keypad: 'simple',
  topics: [
    { id: 'add', label: 'Addition with Regrouping', group: 'Operations', modes: ['flash', 'worksheet', 'story'] },
    { id: 'sub', label: 'Subtraction with Regrouping', group: 'Operations', modes: ['flash', 'worksheet', 'story'] },
    { id: 'arrays', label: 'Arrays, Groups, × & ÷', group: 'Operations', modes: ['flash', 'worksheet', 'story', 'stem'] },
    { id: 'placevalue', label: 'Place Value & Rounding', group: 'Number Sense', modes: ['flash', 'worksheet', 'stem'] },
    { id: 'evenodd', label: 'Odd & Even', group: 'Number Sense', modes: ['flash', 'worksheet'] },
    { id: 'skip', label: 'Skip Counting', group: 'Number Sense', modes: ['flash', 'worksheet', 'stem'] },
    { id: 'money', label: 'Money', group: 'Measurement & Data', modes: ['flash', 'worksheet', 'story', 'stem'] },
    { id: 'time', label: 'Telling Time', group: 'Measurement & Data', modes: ['flash', 'worksheet', 'story', 'stem'] },
    { id: 'measure', label: 'Measuring Length', group: 'Measurement & Data', modes: ['worksheet', 'story', 'stem'] },
    { id: 'data', label: 'Bar Graphs', group: 'Measurement & Data', modes: ['worksheet', 'stem'] },
    { id: 'fractions', label: 'Fractions', group: 'Shapes & Fractions', modes: ['worksheet', 'stem'] },
    { id: 'geometry', label: 'Shapes & Attributes', group: 'Shapes & Fractions', modes: ['worksheet', 'stem'] },
    { id: 'puzzles', label: 'Number Puzzles', group: 'Shapes & Fractions', modes: ['stem'] },
  ],
  difficulties: [
    { id: 'easy', label: 'Warm-up', detail: '2-digit adding & subtracting, quarter hours, coins to 99¢, halves/thirds/fourths' },
    { id: 'standard', label: 'Advanced', detail: '3-digit regrouping, × facts 2–5 & 10, time to 5 minutes, quarters, making change' },
    { id: 'challenge', label: 'Challenge', detail: '3rd-grade reach: across zeros, rounding, × & ÷ to 9s, elapsed time, fraction of a set' },
  ],
  defaultDifficulty: 'standard',
  defaults: {
    flash: { seconds: 60, maxCards: 40 },
    worksheet: { count: 12 },
    story: { count: 6 },
    stem: { count: 8 },
    mix: { count: 10 },
  },
  countOptions: { worksheet: [10, 12, 15, 20], story: [4, 6, 8], stem: [6, 8, 10], mix: [8, 10, 12] },
  secondsOptions: [60, 90, 120],
  expectedMs: { flash: 7000, worksheet: 25000, story: 45000, stem: 40000, mix: 30000 },

  generate(mode, topic, difficulty = 'standard') {
    const d = L(difficulty);
    if (middleEarthOn() && chance(THEME_RATE)) {
      const themed = themed7(mode, topic, d);
      if (themed) return themed;
    }
    switch (topic) {
      case 'add': return addition(mode, d);
      case 'sub': return subtraction(mode, d);
      case 'arrays': return arrays(mode, d);
      case 'placevalue': return placevalue(mode, d);
      case 'evenodd': return evenodd(mode, d);
      case 'skip': return skip(mode, d);
      case 'money': return money(mode, d);
      case 'time': return time(mode, d);
      case 'measure': return measure(mode, d);
      case 'data': return data(mode, d);
      case 'fractions': return fractions(mode, d);
      case 'geometry': return geometry(mode, d);
      case 'puzzles': return puzzles(mode, d);
      default: return null;
    }
  },
};
