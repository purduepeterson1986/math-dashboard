// Cross-age check: do the difficulty levels of the SAME topic form one rising ladder across ages?
//   e.g. Age 7 Challenge addition should not be easier than Age 7 Easy, and Age 8 Easy addition should
//   not sit far below Age 7 Challenge (a step back) or far above it (a leap).
// Measured with the biggest number a child sees in a question (a blunt but honest yardstick);
// the report also prints sample questions so a human can judge the flagged spots.
import { CURRICULA } from '../src/curriculum/index.js';
import { setMiddleEarth } from '../src/curriculum/middleEarth.js';

// Topics with different ids in different ages, grouped into one family
export const FAMILY = {
  count5: 'counting', count10: 'counting', count20: 'counting', teens: 'counting',
  shapes: 'shapes', geometry: 'shapes',
  graphs: 'data', data: 'data',
  add: 'add', sub: 'sub', compare: 'compare', skip: 'skip', time: 'time', money: 'money', measure: 'measure',
  fractions: 'fractions', placevalue: 'placevalue', rounding: 'placevalue', patterns: 'patterns', bonds: 'bonds', mul: 'mul', div: 'div',
};
// Only these families get findings: for the others (shapes, patterns, skip counting, graphs, measuring, time)
// the size of the numbers says little about difficulty, so they are listed in the table but never flagged.
export const NUMERIC = new Set(['counting', 'compare', 'add', 'sub', 'bonds', 'placevalue', 'mul', 'div', 'money']);
// Difficulty score of one number: whole digits, plus a digit for each decimal place (0.25 is harder than 25 to a child)
const score = (tok) => { const [w, f = ''] = tok.split('.'); return (w === '0' ? 0 : w.length) + (f ? 1 + f.length * 0.8 : 0); };
const tokens = (q) => [q.prompt, q.display, q.answerLabel].join(' ').replace(/(\d),(?=\d{3})/g, '$1').match(/\d+(\.\d+)?/g) || [];
const maxNum = (q) => Math.max(0, ...tokens(q).map(score));
const MODES = ['flash', 'worksheet', 'story', 'stem'];

/** Typical (median-of-questions) hardest-number score per age / family / level. */
export function measureLadder({ N = 500 } = {}) {
  const rungs = {}; // family -> [{age, level, idx, mag, shown}]
  for (const [age, cur] of Object.entries(CURRICULA)) {
    for (const topic of cur.topics) {
      const fam = FAMILY[topic.id];
      if (!fam) continue;
      cur.difficulties.forEach((dif, idx) => {
        const vals = []; const shown = [];
        setMiddleEarth(false);
        for (let i = 0; i < N; i++) {
          const mode = topic.modes[i % topic.modes.length];
          const q = cur.generate(mode, topic.id, dif.id);
          if (!q) continue;
          vals.push(maxNum(q));
          if (shown.length < 3) shown.push(q.summary || q.prompt);
        }
        vals.sort((a, b) => a - b);
        const mag = vals[Math.floor(vals.length / 2)] ?? 0;
        (rungs[fam] ||= []).push({ age: Number(age), topic: topic.id, level: dif.id, idx, mag, shown });
      });
    }
  }
  setMiddleEarth(true);
  return rungs;
}

/** Compare each age with the next age that has the same family. */
export function auditLadder(opts = {}) {
  const rungs = measureLadder(opts);
  const findings = []; const table = [];
  for (const [fam, list] of Object.entries(rungs)) {
    const ages = [...new Set(list.map((r) => r.age))].sort((a, b) => a - b);
    const at = (age, idx) => list.find((r) => r.age === age && r.idx === idx);
    const row = ages.map((a) => `${a}: ${[0, 1, 2].map((i) => (at(a, i)?.mag ?? 0).toFixed(1)).join('/')}`);
    table.push(`${fam.padEnd(12)}${NUMERIC.has(fam) ? ' ' : '*'} ${row.join('   ')}`);
    if (!NUMERIC.has(fam)) continue;
    // Inside one age the levels must climb (or at least not fall)
    for (const a of ages) {
      const m = [0, 1, 2].map((i) => at(a, i)?.mag ?? 0);
      if (m[1] < m[0] - 0.5 || m[2] < m[1] - 0.5) findings.push({ kind: 'levels-fall', fam, age: a, detail: `${m.join(' → ')}` });
    }
    for (let k = 0; k + 1 < ages.length; k++) {
      const A = ages[k]; const B = ages[k + 1];
      if (B - A > 2) continue; // ages in between aren't built yet; the check starts working when they are
      const aTop = at(A, 2).mag; const aLow = at(A, 0).mag; const bLow = at(B, 0).mag; const bTop = at(B, 2).mag;
      // Step back: the older age tops out lower than the younger age did
      if (bTop < aTop - 0.8) findings.push({ kind: 'step-back', fam, age: B, detail: `Age ${B} hardest (${bTop}) is below Age ${A} hardest (${aTop})` });
      // Leap: the older age's easiest level is far beyond the younger age's hardest
      if (bLow > aTop + 2) findings.push({ kind: 'leap', fam, age: B, detail: `Age ${B} easiest (${bLow}) is more than 2 digits above Age ${A} hardest (${aTop})` });
      // Warm-up too easy for its age: below the younger age's Easy
      if (bLow < aLow - 0.8) findings.push({ kind: 'warmup-low', fam, age: B, detail: `Age ${B} easiest (${bLow}) is below Age ${A} easiest (${aLow})` });
    }
  }
  return { findings, table, rungs };
}
