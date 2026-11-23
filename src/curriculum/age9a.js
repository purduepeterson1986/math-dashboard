/**
 * Age 9 generators, part A: whole numbers.
 * Multiplication, division, factors & multiples, patterns, adding, subtracting, place value.
 * Levels: easy = Warm-up (late 3rd / early 4th), standard = 4th grade, challenge = a measured 5th-grade reach.
 * Every typed answer is a whole number (the simple keypad); anything else is tap-to-choose.
 */
import { rand, pick, sample, shuffle, chance, by, nm, two, fmt, kp, st, choose, pickText, near, places, explainMul, distinctNumber, inWords } from './age9kit.js';
import { gcd, lcm } from '../lib/rng.js';

/* ============================== Multiplication ============================== */
const MUL_STORIES = [
  ['🍪', 'Bake Sale', (a, b) => `A bakery packs ${a} trays with ${b} cookies on each tray.`, 'cookies', (t) => `${t} cookies are eaten before the sale.`, 'How many cookies are left to sell?'],
  ['🚌', 'Field Trip', (a, b) => `${a} buses each carry ${b} students to a museum.`, 'students', (t) => `${t} more students arrive in vans.`, 'How many students are at the museum in all?'],
  ['📚', 'Library Shelves', (a, b) => `A library has ${a} shelves with ${b} books on each shelf.`, 'books', (t) => `${t} of the books are checked out.`, 'How many books are still on the shelves?'],
  ['🎟️', 'Ticket Booth', (a, b) => `A show sells ${a} boxes of tickets with ${b} tickets in each box.`, 'tickets', (t) => `${t} tickets go unsold.`, 'How many tickets are used?'],
  ['🌽', 'Corn Field', (a, b) => `A farmer plants ${a} rows of corn with ${b} plants in each row.`, 'plants', (t) => `Deer eat ${t} of the plants.`, 'How many plants are left?'],
  ['🧱', 'Brick Wall', (a, b) => `A wall has ${a} rows of bricks with ${b} bricks in each row.`, 'bricks', (t) => `${t} bricks are cracked and replaced with new ones from a pile.`, 'How many bricks does the wall have in all?'],
];
export function mul(mode, d) {
  const topic = 'mul';
  if (mode === 'flash') {
    const f = pick(by(d, ['fact', 'fact', 'tens'], ['two1', 'hund', 'tens2', 'fact2'], ['two1', 'x11', 'tens2', 'x25', 'hund']));
    if (f === 'fact') { const a = rand(6, 12); const b = rand(6, 12); return kp({ key: `mul:f:${a}:${b}`, topic, display: `${a} × ${b}`, answer: a * b, explanation: `${a} × ${b} = ${a * b}.` }); }
    if (f === 'fact2') { const a = rand(7, 12); const b = rand(7, 12); return kp({ key: `mul:f2:${a}:${b}`, topic, display: chance(0.5) ? `${a} × ${b}` : `${b} × ${a}`, answer: a * b, explanation: `${a} × ${b} = ${a * b}.` }); }
    if (f === 'tens') { const a = rand(2, 9); const t = rand(2, 9) * 10; return kp({ key: `mul:t:${a}:${t}`, topic, display: `${a} × ${t}`, answer: a * t, hints: [`${a} × ${t / 10} = ${a * t / 10}, then times 10.`], explanation: `${a} × ${t / 10} = ${a * t / 10}, so ${a} × ${t} = ${a * t}.` }); }
    if (f === 'hund') { const a = rand(2, 9); const t = rand(2, by(d, 5, 9, 9)) * 100; return kp({ key: `mul:h:${a}:${t}`, topic, display: chance(0.5) ? `${a} × ${fmt(t)}` : `${fmt(t)} × ${a}`, answer: a * t, hints: [`${a} × ${t / 100} = ${a * t / 100}, then add two zeros.`], explanation: `${a} × ${t / 100} = ${a * t / 100}, so ${a} × ${fmt(t)} = ${fmt(a * t)}.` }); }
    if (f === 'tens2') { const a = rand(2, 9) * 10; const b = rand(2, 9) * 10; return kp({ key: `mul:tt:${a}:${b}`, topic, display: `${a} × ${b}`, answer: a * b, hints: [`${a / 10} × ${b / 10} = ${a * b / 100}, then add two zeros.`], explanation: `${a / 10} × ${b / 10} = ${a * b / 100}. Two tens give two zeros: ${fmt(a * b)}.` }); }
    if (f === 'two1') { const a = rand(by(d, 12, 12, 25), by(d, 49, 49, 99)); const b = rand(2, 9); return kp({ key: `mul:21:${a}:${b}`, topic, display: `${a} × ${b}`, answer: a * b, hints: [`Split ${a} into ${a - (a % 10)} and ${a % 10}.`], explanation: explainMul(a, b) }); }
    if (f === 'x11') { const a = rand(12, 99); return kp({ key: `mul:11:${a}`, topic, display: `${a} × 11`, answer: a * 11, hints: [`${a} × 10 + ${a}`], explanation: `${a} × 10 = ${a * 10}, plus ${a} more = ${a * 11}.` }); }
    const b = pick([4, 8, 12, 16, 20]); return kp({ key: `mul:25:${b}`, topic, display: `25 × ${b}`, answer: 25 * b, hints: ['Four 25s make 100.'], explanation: `${b} ÷ 4 = ${b / 4} hundreds, so 25 × ${b} = ${25 * b}.` });
  }
  if (mode === 'story') {
    const [e, title, setup, unit, follow, question] = pick(MUL_STORIES);
    if (d === 'challenge' && chance(0.6)) {
      const a = rand(12, 48); const b = rand(12, 36); const take = rand(2, 9) * 10;
      const plus = title === 'Field Trip' || title === 'Brick Wall';
      const ans = plus && title === 'Field Trip' ? a * b + take : title === 'Brick Wall' ? a * b : a * b - take;
      const tail = title === 'Ticket Booth' ? 'How many tickets are sold?' : question;
      return kp({ key: `mul:s2:${title}:${a}:${b}:${take}`, topic, story: { emoji: e, title }, prompt: `${setup(a, b)} ${follow(take)} ${tail}`, answer: ans,
        hints: [`First find ${a} × ${b}.`, title === 'Field Trip' ? `Then add ${take}.` : title === 'Brick Wall' ? 'Replaced bricks do not change the total.' : `Then take away ${take}.`],
        explanation: `${a} × ${b} = ${a * b}.${title === 'Field Trip' ? ` ${a * b} + ${take} = ${ans}.` : title === 'Brick Wall' ? ' The replaced bricks do not change the total.' : ` ${a * b} − ${take} = ${ans}.`}` });
    }
    const A = by(d, rand(3, 9), rand(3, 9), rand(12, 48)); const B = by(d, rand(12, 49), rand(112, 799), rand(112, 499));
    return kp({ key: `mul:s:${title}:${A}:${B}`, topic, story: { emoji: e, title }, prompt: `${setup(A, fmt(B))} How many ${unit} in all?`, answer: A * B,
      hints: [`${A} groups of ${fmt(B)}.`, 'Break the big number into hundreds, tens and ones.'], explanation: explainMul(A, B) });
  }
  if (mode === 'stem') {
    const f = pick(by(d, ['model', 'miss', 'ten'], ['model', 'miss', 'ten', 'est', 'compare'], ['est', 'compare', 'digit', 'miss2', 'model2']));
    if (f === 'model') { const a = rand(2, 9); const t = rand(1, 9) * 10; const o = rand(2, 9);
      return kp({ key: `mul:m:${a}:${t + o}`, topic, prompt: `Area model: ${t + o} × ${a} = (${t} × ${a}) + (${o} × ${a}). What is ${t} × ${a}?`, answer: t * a, hints: [`${t / 10} × ${a} = ${t * a / 10}, then times 10.`], explanation: `${t} × ${a} = ${t * a}. The other part is ${o} × ${a} = ${o * a}. Total: ${(t + o) * a}.` }); }
    if (f === 'model2') { const h = rand(1, 5) * 100; const t = rand(1, 9) * 10; const o = rand(2, 9); const a = rand(3, 9);
      return kp({ key: `mul:m2:${h + t + o}:${a}`, topic, prompt: `Break ${h + t + o} × ${a} into parts: (${h} × ${a}) + (${t} × ${a}) + (${o} × ${a}). What is the total?`, answer: (h + t + o) * a, hints: [`${h} × ${a} = ${h * a}.`, `${t} × ${a} = ${t * a}.`, `${o} × ${a} = ${o * a}.`], explanation: `${h * a} + ${t * a} + ${o * a} = ${fmt((h + t + o) * a)}.` }); }
    if (f === 'miss') { const a = rand(by(d, 3, 6, 6), 9); const b = rand(by(d, 12, 12, 112), by(d, 39, 99, 299));
      return kp({ key: `mul:ms:${a}:${b}`, topic, prompt: 'What number is missing?', display: `${a} × ? = ${fmt(a * b)}`, answer: b, hints: [`Divide: ${fmt(a * b)} ÷ ${a}.`], explanation: `${fmt(a * b)} ÷ ${a} = ${b}, so ${a} × ${b} = ${fmt(a * b)}.` }); }
    if (f === 'miss2') { const a = rand(12, 29); const b = rand(12, 29);
      return kp({ key: `mul:ms2:${a}:${b}`, topic, prompt: 'What number is missing?', display: `${a} × ? = ${fmt(a * b)}`, answer: b, hints: ['Try dividing, or use estimation and check.'], explanation: `${fmt(a * b)} ÷ ${a} = ${b}.` }); }
    if (f === 'ten') { const a = rand(3, 9); const b = rand(2, 9) * 10; const m = by(d, 10, 10, 100);
      return kp({ key: `mul:p:${a}:${b}:${m}`, topic, prompt: `${a} × ${b} = ${a * b}. Use that fact to find the answer.`, display: `${a} × ${fmt(b * m)} = ?`, answer: a * b * m, hints: [`${fmt(b * m)} is ${m} times ${b}.`], explanation: `${fmt(b * m)} is ${m} times as much as ${b}, so the answer is ${m} times ${a * b}: ${fmt(a * b * m)}.` }); }
    if (f === 'digit') { const a = rand(2, 9); const n = rand(10, 99); const prod = n * a; const blank = rand(0, 1); const s = String(n); const shown = blank ? `${s[0]}?` : `?${s[1]}`; const miss = Number(blank ? s[1] : s[0]);
      return kp({ key: `mul:dg:${n}:${a}:${blank}`, topic, prompt: `${shown} × ${a} = ${prod}. What digit does the ? stand for?`, answer: miss, hints: [`Divide ${prod} by ${a}.`], explanation: `${prod} ÷ ${a} = ${n}, so the missing digit is ${miss}.` }); }
    if (f === 'est') { const a = rand(by(d, 21, 31, 32), 98); const b = rand(by(d, 21, 31, 22), 79); const e = Math.round(a / 10) * Math.round(b / 10) * 100;
      const right = fmt(e); const wrong = [e + 400, e - 300, e * 10, Math.round(e / 10), e + 1000].filter((x) => x > 0 && x !== e).map(fmt);
      return pickText({ key: `mul:est:${a}:${b}`, topic, prompt: `Which is the best estimate for ${a} × ${b}?`, hints: ['Round each number to the nearest ten, then multiply.'], explanation: `${a} ≈ ${Math.round(a / 10) * 10} and ${b} ≈ ${Math.round(b / 10) * 10}. ${Math.round(a / 10) * 10} × ${Math.round(b / 10) * 10} = ${right}.` }, right, wrong); }
    const a = rand(3, 9); const b = rand(by(d, 112, 112, 212), 499); const c = rand(3, 9); const e = rand(by(d, 112, 112, 212), 499);
    if (a * b === c * e) return mul(mode, d);
    const L = `${a} × ${fmt(b)}`; const R = `${c} × ${fmt(e)}`; const bigger = a * b > c * e ? L : R; const other = bigger === L ? R : L;
    return pickText({ key: `mul:cmp:${a}:${b}:${c}:${e}`, topic, prompt: 'Which product is GREATER?', hints: ['Work out each one, or estimate.'], explanation: `${L} = ${fmt(a * b)} and ${R} = ${fmt(c * e)}.` }, bigger, [other]);
  }
  // worksheet
  const f = pick(by(d, ['two1', 'two1', 'tens'], ['three1', 'three1', 'two2'], ['four1', 'two2big', 'three2', 'three2', 'three1big']));
  let a; let b;
  if (f === 'two1') { a = rand(12, 59); b = rand(2, 9); } else if (f === 'tens') { a = rand(2, 9) * 10 + rand(0, 9); b = rand(2, 9) * 10; }
  else if (f === 'three1') { a = rand(112, 799); b = rand(3, 9); } else if (f === 'two2') { a = rand(12, 35); b = rand(11, 25); }
  else if (f === 'four1') { a = rand(1112, 9999); b = rand(3, 9); } else if (f === 'two2big') { a = rand(23, 99); b = rand(23, 99); }
  else if (f === 'three2') { a = rand(101, 499); b = rand(12, 49); } else { a = rand(3000, 9999); b = rand(2, 9); }
  if (f === 'tens') return kp({ key: `mul:w:${f}:${a}:${b}`, topic, prompt: 'Multiply. Use the tens fact and add a zero.', display: `${a} × ${b}`, answer: a * b, hints: [`${a} × ${b / 10}, then times 10.`], explanation: explainMul(a, b) });
  const flip = chance(0.4);
  return kp({ key: `mul:w:${f}:${a}:${b}`, topic, prompt: pick(['Multiply.', 'Multiply. Break it apart or use the standard method.']), display: flip && a < 100 ? `${b} × ${fmt(a)}` : `${fmt(a)} × ${b}`, answer: a * b,
    hints: [b < 10 ? `Multiply each place value of ${fmt(a)} by ${b}.` : `Multiply by the ones, then by the tens, then add.`], explanation: explainMul(a, b) });
}

/* ================================ Division ================================ */
const DIV_STORIES = [
  ['🍕', 'Pizza Party', (n, k) => `${fmt(n)} slices of pizza are shared equally among ${k} tables.`, 'whole slices does each table get', 'slices are left over'],
  ['📦', 'Packing Boxes', (n, k) => `A factory packs ${fmt(n)} toys into boxes of ${k}.`, 'boxes are completely full', 'toys are left over'],
  ['🍎', 'Apple Baskets', (n, k) => `${nm()} puts ${fmt(n)} apples into baskets that each hold ${k}.`, 'baskets are completely full', 'apples are left over'],
  ['🚌', 'Buses', (n, k) => `${fmt(n)} students ride buses that each hold ${k}.`, 'buses are completely full', 'students are in the last, partly full bus'],
];
export function div(mode, d) {
  const topic = 'div';
  const hint = 'Divide, multiply back, subtract, bring down.';
  if (mode === 'flash') {
    const f = pick(by(d, ['fact', 'fact', 'hund'], ['two', 'hund', 'rem'], ['three', 'two', 'rem2']));
    if (f === 'fact') { const a = rand(3, 12); const q = rand(6, 12); return kp({ key: `div:f:${a}:${q}`, topic, display: `${fmt(a * q)} ÷ ${a}`, answer: q, hints: [`${a} × ? = ${a * q}`], explanation: `${a} × ${q} = ${a * q}, so ${a * q} ÷ ${a} = ${q}.` }); }
    if (f === 'hund') { const a = rand(2, 9); const q = rand(2, 9) * 10 ** by(d, 1, 1, 2); return kp({ key: `div:h:${a}:${q}`, topic, display: `${fmt(a * q)} ÷ ${a}`, answer: q, hints: [`${a * q / 10 ** by(d, 1, 1, 2)} ÷ ${a} = ${q / 10 ** by(d, 1, 1, 2)}, then add the zeros.`], explanation: `${fmt(a * q)} ÷ ${a} = ${fmt(q)}.` }); }
    if (f === 'two') { const a = rand(3, 9); const q = rand(11, 30); return kp({ key: `div:2:${a}:${q}`, topic, display: `${a * q} ÷ ${a}`, answer: q, hints: [`Split ${a * q} into easy parts.`], explanation: `${a} × ${q} = ${a * q}, so ${a * q} ÷ ${a} = ${q}.` }); }
    if (f === 'rem') { const a = rand(3, 9); const q = rand(4, 12); const r = rand(1, a - 1); return kp({ key: `div:r:${a}:${q}:${r}`, topic, prompt: `What is the remainder?`, display: `${a * q + r} ÷ ${a}`, answer: r, hints: [`${a} × ${q} = ${a * q}.`], explanation: `${a} × ${q} = ${a * q}, and ${a * q + r} − ${a * q} = ${r} left over.` }); }
    if (f === 'rem2') { const a = rand(6, 9); const q = rand(12, 40); const r = rand(1, a - 1); return kp({ key: `div:r2:${a}:${q}:${r}`, topic, prompt: `What is the remainder?`, display: `${fmt(a * q + r)} ÷ ${a}`, answer: r, hints: [`${a} × ${q} = ${a * q}.`], explanation: `${a} × ${q} = ${a * q}, and ${fmt(a * q + r)} − ${a * q} = ${r}.` }); }
    const a = rand(3, 9); const q = rand(1, 4) * 100 + rand(1, 9) * 10; return kp({ key: `div:3:${a}:${q}`, topic, display: `${fmt(a * q)} ÷ ${a}`, answer: q, hints: [`Split ${fmt(a * q)} into ${fmt(a * Math.floor(q / 100) * 100)} and ${fmt(a * (q % 100))}.`], explanation: `${fmt(a * Math.floor(q / 100) * 100)} ÷ ${a} = ${Math.floor(q / 100) * 100} and ${fmt(a * (q % 100))} ÷ ${a} = ${q % 100}. Together: ${q}.` });
  }
  if (mode === 'story') {
    const [e, title, setup, qa, qb] = pick(DIV_STORIES);
    const k = by(d, rand(3, 9), rand(3, 9), rand(6, 9)); const q = by(d, rand(11, 30), rand(102, 299), rand(1002, 1499)); const r = rand(1, k - 1);
    if (d === 'easy' || chance(0.35)) { const n = k * q; return kp({ key: `div:s:ex:${title}:${n}:${k}`, topic, story: { emoji: e, title }, prompt: `${setup(n, k)} How many ${qa}?`, answer: q, hints: [`${fmt(n)} ÷ ${k}`], explanation: `${fmt(n)} ÷ ${k} = ${fmt(q)}.` }); }
    const n = k * q + r; const askRem = chance(0.5);
    return kp({ key: `div:s:${askRem ? 'r' : 'q'}:${title}:${n}:${k}`, topic, story: { emoji: e, title }, prompt: `${setup(n, k)} How many ${askRem ? qb : qa}?`, answer: askRem ? r : q,
      hints: [hint], explanation: `${fmt(n)} ÷ ${k} = ${fmt(q)} with ${r} left over. (${k} × ${fmt(q)} = ${fmt(k * q)}, and ${fmt(n)} − ${fmt(k * q)} = ${r}.)` });
  }
  if (mode === 'stem') {
    const f = pick(by(d, ['fam', 'half', 'fam'], ['fam', 'check', 'dividend', 'interp'], ['dividend', 'interp', 'est', 'check2', 'twoStep']));
    if (f === 'fam') { const a = rand(3, 9); const q = rand(12, 49); return kp({ key: `div:fam:${a}:${q}`, topic, prompt: 'Use the fact family.', display: `${a} × ${q} = ${a * q}, so ${a * q} ÷ ${a} = ?`, answer: q, explanation: `Multiplying and dividing are opposites: ${a * q} ÷ ${a} = ${q}.` }); }
    if (f === 'half') { const q = rand(12, 49); const n = q * 2; return kp({ key: `div:half:${n}`, topic, prompt: `Half of ${n} is how many?`, display: `${n} ÷ 2`, answer: q, explanation: `${n} ÷ 2 = ${q}.` }); }
    if (f === 'check') { const k = rand(3, 9); const q = rand(by(d, 12, 102, 102), by(d, 40, 400, 400)); const r = rand(1, k - 1);
      return kp({ key: `div:chk:${k}:${q}:${r}`, topic, prompt: 'Fill in the missing number.', display: `${k} × ${q} + ${r} = ?`, answer: k * q + r, hints: [`Multiply first: ${k} × ${q}.`, `Then add ${r}.`], explanation: `${k} × ${q} = ${k * q}. ${k * q} + ${r} = ${k * q + r}. So ${k * q + r} ÷ ${k} is ${q} R ${r}.` }); }
    if (f === 'check2') { const k = rand(11, 19); const q = rand(21, 60); const r = rand(1, k - 1);
      return kp({ key: `div:chk2:${k}:${q}:${r}`, topic, prompt: `${fmt(k * q + r)} ÷ ${k} = ${q} R ${r}. What number goes in the box?`, display: `${k} × ☐ + ${r} = ${fmt(k * q + r)}`, answer: q, hints: [`${fmt(k * q + r)} − ${r} = ${fmt(k * q)}.`], explanation: `${fmt(k * q)} ÷ ${k} = ${q}.` }); }
    if (f === 'dividend') { const k = rand(3, 9); const q = rand(by(d, 12, 102, 202), by(d, 40, 480, 899));
      return kp({ key: `div:dv:${k}:${q}`, topic, prompt: 'What number is missing?', display: `? ÷ ${k} = ${fmt(q)}`, answer: k * q, hints: [`Multiply to undo the division: ${k} × ${fmt(q)}.`], explanation: `${k} × ${fmt(q)} = ${fmt(k * q)}.` }); }
    if (f === 'est') { const k = rand(5, 9); const q = rand(40, 90); const n = k * q + rand(1, k - 1);
      const near10 = Math.round(n / 10) * 10; const nice = k * Math.round(n / k / 10) * 10; return kp({ key: `div:est:${n}:${k}`, topic, prompt: `To estimate ${fmt(n)} ÷ ${k}, use a friendly number close to ${fmt(n)} that ${k} divides evenly: ${fmt(nice)}. What is ${fmt(nice)} ÷ ${k}?`, answer: nice / k, hints: [`${nice / 10} ÷ ${k} = ${nice / 10 / k}, then times 10.`], explanation: `${fmt(nice)} ÷ ${k} = ${nice / k}, so ${fmt(n)} ÷ ${k} is about ${nice / k}.` }); }
    if (f === 'twoStep') { const a = rand(3, 9); const q = rand(41, 99); const extra = rand(2, 9) * 10; const n = a * q; const [x] = two();
      return kp({ key: `div:two:${a}:${q}:${extra}`, topic, prompt: `${fmt(n)} stickers are shared equally among ${a} friends. ${x} then gives each friend ${extra} more stickers. How many stickers does each friend have now?`, answer: q + extra, hints: [`First divide: ${fmt(n)} ÷ ${a}.`, `Then add ${extra}.`], explanation: `${fmt(n)} ÷ ${a} = ${q}. ${q} + ${extra} = ${q + extra}.` }); }
    // interpret the remainder
    const k = rand(by(d, 4, 6, 12), by(d, 8, 9, 40)); const q = rand(by(d, 3, 5, 6), by(d, 9, 12, 14)); const r = rand(1, k - 1); const n = k * q + r;
    const t = pick([['buses', 'passengers', 'bus'], ['vans', 'people', 'van'], ['boats', 'campers', 'boat']]);
    return kp({ key: `div:int:${n}:${k}:${t[0]}`, topic, prompt: `${fmt(n)} ${t[1]} need rides. Each ${t[2]} holds ${k}. How many ${t[0]} are needed so everyone gets a seat?`, answer: q + 1,
      hints: [`${fmt(n)} ÷ ${k} = ${q} R ${r}.`, 'The leftovers still need a ride.'], explanation: `${fmt(n)} ÷ ${k} = ${q} R ${r}. The ${r} left over need one more ${t[2]}, so ${q + 1} ${t[0]}.` });
  }
  // worksheet
  const f = pick(by(d, ['x2', 'x2', 'quo', 'rem'], ['x3', 'quo3', 'rem3', 'x3'], ['x4', 'rem4', 'big2', 'x4', 'rem2d']));
  const k1 = rand(3, 9);
  if (f === 'x2') { const q = rand(12, 49); return kp({ key: `div:w:x2:${k1}:${q}`, topic, prompt: 'Divide.', display: `${k1 * q} ÷ ${k1}`, answer: q, hints: [hint], explanation: `${k1} × ${q} = ${k1 * q}, so ${k1 * q} ÷ ${k1} = ${q}.` }); }
  if (f === 'quo' || f === 'rem') { const q = rand(10, 40); const r = rand(1, k1 - 1); return kp({ key: `div:w:${f}:${k1}:${q}:${r}`, topic, prompt: f === 'quo' ? `Divide. How many whole groups of ${k1} fit?` : 'Divide. What is the remainder?', display: `${k1 * q + r} ÷ ${k1}`, answer: f === 'quo' ? q : r, hints: [hint], explanation: `${k1} × ${q} = ${k1 * q}; ${k1 * q + r} − ${k1 * q} = ${r}. So ${k1 * q + r} ÷ ${k1} = ${q} R ${r}.` }); }
  if (f === 'x3') { const q = rand(102, 399); return kp({ key: `div:w:x3:${k1}:${q}`, topic, prompt: 'Divide.', display: `${fmt(k1 * q)} ÷ ${k1}`, answer: q, hints: [hint], explanation: `${k1} × ${q} = ${fmt(k1 * q)}, so ${fmt(k1 * q)} ÷ ${k1} = ${q}.` }); }
  if (f === 'quo3' || f === 'rem3') { const q = rand(102, 299); const r = rand(1, k1 - 1); return kp({ key: `div:w:${f}:${k1}:${q}:${r}`, topic, prompt: f === 'quo3' ? `Divide. How many whole groups of ${k1} fit?` : 'Divide. What is the remainder?', display: `${fmt(k1 * q + r)} ÷ ${k1}`, answer: f === 'quo3' ? q : r, hints: [hint], explanation: `${k1} × ${q} = ${fmt(k1 * q)}; ${fmt(k1 * q + r)} − ${fmt(k1 * q)} = ${r}. So the answer is ${q} R ${r}.` }); }
  if (f === 'x4') { let q; do { q = rand(1002, 1999); } while ([...String(q)].slice(1).some((c) => Number(c) < 3)); const k = rand(6, 9); return kp({ key: `div:w:x4:${k}:${q}`, topic, prompt: 'Divide.', display: `${fmt(k * q)} ÷ ${k}`, answer: q, hints: [hint], explanation: `${k} × ${fmt(q)} = ${fmt(k * q)}, so ${fmt(k * q)} ÷ ${k} = ${fmt(q)}.` }); }
  if (f === 'rem4') { const k = rand(4, 9); const q = rand(1002, 1899); const r = rand(1, k - 1); const askQ = chance(0.5); return kp({ key: `div:w:rem4:${k}:${q}:${r}:${askQ}`, topic, prompt: askQ ? `Divide. How many whole groups of ${k} fit?` : 'Divide. What is the remainder?', display: `${fmt(k * q + r)} ÷ ${k}`, answer: askQ ? q : r, hints: [hint], explanation: `${k} × ${fmt(q)} = ${fmt(k * q)}; ${fmt(k * q + r)} − ${fmt(k * q)} = ${r}. So ${fmt(k * q + r)} ÷ ${k} = ${fmt(q)} R ${r}.` }); }
  if (f === 'big2') { const k = rand(11, 25); const q = rand(12, 40); return kp({ key: `div:w:b2:${k}:${q}`, topic, prompt: 'Divide.', display: `${fmt(k * q)} ÷ ${k}`, answer: q, hints: [`Guess a quotient and multiply it by ${k} to check.`], explanation: `${k} × ${q} = ${fmt(k * q)}, so ${fmt(k * q)} ÷ ${k} = ${q}.` }); }
  const k = rand(12, 29); const q = rand(12, 40); const r = rand(1, k - 1);
  return kp({ key: `div:w:r2d:${k}:${q}:${r}`, topic, prompt: 'Divide. What is the remainder?', display: `${fmt(k * q + r)} ÷ ${k}`, answer: r, hints: [`${k} × ${q} = ${fmt(k * q)}.`], explanation: `${k} × ${q} = ${fmt(k * q)}; ${fmt(k * q + r)} − ${fmt(k * q)} = ${r}.` });
}

/* ============================ Factors & multiples ============================ */
const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const factorsOf = (n) => { const f = []; for (let i = 1; i <= n; i++) if (n % i === 0) f.push(i); return f; };
const ord = (n) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10 > 3 ? 0 : n % 10]}`;
export function factors(mode, d) {
  const topic = 'factors';
  if (mode === 'story') {
    const f = pick(by(d, ['rows', 'groups'], ['rows', 'lcm', 'groups'], ['lcm', 'gcf', 'rows2']));
    if (f === 'rows') { const n = pick([12, 16, 18, 20, 24, 30, 36].filter((x) => d !== 'easy' || x <= 24));
      return kp({ key: `fac:s:rows:${n}`, topic, story: { emoji: '🪑', title: 'Chair Rows' }, prompt: `${nm()} arranges ${n} chairs in equal rows. Every row has the same number of chairs, with at least 2 chairs in a row and at least 2 rows. How many different row lengths are possible?`, answer: factorsOf(n).length - 2,
        hints: [`List the factors of ${n}.`], explanation: `The factors of ${n} are ${factorsOf(n).join(', ')}. Leave out 1 and ${n}: ${factorsOf(n).length - 2} row lengths.` }); }
    if (f === 'groups') { const n = pick([18, 24, 30, 36, 48]); const k = pick(factorsOf(n).filter((x) => x >= 3 && x <= n / 2));
      return kp({ key: `fac:s:g:${n}:${k}`, topic, story: { emoji: '🧑‍🤝‍🧑', title: 'Teams' }, prompt: `${n} students split into teams of ${k}. How many teams?`, answer: n / k, hints: [`${k} × ? = ${n}`], explanation: `${k} × ${n / k} = ${n}.` }); }
    if (f === 'lcm') { const [a, b] = pick(by(d, [[2, 3], [3, 4]], [[3, 4], [4, 6], [5, 6], [2, 5], [6, 8], [4, 10]], [[8, 12], [9, 12], [10, 15], [12, 15], [12, 18], [8, 14]]));
      return kp({ key: `fac:s:lcm:${a}:${b}`, topic, story: { emoji: '✏️', title: 'Party Packs' }, prompt: `Pencils come in packs of ${a}. Erasers come in packs of ${b}. What is the smallest number of pencils you can buy to have exactly as many pencils as erasers (buying whole packs)?`, answer: lcm(a, b),
        hints: [`List multiples of ${a} and of ${b}.`], explanation: `The smallest number that is a multiple of both ${a} and ${b} is ${lcm(a, b)}.` }); }
    if (f === 'gcf') { const [a, b] = pick([[12, 18], [24, 36], [16, 24], [30, 45], [20, 30], [28, 42], [36, 48]]);
      return kp({ key: `fac:s:gcf:${a}:${b}`, topic, story: { emoji: '🎒', title: 'Treat Bags' }, prompt: `${nm()} has ${a} stickers and ${b} marbles. They make identical treat bags with nothing left over. What is the greatest number of bags they can make?`, answer: gcd(a, b),
        hints: [`Find the factors of ${a} and ${b}.`], explanation: `The greatest factor of both ${a} and ${b} is ${gcd(a, b)}.` }); }
    const n = pick([48, 60, 72]); return kp({ key: `fac:s:r2:${n}`, topic, story: { emoji: '🪑', title: 'Seating' }, prompt: `${n} seats are set in equal rows. How many different ways can the rows be arranged if each row has at least 2 seats and there are at least 2 rows?`, answer: factorsOf(n).length - 2,
      hints: [`List all the factors of ${n}.`, 'Leave out 1 and the number itself.'], explanation: `${n} has ${factorsOf(n).length} factors: ${factorsOf(n).join(', ')}. Without 1 and ${n}: ${factorsOf(n).length - 2}.` });
  }
  const f = pick(mode === 'flash'
    ? by(d, ['multN', 'factorOf', 'multOf', 'next'], ['factorOf', 'multOf', 'next', 'primeComp', 'div'], ['primeComp', 'howMany', 'div', 'gcf', 'lcm', 'next'])
    : by(d, ['pairs', 'multN', 'factorOf', 'multOf', 'next'], ['howMany', 'primeComp', 'div', 'lcm', 'gcf', 'pairs', 'missing'], ['primeFact', 'lcm', 'gcf', 'howMany', 'div', 'primeComp', 'sumpair']));
  if (f === 'multN') { const a = rand(3, 12); const n = rand(4, 12); return kp({ key: `fac:mn:${a}:${n}`, topic, prompt: `What is the ${ord(n)} multiple of ${a}?`, answer: a * n, hints: [`Count by ${a}s, ${n} times.`], explanation: `${a} × ${n} = ${a * n}.` }); }
  if (f === 'next') { const a = rand(by(d, 3, 6, 12), by(d, 9, 12, 25)); const n = rand(by(d, 20, 40, 100), by(d, 60, 120, 400)); const nx = Math.ceil((n + 1) / a) * a;
    return kp({ key: `fac:nx:${a}:${n}`, topic, prompt: `What is the next multiple of ${a} after ${n}?`, answer: nx, hints: [`${a} × ${Math.floor(n / a)} = ${a * Math.floor(n / a)}.`], explanation: `${a} × ${nx / a} = ${nx}, and it is the first multiple of ${a} larger than ${n}.` }); }
  if (f === 'factorOf') { const n = pick(by(d, [12, 18, 20, 24, 28, 30], [36, 40, 42, 48, 54, 56], [60, 72, 84, 90])); const fs = factorsOf(n).filter((x) => x > 1 && x < n);
    const right = pick(fs); const non = []; for (let x = 2; x < n / 2 + 4; x++) if (n % x) non.push(x);
    return pickText({ key: `fac:fo:${n}:${right}`, topic, prompt: `Which number is a factor of ${n}?`, hints: [`A factor divides ${n} with nothing left over.`], explanation: `${n} ÷ ${right} = ${n / right}, so ${right} is a factor of ${n}.` }, String(right), sample(non, 3).map(String)); }
  if (f === 'multOf') { const a = rand(by(d, 3, 6, 6), by(d, 9, 12, 12)); const right = a * rand(5, 12); const wrong = near(right, [-2, -1, 1, 2, 3, -3, a - 1, -(a - 1), a + 1], 1).filter((x) => x % a !== 0);
    return pickText({ key: `fac:mo:${a}:${right}`, topic, prompt: `Which number is a multiple of ${a}?`, hints: [`Count by ${a}s.`], explanation: `${a} × ${right / a} = ${right}.` }, String(right), sample(wrong, 3).map(String)); }
  if (f === 'pairs') { const n = pick(by(d, [12, 16, 18, 20, 24, 30], [36, 40, 42, 48], [60, 72, 90])); const a = pick(factorsOf(n).filter((x) => x > 1 && x * x <= n && x < n));
    return kp({ key: `fac:pr:${n}:${a}`, topic, prompt: 'Fill in the missing factor.', display: `${a} × ? = ${n}`, answer: n / a, hints: [`${n} ÷ ${a}`], explanation: `${a} × ${n / a} = ${n}, so ${a} and ${n / a} are a factor pair of ${n}.` }); }
  if (f === 'howMany') { const n = pick(by(d, [12, 18, 20], [24, 30, 36, 40, 42, 48], [60, 72, 84, 90, 96, 100, 120])); return kp({ key: `fac:hm:${n}`, topic, prompt: `How many factors does ${n} have?`, answer: factorsOf(n).length, hints: ['Find the factor pairs, then count every factor.'], explanation: `The factors of ${n} are ${factorsOf(n).join(', ')}: that's ${factorsOf(n).length}.` }); }
  if (f === 'primeComp') { const n = pick(d === 'standard' ? sample(Array.from({ length: 49 }, (_, i) => i + 2), 1) : sample(Array.from({ length: 98 }, (_, i) => i + 3), 1)); const p = isPrime(n);
    return pickText({ key: `fac:pc:${n}`, topic, prompt: `Is ${n} prime or composite?`, hints: ['A prime number has exactly two factors: 1 and itself.'], explanation: p ? `${n} has only two factors, 1 and ${n}, so it is prime.` : `${n} = ${factorsOf(n)[1]} × ${n / factorsOf(n)[1]}, so it has more than two factors: it is composite.` }, p ? 'Prime' : 'Composite', [p ? 'Composite' : 'Prime']); }
  if (f === 'div') {
    const rule = pick(by(d, [2, 5, 10], [3, 4, 5, 9, 10], [3, 4, 6, 8, 9, 12])); const mk = () => rand(100, 999);
    const good = []; const bad = []; for (let i = 0; i < 800 && (good.length < 1 || bad.length < 3); i++) { const x = mk(); if (x % rule === 0) good.push(x); else if (rule % 2 === 1 || x % 2 === 0) bad.push(x); } // even rules: even distractors, so the last digit alone gives nothing away
    const right = good[0]; const why = { 2: 'it ends in an even digit', 3: 'its digits add to a multiple of 3', 4: 'its last two digits make a multiple of 4', 5: 'it ends in 0 or 5', 6: 'it is even and its digits add to a multiple of 3', 8: 'dividing by 8 leaves no remainder', 9: 'its digits add to a multiple of 9', 10: 'it ends in 0', 12: 'it is divisible by both 3 and 4' }[rule];
    return pickText({ key: `fac:dv:${rule}:${right}`, topic, prompt: `Which number is divisible by ${rule}?`, hints: ['Use a divisibility rule, or divide to check.'], explanation: `${right} ÷ ${rule} = ${right / rule}, because ${why}.` }, String(right), bad.slice(0, 3).map(String)); }
  if (f === 'missing') { const a = rand(6, 12); const n = a * rand(6, 12); return kp({ key: `fac:mi:${a}:${n}`, topic, prompt: `${a} is a factor of ${n}. What is the other factor in the pair?`, answer: n / a, hints: [`${n} ÷ ${a}`], explanation: `${a} × ${n / a} = ${n}.` }); }
  if (f === 'lcm') { const [a, b] = pick(by(d, [[2, 3], [2, 4], [3, 5]], [[3, 4], [4, 6], [2, 5], [3, 6], [4, 10], [5, 6], [6, 8]], [[6, 9], [8, 12], [9, 12], [10, 15], [12, 15], [8, 10], [6, 14], [12, 18], [14, 21], [15, 20]]));
    return kp({ key: `fac:lcm:${a}:${b}`, topic, prompt: `What is the smallest number that is a multiple of both ${a} and ${b}?`, answer: lcm(a, b), hints: [`List multiples of ${b} until one is also a multiple of ${a}.`], explanation: `${lcm(a, b)} is the smallest multiple of both ${a} and ${b}.` }); }
  if (f === 'gcf') { const [a, b] = pick(by(d, [[6, 9]], [[12, 18], [16, 24], [18, 27], [20, 30]], [[24, 36], [30, 45], [28, 42], [36, 48], [45, 60], [42, 56]])); return kp({ key: `fac:gcf:${a}:${b}`, topic, prompt: `What is the greatest factor of both ${a} and ${b}?`, answer: gcd(a, b), hints: [`List the factors of ${a} and of ${b}.`], explanation: `The greatest factor that goes into both ${a} and ${b} is ${gcd(a, b)}.` }); }
  if (f === 'sumpair') { const [a, b] = pick([[3, 8], [4, 9], [5, 7], [6, 8], [4, 15], [6, 10]]); const n = a * b; return kp({ key: `fac:sp:${a}:${b}`, topic, prompt: `${n} = ${a} × ?. What is the missing factor?`, answer: b, hints: [`${n} ÷ ${a}`], explanation: `${a} × ${b} = ${n}.` }); }
  // primeFact: missing prime in a factor string
  const n = pick([12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 50, 60]); const pf = []; let m = n; for (let p = 2; m > 1; p++) while (m % p === 0) { pf.push(p); m /= p; }
  const hide = rand(0, pf.length - 1); const missing = pf[hide];
  return kp({ key: `fac:pf:${n}:${hide}`, topic, prompt: `Write ${n} as a product of prime numbers. What prime goes in the box?`, display: pf.map((p, i) => (i === hide ? '☐' : p)).join(' × '), answer: missing, hints: ['Split the number into factors until every factor is prime.'], explanation: `${n} = ${pf.join(' × ')}.` });
}

/* ============================ Patterns & rules ============================ */
export function patterns(mode, d) {
  const topic = 'patterns';
  if (mode === 'story') {
    const [x] = two(); const start = rand(by(d, 5, 20, 40), by(d, 20, 80, 150)); const step = rand(by(d, 3, 4, 6), by(d, 9, 15, 25)); const n = rand(by(d, 4, 6, 10), by(d, 8, 12, 30));
    const T = pick([['🐕', 'Dog Walks', `${x} walks the dog and counts steps. At minute 1 the count is ${start}, and every minute after that adds ${step} steps. How many steps at minute ${n}?`],
      ['💰', 'Saving Up', `${x} has $${start} and saves $${step} more every week. How much money after ${n} weeks of saving?`],
      ['🌱', 'Growing Plant', `A plant is ${start} mm tall today. It grows ${step} mm every day. How tall is it after ${n} days?`]]);
    return kp({ key: `pat:s:${T[1]}:${start}:${step}:${n}`, topic, story: { emoji: T[0], title: T[1] }, prompt: T[2], answer: start + step * n, hints: [`Multiply ${step} × ${n}, then add ${start}.`], explanation: `${step} × ${n} = ${step * n}, and ${start} + ${step * n} = ${start + step * n}.` });
  }
  const f = pick(by(d, ['next', 'nextdown', 'rule', 'table'], ['next', 'nth', 'table2', 'rule2', 'cycle', 'mid'], ['grow', 'double', 'nth2', 'table3', 'cycle2', 'mid2']));
  if (f === 'next' || f === 'nextdown') { const down = f === 'nextdown'; const step = rand(by(d, 3, 6, 6), 9); const a0 = down ? rand(60, 99) : rand(5, 40); const t = Array.from({ length: 4 }, (_, i) => a0 + (down ? -1 : 1) * step * i);
    return kp({ key: `pat:n:${down}:${a0}:${step}`, topic, prompt: `What number comes next?`, visual: { type: 'sequence', terms: t.map(String), blank: true }, answer: t[3] + (down ? -step : step), hints: [`Find how much it changes each time: ${t[1]} → ${t[2]}.`], explanation: `It ${down ? 'goes down' : 'goes up'} by ${step} each time, so the next number is ${t[3] + (down ? -step : step)}.` }); }
  if (f === 'rule') { const step = rand(2, 9) * (chance(0.5) ? 1 : 1); const a0 = rand(2, 20); const t = [0, 1, 2, 3].map((i) => a0 + step * i);
    return pickText({ key: `pat:r:${a0}:${step}`, topic, prompt: `${t.join(', ')}, … What is the rule?`, visual: { type: 'sequence', terms: t.map(String), more: true }, hints: ['Subtract neighbors to see how much it grows.'], explanation: `${t[1]} − ${t[0]} = ${step}, so the rule is "add ${step}".` }, `Add ${step}`, [`Add ${step + 1}`, `Add ${step + 2}`, `Multiply by ${step}`].filter((x) => x !== `Add ${step}`)); }
  if (f === 'rule2') { const step = rand(11, 99); const a0 = rand(100, 600); const t = [0, 1, 2, 3].map((i) => a0 + step * i); const wrong = [`Add ${step + 10}`, `Add ${step - 1}`, `Subtract ${step}`];
    return pickText({ key: `pat:r2:${a0}:${step}`, topic, prompt: 'What is the rule?', visual: { type: 'sequence', terms: t.map(fmt), more: true }, hints: ['Subtract neighbors.'], explanation: `${fmt(t[1])} − ${fmt(t[0])} = ${step}, so the rule is "add ${step}".` }, `Add ${step}`, wrong); }
  if (f === 'table' || f === 'table2' || f === 'table3') {
    const k = rand(by(d, 3, 4, 3), 9); const c = f === 'table' ? 0 : rand(1, 9); const sub = f === 'table2' && chance(0.5); const ins = sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4).sort((a, b) => a - b);
    const out = (x) => (f === 'table3' ? x * k + c : sub ? x * k + c * 0 + (x * k > c ? 0 : 0) + 0 : x * k + c);
    const ruleText = f === 'table' ? `× ${k}` : `× ${k}, then + ${c}`; const fn = (x) => (f === 'table' ? x * k : x * k + c);
    return kp({ key: `pat:tb:${f}:${k}:${c}:${ins.join('')}`, topic, prompt: `The rule is "${ruleText.replace('×', 'multiply by').replace(', then +', ', then add')}". What comes out when ${ins[3]} goes in?`, visual: { type: 'sequence', terms: ins.slice(0, 3).map((x) => `${x}→${fn(x)}`), blank: true }, answer: fn(ins[3]),
      hints: [`Do ${ins[3]} × ${k}${f === 'table' ? '' : `, then add ${c}`}.`], explanation: `${ins[3]} × ${k} = ${ins[3] * k}${f === 'table' ? '' : `, and ${ins[3] * k} + ${c} = ${fn(ins[3])}`}.` }); }
  if (f === 'nth' || f === 'nth2') { const step = rand(by(d, 3, 4, 6), by(d, 9, 9, 19)); const a0 = rand(2, 30); const n = f === 'nth' ? rand(8, 12) : rand(15, 40);
    return kp({ key: `pat:nth:${f}:${a0}:${step}:${n}`, topic, prompt: `A pattern starts at ${a0} and adds ${step} each time. What is the ${ord(n)} number in the pattern?`, answer: a0 + step * (n - 1), hints: [`The ${n}th number has ${n - 1} jumps of ${step} after the start.`], explanation: `${n - 1} jumps: ${n - 1} × ${step} = ${step * (n - 1)}. ${a0} + ${step * (n - 1)} = ${a0 + step * (n - 1)}.` }); }
  if (f === 'cycle' || f === 'cycle2') { const sets = [['🔴', '🔵', '🟢'], ['⭐', '🌙', '☀️', '☁️'], ['🍎', '🍌', '🍇'], ['🔺', '🟦', '⭕', '⬜']]; const set = pick(sets.filter((s) => (f === 'cycle' ? s.length === 3 : s.length >= 3))); const n = f === 'cycle' ? rand(10, 30) : rand(31, 99);
    const right = set[(n - 1) % set.length];
    return pickText({ key: `pat:cy:${set.join('')}:${n}`, topic, prompt: `The pattern repeats forever: ${set.join(' ')} ${set.join(' ')} … Which shape is number ${n} in the pattern?`, hints: [`The pattern has ${set.length} items. Divide ${n} by ${set.length} and look at the remainder.`], explanation: `${n} ÷ ${set.length} leaves ${n % set.length}. ${n % set.length === 0 ? `That means it is the last item, ${right}.` : `The ${n % set.length}${['st', 'nd', 'rd', 'th'][Math.min(3, (n % set.length) - 1)]} item is ${right}.`}` }, right, set.filter((x) => x !== right)); }
  if (f === 'mid' || f === 'mid2') { const step = f === 'mid' ? rand(4, 9) : rand(12, 48); const a0 = rand(2, 50); const t = [0, 1, 2, 3, 4].map((i) => a0 + step * i); const hole = rand(1, 3);
    return kp({ key: `pat:mid:${f}:${a0}:${step}:${hole}`, topic, prompt: 'What number is missing?', visual: { type: 'sequence', terms: t.map((x, i) => (i === hole ? '☐' : String(x))) }, answer: t[hole], hints: [`Find the step between the numbers you can see.`], explanation: `The numbers go up by ${step}, so the missing number is ${t[hole]}.` }); }
  if (f === 'double') { const a0 = rand(2, 9); const mult = pick([2, 3]); const t = [a0, a0 * mult, a0 * mult * mult, a0 * mult ** 3]; const next = a0 * mult ** 4;
    return kp({ key: `pat:db:${a0}:${mult}`, topic, prompt: 'What number comes next?', visual: { type: 'sequence', terms: t.map(String), blank: true }, answer: next, hints: [`Divide: ${t[1]} ÷ ${t[0]}.`], explanation: `Each number is ${mult} times the one before, so ${t[3]} × ${mult} = ${next}.` }); }
  // grow: number of squares in a growing figure
  const per = rand(2, 6); const base = rand(1, 5); const figs = [1, 2, 3].map((n) => per * n + base); const n = rand(8, 20);
  return kp({ key: `pat:gr:${per}:${base}:${n}`, topic, prompt: `A pattern of tiles grows. Figure 1 has ${figs[0]} tiles, Figure 2 has ${figs[1]}, and Figure 3 has ${figs[2]}. How many tiles are in Figure ${n}?`, answer: per * n + base, hints: [`Each figure adds ${per} tiles.`, `Figure ${n} = ${n} × ${per} + ${base}.`], explanation: `The tiles go up by ${per} each time. Figure ${n}: ${n} × ${per} + ${base} = ${per * n + base}.` });
}

/* ============================ Adding & subtracting ============================ */
const BIG_STORIES_ADD = [
  ['♻️', 'Can Drive', (x, y) => `A school collects ${fmt(x)} cans in the fall and ${fmt(y)} cans in the spring.`, (z) => `In the winter it collects ${fmt(z)} more.`, 'cans'],
  ['🚆', 'Train Miles', (x, y) => `A train travels ${fmt(x)} miles in March and ${fmt(y)} miles in April.`, (z) => `In May it travels ${fmt(z)} more miles.`, 'miles'],
  ['🏟️', 'Stadium Crowds', (x, y) => `${fmt(x)} fans come on Friday and ${fmt(y)} fans come on Saturday.`, (z) => `On Sunday ${fmt(z)} more fans come.`, 'fans'],
  ['📖', 'Words Read', (x, y) => `${nm()} reads ${fmt(x)} words in one book and ${fmt(y)} words in another.`, (z) => `A third book has ${fmt(z)} words.`, 'words'],
];
const BIG_STORIES_SUB = [
  ['🎟️', 'Tickets', (x, y) => `A stadium has ${fmt(x)} seats. ${fmt(y)} seats are sold.`, 'How many seats are still open?', (z) => `Then ${fmt(z)} more seats are sold.`],
  ['🛣️', 'Road Trip', (x, y) => `A road trip is ${fmt(x)} miles long. The family drives ${fmt(y)} miles on Monday.`, 'How many miles are left?', (z) => `They drive ${fmt(z)} more miles on Tuesday.`],
  ['📦', 'Warehouse', (x, y) => `A warehouse has ${fmt(x)} boxes. It ships ${fmt(y)} of them.`, 'How many boxes are left?', (z) => `Then it ships ${fmt(z)} more.`],
  ['📚', 'Library', (x, y) => `A library has ${fmt(x)} books. It lends out ${fmt(y)} of them.`, 'How many books are left?', (z) => `Then it lends out ${fmt(z)} more.`],
];
const sz = (d, mode, easyR, stdR, chalR) => { const [lo, hi] = by(d, easyR, stdR, chalR); return rand(lo, hi); };
export function add(mode, d) {
  const topic = 'add';
  if (mode === 'flash') {
    const f = pick(by(d, ['hund', 'round'], ['comp', 'thou', 'hund'], ['k5', 'k5b', 'comp5']));
    if (f === 'hund') { const a = rand(12, 98) * 100; const b = rand(11, 99) * 100; return kp({ key: `add:fh:${a}:${b}`, topic, display: `${fmt(a)} + ${fmt(b)}`, answer: a + b, hints: [`${a / 100} + ${b / 100} = ${(a + b) / 100}, then add the two zeros.`], explanation: `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.` }); }
    if (f === 'round') { const a = rand(1100, 5900); const b = rand(1, 9) * 1000; return kp({ key: `add:fr:${a}:${b}`, topic, display: `${fmt(a)} + ${fmt(b)}`, answer: a + b, hints: ['Add the thousands.'], explanation: `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.` }); }
    if (f === 'thou') { const a = rand(2000, 7900); const b = rand(11, 99) * 10; return kp({ key: `add:ft:${a}:${b}`, topic, display: `${fmt(a)} + ${b}`, answer: a + b, hints: ['Add the tens carefully.'], explanation: `${fmt(a)} + ${b} = ${fmt(a + b)}.` }); }
    if (f === 'comp') { const a = rand(1200, 6900); const b = pick([999, 1999, 2999, 998, 1998]); return kp({ key: `add:fc:${a}:${b}`, topic, display: `${fmt(a)} + ${fmt(b)}`, answer: a + b, hints: [`${fmt(b)} is just under ${fmt(b + (b % 1000 === 998 ? 2 : 1))}. Add that, then take away ${b % 1000 === 998 ? 2 : 1}.`], explanation: `${fmt(a)} + ${fmt(b + (b % 1000 === 998 ? 2 : 1))} = ${fmt(a + b + (b % 1000 === 998 ? 2 : 1))}. Take away ${b % 1000 === 998 ? 2 : 1}: ${fmt(a + b)}.` }); }
    if (f === 'k5') { const a = rand(11, 89) * 1000; const b = rand(11, 99) * 1000; return kp({ key: `add:k5:${a}:${b}`, topic, display: `${fmt(a)} + ${fmt(b)}`, answer: a + b, hints: [`${a / 1000} + ${b / 1000} = ${(a + b) / 1000} thousand.`], explanation: `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.` }); }
    if (f === 'k5b') { const a = rand(11, 89) * 1000 + rand(1, 9) * 100; const b = rand(11, 49) * 1000 + rand(1, 9) * 100; return kp({ key: `add:k5b:${a}:${b}`, topic, display: `${fmt(a)} + ${fmt(b)}`, answer: a + b, hints: ['Add the hundreds, then the thousands.'], explanation: `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.` }); }
    const a = rand(11000, 79000) + rand(1, 9) * 10; const b = pick([9999, 19999, 29999, 39999]); return kp({ key: `add:f5:${a}:${b}`, topic, display: `${fmt(a)} + ${fmt(b)}`, answer: a + b, hints: [`${fmt(b)} is 1 less than ${fmt(b + 1)}.`], explanation: `${fmt(a)} + ${fmt(b + 1)} = ${fmt(a + b + 1)}. Take away 1: ${fmt(a + b)}.` });
  }
  if (mode === 'story') {
    const [e, title, setup, third, unit] = pick(BIG_STORIES_ADD);
    if (d === 'challenge') { const a = rand(120000, 480000); const b = rand(90000, 290000); const c = rand(10000, 99000);
      return kp({ key: `add:s3:${title}:${a}:${b}:${c}`, topic, story: { emoji: e, title }, prompt: `${setup(a, b)} ${third(c)} How many ${unit} in all?`, answer: a + b + c, hints: ['Add the first two, then add the third.'], explanation: `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}. ${fmt(a + b)} + ${fmt(c)} = ${fmt(a + b + c)}.` }); }
    const a = sz(d, mode, [1200, 6900], [12000, 79000], [0, 1]); const b = sz(d, mode, [1100, 2900], [11000, 89000], [0, 1]);
    return kp({ key: `add:s:${title}:${a}:${b}`, topic, story: { emoji: e, title }, prompt: `${setup(a, b)} How many ${unit} in all?`, answer: a + b, hints: ['Line up the digits. Add the ones first.'], explanation: `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.` });
  }
  // worksheet and stem
  if (mode === 'stem') {
    const f = pick(by(d, ['est', 'miss'], ['est', 'miss', 'near'], ['est', 'miss', 'miss3', 'near']));
    if (f === 'miss') { const a = rand(by(d, 1200, 12000, 120000), by(d, 6900, 79000, 590000)); const b = rand(by(d, 1100, 11000, 110000), by(d, 2900, 49000, 390000)); return kp({ key: `add:ms:${a}:${b}`, topic, prompt: 'What number is missing?', display: `${fmt(a)} + ? = ${fmt(a + b)}`, answer: b, hints: ['Subtract to find the missing part.'], explanation: `${fmt(a + b)} − ${fmt(a)} = ${fmt(b)}.` }); }
    if (f === 'miss3') { const a = rand(120000, 480000); const b = rand(110000, 390000); const c = rand(11000, 99000); return kp({ key: `add:m3:${a}:${b}:${c}`, topic, prompt: 'What number is missing?', display: `${fmt(a)} + ${fmt(b)} + ? = ${fmt(a + b + c)}`, answer: c, hints: [`${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`], explanation: `${fmt(a + b + c)} − ${fmt(a + b)} = ${fmt(c)}.` }); }
    if (f === 'est') { const unit = by(d, 100, 1000, 10000); const a = rand(by(d, 12, 12, 12), by(d, 99, 99, 99)) * unit + rand(1, unit - 1); const b = rand(11, 99) * unit + rand(1, unit - 1); const ra = Math.round(a / unit) * unit; const rb = Math.round(b / unit) * unit;
      return kp({ key: `add:es:${unit}:${a}:${b}`, topic, prompt: `Estimate ${fmt(a)} + ${fmt(b)} by rounding each number to the nearest ${fmt(unit)}. What is your estimate?`, answer: ra + rb, hints: [`${fmt(a)} is close to ${fmt(ra)}.`], explanation: `${fmt(a)} ≈ ${fmt(ra)} and ${fmt(b)} ≈ ${fmt(rb)}. ${fmt(ra)} + ${fmt(rb)} = ${fmt(ra + rb)}.` }); }
    const a = rand(by(d, 3000, 30000, 300000), by(d, 6000, 60000, 600000)); const gap = rand(by(d, 5, 50, 500), by(d, 90, 900, 9000)); const b = a + gap;
    return kp({ key: `add:nr:${a}:${b}`, topic, prompt: `How much more is ${fmt(b)} than ${fmt(a)}?`, answer: gap, hints: ['Subtract the smaller number from the larger.'], explanation: `${fmt(b)} − ${fmt(a)} = ${fmt(gap)}.` });
  }
  const f = pick(by(d, ['p4', 'p4'], ['p5', 'p5b'], ['p6', 'p3', 'p7']));
  if (f === 'p3') { const a = rand(12000, 89000); const b = rand(12000, 89000); const c = rand(12000, 89000); return kp({ key: `add:w3:${a}:${b}:${c}`, topic, prompt: 'Add the three numbers.', display: `${fmt(a)} + ${fmt(b)} + ${fmt(c)}`, answer: a + b + c, hints: ['Add two, then add the third.'], explanation: `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}; ${fmt(a + b)} + ${fmt(c)} = ${fmt(a + b + c)}.` }); }
  const [lo, hi] = { p4: [1200, 6900], p5: [12000, 69000], p5b: [10000, 59999], p6: [110000, 690000], p7: [1100000, 4900000] }[f];
  const a = rand(lo, hi); const b = f === 'p4' ? rand(1100, 2900) : f === 'p7' ? rand(1100000, 4900000) : rand(Math.floor(lo / 2), Math.floor(hi / 2) + 9000);
  return kp({ key: `add:w:${f}:${a}:${b}`, topic, prompt: pick(['Add. Regroup when you need to.', 'Add.']), display: `${fmt(a)} + ${fmt(b)}`, answer: a + b, hints: ['Line up the digits. Start with the ones.'], explanation: `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.` });
}

export function sub(mode, d) {
  const topic = 'sub';
  if (mode === 'flash') {
    const f = pick(by(d, ['hund', 'round'], ['comp', 'thou', 'hund'], ['k5', 'k5b', 'comp5']));
    if (f === 'hund') { const a = rand(30, 99) * 100; const b = rand(11, a / 100 - 5) * 100; return kp({ key: `sub:fh:${a}:${b}`, topic, display: `${fmt(a)} − ${fmt(b)}`, answer: a - b, hints: [`${a / 100} − ${b / 100} = ${(a - b) / 100}, then add the two zeros.`], explanation: `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}.` }); }
    if (f === 'round') { const a = rand(2, 9) * 1000 + rand(100, 900); const b = rand(1, Math.floor(a / 1000) - 1) * 1000 + 0; return kp({ key: `sub:fr:${a}:${b}`, topic, display: `${fmt(a)} − ${fmt(b)}`, answer: a - b, hints: ['Subtract the thousands.'], explanation: `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}.` }); }
    if (f === 'thou') { const a = rand(3, 9) * 1000; const b = rand(11, 99) * 10; return kp({ key: `sub:ft:${a}:${b}`, topic, display: `${fmt(a)} − ${b}`, answer: a - b, hints: ['Regroup from the thousands.'], explanation: `${fmt(a)} − ${b} = ${fmt(a - b)}.` }); }
    if (f === 'comp') { const a = rand(4000, 9900); const b = pick([999, 1999, 2999, 998, 1998]); return kp({ key: `sub:fc:${a}:${b}`, topic, display: `${fmt(a)} − ${fmt(b)}`, answer: a - b, hints: [`Take away ${fmt(b + (b % 1000 === 998 ? 2 : 1))}, then add back ${b % 1000 === 998 ? 2 : 1}.`], explanation: `${fmt(a)} − ${fmt(b + (b % 1000 === 998 ? 2 : 1))} = ${fmt(a - b - (b % 1000 === 998 ? 2 : 1))}. Add back ${b % 1000 === 998 ? 2 : 1}: ${fmt(a - b)}.` }); }
    if (f === 'k5') { const a = rand(50, 99) * 1000; const b = rand(11, 49) * 1000; return kp({ key: `sub:k5:${a}:${b}`, topic, display: `${fmt(a)} − ${fmt(b)}`, answer: a - b, hints: [`${a / 1000} − ${b / 1000} = ${(a - b) / 1000} thousand.`], explanation: `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}.` }); }
    if (f === 'k5b') { const a = rand(50, 99) * 1000 + rand(1, 9) * 100; const b = rand(11, 49) * 1000 + rand(1, 9) * 100; return kp({ key: `sub:k5b:${a}:${b}`, topic, display: `${fmt(a)} − ${fmt(b)}`, answer: a - b, hints: ['Subtract the hundreds, then the thousands.'], explanation: `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}.` }); }
    const a = rand(50000, 99000) + rand(1, 9) * 10; const b = pick([9999, 19999, 29999, 39999]); return kp({ key: `sub:f5:${a}:${b}`, topic, display: `${fmt(a)} − ${fmt(b)}`, answer: a - b, hints: [`${fmt(b)} is 1 less than ${fmt(b + 1)}.`], explanation: `${fmt(a)} − ${fmt(b + 1)} = ${fmt(a - b - 1)}. Add back 1: ${fmt(a - b)}.` });
  }
  if (mode === 'story') {
    const [e, title, setup, question, second] = pick(BIG_STORIES_SUB);
    if (d === 'challenge') { const a = rand(500000, 900000); const b = rand(120000, 290000); const c = rand(11000, 99000);
      return kp({ key: `sub:s2:${title}:${a}:${b}:${c}`, topic, story: { emoji: e, title }, prompt: `${setup(a, b)} ${second(c)} ${question}`, answer: a - b - c, hints: ['Subtract the first amount, then the second.'], explanation: `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}. ${fmt(a - b)} − ${fmt(c)} = ${fmt(a - b - c)}.` }); }
    const a = d === 'easy' ? rand(3000, 9000) : rand(50000, 99000); const b = d === 'easy' ? rand(1127, a - 400) : rand(11000, a - 4000);
    return kp({ key: `sub:s:${title}:${a}:${b}`, topic, story: { emoji: e, title }, prompt: `${setup(a, b)} ${question}`, answer: a - b, hints: ['Check by adding your answer to the number you took away.'], explanation: `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}. Check: ${fmt(a - b)} + ${fmt(b)} = ${fmt(a)}.` });
  }
  if (mode === 'stem') {
    const f = pick(by(d, ['miss', 'est', 'check'], ['miss', 'est', 'zeros'], ['miss', 'est', 'zeros', 'diff']));
    if (f === 'miss') { const a = rand(by(d, 4000, 50000, 500000), by(d, 9000, 99000, 900000)); const b = rand(by(d, 1100, 11000, 110000), a - by(d, 1000, 4000, 40000)); return kp({ key: `sub:ms:${a}:${b}`, topic, prompt: 'What number is missing?', display: `${fmt(a)} − ? = ${fmt(a - b)}`, answer: b, hints: ['Subtract the answer from the starting number.'], explanation: `${fmt(a)} − ${fmt(a - b)} = ${fmt(b)}.` }); }
    if (f === 'check') { const a = rand(4000, 9000); const b = rand(1100, a - 1000); return kp({ key: `sub:ck:${a}:${b}`, topic, prompt: `${fmt(a)} − ${fmt(b)} = ☐. Check with addition: ☐ + ${fmt(b)} = ${fmt(a)}. What is ☐?`, answer: a - b, hints: [`Subtract ${fmt(a)} − ${fmt(b)}.`], explanation: `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}.` }); }
    if (f === 'est') { const unit = by(d, 100, 1000, 10000); const a = rand(30, 99) * unit + rand(1, unit - 1); const b = rand(11, 29) * unit + rand(1, unit - 1); const ra = Math.round(a / unit) * unit; const rb = Math.round(b / unit) * unit;
      return kp({ key: `sub:es:${unit}:${a}:${b}`, topic, prompt: `Estimate ${fmt(a)} − ${fmt(b)} by rounding each number to the nearest ${fmt(unit)}. What is your estimate?`, answer: ra - rb, hints: [`${fmt(a)} is close to ${fmt(ra)}.`], explanation: `${fmt(a)} ≈ ${fmt(ra)} and ${fmt(b)} ≈ ${fmt(rb)}. ${fmt(ra)} − ${fmt(rb)} = ${fmt(ra - rb)}.` }); }
    if (f === 'zeros') { const a = by(d, rand(2, 9) * 1000, rand(2, 9) * 10000, rand(2, 9) * 100000); const b = rand(by(d, 123, 1234, 12345), by(d, 987, 9876, 98765)); const A = d === 'challenge' ? 1000000 : a; const B = d === 'challenge' ? rand(123456, 987654) : b;
      return kp({ key: `sub:z:${A}:${B}`, topic, prompt: 'Subtract across the zeros.', display: `${fmt(A)} − ${fmt(B)}`, answer: A - B, hints: [`Regroup from the first digit that isn't zero.`, 'Check by adding back.'], explanation: `${fmt(A)} − ${fmt(B)} = ${fmt(A - B)}.` }); }
    const a = rand(200000, 900000); const b = rand(100000, a - 40000); return kp({ key: `sub:df:${a}:${b}`, topic, prompt: `The two numbers ${fmt(a)} and ${fmt(b)} are different. How much greater is the larger number?`, answer: a - b, hints: ['Subtract.'], explanation: `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}.` });
  }
  const f = pick(by(d, ['p4', 'p4', 'z4'], ['p5', 'p5b', 'z5'], ['p6', 'z7', 'p7']));
  let a; let b;
  if (f === 'p4') { a = rand(3000, 9900); b = rand(1127, a - 700); } else if (f === 'z4') { a = rand(2, 9) * 1000 + pick([0, 0, 3, 10]); b = rand(1127, a - 400); }
  else if (f === 'p5') { a = rand(30000, 99000); b = rand(12000, a - 4000); } else if (f === 'p5b') { a = rand(30000, 99999); b = rand(11111, a - 5000); } else if (f === 'z5') { a = rand(3, 9) * 10000 + pick([0, 0, 5, 100]); b = rand(12345, a - 5000); }
  else if (f === 'p6') { a = rand(300000, 999999); b = rand(120000, a - 40000); } else if (f === 'z7') { a = pick([1000000, 2000000, 5000000, 3000000]); b = rand(123456, 987654); } else { a = rand(2000000, 9000000); b = rand(1100000, a - 400000); }
  return kp({ key: `sub:w:${f}:${a}:${b}`, topic, prompt: f.startsWith('z') ? 'Subtract. Regroup across the zeros.' : 'Subtract.', display: `${fmt(a)} − ${fmt(b)}`, answer: a - b, hints: ['Start with the ones. Regroup from the next place when you need to.'], explanation: `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}. Check: ${fmt(a - b)} + ${fmt(b)} = ${fmt(a)}.` });
}

/* ================================ Place value ================================ */
const PLACE = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions'];
export function placevalue(mode, d) {
  const topic = 'placevalue';
  const len = by(d, 4 + (chance(0.4) ? 1 : 0), 6, 7);
  const f = pick(mode === 'flash'
    ? by(d, ['digit', 'round', 'plusminus'], ['round', 'digit', 'plusminus', 'tenX'], ['round', 'plusminus', 'tenX', 'digit'])
    : by(d, ['digit', 'round', 'expanded', 'compare', 'plusminus', 'greatest'], ['round', 'expanded', 'compare', 'words', 'tenX', 'greatest', 'plusminus'], ['round', 'expanded', 'compare', 'words', 'tenX', 'greatest', 'least']));
  if (f === 'digit') { const ds = distinctNumber(len); const i = rand(0, len - 1); const dig = ds[i] === 0 ? (i === len - 1 ? 1 : ds[i]) : ds[i];
    if (ds[i] === 0) return placevalue(mode, d); const n = Number(ds.join('')); const val = dig * 10 ** (len - 1 - i);
    return kp({ key: `pv:dg:${n}:${i}`, topic, prompt: `What is the value of the ${dig} in ${fmt(n)}?`, answer: val, hints: [`Which place is the ${dig} in? Read the number from the right.`], explanation: `The ${dig} is in the ${PLACE[len - 1 - i]} place, so it is worth ${fmt(val)}.` }); }
  if (f === 'round') {
    const pl = pick(by(d, [10, 100, 1000], [1000, 10000, 100000], [100000, 1000000, 10000, 1000000])); const lo = Math.max(pl * 2, by(d, 1000, 12000, 120000)); const hi = by(d, 9999, 999999, 9999999);
    let n = rand(lo, hi); if (n % pl === pl / 2) n += 1; const r = Math.round(n / pl) * pl; const word = { 10: 'ten', 100: 'hundred', 1000: 'thousand', 10000: 'ten thousand', 100000: 'hundred thousand', 1000000: 'million' }[pl];
    return kp({ key: `pv:rd:${n}:${pl}`, topic, prompt: `Round ${fmt(n)} to the nearest ${word}.`, display: fmt(n), answer: r, hints: [`Look at the digit just to the right of the ${word}s place.`, '5 or more: round up. 4 or less: stay the same.'], explanation: `${fmt(n)} is between ${fmt(Math.floor(n / pl) * pl)} and ${fmt(Math.ceil(n / pl) * pl)}. It is closer to ${fmt(r)}.` }); }
  if (f === 'expanded') { const ds = String(rand(10 ** (len - 1), 10 ** len - 1)).split('').map(Number); const n = Number(ds.join('')); const nz = ds.map((x, i) => [x * 10 ** (len - 1 - i), i]).filter(([v]) => v > 0);
    const hole = pick(nz); const shown = nz.map(([v, i]) => (i === hole[1] ? '☐' : fmt(v))).join(' + ');
    return kp({ key: `pv:ex:${n}:${hole[1]}`, topic, prompt: `Fill in the missing part of ${fmt(n)}.`, display: shown, answer: hole[0], hints: ['Each digit is worth its digit times its place value.'], explanation: `${fmt(n)} = ${nz.map(([v]) => fmt(v)).join(' + ')}.` }); }
  if (f === 'compare') { const a = rand(10 ** (len - 1), 10 ** len - 1); const s = String(a); const k = rand(Math.max(1, len - 3), len - 1); const b = Number(s.slice(0, k) + String(Math.floor(Math.random() * 10 ** (len - k))).padStart(len - k, '0'));
    if (a === b) return placevalue(mode, d); const big = Math.max(a, b); const small = Math.min(a, b);
    return pickText({ key: `pv:cp:${a}:${b}`, topic, prompt: 'Which number is GREATER?', hints: ['Compare the digits from the left, one place at a time.'], explanation: `${fmt(big)} is greater than ${fmt(small)}.` }, fmt(big), [fmt(small)]); }
  if (f === 'words') { const n = by(d, rand(1000, 99999), rand(100000, 999999), rand(1000000, 9999999)); const right = fmt(n); const s = String(n); const swap = (i) => { const c = s.split(''); [c[i], c[i + 1]] = [c[i + 1], c[i]]; return Number(c.join('')); };
    const wrong = [swap(1), swap(2), Number(s.slice(0, 1) + '0' + s.slice(1, -1)), n + 10 ** (s.length - 2)].filter((x) => x !== n && String(x).length === s.length).map(fmt);
    return pickText({ key: `pv:wd:${n}`, topic, prompt: `Which number is "${inWords(n)}"?`, hints: ['Write each part, then use commas.'], explanation: `${inWords(n)} is written ${right}.` }, right, wrong); }
  if (f === 'tenX') { const lo = pick([[1, 0], [2, 1], [3, 2], [4, 3], [5, 4]]); const hiPl = lo[0] + (d === 'easy' ? 0 : rand(0, 2)); const loPl = lo[1];
    const hi = Math.min(6, hiPl); const dif = Math.max(1, hi - loPl); const mult = 10 ** dif; const dg = rand(2, 9);
    return kp({ key: `pv:tx:${dg}:${hi}:${loPl}`, topic, prompt: `A ${dg} in the ${PLACE[hi]} place is worth how many times as much as a ${dg} in the ${PLACE[loPl]} place?`, answer: mult, hints: [`Each place to the left is 10 times as much.`], explanation: `Going from ${PLACE[loPl]} to ${PLACE[hi]} is ${dif} step${dif > 1 ? 's' : ''} left, so ${fmt(mult)} times as much.` }); }
  if (f === 'plusminus') { const amt = pick(by(d, [10, 100, 1000], [1000, 10000, 100000], [10000, 100000, 1000000, 100000])); const up = chance(0.5);
    const lo = Math.max(amt * 2, by(d, 1100, 12000, 200000)); const hi = by(d, 9999, 999999, 9999999); let n = rand(lo, hi);
    if (d === 'challenge') { const pos = String(amt).length - 1; const ds = String(n).split(''); ds[ds.length - 1 - pos] = up ? '9' : '0'; const n2 = Number(ds.join('')); if (n2 >= amt * 2 && String(n2).length === String(n).length) n = n2; } // forces a regroup
    const ans = n + (up ? amt : -amt);
    return kp({ key: `pv:pm:${n}:${amt}:${up}`, topic, prompt: `What is ${fmt(amt)} ${up ? 'more' : 'less'} than ${fmt(n)}?`, answer: ans, hints: [`Change just one digit.`], explanation: `${fmt(n)} ${up ? '+' : '−'} ${fmt(amt)} = ${fmt(ans)}.` }); }
  if (f === 'greatest' || f === 'least') { const k = by(d, 4, 5, 6); const ds = sample([1, 2, 3, 4, 5, 6, 7, 8, 9], k); const big = f === 'greatest'; const ans = Number([...ds].sort((a, b) => (big ? b - a : a - b)).join(''));
    return kp({ key: `pv:${f}:${[...ds].sort().join('')}`, topic, prompt: `Use each digit once to make the ${big ? 'GREATEST' : 'LEAST'} number you can: ${ds.join(', ')}.`, answer: ans, hints: [big ? 'Put the biggest digits in the biggest places.' : 'Put the smallest digits in the biggest places.'], explanation: `${[...ds].sort((a, b) => (big ? b - a : a - b)).join(', ')} gives ${fmt(ans)}.` }); }
  return placevalue(mode, d);
}
