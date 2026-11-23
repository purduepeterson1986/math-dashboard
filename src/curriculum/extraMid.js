// Extra question types for Ages 7 and 8: more variety for fractions, geometry, even/odd and number patterns,
// plus money (new at Age 8) and extra perimeter, liquid volume and mass questions.
// Every generator takes (mode, lv) where lv is 0, 1 or 2 (Warm-up, Standard, Challenge).
import { rand, pick, sample, shuffle, chance, gcd } from '../lib/rng.js';
import { ch, kp, nm, st, txt, uniq, money } from './extraKit.js';

const lvl = (n, a, b, c) => (n === 0 ? a : n === 1 ? b : c);
const F = (n, d) => `[[${n}/${d}]]`;
const NAMES_DEN = { 2: 'halves', 3: 'thirds', 4: 'fourths', 5: 'fifths', 6: 'sixths', 8: 'eighths', 10: 'tenths', 12: 'twelfths' };
const fs = (parts, shaded, kind) => ({ type: 'fracshape', parts, shaded, kind });
/** Wrong fractions whose values all differ from the right one and from each other. */
function wrongFracs(n, d, n2 = 2) {
  const val = (a, b) => (a / b).toFixed(6);
  const seen = new Set([val(n, d)]); const out = [];
  const cands = shuffle([[n + 1, d], [n - 1, d], [n, d + 1], [n, d - 1], [n + 1, d + 1], [1, d], [d - n, d], [n, d * 2], [n * 2, d + 1]]);
  for (const [a, b] of cands) {
    if (a < 1 || b < 2 || a >= b || seen.has(val(a, b))) continue;
    seen.add(val(a, b)); out.push({ text: F(a, b), n: a, d: b });
    if (out.length >= n2) break;
  }
  return out;
}

/* ------------------------------ Fractions ------------------------------ */
export function fractionsMore(mode, lv) {
  const topic = 'fractions';
  const dens = lvl(lv, [2, 3, 4], [2, 3, 4, 6, 8], [2, 3, 4, 5, 6, 8, 10, 12]);
  const d = pick(dens); const kind = pick(['circle', 'rect']);
  const fmt = pick(lvl(lv, ['shade', 'parts', 'unit', 'setOf', 'many', 'sameDen', 'whichShows', 'share', 'nameWord', 'whichShows'], ['shade', 'unit', 'setOf', 'many', 'sameDen', 'sameNum', 'line', 'equiv', 'whichShows', 'share'], ['shade', 'setOf', 'sameDen', 'sameNum', 'line', 'equiv', 'equiv', 'addSame', 'manyWholes', 'whichShows']));
  const story = st(mode, '🍕', 'Fair Shares');
  if (fmt === 'shade') {
    const k = rand(1, d - 1);
    return ch({ key: `fm:shade:${k}:${d}:${kind}`, topic, story, prompt: 'What fraction of the shape is shaded?', visual: fs(d, k, kind), hints: ['Count the equal parts, then count the shaded parts.'], summary: `${k} of ${d} shaded`, explanation: `${k} of the ${d} equal parts are shaded: ${k}/${d}.`, answerLabel: F(k, d) },
    { text: F(k, d) }, wrongFracs(k, d));
  }
  if (fmt === 'whichShows') {
    const k = rand(1, d - 1); const wrong = wrongFracs(k, d, 2);
    return ch({ key: `fm:which:${k}:${d}:${kind}`, topic, story, prompt: `Which picture shows ${F(k, d)}?`, hints: [`Look for ${d} equal parts with ${k} shaded.`], summary: `Find ${k}/${d}`, explanation: `${k} of ${d} equal parts shaded is ${k}/${d}.`, answerLabel: F(k, d) },
    { text: F(k, d), visual: fs(d, k, kind) }, wrong.map((w) => ({ text: w.text, visual: fs(w.d, w.n, kind) })));
  }
  if (fmt === 'share') {
    const [fe, food] = pick([['🍕', 'pizza'], ['🍪', 'cookie'], ['🎂', 'cake'], ['🥧', 'pie'], ['🍫', 'chocolate bar']]);
    return ch({ key: `fm:share:${d}:${food}`, topic, story: st(mode, fe, 'Fair Shares'), prompt: `${d} friends share one ${food} equally. What fraction of the ${food} does each friend get?`, visual: fs(d, 1, kind), hints: [`Cut it into ${d} equal parts.`], summary: `Share a ${food} between ${d}`, explanation: `Each friend gets 1 of ${d} equal parts: 1/${d}.`, answerLabel: F(1, d) },
    { text: F(1, d) }, wrongFracs(1, d));
  }
  if (fmt === 'nameWord') {
    const W = { 2: 'a half', 3: 'a third', 4: 'a fourth' }; const right = W[d];
    return ch({ key: `fm:name:${d}`, topic, prompt: `One of ${d} equal parts is called…`, visual: fs(d, 1, kind), hints: ['Halves are 2 parts, thirds are 3 parts, fourths are 4 parts.'], summary: `Name for 1 of ${d} parts`, explanation: `One of ${d} equal parts is ${right}.`, answerLabel: right }, txt(right), Object.values(W).filter((x) => x !== right).map(txt));
  }
  if (fmt === 'parts') return kp({ key: `fm:parts:${d}:${kind}`, topic, answer: d, prompt: 'How many equal parts is the shape cut into?', visual: fs(d, rand(0, d), kind), hints: ['Count every part, shaded or not.'], summary: `Equal parts: ${d}`, explanation: `The shape has ${d} equal parts.` });
  if (fmt === 'unit') {
    return ch({ key: `fm:unit:${d}`, topic, story, prompt: `A shape is cut into ${d} equal parts. What fraction is ONE part?`, visual: fs(d, 1, kind), hints: ['One part out of all the equal parts.'], summary: `One of ${d} parts`, explanation: `One part out of ${d} equal parts is 1/${d}.`, answerLabel: F(1, d) },
    { text: F(1, d) }, wrongFracs(1, d));
  }
  if (fmt === 'setOf') {
    const k = lv === 2 ? rand(1, d - 1) : 1; const m = rand(2, lvl(lv, 3, 5, 8)); const n = d * m;
    return kp({ key: `fm:set:${k}:${d}:${m}`, topic, story: st(mode, '🍎', 'Share the Fruit'), answer: k * m, prompt: `What is ${F(k, d)} of ${n}?`, visual: n <= 20 ? { type: 'objects', emoji: '🍎', count: n } : undefined, hints: [`Split ${n} into ${d} equal groups. Each group is ${m}.`, k > 1 ? `Take ${k} of those groups.` : 'One group is the answer.'].filter(Boolean),
      summary: `${k}/${d} of ${n}`, explanation: `${n} ÷ ${d} = ${m}, and ${k} × ${m} = ${k * m}.` });
  }
  if (fmt === 'many') {
    return kp({ key: `fm:many:${d}`, topic, answer: d, prompt: `How many ${NAMES_DEN[d] || 'parts'} make 1 whole?`, visual: fs(d, d, kind), hints: ['Count all the equal parts in one whole.'], summary: `${NAMES_DEN[d]} in a whole`, explanation: `${d} ${NAMES_DEN[d]} make 1 whole.` });
  }
  if (fmt === 'manyWholes') {
    const w = rand(2, 4);
    return kp({ key: `fm:manyw:${d}:${w}`, topic, answer: d * w, prompt: `How many ${NAMES_DEN[d] || 'parts'} are in ${w} wholes?`, hints: [`Each whole has ${d} ${NAMES_DEN[d]}.`], summary: `${NAMES_DEN[d]} in ${w} wholes`, explanation: `${w} × ${d} = ${w * d}.` });
  }
  if (fmt === 'sameDen') {
    let a = rand(1, d - 1); let b = rand(1, d - 1); while (b === a && d > 2) b = rand(1, d - 1);
    if (a === b) return fractionsMore(mode, lv);
    const big = Math.max(a, b); const small = Math.min(a, b);
    return ch({ key: `fm:sameDen:${small}:${big}:${d}`, topic, prompt: `Which is GREATER: ${F(small, d)} or ${F(big, d)}?`, hints: ['The bottom numbers match, so compare the top numbers.'], summary: `${small}/${d} or ${big}/${d}`, explanation: `Same-sized parts: ${big} parts is more than ${small} parts.`, answerLabel: F(big, d) },
    { text: F(big, d), visual: fs(d, big, kind) }, [{ text: F(small, d), visual: fs(d, small, kind) }]);
  }
  if (fmt === 'sameNum') {
    const [a, b] = sample(dens.filter((x) => x >= 2), 2); const big = Math.min(a, b); const small = Math.max(a, b);
    return ch({ key: `fm:sameNum:${big}:${small}`, topic, prompt: `Which is GREATER: ${F(1, small)} or ${F(1, big)}?`, hints: ['Fewer equal parts means bigger parts.'], summary: `1/${small} or 1/${big}`, explanation: `${1}/${big} is greater: cutting into ${big} parts makes bigger pieces than ${small} parts.`, answerLabel: F(1, big) },
    { text: F(1, big), visual: fs(big, 1, kind) }, [{ text: F(1, small), visual: fs(small, 1, kind) }]);
  }
  if (fmt === 'line') {
    const k = rand(1, d - 1);
    return ch({ key: `fm:line:${k}:${d}`, topic, prompt: 'What fraction is at the red dot?', visual: { type: 'fracline', den: d, mark: k, max: 1 }, hints: [`The line from 0 to 1 is cut into ${d} equal steps.`], summary: `Dot at ${k}/${d}`, explanation: `The dot is ${k} steps out of ${d}: ${k}/${d}.`, answerLabel: F(k, d) },
    { text: F(k, d) }, wrongFracs(k, d));
  }
  if (fmt === 'equiv') {
    const E = lv === 1 ? [[1, 2, 2], [1, 2, 3], [1, 2, 4], [1, 3, 2], [1, 4, 2], [2, 4, 2], [1, 2, 5]] : [[2, 3, 2], [3, 4, 2], [2, 5, 2], [3, 5, 2], [1, 2, 6], [1, 3, 3], [3, 4, 3], [5, 6, 2], [2, 3, 3], [1, 4, 3]];
    const [a, b, m] = pick(E);
    return kp({ key: `fm:equiv:${a}:${b}:${m}`, topic, answer: a * m, prompt: `${F(a, b)} = ${F('?', b * m)}. What is the missing number?`.replace('[[?/', '[[?/'), hints: [`Multiply the top and the bottom by ${m}.`], summary: `${a}/${b} = ?/${b * m}`, explanation: `${a}/${b} × ${m}/${m} = ${a * m}/${b * m}.` });
  }
  const b = pick(dens.filter((x) => x >= 4)); const a1 = rand(1, Math.floor((b - 1) / 2)); const a2 = rand(1, b - 1 - a1);
  const right = F(a1 + a2, b);
  return ch({ key: `fm:add:${a1}:${a2}:${b}`, topic, prompt: `${F(a1, b)} + ${F(a2, b)} = ?`, hints: ['The bottom numbers match. Add the top numbers and keep the bottom number.'], summary: `${a1}/${b} + ${a2}/${b}`, explanation: `${a1} + ${a2} = ${a1 + a2}, so the answer is ${a1 + a2}/${b}.`, answerLabel: right },
  { text: right }, wrongFracs(a1 + a2, b));
}

/* ------------------------------ Geometry ------------------------------ */
const RIDDLES = [
  ['triangle', 'I have 3 sides and 3 corners.'], ['square', 'I have 4 equal sides and 4 square corners.'], ['rectangle', 'I have 4 sides: 2 long and 2 short. All 4 corners are square.'],
  ['pentagon', 'I have 5 sides and 5 corners.'], ['hexagon', 'I have 6 sides and 6 corners.'], ['circle', 'I am round. I have no corners and no straight sides.'],
];
const SOLIDS = [
  ['cube', 'I have 6 flat square faces.'], ['sphere', 'I am round like a ball. I have no flat faces.'], ['cylinder', 'I have 2 flat circles and a curved side. I can roll.'],
  ['cone', 'I have 1 flat circle and a point on top.'], ['rectangular prism', 'I have 6 flat faces. All are rectangles.'], ['square pyramid', 'I have a square on the bottom and 4 triangles that meet at a point.'],
];
const SOLID_FACTS = [['cube', 6, 12, 8], ['rectangular prism', 6, 12, 8], ['square pyramid', 5, 8, 5], ['triangular prism', 5, 9, 6]];
export function geometryMore(mode, lv) {
  const topic = 'geometry';
  const fmt = pick(lvl(lv, ['riddle', 'riddle', 'notPoly', 'equalSides', 'rightAngles', 'corners', 'shapeName', 'sortPoly'], ['riddle', 'solid', 'notPoly', 'equalSides', 'rightAngles', 'sidesName'], ['solid', 'solidFacts', 'solidFacts', 'riddle', 'sortPoly', 'sidesName']));
  const story = st(mode, '🔷', 'Shape Detective');
  if (fmt === 'riddle') {
    const pool = lvl(lv, RIDDLES.slice(0, 4), RIDDLES, RIDDLES); const [ans, clue] = pick(pool);
    const wrong = sample(pool.map((r) => r[0]).filter((x) => x !== ans && !(ans === 'square' && x === 'rectangle') && !(ans === 'rectangle' && x === 'square')), 3);
    return ch({ key: `gm:riddle:${ans}`, topic, story, prompt: `${clue} What shape am I?`, hints: ['Count the sides and the corners.'], summary: `Riddle: ${ans}`, explanation: `A ${ans}: ${clue.toLowerCase()}`, answerLabel: ans }, txt(ans), wrong.map(txt));
  }
  if (fmt === 'corners') {
    const s = pick(['triangle', 'square', 'rectangle', 'pentagon', 'hexagon']); const n = { triangle: 3, square: 4, rectangle: 4, pentagon: 5, hexagon: 6 }[s];
    return kp({ key: `gm:corners:${s}`, topic, story, answer: n, prompt: `How many corners does this ${s} have?`, visual: { type: 'shape', shape: s, color: pick(['teal', 'purple', 'orange', 'blue']) }, hints: ['Touch each corner and count.'], summary: `Corners of a ${s}`, explanation: `A ${s} has ${n} corners.` });
  }
  if (fmt === 'shapeName') {
    const s = pick(['triangle', 'square', 'rectangle', 'pentagon', 'hexagon']); const wrong = sample(['triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'circle'].filter((x) => x !== s && !(s === 'square' && x === 'rectangle') && !(s === 'rectangle' && x === 'square')), 3);
    return ch({ key: `gm:shapeName:${s}`, topic, story, prompt: 'What is the name of this shape?', visual: { type: 'shape', shape: s, color: pick(['teal', 'purple', 'orange', 'blue']) }, hints: ['Count the sides.'], summary: `Name the ${s}`, explanation: `This shape is a ${s}.`, answerLabel: s }, txt(s), wrong.map(txt));
  }
  if (fmt === 'solid') {
    const [ans, clue] = pick(SOLIDS); const wrong = sample(SOLIDS.map((r) => r[0]).filter((x) => x !== ans && !(ans === 'cube' && x === 'rectangular prism') && !(ans === 'rectangular prism' && x === 'cube')), 3);
    return ch({ key: `gm:solid:${ans}`, topic, story, prompt: `${clue} What solid shape am I?`, hints: ['Think about faces, curves and corners.'], summary: `Solid: ${ans}`, explanation: `That is a ${ans}.`, answerLabel: ans }, txt(ans), wrong.map(txt));
  }
  if (fmt === 'solidFacts') {
    const [n, faces, edges, verts] = pick(SOLID_FACTS); const what = pick(['faces', 'edges', 'vertices']); const ans = what === 'faces' ? faces : what === 'edges' ? edges : verts;
    return kp({ key: `gm:facts:${n}:${what}`, topic, answer: ans, prompt: `How many ${what}${what === 'vertices' ? ' (corners)' : ''} does a ${n} have?`, hints: [what === 'faces' ? 'Count each flat side.' : what === 'edges' ? 'An edge is where two faces meet.' : 'A vertex is a corner.'], summary: `${n} ${what}`, explanation: `A ${n} has ${faces} faces, ${edges} edges and ${verts} vertices.` });
  }
  if (fmt === 'notPoly') {
    const polys = sample(['triangle', 'square', 'hexagon', 'pentagon', 'rectangle'], 3); const colors = sample(['red', 'green', 'orange', 'purple'], 3);
    return ch({ key: `gm:notPoly:${polys.join('')}`, topic, story, prompt: 'Which shape is NOT made of straight sides?', hints: ['Look for the curved shape.'], summary: 'Not a polygon', explanation: 'A circle has a curved side, so it is not a polygon.', answerLabel: 'circle' },
    { visual: { type: 'shape', shape: pick(['circle', 'oval']), color: 'blue' } }, polys.map((s, i) => ({ visual: { type: 'shape', shape: s, color: colors[i] } })));
  }
  if (fmt === 'equalSides') {
    const Q = [['square', 4, 'How many equal sides does a square have?'], ['triangle', 3, 'An equilateral triangle has sides that are all equal. How many equal sides does it have?'], ['hexagon', 6, 'A regular hexagon has all sides equal. How many equal sides does it have?'], ['rectangle', 2, 'A rectangle has 2 pairs of equal sides. How many sides are the same length as the longest side?']];
    const [s, a, prompt] = pick(Q);
    return kp({ key: `gm:equal:${s}`, topic, answer: a, prompt, hints: ['Think about which sides match.'], summary: `Equal sides: ${s}`, explanation: `The answer is ${a}.` });
  }
  if (fmt === 'rightAngles') {
    const Q = [['square', 4], ['rectangle', 4], ['triangle', 0], ['hexagon', 0], ['pentagon', 0]]; const [s, a] = pick(Q);
    return kp({ key: `gm:right:${s}`, topic, answer: a, prompt: `How many square corners (right angles) does a ${s} have? A regular ${s === 'square' || s === 'rectangle' ? '' : ''}${s === 'triangle' ? 'triangle has none' : ''}`.replace(/ A regular.*$/, ''), visual: { type: 'shape', shape: s, color: 'teal' }, hints: ['A square corner looks like the corner of a book.'], summary: `Right angles in a ${s}`, explanation: `A ${s} has ${a} square corners.` });
  }
  if (fmt === 'sortPoly') {
    const ans = pick(['triangle', 'square', 'pentagon', 'hexagon']); const ns = { triangle: 3, square: 4, pentagon: 5, hexagon: 6 };
    const wrong = sample(Object.keys(ns).filter((x) => x !== ans), 3);
    return ch({ key: `gm:sortPoly:${ans}`, topic, prompt: `Which shape has ${ns[ans]} sides?`, hints: ['Count the sides of each shape.'], summary: `Shape with ${ns[ans]} sides`, explanation: `A ${ans} has ${ns[ans]} sides.`, answerLabel: ans },
    { visual: { type: 'shape', shape: ans, color: pick(['blue', 'green', 'purple']) } }, wrong.map((s) => ({ visual: { type: 'shape', shape: s, color: pick(['red', 'orange', 'teal']) } })));
  }
  const S = [['pentagon', 5], ['hexagon', 6], ['triangle', 3], ['quadrilateral', 4]]; const [name, n] = pick(S);
  return ch({ key: `gm:sidesName:${n}`, topic, prompt: `A shape with ${n} sides is called a…`, hints: ['Pent- means 5. Hex- means 6. Tri- means 3. Quad- means 4.'], summary: `${n} sides`, explanation: `A shape with ${n} sides is a ${name}.`, answerLabel: name }, txt(name), sample(S.map((x) => x[0]).filter((x) => x !== name), 3).map(txt));
}

/* ------------------------------ Even & odd ------------------------------ */
const eoWord = (n) => (n % 2 === 0 ? 'Even' : 'Odd');
export function evenOddMore(mode, lv) {
  const topic = 'evenodd';
  const hi = lvl(lv, 30, 99, 999); const lo = lvl(lv, 1, 10, 100);
  const fmt = pick(lvl(lv, ['pick', 'next', 'pairs', 'missing', 'sumRule'], ['pick', 'next', 'missing', 'sumRule', 'oddOne', 'pairs'], ['pick', 'next', 'sumRule', 'oddOne', 'digit', 'three']));
  const story = st(mode, '🧦', 'Pairs and Leftovers');
  if (fmt === 'pick') {
    const wantEven = chance(0.5); const right = (() => { let n = rand(lo, hi); while ((n % 2 === 0) !== wantEven) n = rand(lo, hi); return n; })();
    const wrong = []; while (wrong.length < 2) { const n = rand(lo, hi); if ((n % 2 === 0) !== wantEven && !wrong.includes(n)) wrong.push(n); }
    return ch({ key: `eo2:pick:${wantEven}:${right}:${wrong.join('')}`, topic, prompt: `Which number is ${wantEven ? 'EVEN' : 'ODD'}?`, hints: ['Look at the ones digit: 0, 2, 4, 6, 8 mean even.'], summary: `Pick the ${wantEven ? 'even' : 'odd'} number`, explanation: `${right} ends in ${right % 10}, so it is ${wantEven ? 'even' : 'odd'}.`, answerLabel: String(right) }, txt(right), wrong.map(txt));
  }
  if (fmt === 'next') {
    const wantEven = chance(0.5); let n = rand(lo, hi - 2); const ans = n % 2 === (wantEven ? 0 : 1) ? n + 2 : n + 1;
    return kp({ key: `eo2:next:${wantEven}:${n}`, topic, answer: ans, prompt: `What is the next ${wantEven ? 'EVEN' : 'ODD'} number after ${n}?`, hints: [`Count up from ${n} and check each number.`], summary: `Next ${wantEven ? 'even' : 'odd'} after ${n}`, explanation: `${ans} is the next ${wantEven ? 'even' : 'odd'} number after ${n}.` });
  }
  if (fmt === 'pairs') {
    const n = rand(lo === 1 ? 3 : 7, lvl(lv, 19, 25, 25));
    return kp({ key: `eo2:pairs:${n}`, topic, story, answer: n % 2, prompt: `${nm()} has ${n} socks and puts them in pairs. How many socks are left over?`, visual: { type: 'objects', emoji: '🧦', count: Math.min(n, 20) }, hints: ['Make pairs of 2. Is there one left?'], summary: `${n} socks in pairs`, explanation: `${n} ${n % 2 === 0 ? 'makes pairs with nothing left over: it is even' : 'leaves 1 sock without a partner: it is odd'}.` });
  }
  if (fmt === 'missing') {
    const odd = chance(0.5); const start = (odd ? 1 : 2) + 2 * rand(0, lvl(lv, 5, 20, 100)); const seq = [0, 1, 2, 3, 4].map((i) => start + 2 * i); const h = rand(1, 3);
    return kp({ key: `eo2:missing:${odd}:${start}:${h}`, topic, answer: seq[h], prompt: `What number is missing in this ${odd ? 'odd' : 'even'} number pattern? ${seq.map((x, i) => (i === h ? '?' : x)).join(', ')}`, hints: ['These numbers go up by 2 each time.'], summary: `${odd ? 'Odd' : 'Even'} pattern`, explanation: `${seq.join(', ')}.` });
  }
  if (fmt === 'sumRule') {
    const combos = lv === 0 ? [['even', 'even'], ['odd', 'odd'], ['even', 'odd']] : [['even', 'even'], ['odd', 'odd'], ['even', 'odd'], ['odd', 'even']];
    const [a, b] = pick(combos); const mk = (kind) => { let n = rand(lo + 1, hi); while ((n % 2 === 0) !== (kind === 'even')) n = rand(lo + 1, hi); return n; };
    const x = mk(a); const y = mk(b); const sum = x + y;
    return ch({ key: `eo2:sum:${x}:${y}`, topic, prompt: `Is ${x} + ${y} odd or even?`, hints: ['odd + odd = even, even + even = even, odd + even = odd.'], summary: `${x} + ${y}`, explanation: `${x} + ${y} = ${sum}, which is ${eoWord(sum).toLowerCase()}.`, answerLabel: eoWord(sum) }, txt(eoWord(sum)), [txt(sum % 2 === 0 ? 'Odd' : 'Even')]);
  }
  if (fmt === 'oddOne') {
    const evenGroup = chance(0.5); const group = []; while (group.length < 3) { const n = rand(lo, hi); if ((n % 2 === 0) === evenGroup && !group.includes(n)) group.push(n); }
    let odd = rand(lo, hi); while ((odd % 2 === 0) === evenGroup || group.includes(odd)) odd = rand(lo, hi);
    return ch({ key: `eo2:oddOne:${evenGroup}:${group.join('')}:${odd}`, topic, prompt: `Which number does NOT belong with the others? ${shuffle([...group, odd]).join(', ')}`, hints: [`Three numbers are ${evenGroup ? 'even' : 'odd'}. One is different.`], summary: 'Odd one out', explanation: `${odd} is ${evenGroup ? 'odd' : 'even'}, but the others are ${evenGroup ? 'even' : 'odd'}.`, answerLabel: String(odd) },
    txt(odd), group.map(txt));
  }
  if (fmt === 'digit') {
    const n = rand(1001, 9999); const d = n % 10;
    return ch({ key: `eo2:digit:${n}`, topic, prompt: `Only the ones digit matters. Is ${n.toLocaleString('en-US')} odd or even?`, hints: ['Look only at the last digit.'], summary: `${n} odd or even`, explanation: `The ones digit is ${d}, so ${n.toLocaleString('en-US')} is ${eoWord(n).toLowerCase()}.`, answerLabel: eoWord(n) }, txt(eoWord(n)), [txt(n % 2 === 0 ? 'Odd' : 'Even')]);
  }
  const t = [rand(lo + 1, hi), rand(lo + 1, hi), rand(lo + 1, hi)]; const sum = t[0] + t[1] + t[2];
  return ch({ key: `eo2:three:${t.join('+')}`, topic, prompt: `Is ${t.join(' + ')} odd or even?`, hints: ['Count how many of the numbers are odd. Two odds make an even.'], summary: t.join(' + '), explanation: `${t.join(' + ')} = ${sum}, which is ${eoWord(sum).toLowerCase()}.`, answerLabel: eoWord(sum) }, txt(eoWord(sum)), [txt(sum % 2 === 0 ? 'Odd' : 'Even')]);
}

/* ------------------------------ Function tables (patterns) ------------------------------ */
export function functionTable(mode, lv) {
  const topic = 'patterns';
  const kinds = lvl(lv, ['add', 'add', 'sub'], ['add', 'sub', 'times'], ['times', 'times2add', 'sub', 'add']);
  const kind = pick(kinds);
  let rule; let f; let ruleText;
  if (kind === 'add') { const k = rand(2, lvl(lv, 9, 15, 40)); f = (x) => x + k; ruleText = `add ${k}`; rule = k; }
  else if (kind === 'sub') { const k = rand(2, lvl(lv, 8, 12, 30)); f = (x) => x - k; ruleText = `subtract ${k}`; rule = k; }
  else if (kind === 'times') { const k = rand(2, lvl(lv, 5, 6, 9)); f = (x) => x * k; ruleText = `multiply by ${k}`; rule = k; }
  else { const k = rand(2, 4); const j = rand(1, 5); f = (x) => x * k + j; ruleText = `multiply by ${k}, then add ${j}`; rule = `${k}:${j}`; }
  const lo = kind === 'sub' ? 40 : 1; const xs = sample([lo, lo + 1, lo + 2, lo + 3, lo + 4, lo + 5, lo + 6], 3).sort((a, b) => a - b);
  const bigX = rand(10, lvl(lv, 20, 30, 50)) + (kind === 'sub' ? 40 : 0);
  const table = xs.map((x) => `${x} → ${f(x)}`).join(',  ');
  if (lv >= 1 && chance(0.4)) {
    const wrong = uniq(kind === 'add' ? [`add ${rule + 1}`, `subtract ${rule}`, `multiply by ${rule}`] : kind === 'sub' ? [`subtract ${rule + 1}`, `add ${rule}`, `subtract ${Math.max(1, rule - 1)}`] : kind === 'times' ? [`add ${rule}`, `multiply by ${rule + 1}`, `add ${rule + 1}`] : ['multiply by 2', 'multiply by 3, then add 1', 'add 5']).filter((w) => w !== ruleText).slice(0, 3);
    return ch({ key: `ft:rule:${kind}:${rule}:${xs.join('')}`, topic, story: st(mode, '⚙️', 'Function Machine'), prompt: `The machine changes each In number to an Out number: ${table}. What is the rule?`, hints: ['Compare an In number with its Out number.'], summary: `Rule for ${table}`, explanation: `The rule is ${ruleText}.`, answerLabel: ruleText }, txt(ruleText), wrong.map(txt));
  }
  return kp({ key: `ft:out:${kind}:${rule}:${xs.join('')}:${bigX}`, topic, story: st(mode, '⚙️', 'Function Machine'), answer: f(bigX), prompt: `The machine changes each In number to an Out number: ${table}. What is the Out number when In is ${bigX}?`, hints: ['Find the rule first.', `The rule is ${ruleText}.`], summary: `Out when In is ${bigX}`, explanation: `The rule is ${ruleText}. ${bigX} → ${f(bigX)}.` });
}

/* ------------------------------ Money (Age 8) ------------------------------ */
export function moneyA8(mode, lv) {
  const topic = 'money';
  const who = nm();
  const fmt = pick(lvl(lv, ['coins', 'dollars', 'quarters', 'changeWhole', 'dimes'], ['total2', 'changeDollar', 'compare', 'cents', 'change', 'enough'], ['multi', 'changeBig', 'unit', 'save', 'budget', 'half', 'total3']));
  if (fmt === 'coins') {
    const n = rand(4, 8); const coins = Array.from({ length: n }, () => pick([25, 10, 10, 5, 5, 1, 100])).sort((a, b) => b - a); const total = coins.reduce((a, b) => a + b, 0);
    return kp({ key: `m8:coins:${coins.join('-')}`, topic, story: st(mode, '🪙', 'Count the Money'), answer: total, prompt: 'How many cents are in all?', visual: { type: 'coins', coins }, hints: ['Count the dollar bills first, then quarters, dimes, nickels, then pennies.'], summary: `Coins: ${total}¢`, explanation: `Added up, the coins and bills are worth ${total} cents.` });
  }
  if (fmt === 'dollars') {
    const d = rand(2, 9);
    return kp({ key: `m8:dollars:${d}`, topic, answer: d, prompt: `How many dollars is ${d * 100} cents?`, hints: ['100 cents make 1 dollar.'], summary: `${d * 100}¢ in dollars`, explanation: `${d * 100} ÷ 100 = ${d} dollars.` });
  }
  if (fmt === 'quarters') {
    const d = rand(1, 5);
    return kp({ key: `m8:quarters:${d}`, topic, answer: d * 4, prompt: `How many quarters make $${d}?`, visual: { type: 'coins', coins: [25] }, hints: ['4 quarters make 1 dollar.'], summary: `Quarters in $${d}`, explanation: `4 quarters per dollar: ${d} × 4 = ${d * 4}.` });
  }
  if (fmt === 'dimes') {
    const d = rand(1, 5); const extra = pick([0, 1, 2, 3]);
    return kp({ key: `m8:dimes:${d}:${extra}`, topic, answer: d * 10 + extra * 10, prompt: `How many dimes make $${d}${extra ? `.${extra}0` : ''}?`.replace('.', extra ? '.' : '.'), hints: ['10 dimes make 1 dollar.'], summary: `Dimes in $${d}.${extra}0`, explanation: `$${d}.${extra}0 is ${d * 100 + extra * 10} cents, and each dime is 10 cents.` });
  }
  if (fmt === 'changeWhole') {
    const pay = pick([5, 10, 20]); const cost = rand(1, pay - 1);
    return kp({ key: `m8:chW:${pay}:${cost}`, topic, story: st(mode, '🧸', 'At the Toy Shop'), answer: pay - cost, prompt: `${who} buys a toy for $${cost} and pays with $${pay}. How many dollars of change?`, hints: [`Count up from ${cost} to ${pay}.`], summary: `Change from $${pay} for $${cost}`, explanation: `${pay} − ${cost} = ${pay - cost} dollars.` });
  }
  if (fmt === 'total2') {
    const a = rand(2, 19) * 5; const b = rand(2, 19) * 5;
    return kp({ key: `m8:t2:${a}:${b}`, topic, story: st(mode, '✏️', 'School Supplies'), answer: a + b, prompt: `${who} buys a pencil for ${a}¢ and an eraser for ${b}¢. How many cents in all?`, hints: ['Add the two prices.'], summary: `${a}¢ + ${b}¢`, explanation: `${a} + ${b} = ${a + b} cents.` });
  }
  if (fmt === 'changeDollar') {
    const cost = rand(1, 19) * 5; const pay = pick([100, 100, 100, 200]);
    return kp({ key: `m8:chD:${pay}:${cost}`, topic, story: st(mode, '🍬', 'Candy Shop'), answer: pay - cost, prompt: `A treat costs ${cost}¢. ${who} pays with ${pay === 100 ? 'a dollar bill (100¢)' : 'two dollar bills (200¢)'}. How many cents of change?`, hints: [`Count up from ${cost} to ${pay}.`], summary: `Change from ${pay}¢`, explanation: `${pay} − ${cost} = ${pay - cost} cents.` });
  }
  if (fmt === 'compare') {
    const a = rand(100, 900); let b = a + pick([-9, -5, -1, 1, 5, 9, 90, -90]); if (b < 100) b = a + 10;
    const big = Math.max(a, b); const small = Math.min(a, b);
    return ch({ key: `m8:cmp:${small}:${big}`, topic, prompt: `Which costs MORE: ${money(small)} or ${money(big)}?`, hints: ['Compare the dollars first, then the cents.'], summary: `${money(small)} or ${money(big)}`, explanation: `${money(big)} is more than ${money(small)}.`, answerLabel: money(big) }, txt(money(big)), [txt(money(small))]);
  }
  if (fmt === 'cents') {
    const d = rand(1, 9); const c = rand(1, 19) * 5;
    return kp({ key: `m8:cents:${d}:${c}`, topic, answer: d * 100 + c, prompt: `${money(d * 100 + c)} is how many cents?`, hints: ['Each dollar is 100 cents.'], summary: `${money(d * 100 + c)} in cents`, explanation: `${d} dollars is ${d * 100} cents, plus ${c} cents is ${d * 100 + c} cents.` });
  }
  if (fmt === 'change') {
    const pay = pick([500, 1000]); const cost = rand(pay === 500 ? 110 : 220, pay - 15, 5); const cost5 = Math.round(cost / 5) * 5; const right = pay - cost5;
    const wrong = uniq([right + 10, right - 10, right + 100, right - 100]).filter((x) => x > 0 && x !== right).slice(0, 3);
    return ch({ key: `m8:ch:${pay}:${cost5}`, topic, story: st(mode, '🛍️', 'Making Change'), prompt: `${who} pays ${money(pay)} for something that costs ${money(cost5)}. How much change?`, hints: [`Count up from ${money(cost5)} to ${money(pay)}.`], summary: `Change from ${money(pay)}`, explanation: `${money(pay)} − ${money(cost5)} = ${money(right)}.`, answerLabel: money(right) }, txt(money(right)), wrong.map((x) => txt(money(x))));
  }
  if (fmt === 'enough') {
    const have = pick([500, 1000]); const a = rand(150, have / 2 + 100); const b = rand(100, have / 2 + 150); const a5 = Math.round(a / 5) * 5; const b5 = Math.round(b / 5) * 5; const yes = a5 + b5 <= have;
    return ch({ key: `m8:enough:${have}:${a5}:${b5}`, topic, prompt: `${who} has ${money(have)}. A book costs ${money(a5)} and a pen costs ${money(b5)}. Is that enough for both?`, hints: ['Add the two prices, then compare with the money you have.'], summary: `Enough for ${money(a5)} + ${money(b5)}?`, explanation: `${money(a5)} + ${money(b5)} = ${money(a5 + b5)}, which is ${yes ? 'not more than' : 'more than'} ${money(have)}.`, answerLabel: yes ? 'Yes' : 'No' }, txt(yes ? 'Yes' : 'No'), [txt(yes ? 'No' : 'Yes')]);
  }
  if (fmt === 'multi') {
    const q = rand(2, 8); const p = rand(1, 15) * 25;
    return kp({ key: `m8:multi:${q}:${p}`, topic, story: st(mode, '📓', 'Back to School'), answer: q * p, prompt: `${who} buys ${q} notebooks at ${money(p)} each. How many cents in all?`, hints: [`Multiply ${q} by ${p} cents.`], summary: `${q} × ${money(p)}`, explanation: `${q} × ${p} = ${q * p} cents.` });
  }
  if (fmt === 'changeBig') {
    const a = rand(300, 900); const b = rand(200, 800); const a5 = Math.round(a / 5) * 5; const b5 = Math.round(b / 5) * 5; const pay = 2000; const right = pay - a5 - b5;
    const wrong = uniq([right + 100, right - 100, right + 50, right - 50]).filter((x) => x > 0 && x !== right).slice(0, 3);
    return ch({ key: `m8:chB:${a5}:${b5}`, topic, prompt: `${who} buys items for ${money(a5)} and ${money(b5)} and pays with a $20 bill. How much change?`, hints: ['Add the two prices first. Then subtract from $20.00.'], summary: `Change from $20 for ${money(a5)} + ${money(b5)}`, explanation: `${money(a5)} + ${money(b5)} = ${money(a5 + b5)}. $20.00 − ${money(a5 + b5)} = ${money(right)}.`, answerLabel: money(right) }, txt(money(right)), wrong.map((x) => txt(money(x))));
  }
  if (fmt === 'unit') {
    const q = pick([2, 4, 5, 6, 8, 10]); const each = rand(2, 19) * 5;
    return kp({ key: `m8:unit:${q}:${each}`, topic, answer: each, prompt: `${q} pencils cost ${q * each}¢ in all. How many cents does 1 pencil cost?`, hints: [`Divide ${q * each} by ${q}.`], summary: `Price of 1 of ${q}`, explanation: `${q * each} ÷ ${q} = ${each} cents.` });
  }
  if (fmt === 'save') {
    const w = rand(3, 10); const per = pick([125, 150, 200, 250, 300, 500]);
    return kp({ key: `m8:save:${per}:${w}`, topic, story: st(mode, '🐷', 'Saving Up'), answer: w, prompt: `${who} saves ${money(per)} each week. How many weeks to save ${money(per * w)}?`, hints: [`How many ${money(per)}s fit into ${money(per * w)}?`], summary: `Save ${money(per * w)}`, explanation: `${per * w} ÷ ${per} = ${w} weeks.` });
  }
  if (fmt === 'budget') {
    const have = pick([1000, 1500, 2000]); const cost = rand(Math.floor(have / 10), Math.floor(have / 5 * 3), 5); const c5 = Math.round(cost / 5) * 5;
    return kp({ key: `m8:budget:${have}:${c5}`, topic, answer: have - c5, prompt: `${who} has ${money(have)} and buys a game for ${money(c5)}. How many cents are left?`, hints: ['Subtract the price from the money you have.'], summary: `${money(have)} − ${money(c5)}`, explanation: `${have} − ${c5} = ${have - c5} cents.` });
  }
  if (fmt === 'half') {
    const p = rand(4, 40) * 50;
    return kp({ key: `m8:half:${p}`, topic, story: st(mode, '👕', 'Sale Day'), answer: p / 2, prompt: `A shirt costs ${money(p)}. It is on sale for half price. How many cents does the sale price cost?`, hints: ['Half means divide by 2.'], summary: `Half of ${money(p)}`, explanation: `${p} ÷ 2 = ${p / 2} cents.` });
  }
  const a = rand(2, 9) * 25; const b = rand(2, 9) * 25; const c = rand(1, 9) * 25;
  return kp({ key: `m8:t3:${a}:${b}:${c}`, topic, answer: a + b + c, prompt: `Three snacks cost ${money(a)}, ${money(b)} and ${money(c)}. How many cents in all?`, hints: ['Add all three prices.'], summary: `${money(a)} + ${money(b)} + ${money(c)}`, explanation: `${a} + ${b} + ${c} = ${a + b + c} cents.` });
}

/* ------------------------------ Perimeter (topic: area) ------------------------------ */
const PERIM_THINGS = [['🖼️', 'picture frame', 'Frame It'], ['🎁', 'gift box ribbon', 'Gift Ribbon'], ['🏞️', 'park path', 'Park Path'], ['🐕', 'dog pen fence', 'Dog Pen'], ['🌻', 'flower bed border', 'Flower Bed'], ['🏑', 'field', 'Field Lines']];
export function perimeterMore(mode, lv) {
  const topic = 'area';
  const hi = lvl(lv, 10, 20, 40);
  const fmt = pick(lvl(lv, ['grid', 'square', 'poly', 'story'], ['poly', 'square', 'tri', 'story', 'whichRect', 'missingSide'], ['poly', 'story', 'whichRect', 'missingSide', 'rows', 'sameP']));
  const [e, thing, title] = pick(PERIM_THINGS);
  if (fmt === 'grid') {
    const w = rand(2, 7); const h = rand(2, 6);
    return kp({ key: `pm:grid:${w}:${h}`, topic, answer: 2 * (w + h), prompt: 'What is the perimeter of this rectangle? Count the units along the edge.', visual: { type: 'areagrid', w, h }, hints: ['Perimeter is the distance around the outside.'], summary: `Perimeter of a ${w} by ${h} rectangle`, explanation: `${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} units.` });
  }
  if (fmt === 'square') {
    const s = rand(2, Math.floor(hi / 2));
    return kp({ key: `pm:square:${s}`, topic, story: st(mode, e, title), answer: 4 * s, prompt: `A square ${thing} has sides of ${s} ${lv === 0 ? 'inches' : 'feet'}. What is its perimeter?`, hints: ['A square has 4 equal sides.'], summary: `Square with side ${s}`, explanation: `4 × ${s} = ${4 * s}.` });
  }
  if (fmt === 'poly') {
    const n = pick([3, 4, 5, 6]); const sides = Array.from({ length: n }, () => rand(2, Math.floor(hi / 2) + 2));
    return kp({ key: `pm:poly:${sides.join('-')}`, topic, story: st(mode, e, title), answer: sides.reduce((a, b) => a + b, 0), prompt: `A shape has ${n} sides that measure ${sides.join(', ')} centimeters. What is its perimeter?`, hints: ['Add all of the sides.'], summary: `Perimeter of ${sides.join(' + ')}`, explanation: `${sides.join(' + ')} = ${sides.reduce((a, b) => a + b, 0)} cm.` });
  }
  if (fmt === 'tri') {
    const a = rand(3, hi / 2 + 3); const b = rand(3, hi / 2 + 3); const c = rand(Math.abs(a - b) + 1, a + b - 1);
    return kp({ key: `pm:tri:${a}:${b}:${c}`, topic, answer: a + b + c, prompt: `A triangle has sides of ${a} m, ${b} m and ${c} m. What is its perimeter?`, hints: ['Add the three sides.'], summary: `Triangle ${a}, ${b}, ${c}`, explanation: `${a} + ${b} + ${c} = ${a + b + c} m.` });
  }
  if (fmt === 'story') {
    const w = rand(2, hi / 2); const h = rand(2, hi / 2);
    return kp({ key: `pm:story:${thing}:${w}:${h}`, topic, story: st(mode, e, title), answer: 2 * (w + h), prompt: `${nm()} puts a ${thing} around a rectangle that is ${w} ft long and ${h} ft wide. How many feet go around it?`, hints: ['Add all four sides: two lengths and two widths.'], summary: `Around ${w} by ${h}`, explanation: `2 × (${w} + ${h}) = ${2 * (w + h)} ft.` });
  }
  if (fmt === 'whichRect') {
    const target = pick([14, 16, 18, 20, 24, 30]); const w = rand(2, target / 2 - 1); const h = target / 2 - w;
    const wrong = []; while (wrong.length < 3) { const a = rand(2, 12); const b = rand(2, 12); if (2 * (a + b) !== target && !wrong.some(([x, y]) => x === a && y === b)) wrong.push([a, b]); }
    return ch({ key: `pm:which:${target}:${w}:${h}:${wrong.map((x) => x.join('x')).join('')}`, topic, prompt: `Which rectangle has a perimeter of ${target}?`, hints: ['Find the perimeter of each choice.'], summary: `Perimeter ${target}`, explanation: `${w} + ${h} + ${w} + ${h} = ${target}.`, answerLabel: `${w} by ${h}` }, txt(`${w} by ${h}`), wrong.map(([a, b]) => txt(`${a} by ${b}`)));
  }
  if (fmt === 'missingSide') {
    const a = rand(3, 14); const b = rand(3, 14); const c = rand(3, 14); const d = rand(3, 14); const p = a + b + c + d;
    return kp({ key: `pm:miss:${a}:${b}:${c}:${d}`, topic, answer: d, prompt: `A four-sided shape has a perimeter of ${p} inches. Three of the sides are ${a}, ${b} and ${c} inches. How long is the fourth side?`, hints: [`Add the three sides: ${a + b + c}. Then subtract from ${p}.`], summary: `Missing side, perimeter ${p}`, explanation: `${p} − ${a + b + c} = ${d} inches.` });
  }
  if (fmt === 'rows') {
    const w = rand(2, 9); const h = rand(2, 9); const p = 2 * (w + h);
    return kp({ key: `pm:rows:${w}:${h}`, topic, answer: w + h, prompt: `A rectangle has a perimeter of ${p} meters. What is its length plus its width?`, hints: ['The perimeter counts each length and each width twice.'], summary: `Half the perimeter of ${p}`, explanation: `${p} ÷ 2 = ${w + h} meters.` });
  }
  const w = rand(2, 8); const h = rand(2, 8); const p = 2 * (w + h); let w2 = rand(1, p / 2 - 1); if (w2 === w || w2 === h) w2 = w2 === 1 ? 2 : w2 - 1; const h2 = p / 2 - w2;
  return kp({ key: `pm:same:${w}:${h}:${w2}`, topic, answer: h2, prompt: `A ${w} by ${h} rectangle has a perimeter of ${p}. Another rectangle with the same perimeter is ${w2} wide. How long is it?`, hints: [`Length plus width must equal ${p / 2}.`], summary: `Same perimeter ${p}`, explanation: `${p / 2} − ${w2} = ${h2}.` });
}

/* ------------------------------ Mass & liquid volume (topic: mass) ------------------------------ */
const HOLDS = [['a teaspoon', 5], ['a soup spoon', 15], ['a cup of tea', 250], ['a juice box', 200], ['a water bottle', 500], ['a kettle', 1000], ['a bucket', 10000], ['a fish tank', 40000], ['a bathtub', 150000]];
const MASSES = [['a paper clip', 1, 'g'], ['an apple', 100, 'g'], ['a loaf of bread', 500, 'g'], ['a bag of flour', 1, 'kg'], ['a watermelon', 5, 'kg'], ['a house cat', 4, 'kg'], ['a bicycle', 12, 'kg'], ['a backpack of books', 5, 'kg']];
export function capacityMore(mode, lv) {
  const topic = 'mass';
  const fmt = pick(lvl(lv, ['toMl', 'toG', 'bags', 'jugs', 'compareHold', 'cupsLiter'], ['toMl', 'toG', 'cupsLiter', 'bottles', 'poured', 'estimateHold', 'estimateMass', 'compareMass'], ['toMl', 'toG', 'poured2', 'bottles', 'mixed', 'estimateHold', 'estimateMass', 'diff']));
  const story = st(mode, '🧪', 'Measure It');
  if (fmt === 'toMl') { const l = rand(2, lvl(lv, 5, 9, 15)); return kp({ key: `cm:toMl:${l}`, topic, story, answer: l * 1000, prompt: `1 liter is 1,000 milliliters. How many milliliters are in ${l} liters?`, hints: [`Multiply ${l} by 1,000.`], summary: `${l} L in mL`, explanation: `${l} × 1,000 = ${(l * 1000).toLocaleString('en-US')} mL.` }); }
  if (fmt === 'toG') { const k = rand(2, lvl(lv, 5, 9, 15)); return kp({ key: `cm:toG:${k}`, topic, story, answer: k * 1000, prompt: `1 kilogram is 1,000 grams. How many grams are in ${k} kilograms?`, hints: [`Multiply ${k} by 1,000.`], summary: `${k} kg in g`, explanation: `${k} × 1,000 = ${(k * 1000).toLocaleString('en-US')} g.` }); }
  if (fmt === 'bags') { const q = rand(2, lvl(lv, 6, 9, 12)); const kg = rand(2, lvl(lv, 5, 8, 12)); return kp({ key: `cm:bags:${q}:${kg}`, topic, story: st(mode, '🥔', 'Potato Sacks'), answer: q * kg, prompt: `${nm()} carries ${q} bags of potatoes. Each bag weighs ${kg} kilograms. How many kilograms in all?`, hints: ['Multiply the number of bags by the weight of one bag.'], summary: `${q} bags of ${kg} kg`, explanation: `${q} × ${kg} = ${q * kg} kg.` }); }
  if (fmt === 'jugs') { const l = rand(2, 6); const k = rand(2, 6); return kp({ key: `cm:jugs:${l}:${k}`, topic, story: st(mode, '🪣', 'Big Bucket'), answer: l * k, prompt: `A jug holds ${l} liters. A barrel holds ${k} times as much. How many liters does the barrel hold?`, hints: ['Times as much means multiply.'], summary: `${k} times ${l} L`, explanation: `${k} × ${l} = ${l * k} liters.` }); }
  if (fmt === 'compareHold') {
    const [a, b] = sample(HOLDS.slice(0, 8), 2); const big = a[1] > b[1] ? a : b; const small = big === a ? b : a;
    return ch({ key: `cm:cmpH:${small[0]}:${big[0]}`, topic, prompt: `Which holds MORE: ${small[0]} or ${big[0]}?`, hints: ['Think about how big each one is.'], summary: `${small[0]} vs ${big[0]}`, explanation: `${big[0][0].toUpperCase() + big[0].slice(1)} holds more than ${small[0]}.`, answerLabel: big[0] }, txt(big[0]), [txt(small[0])]);
  }
  if (fmt === 'cupsLiter') { const per = pick([250, 200, 500, 100]); const l = rand(1, lvl(lv, 2, 3, 4)); return kp({ key: `cm:cups:${per}:${l}`, topic, story, answer: (l * 1000) / per, prompt: `A glass holds ${per} milliliters. How many glasses does it take to fill a ${l}-liter jug? (1 liter = 1,000 milliliters)`, hints: [`${l} liters is ${(l * 1000).toLocaleString('en-US')} milliliters. How many ${per}s fit in it?`], summary: `Glasses of ${per} mL for ${l} L`, explanation: `${(l * 1000).toLocaleString('en-US')} ÷ ${per} = ${(l * 1000) / per} glasses.` }); }
  if (fmt === 'bottles') { const per = pick([250, 500]); const l = rand(2, 5); return kp({ key: `cm:bottles:${per}:${l}`, topic, story, answer: (l * 1000) / per, prompt: `${nm()} pours bottles of ${per} milliliters into a ${l}-liter tank. How many bottles fill the tank?`, hints: [`Change ${l} liters to milliliters first: ${(l * 1000).toLocaleString('en-US')}.`], summary: `Fill ${l} L with ${per} mL`, explanation: `${(l * 1000).toLocaleString('en-US')} ÷ ${per} = ${(l * 1000) / per} bottles.` }); }
  if (fmt === 'poured') { const total = rand(10, 40); const per = rand(2, 5); const k = rand(2, Math.min(5, Math.floor((total - 1) / per))); return kp({ key: `cm:pour:${total}:${per}:${k}`, topic, story, answer: total - per * k, prompt: `A tank has ${total} liters. ${nm()} pours out ${k} buckets of ${per} liters each. How many liters are left?`, hints: [`First find how many liters were poured out: ${k} × ${per}.`], summary: `${total} L minus ${k} buckets`, explanation: `${k} × ${per} = ${k * per}. ${total} − ${k * per} = ${total - per * k} liters.` }); }
  if (fmt === 'poured2') { const l = rand(2, 6); const used = rand(200, l * 1000 - 100, 50); const u = Math.round(used / 50) * 50; return kp({ key: `cm:pour2:${l}:${u}`, topic, story, answer: l * 1000 - u, prompt: `A jug holds ${l} liters. ${nm()} pours out ${u.toLocaleString('en-US')} milliliters. How many milliliters are left?`, hints: [`Change ${l} liters to milliliters: ${(l * 1000).toLocaleString('en-US')}.`], summary: `${l} L minus ${u} mL`, explanation: `${(l * 1000).toLocaleString('en-US')} − ${u} = ${(l * 1000 - u).toLocaleString('en-US')} mL.` }); }
  if (fmt === 'mixed') { const a = rand(2, 9); const b = rand(100, 900, 50); const b5 = Math.round(b / 50) * 50; return kp({ key: `cm:mixed:${a}:${b5}`, topic, answer: a * 1000 + b5, prompt: `A bucket has ${a} liters and ${b5} milliliters of water. How many milliliters is that in all?`, hints: [`${a} liters is ${(a * 1000).toLocaleString('en-US')} milliliters. Then add ${b5}.`], summary: `${a} L ${b5} mL`, explanation: `${(a * 1000).toLocaleString('en-US')} + ${b5} = ${(a * 1000 + b5).toLocaleString('en-US')} mL.` }); }
  if (fmt === 'estimateHold') {
    const [what, ml] = pick(HOLDS.slice(0, 8)); const fmtN = (n) => (n >= 1000 ? `${(n / 1000).toLocaleString('en-US')} L` : `${n} mL`);
    const right = fmtN(ml); const wrong = uniq([fmtN(ml * 10), fmtN(Math.max(1, ml / 10)), fmtN(ml * 100)]).filter((x) => x !== right).slice(0, 2);
    return ch({ key: `cm:estH:${what}`, topic, prompt: `Which is the best estimate for how much ${what} holds?`, hints: ['Think about a liter: a big water bottle. Is it more or less than that?'], summary: `Estimate for ${what}`, explanation: `${what[0].toUpperCase() + what.slice(1)} holds about ${right}.`, answerLabel: right }, txt(right), wrong.map(txt));
  }
  if (fmt === 'estimateMass') {
    const [what, n, unit] = pick(MASSES); const right = `${n.toLocaleString('en-US')} ${unit}`; const other = unit === 'g' ? 'kg' : 'g';
    const wrong = uniq([`${n.toLocaleString('en-US')} ${other}`, `${(n * 10).toLocaleString('en-US')} ${unit}`, `${n} ${other === 'g' ? 'g' : 'kg'}`]).filter((x) => x !== right).slice(0, 2);
    return ch({ key: `cm:estM:${what}`, topic, prompt: `Which is the best estimate for the mass of ${what}?`, hints: ['A paper clip is about 1 gram. A bag of flour is about 1 kilogram.'], summary: `Mass of ${what}`, explanation: `${what[0].toUpperCase() + what.slice(1)} has a mass of about ${right}.`, answerLabel: right }, txt(right), wrong.map(txt));
  }
  if (fmt === 'compareMass') {
    const A = [['an elephant', 5000], ['a horse', 500], ['a dog', 20], ['a cat', 4], ['a mouse', 0.02]]; const [x, y] = sample(A, 2); const big = x[1] > y[1] ? x : y; const small = big === x ? y : x;
    return ch({ key: `cm:cmpM:${small[0]}:${big[0]}`, topic, prompt: `Which has MORE mass: ${small[0]} or ${big[0]}?`, hints: ['More mass means heavier.'], summary: `${small[0]} vs ${big[0]}`, explanation: `${big[0][0].toUpperCase() + big[0].slice(1)} has more mass.`, answerLabel: big[0] }, txt(big[0]), [txt(small[0])]);
  }
  const a = rand(300, 900, 50); const b = rand(100, a - 50, 50); const a5 = Math.round(a / 50) * 50; const b5 = Math.min(a5 - 50, Math.round(b / 50) * 50);
  return kp({ key: `cm:diff:${a5}:${b5}`, topic, story: st(mode, '⚖️', 'Weighing'), answer: a5 - b5, prompt: `A box of cereal has a mass of ${a5} grams. A box of rice has a mass of ${b5} grams. How many more grams is the cereal?`, hints: ['Subtract the smaller mass from the larger.'], summary: `${a5} g vs ${b5} g`, explanation: `${a5} − ${b5} = ${a5 - b5} grams.` });
}
