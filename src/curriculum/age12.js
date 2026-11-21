/**
 * Age 12 — "Problem Solvers"
 * Pitched for advanced 6th/7th graders. "Advanced" is the default; "Challenge" reaches
 * into 7th–8th grade (multi-step equations, percent change, compound probability, slope…).
 *
 * Display strings may contain [[n/d]] tokens, rendered as stacked fractions by <MathText>.
 */
import { rand, pick, sample, shuffle, chance, gcd, lcm, round, distinctInts } from '../lib/rng.js';
import { NAMES, makeChoices, withFractionNote } from './shared.js';
import { themed12, middleEarthOn, THEME_RATE } from './middleEarth.js';

const L = (d) => (d === 'easy' || d === 'challenge' ? d : 'standard');
const by = (d, e, s, c) => (d === 'easy' ? e : d === 'challenge' ? c : s);
const nm = () => pick(NAMES);
const two = () => sample(NAMES, 2);

/** pretty number: −1,234.5 */
const fmt = (n) => {
  const r = round(n, 6);
  return (r < 0 ? '−' : '') + Math.abs(r).toLocaleString('en-US', { maximumFractionDigits: 6 });
};
/** parenthesize negatives inside expressions */
const p = (n) => (n < 0 ? `(${fmt(n)})` : fmt(n));
/** plain answer string the checker can parse */
const ans = (n) => String(round(n, 6));
const money = (n) => `$${n.toFixed(2)}`;
function frac(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d);
  n /= g; d /= g;
  return d === 1 ? String(n) : `${n}/${d}`;
}
const F = (n, d) => `[[${n}/${d}]]`;
const FR = (n, d) => { const s = frac(n, d); return s.includes('/') ? `[[${s}]]` : s; };
const digitSum = (n) => String(n).split('').reduce((a, c) => a + Number(c), 0);

function kp(o) {
  const a = String(o.answer);
  return { input: 'keypad', answerLabel: a.replace(/^-/, '−'), ...o, answer: a };
}
function choice(o, correct, wrong) {
  const { choices, answer } = makeChoices(correct, wrong);
  return { input: 'choice', choices, answer, answerLabel: correct.text, ...o };
}
/** numeric distractors near the answer */
function nearby(answer, n = 3) {
  const out = new Set();
  const step = Math.max(1, Math.round(Math.abs(answer) * 0.15));
  let guard = 0;
  while (out.size < n && guard++ < 100) {
    const v = answer + pick([-1, 1]) * step * rand(1, 3);
    if (v !== answer) out.add(v);
  }
  return [...out];
}

/* ===================== Arithmetic (add/sub/mul/div) ===================== */

function decPair(d, mode) {
  // returns [aUnits, bUnits, scale]
  if (mode === 'flash') {
    if (d === 'easy') return [rand(10, 99), rand(10, 99), 1];
    if (d === 'standard') return [rand(100, 999), rand(10, 999), 1];
    return chance(0.5) ? [rand(100, 999), rand(100, 999), 1] : [rand(100, 999), rand(100, 999), 10];
  }
  if (d === 'easy') return [rand(100, 999), rand(100, 999), 1];
  if (d === 'standard') return chance(0.5) ? [rand(1000, 9999), rand(1000, 9999), 1] : [rand(100, 9999), rand(100, 9999), 100];
  return [rand(10000, 99999) * 10, rand(1000, 99999), 1000];
}

function addition(mode, d) {
  const [A, B, s] = decPair(d, mode);
  const a = A / s; const b = B / s;
  return kp({
    key: `add:${A}:${B}:${s}`, topic: 'add', display: `${fmt(a)} + ${fmt(b)}`, answer: ans((A + B) / s),
    explanation: s > 1 ? `Line up the decimal points: ${fmt(a)} + ${fmt(b)} = ${fmt((A + B) / s)}` : `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}`,
  });
}

function subtraction(mode, d) {
  let [A, B, s] = decPair(d, mode);
  if (B > A) [A, B] = [B, A];
  if (A === B) A += 7;
  const a = A / s; const b = B / s;
  return kp({
    key: `sub:${A}:${B}:${s}`, topic: 'sub', display: `${fmt(a)} − ${fmt(b)}`, answer: ans((A - B) / s),
    explanation: `${fmt(a)} − ${fmt(b)} = ${fmt((A - B) / s)}${s > 1 ? ' (line up the decimals, fill blanks with zeros)' : ''}`,
  });
}

function multiplication(mode, d) {
  let a; let b; let sa = 1; let sb = 1;
  if (mode === 'flash') {
    if (d === 'easy') { a = rand(3, 12); b = rand(3, 12); }
    else if (d === 'standard') { a = rand(12, 99); b = rand(3, 9); }
    else if (chance(0.5)) { a = rand(11, 39); b = rand(11, 25); }
    else { a = rand(2, 9); b = rand(2, 12); sa = 10; } // 0.7 × 8
  } else if (d === 'easy') { a = rand(12, 99); b = rand(3, 9); }
  else if (d === 'standard') { if (chance(0.5)) { a = rand(101, 999); b = rand(12, 99); } else { a = rand(101, 999); b = rand(3, 9); sa = 100; } }
  else { a = rand(11, 99); b = rand(101, 999); sa = 10; sb = 100; }
  const x = a / sa; const y = b / sb;
  const res = (a * b) / (sa * sb);
  return kp({
    key: `mul:${a}:${b}:${sa}:${sb}`, topic: 'mul', display: `${fmt(x)} × ${fmt(y)}`, answer: ans(res),
    explanation: sa * sb > 1
      ? `Multiply ${a} × ${b} = ${fmt(a * b)}, then place ${String(sa * sb).length - 1} decimal place${sa * sb > 10 ? 's' : ''}: ${fmt(res)}`
      : `${fmt(x)} × ${fmt(y)} = ${fmt(res)}`,
  });
}

function division(mode, d) {
  let q; let b; let sq = 1; let sb = 1;
  if (mode === 'flash') {
    if (d === 'easy') { b = rand(3, 12); q = rand(3, 12); }
    else if (d === 'standard') { b = rand(3, 9); q = rand(12, 99); }
    else if (chance(0.5)) { b = rand(11, 25); q = rand(4, 30); }
    else { b = rand(2, 9); q = rand(2, 9); sb = 10; } // 4.8 ÷ 0.6 = 8
  } else if (d === 'easy') { b = rand(3, 9); q = rand(12, 199); }
  else if (d === 'standard') { b = rand(12, 48); q = rand(12, 199); }
  else if (chance(0.5)) { b = rand(4, 25); q = rand(12, 999); sq = 10; } // 45.6 ÷ 12 = 3.8
  else { b = rand(3, 9); q = rand(12, 99); sb = 10; } // 30.4 ÷ 0.8
  const divisor = b / sb;
  const quotient = q / sq;
  const dividend = round(divisor * quotient, 6);
  return kp({
    key: `div:${b}:${q}:${sq}:${sb}`, topic: 'div', display: `${fmt(dividend)} ÷ ${fmt(divisor)}`, answer: ans(quotient),
    explanation: sb > 1
      ? `Multiply both by 10: ${fmt(dividend * 10)} ÷ ${b} = ${fmt(quotient)}`
      : `${fmt(dividend)} ÷ ${fmt(divisor)} = ${fmt(quotient)} (check: ${fmt(quotient)} × ${fmt(divisor)} = ${fmt(dividend)})`,
  });
}

/* ============================== Integers ============================== */

function integers(mode, d) {
  const topic = 'integers';
  if (mode === 'story') return integerStory(d);
  const nz = (lo, hi) => { let v = 0; while (v === 0) v = rand(lo, hi); return v; };
  if (d === 'challenge' && mode !== 'flash' && chance(0.6)) {
    const a = nz(-6, 6); const b = nz(-9, 9); const c = nz(-9, 9);
    const form = pick(['sq', 'mix']);
    if (form === 'sq') {
      const r = a * a - b * c;
      return kp({ key: `int:sq:${a}:${b}:${c}`, topic, display: `${p(a)}² − ${p(b)} × ${p(c)}`, answer: ans(r),
        explanation: `Exponent first: ${p(a)}² = ${a * a}. Then ${p(b)} × ${p(c)} = ${fmt(b * c)}. ${a * a} − ${p(b * c)} = ${fmt(r)}` });
    }
    const e = nz(2, 5);
    const r = (b + c) * a - e;
    return kp({ key: `int:mix:${a}:${b}:${c}:${e}`, topic, display: `${p(a)} × (${fmt(b)} + ${p(c)}) − ${e}`, answer: ans(r),
      explanation: `Parentheses: ${fmt(b)} + ${p(c)} = ${fmt(b + c)}. Then ${p(a)} × ${p(b + c)} = ${fmt(a * (b + c))}. Minus ${e} = ${fmt(r)}` });
  }
  const ops = d === 'easy' ? ['+', '−'] : ['+', '−', '×', '÷'];
  const op = pick(ops);
  const R = by(d, 20, 30, 60);
  let a; let b; let r;
  if (op === '×') { a = nz(-12, 12); b = nz(-12, 12); r = a * b; }
  else if (op === '÷') { b = nz(-12, 12); r = nz(-12, 12); a = b * r; }
  else { a = nz(-R, R); b = nz(-R, R); if (a > 0 && b > 0) a = -a; r = op === '+' ? a + b : a - b; }
  const rule = op === '×' || op === '÷'
    ? (r < 0 ? 'Signs differ, so the answer is negative.' : 'Same signs, so the answer is positive.')
    : op === '−' ? `Subtracting is adding the opposite: ${p(a)} + ${p(-b)}.` : 'Think of a number line: start at the first number and move.';
  return kp({ key: `int:${op}:${a}:${b}`, topic, display: `${p(a)} ${op} ${p(b)}`, answer: ans(r), explanation: `${rule} Answer: ${fmt(r)}` });
}

/* ========================= Fractions & Decimals ========================= */

function fracdec(mode, d) {
  const topic = 'fracdec';
  if (mode === 'story') return fractionStory(d);
  const forms = mode === 'flash'
    ? by(d, ['simplify', 'ofnum', 'f2d'], ['simplify', 'addlike', 'f2d', 'mulf'], ['addunlike', 'mulf', 'divf', 'decmul'])
    : by(d, ['simplify', 'addlike', 'ofnum', 'f2d'], ['addunlike', 'subunlike', 'mulf', 'f2d', 'ofnum'], ['addunlike', 'subunlike', 'mulf', 'divf', 'mixed', 'decmul']);
  const f = pick(forms);
  const dens = by(d, [2, 3, 4, 5, 6, 8, 10], [3, 4, 5, 6, 8, 9, 10, 12], [4, 5, 6, 7, 8, 9, 12, 15]);

  if (f === 'simplify') {
    const den = pick(by(d, [4, 6, 8, 9, 10, 12], [12, 14, 15, 16, 18, 20, 24], [18, 24, 28, 30, 36, 42, 45, 48]));
    const divisors = Array.from({ length: den - 2 }, (_, i) => i + 2).filter((k) => den % k === 0);
    const k = pick(divisors);
    const num = k * rand(1, den / k - 1);
    const g = gcd(num, den);
    return kp({ key: `fd:simp:${num}:${den}`, topic, prompt: 'Simplify completely', display: F(num, den), answer: frac(num, den), mustSimplify: true,
      explanation: `Divide top and bottom by ${g}: ${FR(num, den)}`, hint: 'Write it as a fraction in lowest terms.' });
  }
  if (f === 'ofnum') {
    const den = pick([3, 4, 5, 6, 8, 10]);
    const num = rand(1, den - 1);
    const whole = den * rand(2, by(d, 12, 20, 30));
    return kp({ key: `fd:of:${num}:${den}:${whole}`, topic, display: `${F(num, den)} of ${whole}`, answer: ans((whole / den) * num),
      explanation: `${whole} ÷ ${den} = ${whole / den}, then × ${num} = ${(whole / den) * num}` });
  }
  if (f === 'f2d') {
    const den = pick([2, 4, 5, 8, 10, 20, 25]);
    let num = rand(1, den * by(d, 1, 2, 3) - 1);
    if (num % den === 0) num += 1;
    return kp({ key: `fd:f2d:${num}:${den}`, topic, prompt: 'Write as a decimal', display: F(num, den), answer: ans(num / den), decimalOnly: true,
      explanation: `${num} ÷ ${den} = ${fmt(num / den)}` });
  }
  if (f === 'addlike') {
    const den = pick(dens); const a = rand(1, den - 1); const b = rand(1, den - 1);
    return kp({ key: `fd:al:${a}:${b}:${den}`, topic, display: `${F(a, den)} + ${F(b, den)}`, answer: frac(a + b, den),
      explanation: `Same denominator: add the tops. ${a} + ${b} = ${a + b}, so ${F(a + b, den)}${gcd(a + b, den) > 1 || a + b >= den ? ` = ${FR(a + b, den)}` : ''}` });
  }
  if (f === 'addunlike' || f === 'subunlike') {
    let [d1, d2] = sample(dens, 2);
    const a = rand(1, d1 - 1); const b = rand(1, d2 - 1);
    const L2 = lcm(d1, d2);
    let A = a * (L2 / d1); let B = b * (L2 / d2);
    let x = a; let y = b;
    if (f === 'subunlike' && A < B) { [A, B] = [B, A]; [x, y] = [y, x]; [d1, d2] = [d2, d1]; }
    const sum = f === 'addunlike' ? A + B : A - B;
    const sym = f === 'addunlike' ? '+' : '−';
    return kp({ key: `fd:${f}:${x}/${d1}:${y}/${d2}`, topic, display: `${F(x, d1)} ${sym} ${F(y, d2)}`, answer: frac(sum, L2),
      explanation: `Common denominator ${L2}: ${F(A, L2)} ${sym} ${F(B, L2)} = ${F(sum, L2)}${frac(sum, L2) !== `${sum}/${L2}` ? ` = ${FR(sum, L2)}` : ''}`,
      hint: 'Fractions or decimals are fine, e.g. 7/12' });
  }
  if (f === 'mulf') {
    const d1 = pick(dens); const d2 = pick(dens);
    const a = rand(1, d1 - 1); const b = rand(1, d2 + (d === 'challenge' ? d2 : -1));
    return kp({ key: `fd:mul:${a}/${d1}:${b}/${d2}`, topic, display: `${F(a, d1)} × ${F(b, d2)}`, answer: frac(a * b, d1 * d2),
      explanation: `Multiply across: ${F(a * b, d1 * d2)} = ${FR(a * b, d1 * d2)}` });
  }
  if (f === 'divf') {
    const d1 = pick(dens); const d2 = pick(dens);
    const a = rand(1, d1 - 1); const b = rand(1, d2 - 1);
    return kp({ key: `fd:div:${a}/${d1}:${b}/${d2}`, topic, display: `${F(a, d1)} ÷ ${F(b, d2)}`, answer: frac(a * d2, d1 * b),
      explanation: `Keep, change, flip: ${F(a, d1)} × ${F(d2, b)} = ${F(a * d2, d1 * b)} = ${FR(a * d2, d1 * b)}` });
  }
  if (f === 'mixed') {
    const d1 = pick([2, 3, 4, 5, 6]); const d2 = pick([2, 3, 4, 6, 8]);
    const w1 = rand(1, 4); const w2 = rand(1, 3); const a = rand(1, d1 - 1); const b = rand(1, d2 - 1);
    const n1 = w1 * d1 + a; const n2 = w2 * d2 + b;
    return kp({ key: `fd:mixed:${w1}${a}${d1}:${w2}${b}${d2}`, topic, display: `${w1}${F(a, d1)} × ${w2}${F(b, d2)}`, answer: frac(n1 * n2, d1 * d2),
      explanation: `Improper fractions: ${F(n1, d1)} × ${F(n2, d2)} = ${FR(n1 * n2, d1 * d2)}`, hint: 'Answer as an improper fraction or decimal' });
  }
  // decimal × decimal
  const a = rand(11, 99); const b = rand(2, 99);
  return kp({ key: `fd:dm:${a}:${b}`, topic, display: `${fmt(a / 10)} × ${fmt(b / 100)}`, answer: ans((a * b) / 1000),
    explanation: `${a} × ${b} = ${a * b}; 1 + 2 = 3 decimal places → ${fmt((a * b) / 1000)}` });
}

/* ============================= Pre-Algebra ============================= */

function algebra(mode, d) {
  const topic = 'algebra';
  if (mode === 'story') return algebraStory(d);
  if (mode === 'stem') return balanceScale(d);
  const nz = (lo, hi) => { let v = 0; while (v === 0) v = rand(lo, hi); return v; };
  const v = pick(['x', 'n', 'y', 'm']);
  const form = by(d,
    mode === 'flash' ? ['add', 'mul'] : ['add', 'mul', 'two'],
    mode === 'flash' ? ['two', 'mul', 'eval'] : ['two', 'two', 'eval', 'frac'],
    mode === 'flash' ? ['two', 'two', 'eval'] : ['both', 'dist', 'two', 'frac']);
  const x = d === 'challenge' ? nz(-12, 15) : rand(2, by(d, 15, 20, 20));

  if (form === 'add') {
    const b = rand(3, 40);
    return kp({ key: `alg:add:${x}:${b}`, topic, prompt: `Solve for ${v}`, display: `${v} + ${b} = ${x + b}`, answer: ans(x),
      explanation: `Subtract ${b} from both sides: ${v} = ${x + b} − ${b} = ${x}` });
  }
  if (form === 'mul') {
    const a = rand(2, 12);
    return kp({ key: `alg:mul:${x}:${a}`, topic, prompt: `Solve for ${v}`, display: `${a}${v} = ${a * x}`, answer: ans(x),
      explanation: `Divide both sides by ${a}: ${v} = ${a * x} ÷ ${a} = ${x}` });
  }
  if (form === 'eval') {
    const a = nz(2, 9); const b = nz(-12, 12); const val = d === 'challenge' ? nz(-6, 6) : rand(2, 9);
    const sq = d === 'challenge' && chance(0.5);
    const r = sq ? val * val + a * val + b : a * val + b;
    return kp({ key: `alg:eval:${a}:${b}:${val}:${sq}`, topic, prompt: `Evaluate when ${v} = ${fmt(val)}`,
      display: `${sq ? `${v}² + ` : ''}${a}${v} ${b < 0 ? '−' : '+'} ${Math.abs(b)}`, answer: ans(r),
      explanation: `Substitute: ${sq ? `${p(val)}² + ` : ''}${a}·${p(val)} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${fmt(r)}` });
  }
  if (form === 'frac') {
    const k = pick([2, 3, 4, 5]); const xx = k * rand(2, 12); const b = rand(1, 15);
    return kp({ key: `alg:frac:${k}:${xx}:${b}`, topic, prompt: `Solve for ${v}`, display: `${v}/${k} + ${b} = ${xx / k + b}`, answer: ans(xx),
      explanation: `Subtract ${b}: ${v}/${k} = ${xx / k}. Multiply by ${k}: ${v} = ${xx}` });
  }
  if (form === 'both') {
    const a = rand(3, 9); const c = rand(1, a - 1); const b = nz(-15, 15);
    const rhsConst = a * x + b - c * x;
    return kp({ key: `alg:both:${a}:${b}:${c}:${x}`, topic, prompt: `Solve for ${v}`,
      display: `${a}${v} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${c === 1 ? '' : c}${v} ${rhsConst < 0 ? '−' : '+'} ${Math.abs(rhsConst)}`, answer: ans(x),
      explanation: `Subtract ${c}${v} from both sides: ${a - c}${v} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${fmt(rhsConst)}. Then ${a - c}${v} = ${fmt(rhsConst - b)}, so ${v} = ${fmt(x)}` });
  }
  if (form === 'dist') {
    const a = rand(2, 8); const b = nz(-9, 9);
    return kp({ key: `alg:dist:${a}:${b}:${x}`, topic, prompt: `Solve for ${v}`, display: `${a}(${v} ${b < 0 ? '−' : '+'} ${Math.abs(b)}) = ${fmt(a * (x + b))}`, answer: ans(x),
      explanation: `Divide by ${a}: ${v} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${fmt(x + b)}, so ${v} = ${fmt(x)}` });
  }
  // two-step
  const a = d === 'challenge' ? nz(-9, 9) : rand(2, 12);
  const b = d === 'challenge' ? nz(-30, 30) : rand(1, 40);
  const c = a * x + b;
  return kp({ key: `alg:two:${a}:${b}:${x}`, topic, prompt: `Solve for ${v}`,
    display: `${a === -1 ? '−' : a}${v} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${fmt(c)}`, answer: ans(x),
    explanation: `${b < 0 ? 'Add' : 'Subtract'} ${Math.abs(b)}: ${a}${v} = ${fmt(c - b)}. Divide by ${a}: ${v} = ${fmt(x)}` });
}

function balanceScale(d) {
  const topic = 'algebra';
  const x = rand(2, by(d, 9, 12, 15));
  if (d === 'challenge') {
    const a = rand(3, 5); const c = rand(1, a - 1); const b = rand(1, 9);
    const r = (a - c) * x + b;
    return kp({ key: `alg:bal2:${a}:${b}:${c}:${x}`, topic, prompt: 'The scale is balanced. How much does one box weigh?',
      visual: { type: 'balance', left: { x: a, units: b }, right: { x: c, units: r } },
      display: `${a}x + ${b} = ${c}x + ${r}`, answer: ans(x),
      hints: [`Take ${c} box${c > 1 ? 'es' : ''} off both sides.`, `Now ${a - c}x + ${b} = ${r}. Remove ${b} weights from both sides.`],
      explanation: `Remove ${c} boxes from each side: ${a - c}x + ${b} = ${r}. Then ${a - c}x = ${r - b}, so x = ${x}.` });
  }
  const a = rand(2, by(d, 3, 5, 5)); const b = rand(1, by(d, 6, 12, 12));
  return kp({ key: `alg:bal:${a}:${b}:${x}`, topic, prompt: 'The scale is balanced. How much does one box weigh?',
    visual: { type: 'balance', left: { x: a, units: b }, right: { x: 0, units: a * x + b } },
    display: `${a}x + ${b} = ${a * x + b}`, answer: ans(x),
    hints: [`Take ${b} weight${b > 1 ? 's' : ''} off both sides so it stays balanced.`, `Now ${a} boxes = ${a * x}. Split into ${a} equal parts.`],
    explanation: `${a}x + ${b} = ${a * x + b} → ${a}x = ${a * x} → x = ${x}` });
}

/* ========================= Ratios & Percentages ========================= */

function ratio(mode, d) {
  const topic = 'ratio';
  if (mode === 'story') return percentStory(d);
  if (mode === 'stem') return ratioTape(d);
  const forms = mode === 'flash'
    ? by(d, ['pctEasy', 'equiv'], ['pct', 'equiv', 'unit'], ['pct', 'whole', 'change'])
    : by(d, ['pctEasy', 'equiv', 'unit'], ['pct', 'whole', 'unit', 'equiv'], ['change', 'whole', 'reverse', 'pct']);
  const f = pick(forms);
  if (f === 'pctEasy' || f === 'pct') {
    const pc = f === 'pctEasy' ? pick([10, 20, 25, 50, 75]) : pick([5, 12, 15, 30, 35, 40, 45, 60, 65, 80, 120, 150]);
    const base = pick([20, 40, 60, 80, 120, 160, 200, 240, 300, 360, 480]);
    return kp({ key: `r:pct:${pc}:${base}`, topic, display: `${pc}% of ${base}`, answer: ans((pc * base) / 100),
      explanation: `${pc}% = ${fmt(pc / 100)}. ${fmt(pc / 100)} × ${base} = ${fmt((pc * base) / 100)}` });
  }
  if (f === 'equiv') {
    const a = rand(2, 9); const b = rand(2, 9); const k = rand(2, by(d, 6, 9, 12));
    if (a === b) return ratio(mode, d);
    return kp({ key: `r:eq:${a}:${b}:${k}`, topic, prompt: 'Find the missing number', display: `${a} : ${b} = ? : ${b * k}`, answer: ans(a * k),
      explanation: `${b} × ${k} = ${b * k}, so ${a} × ${k} = ${a * k}` });
  }
  if (f === 'unit') {
    const rate = rand(3, 18) * pick([1, 0.5, 0.25]); const n = rand(3, 12);
    const thing = pick([['miles', 'hours', 'miles per hour'], ['pages', 'minutes', 'pages per minute'], ['dollars', 'pounds', 'dollars per pound']]);
    return kp({ key: `r:unit:${rate}:${n}:${thing[0]}`, topic, prompt: `Find the unit rate (${thing[2]})`, display: `${fmt(rate * n)} ${thing[0]} in ${n} ${thing[1]}`, answer: ans(rate),
      explanation: `${fmt(rate * n)} ÷ ${n} = ${fmt(rate)} ${thing[2]}` });
  }
  if (f === 'whole') {
    const pc = pick([10, 20, 25, 40, 75, 15, 35]); const whole = pick([40, 60, 80, 120, 200, 140, 260]);
    const part = (pc * whole) / 100;
    if (part !== Math.round(part)) return ratio(mode, d);
    return kp({ key: `r:whole:${pc}:${whole}`, topic, display: `${fmt(part)} is ${pc}% of what number?`, answer: ans(whole),
      explanation: `${fmt(part)} ÷ ${fmt(pc / 100)} = ${whole}` });
  }
  if (f === 'change') {
    const a = pick([40, 50, 60, 80, 120, 150, 200, 250]); const pc = pick([10, 15, 20, 25, 30, 40, 50, 60]) * pick([1, -1]);
    const b = a * (1 + pc / 100);
    if (b !== Math.round(b)) return ratio(mode, d);
    return kp({ key: `r:chg:${a}:${pc}`, topic, prompt: 'Percent change (use − for a decrease)', display: `${a} → ${fmt(b)}`, answer: ans(pc),
      explanation: `Change = ${fmt(b - a)}. ${fmt(b - a)} ÷ ${a} = ${fmt(pc / 100)} = ${pc}%` });
  }
  // reverse: after x% off, price is P — original?
  const pc = pick([10, 20, 25, 40, 50]); const orig = pick([40, 60, 80, 120, 160, 200]);
  const sale = orig * (1 - pc / 100);
  return kp({ key: `r:rev:${pc}:${orig}`, topic, prompt: 'Find the original price', display: `After ${pc}% off, it costs $${fmt(sale)}`, answer: ans(orig),
    explanation: `$${fmt(sale)} is ${100 - pc}% of the original. ${fmt(sale)} ÷ ${fmt((100 - pc) / 100)} = ${orig}` });
}

function ratioTape(d) {
  const topic = 'ratio';
  const parts = d === 'challenge' && chance(0.5) ? 3 : 2;
  const r = Array.from({ length: parts }, () => rand(1, 7));
  if (parts === 2 && r[0] === r[1]) r[1] += 1;
  const unit = rand(2, by(d, 6, 9, 14));
  const total = r.reduce((a, b) => a + b, 0) * unit;
  const things = pick([['red', 'blue', 'green', 'marbles'], ['cats', 'dogs', 'birds', 'pets'], ['fiction', 'nonfiction', 'poetry', 'books'], ['boys', 'girls', 'teachers', 'people']]);
  const ask = rand(0, parts - 1);
  const labels = things.slice(0, parts);
  return kp({
    key: `r:tape:${r.join(':')}:${unit}:${ask}`, topic,
    prompt: `The ratio of ${labels.join(' to ')} is ${r.join(' : ')}. There are ${total} ${things[3]} in all. How many are ${labels[ask]}?`,
    visual: { type: 'tape', parts: r.map((v, i) => ({ label: labels[i], units: v })), total },
    answer: ans(r[ask] * unit),
    hints: [`There are ${r.join(' + ')} = ${r.reduce((a, b) => a + b, 0)} equal parts.`, `Each part is ${total} ÷ ${r.reduce((a, b) => a + b, 0)} = ${unit}.`],
    explanation: `${total} ÷ ${r.reduce((a, b) => a + b, 0)} parts = ${unit} each. ${labels[ask]}: ${r[ask]} × ${unit} = ${r[ask] * unit}`,
  });
}

/* ============================ Geometry ============================ */

function geometry(mode, d) {
  const topic = 'geometry';
  if (mode === 'story') return geometryStory(d);
  const forms = by(d, ['rectA', 'rectP', 'tri'], ['tri', 'trap', 'prism', 'missing', 'Lshape'], ['circleA', 'circleC', 'Lshape', 'prism', 'missing', 'trap']);
  const f = pick(forms);
  if (f === 'rectA' || f === 'rectP') {
    const w = rand(3, 25); const h = rand(3, 25);
    const isA = f === 'rectA';
    return kp({ key: `g:${f}:${w}:${h}`, topic, prompt: `Find the ${isA ? 'area' : 'perimeter'} of the rectangle`, visual: { type: 'rect', w, h, unit: 'cm' },
      answer: ans(isA ? w * h : 2 * (w + h)), explanation: isA ? `Area = ${w} × ${h} = ${w * h} cm²` : `Perimeter = 2 × (${w} + ${h}) = ${2 * (w + h)} cm` });
  }
  if (f === 'tri') {
    const b = rand(2, 20) * 2; const h = rand(3, 18);
    return kp({ key: `g:tri:${b}:${h}`, topic, prompt: 'Find the area of the triangle', visual: { type: 'triangle', b, h, unit: 'm' },
      answer: ans((b * h) / 2), explanation: `Area = ½ × base × height = ½ × ${b} × ${h} = ${(b * h) / 2} m²` });
  }
  if (f === 'trap') {
    const a = rand(3, 12); const b = a + rand(2, 10); const h = rand(2, 10) * 2;
    return kp({ key: `g:trap:${a}:${b}:${h}`, topic, prompt: 'Find the area of the trapezoid', visual: { type: 'trapezoid', a, b, h, unit: 'in' },
      answer: ans(((a + b) / 2) * h), explanation: `Area = (${a} + ${b}) ÷ 2 × ${h} = ${((a + b) / 2) * h} in²` });
  }
  if (f === 'prism') {
    const l = rand(2, 12); const w = rand(2, 10); const h = rand(2, 9);
    const surf = d === 'challenge' && chance(0.5);
    return kp({ key: `g:prism:${l}:${w}:${h}:${surf}`, topic, prompt: `Find the ${surf ? 'surface area' : 'volume'} of the box`,
      visual: { type: 'prism', l, w, h, unit: 'ft' },
      answer: ans(surf ? 2 * (l * w + l * h + w * h) : l * w * h),
      explanation: surf ? `SA = 2(${l}·${w} + ${l}·${h} + ${w}·${h}) = ${2 * (l * w + l * h + w * h)} ft²` : `V = ${l} × ${w} × ${h} = ${l * w * h} ft³` });
  }
  if (f === 'missing') {
    const w = rand(3, 15); const l = rand(w + 1, 24);
    return kp({ key: `g:miss:${w}:${l}`, topic, prompt: `A rectangle has perimeter ${2 * (w + l)} cm and length ${l} cm. What is its area?`,
      answer: ans(w * l), hints: [`Length + width = ${2 * (w + l)} ÷ 2 = ${w + l}.`, `Width = ${w + l} − ${l} = ${w}.`],
      explanation: `Width = ${w + l} − ${l} = ${w}. Area = ${l} × ${w} = ${w * l} cm²` });
  }
  if (f === 'Lshape') {
    const W = rand(8, 16); const H = rand(8, 16); const cw = rand(2, W - 3); const ch = rand(2, H - 3);
    return kp({ key: `g:L:${W}:${H}:${cw}:${ch}`, topic, prompt: 'Find the area of the L-shaped room', visual: { type: 'lshape', W, H, cw, ch, unit: 'm' },
      answer: ans(W * H - cw * ch), hints: ['Imagine the full rectangle, then subtract the missing corner.'],
      explanation: `${W} × ${H} − ${cw} × ${ch} = ${W * H} − ${cw * ch} = ${W * H - cw * ch} m²` });
  }
  const r = rand(2, 15);
  const isA = f === 'circleA';
  return kp({ key: `g:${f}:${r}`, topic, prompt: `Find the ${isA ? 'area' : 'circumference'} of the circle (use π ≈ 3.14)`,
    visual: { type: 'circle', r, unit: 'cm' }, answer: ans(isA ? 3.14 * r * r : 2 * 3.14 * r), tolerance: 0.05,
    explanation: isA ? `A = πr² = 3.14 × ${r}² = ${fmt(round(3.14 * r * r, 2))} cm²` : `C = 2πr = 2 × 3.14 × ${r} = ${fmt(round(6.28 * r, 2))} cm` });
}

/* ========================= Coordinate Plane ========================= */

const QUAD = { 1: 'Quadrant I', 2: 'Quadrant II', 3: 'Quadrant III', 4: 'Quadrant IV' };
function coords(mode, d) {
  const topic = 'coords';
  const nz = (lo, hi) => { let v = 0; while (v === 0) v = rand(lo, hi); return v; };
  const forms = by(d, ['quad', 'which', 'dist'], ['which', 'dist', 'reflect', 'rectArea'], ['reflect', 'slope', 'mid', 'rectArea', 'dist']);
  const f = pick(forms);
  if (f === 'quad') {
    const x = nz(-8, 8); const y = nz(-8, 8);
    const q = x > 0 ? (y > 0 ? 1 : 4) : (y > 0 ? 2 : 3);
    return choice({ key: `c:quad:${x}:${y}`, topic, prompt: `Which quadrant is the point (${fmt(x)}, ${fmt(y)}) in?`,
      visual: { type: 'grid', range: 8, points: [], showQuadrants: true },
      explanation: `x is ${x > 0 ? 'positive' : 'negative'} and y is ${y > 0 ? 'positive' : 'negative'} → ${QUAD[q]}` },
    { text: QUAD[q] }, [1, 2, 3, 4].filter((k) => k !== q).map((k) => ({ text: QUAD[k] })));
  }
  if (f === 'which' || f === 'reflect') {
    const pts = [];
    const used = new Set();
    while (pts.length < 4) {
      const x = nz(-6, 6); const y = nz(-6, 6);
      if (!used.has(`${x},${y}`)) { used.add(`${x},${y}`); pts.push({ x, y }); }
    }
    const labels = ['A', 'B', 'C', 'D'];
    if (f === 'which') {
      const t = rand(0, 3);
      const P = pts.map((pt, i) => ({ ...pt, label: labels[i] }));
      return choice({ key: `c:which:${pts.map((q) => `${q.x},${q.y}`).join('|')}:${t}`, topic,
        prompt: `Which point is at (${fmt(pts[t].x)}, ${fmt(pts[t].y)})?`, visual: { type: 'grid', range: 7, points: P },
        explanation: `Go ${pts[t].x > 0 ? 'right' : 'left'} ${Math.abs(pts[t].x)}, then ${pts[t].y > 0 ? 'up' : 'down'} ${Math.abs(pts[t].y)} → point ${labels[t]}` },
      { text: `Point ${labels[t]}` }, labels.filter((_, i) => i !== t).map((l) => ({ text: `Point ${l}` })));
    }
    // reflect: P plus candidate reflections
    const P = pts[0];
    const axis = pick(['x-axis', 'y-axis']);
    const R = axis === 'x-axis' ? { x: P.x, y: -P.y } : { x: -P.x, y: P.y };
    const W1 = axis === 'x-axis' ? { x: -P.x, y: P.y } : { x: P.x, y: -P.y };
    const W2 = { x: -P.x, y: -P.y };
    const W3 = { x: P.y, y: P.x };
    const opts = shuffle([{ ...R, ok: true }, W1, W2, W3].filter((o, i, arr) => arr.findIndex((z) => z.x === o.x && z.y === o.y) === i));
    const points = [{ ...P, label: 'P', color: 'ink' }, ...opts.map((o, i) => ({ x: o.x, y: o.y, label: labels[i] }))];
    const ri = opts.findIndex((o) => o.ok);
    return choice({ key: `c:refl:${P.x}:${P.y}:${axis}`, topic, prompt: `Reflect point P over the ${axis}. Where does it land?`,
      visual: { type: 'grid', range: 7, points },
      hints: [axis === 'x-axis' ? 'Reflecting over the x-axis flips the sign of y.' : 'Reflecting over the y-axis flips the sign of x.'],
      explanation: `P(${fmt(P.x)}, ${fmt(P.y)}) → (${fmt(R.x)}, ${fmt(R.y)}) = point ${labels[ri]}` },
    { text: `Point ${labels[ri]}` }, opts.map((_, i) => i).filter((i) => i !== ri).map((i) => ({ text: `Point ${labels[i]}` })));
  }
  if (f === 'dist') {
    const horiz = chance(0.5);
    const a = nz(-7, 7); const b = nz(-7, 7); const k = nz(-6, 6);
    if (a === b) return coords(mode, d);
    const A = horiz ? { x: a, y: k } : { x: k, y: a }; const B = horiz ? { x: b, y: k } : { x: k, y: b };
    return kp({ key: `c:dist:${A.x},${A.y}:${B.x},${B.y}`, topic, prompt: `How far apart are A(${fmt(A.x)}, ${fmt(A.y)}) and B(${fmt(B.x)}, ${fmt(B.y)})?`,
      visual: { type: 'grid', range: 8, points: [{ ...A, label: 'A' }, { ...B, label: 'B' }], segments: [[A, B]] },
      answer: ans(Math.abs(a - b)),
      explanation: `Same ${horiz ? 'y' : 'x'}, so subtract the other coordinates: |${fmt(a)} − ${p(b)}| = ${Math.abs(a - b)}` });
  }
  if (f === 'rectArea') {
    const x1 = nz(-6, -1); const x2 = nz(1, 6); const y1 = nz(-6, -1); const y2 = nz(1, 6);
    const pts = [{ x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 }];
    return kp({ key: `c:rect:${x1}:${x2}:${y1}:${y2}`, topic, prompt: 'What is the area of the rectangle with these corners?',
      visual: { type: 'grid', range: 7, points: pts.map((q, i) => ({ ...q, label: 'ABCD'[i] })), polygon: pts },
      answer: ans((x2 - x1) * (y2 - y1)), hints: [`Width: ${fmt(x2)} − ${p(x1)} = ${x2 - x1}.`, `Height: ${fmt(y2)} − ${p(y1)} = ${y2 - y1}.`],
      explanation: `${x2 - x1} × ${y2 - y1} = ${(x2 - x1) * (y2 - y1)} square units` });
  }
  if (f === 'mid') {
    const x1 = rand(-7, 7); const y1 = rand(-7, 7); const x2 = x1 + 2 * nz(-3, 3); const y2 = y1 + 2 * nz(-3, 3);
    const askX = chance(0.5);
    return kp({ key: `c:mid:${x1}:${y1}:${x2}:${y2}:${askX}`, topic, prompt: `What is the ${askX ? 'x' : 'y'}-coordinate of the midpoint of (${fmt(x1)}, ${fmt(y1)}) and (${fmt(x2)}, ${fmt(y2)})?`,
      answer: ans(askX ? (x1 + x2) / 2 : (y1 + y2) / 2),
      explanation: `Average: (${fmt(askX ? x1 : y1)} + ${p(askX ? x2 : y2)}) ÷ 2 = ${fmt(askX ? (x1 + x2) / 2 : (y1 + y2) / 2)}` });
  }
  // slope
  const x1 = rand(-5, 3); const y1 = rand(-5, 5); const dx = nz(1, 5); const dy = nz(-6, 6);
  const A = { x: x1, y: y1 }; const B = { x: x1 + dx, y: y1 + dy };
  return kp({ key: `c:slope:${x1}:${y1}:${dx}:${dy}`, topic, prompt: `What is the slope of the line through A and B?`,
    visual: { type: 'grid', range: 8, points: [{ ...A, label: 'A' }, { ...B, label: 'B' }], segments: [[A, B]] },
    answer: frac(dy, dx), hint: 'Fractions are fine, e.g. -3/4',
    hints: ['Slope = rise ÷ run.', `Rise: ${fmt(B.y)} − ${p(A.y)} = ${fmt(dy)}. Run: ${fmt(B.x)} − ${p(A.x)} = ${dx}.`],
    explanation: `Slope = ${fmt(dy)} ÷ ${dx} = ${FR(dy, dx)}` });
}

/* ============================= Probability ============================= */

const MARBLE_COLORS = ['red', 'blue', 'green', 'yellow', 'purple'];
function probability(mode, d) {
  const topic = 'probability';
  const forms = by(d, ['marble', 'die', 'not'], ['marble', 'not', 'twoDice', 'coinDie'], ['twoDraw', 'twoDice', 'indep', 'atLeast']);
  const f = pick(forms);
  if (f === 'marble' || f === 'not' || f === 'twoDraw' || f === 'indep') {
    const cols = sample(MARBLE_COLORS, by(d, 2, 3, 3));
    const counts = cols.map(() => rand(1, by(d, 6, 8, 7)));
    const total = counts.reduce((a, b) => a + b, 0);
    const i = rand(0, cols.length - 1);
    const visual = { type: 'marbles', groups: cols.map((c, k) => ({ color: c, count: counts[k] })) };
    const story = mode === 'story' ? { emoji: '🎲', title: 'Mystery Bag' } : undefined;
    if (f === 'marble') {
      return kp({ key: `p:m:${counts.join(',')}:${i}`, topic, story, visual, prompt: `You pick one marble without looking. What is the probability it is ${cols[i]}? (Written P(${cols[i]}).)`,
        answer: frac(counts[i], total), hint: 'Answer as a fraction, e.g. 3/8',
        explanation: `${counts[i]} ${cols[i]} out of ${total} total = ${FR(counts[i], total)}` });
    }
    if (f === 'not') {
      return kp({ key: `p:not:${counts.join(',')}:${i}`, topic, story, visual, prompt: `What is the probability the marble is NOT ${cols[i]}?`,
        answer: frac(total - counts[i], total), hint: 'Answer as a fraction',
        explanation: `${total - counts[i]} of ${total} are not ${cols[i]}: ${FR(total - counts[i], total)}` });
    }
    if (f === 'twoDraw') {
      const c = counts[i];
      if (c < 2) return probability(mode, d);
      return kp({ key: `p:2d:${counts.join(',')}:${i}`, topic, story, visual,
        prompt: `Draw two marbles WITHOUT putting the first back. What is P(both ${cols[i]})?`,
        answer: frac(c * (c - 1), total * (total - 1)), hint: 'Answer as a fraction',
        hints: [`First draw: ${F(c, total)}.`, `Now one fewer ${cols[i]} and one fewer marble: ${F(c - 1, total - 1)}.`],
        explanation: `${F(c, total)} × ${F(c - 1, total - 1)} = ${FR(c * (c - 1), total * (total - 1))}` });
    }
    const c = counts[i];
    return kp({ key: `p:ind:${counts.join(',')}:${i}`, topic, story, visual,
      prompt: `Draw a marble, put it BACK, then draw again. What is P(${cols[i]} both times)?`,
      answer: frac(c * c, total * total), hint: 'Answer as a fraction',
      explanation: `${F(c, total)} × ${F(c, total)} = ${FR(c * c, total * total)}` });
  }
  if (f === 'die') {
    const ev = pick([['an even number', 3], ['a number greater than 4', 2], ['a 6', 1], ['a prime number', 3], ['a multiple of 3', 2]]);
    return kp({ key: `p:die:${ev[0]}`, topic, visual: { type: 'dice', count: 1 }, prompt: `Roll one die. What is the probability of rolling ${ev[0]}? (Written P(${ev[0]}).)`,
      answer: frac(ev[1], 6), hint: 'Answer as a fraction', explanation: `${ev[1]} of the 6 outcomes work: ${FR(ev[1], 6)}` });
  }
  if (f === 'twoDice') {
    const s = rand(3, 11);
    const ways = 6 - Math.abs(7 - s);
    return kp({ key: `p:2dice:${s}`, topic, visual: { type: 'dice', count: 2 }, prompt: `Roll two dice. What is P(the sum is ${s})?`,
      answer: frac(ways, 36), hint: 'Answer as a fraction',
      hints: ['There are 6 × 6 = 36 equally likely outcomes.', `List pairs that add to ${s}.`],
      explanation: `${ways} way${ways > 1 ? 's' : ''} out of 36 = ${FR(ways, 36)}` });
  }
  if (f === 'coinDie') {
    const n = rand(1, 6);
    return kp({ key: `p:cd:${n}`, topic, prompt: `Flip a coin and roll a die. What is P(heads and ${n})?`, visual: { type: 'dice', count: 1, coin: true },
      answer: '1/12', explanation: `${F(1, 2)} × ${F(1, 6)} = ${F(1, 12)}` });
  }
  // at least one head in k flips
  const k = rand(2, 4);
  return kp({ key: `p:atl:${k}`, topic, prompt: `Flip ${k} coins. What is P(at least one heads)?`, visual: { type: 'dice', count: 0, coin: true },
    answer: frac(2 ** k - 1, 2 ** k), hint: 'Answer as a fraction',
    hints: ['Find the opposite: P(no heads at all).', `P(all tails) = ${F(1, 2 ** k)}.`],
    explanation: `1 − ${F(1, 2 ** k)} = ${F(2 ** k - 1, 2 ** k)}` });
}

/* ========================= Rate, Distance & Time ========================= */

function rates(mode, d) {
  const topic = 'rates';
  const forms = by(d, ['dist', 'speed', 'time'], ['dist', 'speed', 'minutes', 'better'], ['meet', 'minutes', 'catch', 'better']);
  const f = pick(forms);
  const who = nm();
  const vehicles = [['bikes', '🚴', 8, 18], ['drives', '🚗', 35, 70], ['runs', '🏃', 4, 9], ['flies a drone', '🛸', 15, 40], ['kayaks', '🛶', 3, 6], ['takes the train', '🚆', 40, 90]];
  const [verb, emoji, vlo, vhi] = pick(vehicles);
  const story = { emoji, title: 'On the Move' };
  if (f === 'dist') {
    const r = rand(vlo, vhi); const t = pick([2, 3, 4, 1.5, 2.5]);
    return kp({ key: `rt:d:${r}:${t}`, topic, story, prompt: `${who} ${verb} at ${r} mph for ${fmt(t)} hours. How many miles?`, answer: ans(r * t),
      hints: ['distance = rate × time'], explanation: `${r} × ${fmt(t)} = ${fmt(r * t)} miles` });
  }
  if (f === 'speed') {
    const r = rand(vlo, vhi); const t = rand(2, 6);
    return kp({ key: `rt:s:${r}:${t}`, topic, story, prompt: `${who} ${verb} ${r * t} miles in ${t} hours. What is the average speed in mph?`, answer: ans(r),
      hints: ['rate = distance ÷ time'], explanation: `${r * t} ÷ ${t} = ${r} mph` });
  }
  if (f === 'time') {
    const r = rand(vlo, vhi); const t = rand(2, 8);
    return kp({ key: `rt:t:${r}:${t}`, topic, story, prompt: `${who} ${verb} ${r * t} miles at ${r} mph. How many hours does it take?`, answer: ans(t),
      hints: ['time = distance ÷ rate'], explanation: `${r * t} ÷ ${r} = ${t} hours` });
  }
  if (f === 'minutes') {
    const r = pick([12, 15, 20, 30, 40, 45, 48, 60].filter((x) => x >= vlo && x <= vhi * 1.5).concat([vhi]).slice(0, 8)); const mins = pick([10, 15, 20, 25, 30, 40, 45, 50]);
    const dd = (r * mins) / 60;
    if (dd !== Math.round(dd * 4) / 4) return rates(mode, d);
    return kp({ key: `rt:min:${r}:${mins}`, topic, story, prompt: `${who} ${verb} at ${r} mph. How many minutes to go ${fmt(dd)} miles?`, answer: ans(mins),
      hints: [`${r} mph means 1 mile every ${fmt(60 / r)} minutes.`], explanation: `${fmt(dd)} ÷ ${r} = ${fmt(mins / 60)} h = ${mins} minutes` });
  }
  if (f === 'meet') {
    const r1 = rand(30, 70); const r2 = rand(30, 70); const t = pick([1.5, 2, 2.5, 3]);
    const D = (r1 + r2) * t;
    return kp({ key: `rt:meet:${r1}:${r2}:${t}`, topic, story: { emoji: '🚆', title: 'Two Trains' },
      prompt: `Two trains start ${fmt(D)} miles apart and head toward each other at ${r1} mph and ${r2} mph. In how many hours do they meet?`,
      answer: ans(t), hints: [`Together they close ${r1} + ${r2} = ${r1 + r2} miles every hour.`],
      explanation: `${fmt(D)} ÷ ${r1 + r2} = ${fmt(t)} hours` });
  }
  if (f === 'catch') {
    const r1 = rand(3, 6); const r2 = r1 + rand(2, 4); const head = (r2 - r1) * pick([0.5, 1, 1.5, 2]);
    return kp({ key: `rt:catch:${r1}:${r2}:${head}`, topic, story: { emoji: '🏃', title: 'The Chase' },
      prompt: `${who} starts ${fmt(head)} miles ahead, running ${r1} mph. A friend chases at ${r2} mph. How many hours until the friend catches up?`,
      answer: ans(head / (r2 - r1)), hints: [`The gap shrinks by ${r2} − ${r1} = ${r2 - r1} miles each hour.`],
      explanation: `${fmt(head)} ÷ ${r2 - r1} = ${fmt(head / (r2 - r1))} hours` });
  }
  // better buy
  const item = pick(['cereal', 'juice', 'trail mix', 'pasta']);
  const s1 = pick([12, 16, 18, 20, 24]); const s2 = pick([28, 32, 36, 40, 48]);
  const u1 = pick([0.15, 0.18, 0.2, 0.22, 0.25]); let u2 = pick([0.14, 0.16, 0.19, 0.21, 0.24]);
  if (Math.abs(u1 - u2) < 0.005) u2 += 0.02;
  const p1 = round(s1 * u1, 2); const p2 = round(s2 * u2, 2);
  const firstBetter = p1 / s1 < p2 / s2;
  return choice({ key: `rt:buy:${s1}:${s2}:${p1}:${p2}`, topic, story: { emoji: '🛒', title: 'Best Buy' },
    prompt: `${item}: ${s1} oz for ${money(p1)} or ${s2} oz for ${money(p2)}. Which is the better buy?`,
    hints: ['Find the price per ounce for each.'],
    explanation: `${money(p1)} ÷ ${s1} ≈ $${(p1 / s1).toFixed(3)}/oz vs ${money(p2)} ÷ ${s2} ≈ $${(p2 / s2).toFixed(3)}/oz` },
  { text: `${firstBetter ? s1 : s2} oz` }, [{ text: `${firstBetter ? s2 : s1} oz` }, { text: 'Same price per ounce' }]);
}

/* ============================== Statistics ============================== */

function stats(mode, d) {
  const topic = 'stats';
  const forms = by(d, ['mean', 'median', 'range'], ['mean', 'median', 'mode', 'missing'], ['missing', 'median', 'newMean', 'mean']);
  const f = pick(forms);
  const n = by(d, 5, 6, 7);
  if (f === 'missing' || f === 'newMean') {
    const target = rand(70, 92); const k = by(d, 4, 4, 5);
    const vals = Array.from({ length: k - 1 }, () => target + rand(-10, 10));
    const last = target * k - vals.reduce((a, b) => a + b, 0);
    if (last < 40 || last > 100) return stats(mode, d);
    if (f === 'newMean') {
      const all = [...vals, last];
      return kp({ key: `st:nm:${all.join(',')}`, topic, story: { emoji: '📊', title: 'Test Scores' },
        prompt: `${nm()}'s test scores are ${all.join(', ')}. What is the mean score?`, visual: { type: 'bars', values: all },
        answer: ans(target), explanation: `Sum ${target * k} ÷ ${k} = ${target}` });
    }
    return kp({ key: `st:miss:${vals.join(',')}:${target}`, topic, story: { emoji: '📊', title: 'Test Scores' },
      prompt: `${nm()} scored ${vals.join(', ')} on ${k - 1} tests. What score is needed on the next test for a mean of ${target}?`,
      visual: { type: 'bars', values: [...vals, null] },
      answer: ans(last), hints: [`For a mean of ${target} over ${k} tests, the total must be ${target} × ${k} = ${target * k}.`, `So far: ${vals.reduce((a, b) => a + b, 0)}.`],
      explanation: `${target * k} − ${vals.reduce((a, b) => a + b, 0)} = ${last}` });
  }
  let vals = Array.from({ length: n }, () => rand(2, by(d, 20, 40, 60)));
  if (f === 'mean') {
    const sum = vals.reduce((a, b) => a + b, 0);
    const fix = (n - (sum % n)) % n; vals[0] += fix;
    const m = (sum + fix) / n;
    return kp({ key: `st:mean:${vals.join(',')}`, topic, prompt: `Find the mean of: ${vals.join(', ')}`, visual: { type: 'bars', values: vals },
      answer: ans(m), explanation: `Sum = ${sum + fix}. ${sum + fix} ÷ ${n} = ${m}` });
  }
  if (f === 'median') {
    const sorted = [...vals].sort((a, b) => a - b);
    const med = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    return kp({ key: `st:med:${vals.join(',')}`, topic, prompt: `Find the median of: ${vals.join(', ')}`, answer: ans(med),
      hints: ['Put the numbers in order first.'], explanation: `In order: ${sorted.join(', ')} → median ${fmt(med)}` });
  }
  if (f === 'mode') {
    const m = vals[0]; vals[rand(1, n - 1)] = m; vals[rand(1, n - 1)] = m;
    const counts = {}; vals.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
    const max = Math.max(...Object.values(counts));
    if (Object.values(counts).filter((c) => c === max).length > 1) return stats(mode, d);
    vals = shuffle(vals);
    return kp({ key: `st:mode:${vals.join(',')}`, topic, prompt: `Find the mode of: ${vals.join(', ')}`, answer: ans(m),
      explanation: `${m} appears ${max} times, more than any other value.` });
  }
  return kp({ key: `st:range:${vals.join(',')}`, topic, prompt: `Find the range of: ${vals.join(', ')}`, answer: ans(Math.max(...vals) - Math.min(...vals)),
    explanation: `${Math.max(...vals)} − ${Math.min(...vals)} = ${Math.max(...vals) - Math.min(...vals)}` });
}

/* ============================ Sequences ============================ */

function sequences(mode, d) {
  const topic = 'sequences';
  const forms = by(d, ['arith', 'geo', 'arith'], ['arith', 'geo', 'squares', 'fib', 'diff2'], ['nth', 'diff2', 'fib', 'geo', 'altern']);
  const f = pick(forms);
  let terms; let next; let expl; let prompt = 'What comes next?';
  if (f === 'arith' || f === 'nth') {
    const a = rand(-10, 30); const k = pick([2, 3, 4, 5, 6, 7, 8, 9, 11, 12, -3, -4, -6]);
    terms = [0, 1, 2, 3].map((i) => a + i * k);
    if (f === 'nth') {
      const N = pick([20, 25, 50, 100]);
      next = a + (N - 1) * k;
      return kp({ key: `seq:nth:${a}:${k}:${N}`, topic, prompt: `What is the ${N}th term?`, visual: { type: 'sequence', terms: terms.map(fmt), blank: false, more: true },
        answer: ans(next), hints: [`The pattern adds ${fmt(k)} each time.`, `From term 1 to term ${N} is ${N - 1} steps.`],
        explanation: `${fmt(a)} + ${N - 1} × ${p(k)} = ${fmt(next)}` });
    }
    next = a + 4 * k; expl = `Add ${fmt(k)} each time.`;
  } else if (f === 'geo') {
    const a = rand(1, 5); const r = pick(by(d, [2, 3], [2, 3, 4, -2], [3, -2, -3, 5]));
    terms = [0, 1, 2, 3].map((i) => a * r ** i); next = a * r ** 4; expl = `Multiply by ${fmt(r)} each time.`;
  } else if (f === 'squares') {
    const s = rand(1, 8); const off = pick([0, 0, 1, -1, 2]);
    terms = [0, 1, 2, 3].map((i) => (s + i) ** 2 + off); next = (s + 4) ** 2 + off;
    expl = `These are square numbers${off ? ` ${off > 0 ? 'plus' : 'minus'} ${Math.abs(off)}` : ''}: ${s + 4}² ${off ? (off > 0 ? `+ ${off}` : `− ${-off}`) : ''} = ${next}`;
  } else if (f === 'fib') {
    const a = rand(1, 6); const b = rand(a, 9);
    terms = [a, b]; while (terms.length < 5) terms.push(terms[terms.length - 1] + terms[terms.length - 2]);
    next = terms[3] + terms[4]; expl = 'Each term is the sum of the two before it.';
  } else if (f === 'diff2') {
    const a = rand(1, 10); const d1 = rand(1, 4); const inc = rand(1, 3);
    terms = [a]; let step = d1;
    for (let i = 0; i < 4; i++) { terms.push(terms[i] + step); step += inc; }
    next = terms[4] + step; expl = `The differences grow by ${inc}: next difference is ${step}.`;
  } else {
    const a = rand(2, 9); const k = rand(2, 5);
    terms = [a, -a * k, a * k * k, -a * k ** 3]; next = a * k ** 4; expl = `Multiply by −${k} each time.`;
  }
  return kp({ key: `seq:${f}:${terms.join(',')}`, topic, prompt, visual: { type: 'sequence', terms: terms.map(fmt), blank: true },
    answer: ans(next), hints: ['Look at how each term changes from the one before it.'], explanation: `${expl} Next: ${fmt(next)}` });
}

/* ============================ Estimation ============================ */

function estimation(mode, d) {
  const topic = 'estimation';
  const f = pick(by(d, ['mul', 'round'], ['mul', 'sqrt', 'pct'], ['sqrt', 'mul', 'pct', 'div']));
  if (f === 'sqrt') {
    const n = rand(5, by(d, 50, 99, 199));
    const r = Math.floor(Math.sqrt(n));
    if (r * r === n) return estimation(mode, d);
    const opts = [[r, r + 1], [r - 1, r], [r + 1, r + 2], [Math.floor(n / 2) - 1, Math.floor(n / 2)]];
    const uniq = opts.filter((o, i) => opts.findIndex((z) => z[0] === o[0]) === i && o[0] >= 0);
    return choice({ key: `est:sqrt:${n}`, topic, prompt: `√${n} is between which two whole numbers?`,
      explanation: `${r}² = ${r * r} and ${r + 1}² = ${(r + 1) ** 2}, and ${n} is between them.` },
    { text: `${r} and ${r + 1}` }, uniq.slice(1).map((o) => ({ text: `${o[0]} and ${o[1]}` })));
  }
  let real; let est; let expr; let how;
  if (f === 'mul') {
    const a = rand(11, 99) + rand(1, 9) / 10; const b = rand(11, 99) + rand(1, 9) / 10;
    const ra = Math.round(a / 10) * 10; const rb = Math.round(b / 10) * 10;
    real = a * b; est = ra * rb; expr = `${fmt(a)} × ${fmt(b)}`; how = `${ra} × ${rb} = ${est}`;
  } else if (f === 'div') {
    const b = rand(12, 48); const q = rand(20, 90); const a = b * q + rand(1, b - 1);
    const rb = Math.round(b / 10) * 10;
    real = a / b; est = Math.round(a / rb); expr = `${fmt(a)} ÷ ${b}`; how = `≈ ${fmt(a)} ÷ ${rb} ≈ ${est}`;
  } else if (f === 'pct') {
    const pc = pick([19, 21, 24, 26, 32, 49, 51, 74]); const base = rand(150, 900);
    const nice = Math.round(pc / 25) * 25 || 20;
    real = (pc * base) / 100; est = Math.round((nice * base) / 100); expr = `${pc}% of ${base}`; how = `${pc}% ≈ ${nice}%, so about ${fmt(est)}`;
  } else {
    const a = rand(101, 999); const b = rand(101, 999);
    real = a + b; est = Math.round(a / 100) * 100 + Math.round(b / 100) * 100; expr = `${a} + ${b}`; how = `${Math.round(a / 100) * 100} + ${Math.round(b / 100) * 100} = ${est}`;
  }
  const correct = est;
  const mag = 10 ** Math.max(0, Math.floor(Math.log10(Math.abs(correct))) - 1);
  const snap = (v) => Math.round(v / mag) * mag;
  const wrongs = [...new Set([snap(correct * 1.6), snap(correct * 0.55), snap(correct * 10), snap(correct / 10)])].filter((w) => w !== correct && w > 0).slice(0, 3);
  return choice({ key: `est:${f}:${expr}`, topic, prompt: `Which is the best estimate of ${expr}?`, explanation: `Round first: ${how}. The exact answer is ${fmt(round(real, 2))}.` },
    { text: fmt(correct) }, wrongs.map((w) => ({ text: fmt(w) })));
}

/* ============================ Logic riddles ============================ */

function isPrime(n) { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
function logic(mode, d) {
  const topic = 'logic';
  const max = by(d, 60, 100, 200);
  for (let t = 0; t < 40; t++) {
    const n = rand(10, max - 1);
    const lo = Math.max(1, n - rand(4, 20)); const hi = Math.min(max + 20, n + rand(4, 20));
    const range = { t: `I am between ${lo} and ${hi}.`, f: (x) => x > lo && x < hi };
    const cands = [
      ...[3, 4, 5, 6, 7, 8, 9, 11, 12].filter((k) => n % k === 0).map((k) => ({ t: `I am a multiple of ${k}.`, f: (x) => x % k === 0 })),
      ...[3, 4, 5, 7, 9].filter((k) => n % k !== 0).map((k) => ({ t: `I am not a multiple of ${k}.`, f: (x) => x % k !== 0 })),
      { t: n % 2 ? 'I am odd.' : 'I am even.', f: (x) => x % 2 === n % 2 },
      { t: `The sum of my digits is ${digitSum(n)}.`, f: (x) => digitSum(x) === digitSum(n) },
      ...(d !== 'easy' ? [{ t: isPrime(n) ? 'I am a prime number.' : 'I am not prime.', f: (x) => isPrime(x) === isPrime(n) }] : []),
      ...(d === 'challenge' && n % 10 !== 0 ? [{ t: `My ones digit is ${n % 10 > Math.floor(n / 10) % 10 ? 'greater' : n % 10 === Math.floor(n / 10) % 10 ? 'equal to' : 'less'} than my tens digit.`,
        f: (x) => Math.sign((x % 10) - (Math.floor(x / 10) % 10)) === Math.sign((n % 10) - (Math.floor(n / 10) % 10)) }] : []),
    ];
    let pool = Array.from({ length: max + 40 }, (_, i) => i + 1).filter(range.f);
    const chosen = [range];
    for (const c of shuffle(cands)) {
      if (pool.length === 1) break;
      const np = pool.filter(c.f);
      if (np.length < pool.length && np.includes(n)) { pool = np; chosen.push(c); }
    }
    if (pool.length === 1 && chosen.length >= by(d, 2, 3, 3) && chosen.length <= by(d, 4, 5, 6)) {
      const clues = shuffle(chosen.slice(1)); clues.unshift(range);
      return kp({ key: `logic:${n}:${clues.map((c) => c.t).join('|')}`, topic, prompt: 'I am thinking of a number. Use every clue!',
        visual: { type: 'clues', items: clues.map((c) => c.t) }, answer: ans(n),
        hints: ['List the numbers in the range first.', 'Cross out numbers that break each clue.'],
        explanation: `Only ${n} fits every clue.` });
    }
  }
  return logic(mode, 'easy');
}

/* ============================== Stories ============================== */

function arithmeticStory(topic, d) {
  const who = nm(); const [a1, a2] = two();
  const T = {
    add: () => {
      if (d === 'easy') {
        const x = rand(120, 480); const y = rand(120, 480);
        return { e: '📚', title: 'Read-a-thon', text: `${who} read ${x} pages in October and ${y} pages in November.`, q: 'How many pages in all?', a: x + y, hints: [`Add ${x} + ${y}.`], ex: `${x} + ${y} = ${x + y}` };
      }
      if (d === 'challenge') {
        const parts = [rand(12000, 48000), rand(8000, 35000), rand(15000, 52000), rand(9000, 29000), rand(11000, 41000)].map((v) => v / 100);
        const tot = round(parts.reduce((a, b) => a + b, 0), 2);
        return { e: '🏫', title: 'Class Trip Fund', text: `A class raised ${parts.map(money).join(', ')} at five fundraisers.`, q: 'How many dollars did they raise in all?', a: tot,
          hints: ['Line up the decimal points.', 'Add two amounts at a time.'], ex: `The five amounts add up to ${fmt(tot)}.` };
      }
      const days = [rand(1200, 4800), rand(800, 3500), rand(1500, 5200)].map((v) => v / 100);
      const s = round(days.reduce((a, b) => a + b, 0), 2);
      const goal = Math.ceil(s / 50) * 50 + 50;
      return { e: '🍋', title: 'Lemonade Stand', text: `${a1} and ${a2} earned ${days.map(money).join(', ')} over three days. Their goal is $${goal}.`,
        q: 'How many more dollars do they need to reach the goal?', a: round(goal - s, 2),
        hints: [`Step 1: add the three days: ${money(s)}.`, `Step 2: subtract from $${goal}.`], ex: `${goal} − ${fmt(s)} = ${fmt(round(goal - s, 2))}` };
    },
    sub: () => {
      const start = rand(10000, 60000); const trip = rand(300, 2400);
      if (d === 'easy') return { e: '🚗', title: 'Road Trip', text: `The car's odometer read ${fmt(start)} miles before a trip and ${fmt(start + trip)} after.`, q: 'How many miles was the trip?', a: trip, hints: ['Subtract the start from the end.'], ex: `${fmt(start + trip)} − ${fmt(start)} = ${fmt(trip)}` };
      const price = rand(1250, 4875) / 100; const paid = Math.ceil(price / 20) * 20 + (d === 'challenge' ? 20 : 0);
      const coupon = d === 'challenge' ? rand(3, 8) : 0;
      return { e: '🧾', title: 'Making Change', text: `${who} buys art supplies for ${money(price)}${coupon ? ` and uses a $${coupon} coupon` : ''}, paying with $${paid}.`,
        q: 'How much change, in dollars?', a: round(paid - price + coupon, 2),
        hints: coupon ? [`Price after coupon: ${money(price - coupon)}.`, `Change: ${paid} − ${fmt(round(price - coupon, 2))}.`] : [`Subtract ${money(price)} from $${paid}.`], ex: `${paid} − ${fmt(round(price - coupon, 2))} = ${fmt(round(paid - price + coupon, 2))}` };
    },
    mul: () => {
      const n = rand(3, 9); const pr = rand(150, 899) / 100; const extra = rand(1500, 4500) / 100;
      if (d === 'easy') { const rows = rand(12, 30); const per = rand(8, 24); return { e: '🌱', title: 'Garden Rows', text: `A garden has ${rows} rows with ${per} plants in each row.`, q: 'How many plants?', a: rows * per, hints: [`Multiply ${rows} × ${per}.`], ex: `${rows} × ${per} = ${rows * per}` }; }
      if (d === 'challenge') {
        const q1 = rand(12, 36); const p1 = rand(35, 189) / 100; const q2 = rand(6, 18); const p2 = rand(145, 649) / 100;
        return { e: '🎒', title: 'Classroom Supplies', text: `A teacher buys ${q1} pencil packs at ${money(p1)} each and ${q2} markers at ${money(p2)} each.`, q: 'What is the total cost, in dollars?', a: round(q1 * p1 + q2 * p2, 2),
          hints: [`Packs: ${q1} × ${money(p1)} = ${money(q1 * p1)}.`, `Markers: ${q2} × ${money(p2)}.`, 'Add the two totals.'], ex: `${fmt(round(q1 * p1, 2))} + ${fmt(round(q2 * p2, 2))} = ${fmt(round(q1 * p1 + q2 * p2, 2))}` };
      }
      return { e: '🎒', title: 'Back to School', text: `${who} buys ${n} notebooks at ${money(pr)} each and a backpack for ${money(extra)}.`,
        q: 'What is the total cost, in dollars?', a: round(n * pr + extra, 2), hints: [`Notebooks: ${n} × ${money(pr)} = ${money(n * pr)}.`, `Add the backpack.`], ex: `${fmt(round(n * pr, 2))} + ${fmt(extra)} = ${fmt(round(n * pr + extra, 2))}` };
    },
    div: () => {
      if (d === 'challenge') {
        const n = rand(3, 9); const each = rand(215, 899) / 100;
        return { e: '🍕', title: 'Sharing the Bill', text: `${n} friends split a $${fmt(round(n * each, 2))} bill equally.`, q: 'How many dollars does each friend pay?', a: each,
          hints: [`Divide ${fmt(round(n * each, 2))} by ${n}.`, 'Keep the decimal point in line.'], ex: `${fmt(round(n * each, 2))} ÷ ${n} = ${fmt(each)}` };
      }
      if (d === 'standard') {
        const cap = pick([24, 28, 32, 36, 44, 48]); const kids = cap * rand(3, 8) + rand(1, cap - 1);
        return { e: '🚌', title: 'Field Trip', text: `${kids} students are going on a field trip. Each bus holds ${cap} students.`, q: 'How many buses are needed?', a: Math.ceil(kids / cap),
          hints: [`${kids} ÷ ${cap} = ${Math.floor(kids / cap)} remainder ${kids % cap}.`, 'Can the leftover students stay home?'], ex: `${Math.floor(kids / cap)} full buses + 1 more for the remaining ${kids % cap}.` };
      }
      const per = pick([6, 8, 12, 15, 16, 24]); const boxes = rand(12, 60);
      return { e: '🍪', title: 'Bake Sale', text: `The club baked ${per * boxes} cookies and packs them ${per} to a box.`, q: 'How many boxes do they fill?', a: boxes, hints: [`Divide ${per * boxes} by ${per}.`], ex: `${per * boxes} ÷ ${per} = ${boxes}` };
    },
  };
  const s = T[topic]();
  return kp({ key: `story:${topic}:${s.title}:${s.a}:${s.text.length}`, topic, story: { emoji: s.e, title: s.title }, prompt: `${s.text} ${s.q}`, answer: ans(s.a), hints: s.hints, explanation: s.ex });
}

function integerStory(d) {
  const t0 = d === 'easy' ? rand(-6, 4) : rand(-15, 5); const up = d === 'easy' ? rand(3, 10) : rand(6, 25); const down = d === 'easy' ? rand(2, 8) : rand(3, 18);
  if (chance(0.5)) {
    const r = t0 + up - down;
    return kp({ key: `story:int:temp:${t0}:${up}:${down}`, topic: 'integers', story: { emoji: '🌡️', title: 'Wild Weather' },
      prompt: `At dawn it was ${fmt(t0)}°F. By noon the temperature rose ${up}°, then fell ${down}° by evening. What was the evening temperature?`,
      answer: ans(r), hints: [`${fmt(t0)} + ${up} = ${fmt(t0 + up)}.`, `${fmt(t0 + up)} − ${down}.`], explanation: `${fmt(t0)} + ${up} − ${down} = ${fmt(r)}°F` });
  }
  const depth = d === 'easy' ? -rand(5, 30) : -rand(20, 120); const rise = d === 'easy' ? rand(3, 15) : rand(5, 40); const dive = d === 'easy' ? rand(4, 20) : rand(10, 60);
  const r = depth + rise - dive;
  return kp({ key: `story:int:sub:${depth}:${rise}:${dive}`, topic: 'integers', story: { emoji: '🤿', title: 'Deep Dive' },
    prompt: `A submarine is at ${fmt(depth)} m. It rises ${rise} m, then dives ${dive} m${d === 'challenge' ? ', and then repeats the dive' : ''}. What is its final elevation?`,
    answer: ans(d === 'challenge' ? r - dive : r), hints: ['Below sea level is negative. Rising adds, diving subtracts.'],
    explanation: `${fmt(depth)} + ${rise} − ${dive}${d === 'challenge' ? ` − ${dive}` : ''} = ${fmt(d === 'challenge' ? r - dive : r)} m` });
}

function fractionStory(d) {
  const who = nm();
  const f = pick(by(d, ['pizza', 'ribbon'], ['pizza', 'recipe', 'ribbon'], ['recipe', 'trail', 'savings']));
  if (f === 'pizza') {
    const den = pick([8, 12]); const a = rand(1, den / 2 - 1); const b = rand(1, den / 2 - 1);
    return kp({ key: `story:fd:pizza:${a}:${b}:${den}`, topic: 'fracdec', story: { emoji: '🍕', title: 'Pizza Night' },
      prompt: `A pizza is cut into ${den} slices. ${who} eats ${a} and a friend eats ${b}. What fraction of the pizza is left?`, answer: frac(den - a - b, den),
      visual: { type: 'pie', parts: den, shaded: a + b }, hints: [`${a} + ${b} = ${a + b} slices eaten.`, `${den} − ${a + b} = ${den - a - b} slices left out of ${den}.`],
      explanation: `${F(den - a - b, den)} = ${FR(den - a - b, den)}`, hint: 'Answer as a fraction' });
  }
  if (f === 'ribbon') {
    const len = rand(3, 9) * 4; const pieceD = pick([2, 4]);
    return kp({ key: `story:fd:rib:${len}:${pieceD}`, topic: 'fracdec', story: { emoji: '🎀', title: 'Ribbon Crafts' },
      prompt: `${who} has ${len} feet of ribbon and cuts it into pieces that are ${F(1, pieceD)} foot long. How many pieces?`,
      answer: ans(len * pieceD), hints: [`How many ${F(1, pieceD)}s fit in 1 foot? ${pieceD}.`], explanation: `${len} ÷ ${F(1, pieceD)} = ${len} × ${pieceD} = ${len * pieceD}` });
  }
  if (f === 'recipe') {
    const cupsN = pick([1, 2, 3, 5]); const cupsD = pick([2, 3, 4]); const serv = pick([4, 6, 8]); const want = serv * pick([2, 3]) / pick([1, 2]);
    if (want === serv) return fractionStory(d);
    return kp({ key: `story:fd:rec:${cupsN}:${cupsD}:${serv}:${want}`, topic: 'fracdec', story: { emoji: '🥞', title: 'Pancake Breakfast' },
      prompt: `A recipe uses ${F(cupsN, cupsD)} cup of milk for ${serv} pancakes. How many cups for ${want} pancakes?`, answer: frac(cupsN * want, cupsD * serv),
      hints: [`Scale factor: ${want} ÷ ${serv} = ${FR(want, serv)}.`, `Multiply ${F(cupsN, cupsD)} by that.`], explanation: `${F(cupsN, cupsD)} × ${FR(want, serv)} = ${FR(cupsN * want, cupsD * serv)} cups`, hint: 'Fraction or decimal' });
  }
  if (f === 'trail') {
    const total = rand(4, 12); const d1 = pick([3, 4, 5]); const n1 = rand(1, d1 - 1);
    return kp({ key: `story:fd:trail:${total}:${n1}:${d1}`, topic: 'fracdec', story: { emoji: '🥾', title: 'Trail Hike' },
      prompt: `A trail is ${total}${F(1, 2)} miles long. ${who} has hiked ${F(n1, d1)} of it. How many miles are left?`,
      answer: frac((2 * total + 1) * (d1 - n1), 2 * d1), hints: [`Fraction left: 1 − ${F(n1, d1)} = ${F(d1 - n1, d1)}.`, `${F(d1 - n1, d1)} × ${F(2 * total + 1, 2)}.`],
      explanation: `${F(d1 - n1, d1)} × ${F(2 * total + 1, 2)} = ${FR((2 * total + 1) * (d1 - n1), 2 * d1)} miles` });
  }
  const save = rand(20, 60) * 5; const spendF = pick([[1, 4], [1, 3], [2, 5], [3, 8]]); const giveF = pick([[1, 2], [1, 3], [1, 4]]);
  const afterSpend = save - (save * spendF[0]) / spendF[1];
  const left = afterSpend - (afterSpend * giveF[0]) / giveF[1];
  if (left !== Math.round(left * 100) / 100) return fractionStory('standard');
  return kp({ key: `story:fd:save:${save}:${spendF}:${giveF}`, topic: 'fracdec', story: { emoji: '🐷', title: 'Piggy Bank' },
    prompt: `${who} saved $${save}. ${who} spent ${F(...spendF)} of it on a game, then gave ${F(...giveF)} of what was left to charity. How many dollars remain?`,
    answer: ans(round(left, 2)), hints: [`After the game: ${fmt(afterSpend)}.`, `Charity gets ${F(...giveF)} of ${fmt(afterSpend)}.`], explanation: `$${fmt(afterSpend)} − $${fmt(afterSpend - left)} = $${fmt(left)}` });
}

function percentStory(d) {
  const who = nm();
  const f = pick(by(d, ['sale', 'tip'], ['sale', 'tip', 'tax'], ['saleTax', 'change', 'reverse']));
  if (f === 'sale') {
    const price = pick([40, 60, 80, 120, 150, 90]); const pc = pick([10, 20, 25, 30, 40]);
    return kp({ key: `story:r:sale:${price}:${pc}`, topic: 'ratio', story: { emoji: '🏷️', title: 'Big Sale' },
      prompt: `A jacket costs $${price}. It is ${pc}% off. What is the sale price in dollars?`, answer: ans(price * (1 - pc / 100)),
      hints: [`Discount: ${pc}% of ${price} = ${fmt((price * pc) / 100)}.`, 'Subtract the discount.'], explanation: `${price} − ${fmt((price * pc) / 100)} = ${fmt(price * (1 - pc / 100))}` });
  }
  if (f === 'tip') {
    const bill = rand(18, 90); const pc = pick([15, 18, 20]);
    return kp({ key: `story:r:tip:${bill}:${pc}`, topic: 'ratio', story: { emoji: '🍽️', title: 'Dinner Out' },
      prompt: `The family's dinner bill is $${bill}. They leave a ${pc}% tip. What is the total, in dollars?`, answer: ans(round(bill * (1 + pc / 100), 2)), tolerance: 0.011,
      hints: [`Tip: ${fmt(pc / 100)} × ${bill} = ${fmt(round((bill * pc) / 100, 2))}.`], explanation: `${bill} + ${fmt(round((bill * pc) / 100, 2))} = ${fmt(round(bill * (1 + pc / 100), 2))}` });
  }
  if (f === 'tax') {
    const price = rand(20, 200); const pc = pick([5, 6, 7, 8]);
    return kp({ key: `story:r:tax:${price}:${pc}`, topic: 'ratio', story: { emoji: '🎧', title: 'Headphones' },
      prompt: `Headphones cost $${price} plus ${pc}% sales tax. What is the total, in dollars?`, answer: ans(round(price * (1 + pc / 100), 2)), tolerance: 0.011,
      hints: [`Tax: ${fmt(pc / 100)} × ${price}.`], explanation: `${price} × ${fmt(1 + pc / 100)} = ${fmt(round(price * (1 + pc / 100), 2))}` });
  }
  if (f === 'saleTax') {
    const price = pick([40, 60, 80, 100, 120, 200]); const off = pick([20, 25, 30, 40]); const tax = pick([5, 8, 10]);
    const sale = price * (1 - off / 100); const tot = round(sale * (1 + tax / 100), 2);
    return kp({ key: `story:r:st:${price}:${off}:${tax}`, topic: 'ratio', story: { emoji: '🛍️', title: 'Sale + Tax' },
      prompt: `Sneakers cost $${price}. They're ${off}% off, then ${tax}% tax is added to the sale price. What is the final cost, in dollars?`, answer: ans(tot), tolerance: 0.011,
      hints: [`Sale price: ${price} × ${fmt(1 - off / 100)} = ${fmt(sale)}.`, `Add tax: ${fmt(sale)} × ${fmt(1 + tax / 100)}.`], explanation: `$${fmt(sale)} × ${fmt(1 + tax / 100)} = $${fmt(tot)}` });
  }
  if (f === 'change') {
    const a = pick([20, 25, 40, 50, 80]); const pc = pick([20, 25, 40, 50, 60, 75]); const b = a * (1 + pc / 100);
    return kp({ key: `story:r:chg:${a}:${pc}`, topic: 'ratio', story: { emoji: '📈', title: 'Growing Channel' },
      prompt: `${who}'s science channel grew from ${a * 100} to ${fmt(b * 100)} subscribers. What was the percent increase?`, answer: ans(pc),
      hints: [`Increase: ${fmt(b * 100 - a * 100)}.`, `Divide by the ORIGINAL amount, ${a * 100}.`], explanation: `${fmt((b - a) * 100)} ÷ ${a * 100} = ${fmt(pc / 100)} = ${pc}%` });
  }
  const pc = pick([20, 25, 40]); const orig = pick([60, 80, 120, 160]);
  return kp({ key: `story:r:rev:${pc}:${orig}`, topic: 'ratio', story: { emoji: '🎮', title: 'Mystery Price' },
    prompt: `After a ${pc}% discount, a game costs $${fmt(orig * (1 - pc / 100))}. What was the original price, in dollars?`, answer: ans(orig),
    hints: [`$${fmt(orig * (1 - pc / 100))} is ${100 - pc}% of the original.`], explanation: `${fmt(orig * (1 - pc / 100))} ÷ ${fmt(1 - pc / 100)} = ${orig}` });
}

function algebraStory(d) {
  const who = nm();
  const f = pick(by(d, ['plan', 'tickets'], ['plan', 'tickets', 'consec'], ['consec', 'ages', 'plan2']));
  if (f === 'plan' || f === 'plan2') {
    const base = rand(10, 30); const per = pick([2, 3, 4, 5]); const gb = rand(2, 12);
    const fee = f === 'plan2' ? rand(5, 12) : 0;
    return kp({ key: `story:alg:plan:${base}:${per}:${gb}:${fee}`, topic: 'algebra', story: { emoji: '📱', title: 'Phone Plan' },
      prompt: `A phone plan costs $${base} a month plus $${per} per GB of data${fee ? `, plus a one-time $${fee} activation fee` : ''}. ${who}'s first bill was $${base + per * gb + fee}. How many GB were used?`,
      answer: ans(gb), hints: [`Write it: ${base}${fee ? ` + ${fee}` : ''} + ${per}g = ${base + per * gb + fee}.`, `Subtract ${base + fee}, then divide by ${per}.`],
      explanation: `${per}g = ${per * gb}, so g = ${gb}` });
  }
  if (f === 'tickets') {
    const adult = pick([8, 10, 12, 15]); const kid = pick([4, 5, 6]); const a = rand(2, 6); const k = rand(2, 9);
    return kp({ key: `story:alg:tix:${adult}:${kid}:${a}:${k}`, topic: 'algebra', story: { emoji: '🎟️', title: 'Museum Trip' },
      prompt: `Adult tickets cost $${adult} and student tickets cost $${kid}. A group with ${a} adults paid $${a * adult + k * kid}. How many students went?`,
      answer: ans(k), hints: [`Adults paid ${a} × ${adult} = ${a * adult}.`, `Students paid ${a * adult + k * kid} − ${a * adult} = ${k * kid}.`], explanation: `${k * kid} ÷ ${kid} = ${k} students` });
  }
  if (f === 'consec') {
    const n = rand(8, 60); const cnt = by(d, 3, 3, pick([3, 4]));
    const even = d === 'challenge' && chance(0.5);
    const step = even ? 2 : 1; const start = even ? n * 2 : n;
    const sum = Array.from({ length: cnt }, (_, i) => start + i * step).reduce((a, b) => a + b, 0);
    return kp({ key: `story:alg:con:${start}:${cnt}:${step}`, topic: 'algebra', story: { emoji: '🔢', title: 'Number Puzzle' },
      prompt: `The sum of ${cnt} consecutive ${even ? 'even ' : ''}numbers is ${sum}. What is the smallest number?`, answer: ans(start),
      hints: [`Let n be the smallest: n + (n + ${step}) + … = ${sum}.`, `${cnt}n + ${(step * cnt * (cnt - 1)) / 2} = ${sum}.`],
      explanation: `${cnt}n = ${sum - (step * cnt * (cnt - 1)) / 2}, so n = ${start}` });
  }
  const kidAge = rand(4, 12); const mult = rand(2, 4); const yrs = rand(2, 8);
  const sum = kidAge * mult + yrs + kidAge + yrs;
  return kp({ key: `story:alg:ages:${kidAge}:${mult}:${yrs}`, topic: 'algebra', story: { emoji: '🎂', title: 'Age Puzzle' },
    prompt: `${who}'s aunt is ${mult} times as old as ${who}. In ${yrs} years, the sum of their ages will be ${sum}. How old is ${who} now?`,
    answer: ans(kidAge), hints: [`Let a = ${who}'s age. Aunt = ${mult}a.`, `(a + ${yrs}) + (${mult}a + ${yrs}) = ${sum}.`], explanation: `${mult + 1}a + ${2 * yrs} = ${sum} → a = ${kidAge}` });
}

function geometryStory(d) {
  const who = nm();
  const f = pick(by(d, ['fence', 'tiles'], ['fence', 'tiles', 'paint'], ['paint', 'pool', 'fence']));
  if (f === 'fence') {
    const w = rand(8, 30); const l = rand(10, 40); const cost = pick([2, 3, 4, 5]) + (d === 'challenge' ? 0.5 : 0);
    const P = 2 * (w + l);
    return kp({ key: `story:g:fence:${w}:${l}:${cost}`, topic: 'geometry', story: { emoji: '🏡', title: 'New Fence' },
      prompt: `${who}'s family is fencing a ${l} ft by ${w} ft garden. Fencing costs $${fmt(cost)} per foot. What will it cost, in dollars?`, visual: { type: 'rect', w: l, h: w, unit: 'ft' },
      answer: ans(P * cost), hints: [`Perimeter: 2 × (${l} + ${w}) = ${P} ft.`, `Multiply by $${fmt(cost)}.`], explanation: `${P} × ${fmt(cost)} = $${fmt(P * cost)}` });
  }
  if (f === 'tiles') {
    const w = rand(6, 16); const l = rand(8, 20); const t = pick([1, 2]);
    const tiles = (w * l) / (t * t);
    if (tiles !== Math.round(tiles)) return geometryStory(d);
    return kp({ key: `story:g:tile:${w}:${l}:${t}`, topic: 'geometry', story: { emoji: '🧱', title: 'Tiling the Floor' },
      prompt: `A room is ${l} ft by ${w} ft. Square tiles are ${t} ft on each side. How many tiles cover the floor?`, answer: ans(tiles),
      hints: [`Floor area: ${l * w} ft².`, `Each tile covers ${t * t} ft².`], explanation: `${l * w} ÷ ${t * t} = ${tiles} tiles` });
  }
  if (f === 'paint') {
    const l = rand(10, 16); const w = rand(9, 14); const h = 8; const can = pick([350, 400]);
    const wall = 2 * (l + w) * h; const door = 21;
    const net = wall - door;
    return kp({ key: `story:g:paint:${l}:${w}:${can}`, topic: 'geometry', story: { emoji: '🎨', title: 'Painting a Room' },
      prompt: `A bedroom is ${l} ft by ${w} ft with ${h} ft walls. Skip a 3 ft × 7 ft door. One can covers ${can} ft². How many cans are needed (whole cans)?`,
      answer: ans(Math.ceil(net / can)), hints: [`Wall area: 2 × (${l} + ${w}) × ${h} = ${wall} ft².`, `Minus the door: ${net} ft².`, `${net} ÷ ${can}, then round UP.`],
      explanation: `${net} ÷ ${can} ≈ ${fmt(round(net / can, 2))} → ${Math.ceil(net / can)} cans` });
  }
  const l = rand(8, 20); const w = rand(5, 12); const dep = rand(3, 6);
  return kp({ key: `story:g:pool:${l}:${w}:${dep}`, topic: 'geometry', story: { emoji: '🏊', title: 'Filling the Pool' },
    prompt: `A pool is ${l} m long, ${w} m wide, and ${dep} m deep. 1 m³ holds 1,000 liters. How many liters fill it?`,
    answer: ans(l * w * dep * 1000), visual: { type: 'prism', l, w, h: dep, unit: 'm' }, hints: [`Volume: ${l} × ${w} × ${dep} = ${l * w * dep} m³.`], explanation: `${l * w * dep} × 1,000 = ${fmt(l * w * dep * 1000)} L` });
}

/* ============================== Registry ============================== */

const ARITH = { add: addition, sub: subtraction, mul: multiplication, div: division };

export default {
  age: 12,
  title: 'Problem Solvers',
  tagline: 'Fractions, algebra, ratios & real-world STEM',
  accent: 'indigo',
  allowRetry: false,
  bigInput: false,
  readAloud: false,
  keypad: 'full',
  topics: [
    { id: 'add', label: 'Addition', group: 'Operations', modes: ['flash', 'worksheet', 'story'] },
    { id: 'sub', label: 'Subtraction', group: 'Operations', modes: ['flash', 'worksheet', 'story'] },
    { id: 'mul', label: 'Multiplication', group: 'Operations', modes: ['flash', 'worksheet', 'story'] },
    { id: 'div', label: 'Division', group: 'Operations', modes: ['flash', 'worksheet', 'story'] },
    { id: 'integers', label: 'Negative Numbers', group: 'Operations', modes: ['flash', 'worksheet', 'story'] },
    { id: 'fracdec', label: 'Fractions & Decimals', group: 'Number Sense', modes: ['flash', 'worksheet', 'story'] },
    { id: 'ratio', label: 'Ratios & Percentages', group: 'Number Sense', modes: ['flash', 'worksheet', 'story', 'stem'] },
    { id: 'estimation', label: 'Estimation', group: 'Number Sense', modes: ['stem'] },
    { id: 'algebra', label: 'Pre-Algebra Equations', group: 'Algebra & Logic', modes: ['flash', 'worksheet', 'story', 'stem'] },
    { id: 'sequences', label: 'Patterns & Sequences', group: 'Algebra & Logic', modes: ['stem'] },
    { id: 'logic', label: 'Logic Riddles', group: 'Algebra & Logic', modes: ['stem'] },
    { id: 'geometry', label: 'Area, Perimeter & Volume', group: 'Geometry & Data', modes: ['worksheet', 'story', 'stem'] },
    { id: 'coords', label: 'Coordinate Plane', group: 'Geometry & Data', modes: ['worksheet', 'stem'] },
    { id: 'probability', label: 'Probability', group: 'Geometry & Data', modes: ['worksheet', 'story', 'stem'] },
    { id: 'rates', label: 'Rate, Distance & Time', group: 'Geometry & Data', modes: ['worksheet', 'story', 'stem'] },
    { id: 'stats', label: 'Mean, Median & Mode', group: 'Geometry & Data', modes: ['worksheet', 'stem'] },
  ],
  difficulties: [
    { id: 'easy', label: 'Warm-up', detail: 'Facts to 12×12, 2–3 digit numbers, one-step equations, simple fractions' },
    { id: 'standard', label: 'Advanced', detail: '4-digit & decimal operations, unlike denominators, two-step equations, percents' },
    { id: 'challenge', label: 'Challenge', detail: 'Grade 7–8 reach: variables on both sides, percent change, compound probability, slope' },
  ],
  defaultDifficulty: 'standard',
  defaults: {
    flash: { seconds: 60, maxCards: 60 },
    worksheet: { count: 15 },
    story: { count: 6 },
    stem: { count: 8 },
    mix: { count: 12 },
  },
  countOptions: { worksheet: [10, 15, 20], story: [4, 6, 8, 10], stem: [6, 8, 10, 12], mix: [8, 12, 16] },
  secondsOptions: [60, 90, 120, 180],
  expectedMs: { flash: 6000, worksheet: 35000, story: 75000, stem: 60000, mix: 45000 },

  generate(mode, topic, difficulty = 'standard') {
    const d = L(difficulty);
    if (middleEarthOn() && chance(THEME_RATE)) {
      const themed = themed12(mode, topic, d);
      if (themed) return themed;
    }
    if (ARITH[topic]) return mode === 'story' ? arithmeticStory(topic, d) : ARITH[topic](mode, d);
    switch (topic) {
      case 'integers': return integers(mode, d);
      case 'fracdec': return fracdec(mode, d);
      case 'algebra': return algebra(mode, d);
      case 'ratio': return ratio(mode, d);
      case 'geometry': return geometry(mode, d);
      case 'coords': return coords(mode, d);
      case 'probability': return withFractionNote(probability(mode, d));
      case 'rates': return rates(mode, d);
      case 'stats': return stats(mode, d);
      case 'sequences': return sequences(mode, d);
      case 'estimation': return estimation(mode, d);
      case 'logic': return logic(mode, d);
      default: return null;
    }
  },
};

export { nearby, distinctInts };
