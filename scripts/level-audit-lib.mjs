// Measures whether a topic's three levels feel different. Shared by audit-levels.mjs (report) and
// test-generators.mjs (hard gate).
import { CURRICULA } from '../src/curriculum/index.js';
import { setMiddleEarth, THEMED } from '../src/curriculum/middleEarth.js';

export const MODES = ['flash', 'worksheet', 'story', 'stem'];
const nums = (q) => [q.prompt, q.display, q.answerLabel, q.summary].join(' ').replace(/,/g, '').match(/\d+(\.\d+)?/g)?.map(Number) || [];
const maxNum = (q) => Math.max(0, ...nums(q));
// What the child experiences: format + number of options + answer style, with numbers blurred to a band
const band = (n) => (n <= 5 ? 'a' : n <= 10 ? 'b' : n <= 20 ? 'c' : n <= 100 ? 'd' : n <= 1000 ? 'e' : 'f');
const shape = (q) => `${q.input}|${q.choices?.length || 0}|${String(q.key).replace(/\d+/g, '#')}|${band(maxNum(q))}`;
const full = (q) => `${q.key}|${q.choices?.length || 0}`;

export function sample(cur, age, topic, mode, d, themed, N) {
  setMiddleEarth(themed);
  const fullC = new Map(); const halfA = new Map(); const halfB = new Map(); const shapeC = new Map(); let mx = 0; let n = 0; const shown = [];
  for (let i = 0; i < N; i++) {
    const q = (themed && THEMED[age] && THEMED[age](mode, topic.id, d)) || cur.generate(mode, topic.id, d);
    if (!q) continue;
    n++; mx += maxNum(q);
    fullC.set(full(q), (fullC.get(full(q)) || 0) + 1);
    const h = i % 2 ? halfA : halfB; h.set(full(q), (h.get(full(q)) || 0) + 1);
    shapeC.set(shape(q), (shapeC.get(shape(q)) || 0) + 1);
    if (shown.length < 10) shown.push(q.summary || q.prompt || q.display);
  }
  let base = 0; for (const [k, v] of halfA) base += Math.min(v / (N / 2), (halfB.get(k) || 0) / (N / 2));
  return { n, mx: mx / Math.max(1, n), fullC, shapeC, shown, base };
}
const dist = (a, b) => { let o = 0; for (const [k, v] of a.fullC) o += Math.min(v / a.n, (b.fullC.get(k) || 0) / b.n); return o; };
const shapeDist = (a, b) => { let o = 0; for (const [k, v] of a.shapeC) o += Math.min(v / a.n, (b.shapeC.get(k) || 0) / b.n); return o; };

/** Returns every (age, topic, mode, themed, pair) whose levels are too alike. */
export function auditLevels({ N = 1500, onlyAge, show } = {}) {
  const weak = []; let compared = 0;
  for (const [age, cur] of Object.entries(CURRICULA)) {
    if (onlyAge && String(onlyAge) !== age) continue;
    const ids = cur.difficulties.map((d) => d.id);
    for (const topic of cur.topics) {
      for (const mode of MODES.filter((m) => topic.modes.includes(m))) {
        for (const themed of [false, true]) {
          if (themed && !THEMED[age]) continue;
          const prof = ids.map((d) => sample(cur, age, topic, mode, d, themed, N));
          if (show && !themed) {
            console.log(`\n== age ${age} / ${topic.id} / ${mode}`);
            ids.forEach((d, i) => console.log(`  ${d} (max# ${prof[i].mx.toFixed(1)}): ${prof[i].shown.slice(0, 6).join(' | ')}`));
          }
          for (const [i, j] of [[0, 1], [1, 2], [0, 2]]) {
            compared++;
            const a = prof[i]; const b = prof[j];
            const d1 = dist(a, b); const d2 = shapeDist(a, b);
            const dm = Math.abs(a.mx - b.mx) / Math.max(1, Math.max(a.mx, b.mx));
            // Same questions, or the same kinds of questions at the same number sizes
            // Alike = the levels serve (nearly) the same questions, or the same kinds of questions at the same number sizes
            const alike = d1 > 0.85 || (d2 > 0.9 && dm < 0.03);
            if (alike) {
              weak.push({ age, topic: topic.id, mode, themed, pair: `${ids[i]}→${ids[j]}`, same: d1, shape: d2, mag: `${a.mx.toFixed(1)}→${b.mx.toFixed(1)}` });
            }
          }
        }
      }
    }
  }
  setMiddleEarth(true);
  return { weak, compared };
}
