// "Try It & See": predict-and-test questions with a short animation that plays after the child answers.
// Each question is a tap-to-choose with a `motion` picture (see components/VisualsMotion.jsx). lv is 0, 1 or 2
// (Warm-up, Standard, Stretch) and picks which experiments and how close the call is.
import { pick, sample, shuffle } from '../lib/rng.js';
import { ch, st, txt, emo } from './extraKit.js';

const topic = 'tryit';
const COLS = ['red', 'blue', 'yellow', 'green', 'purple', 'orange'];
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const SQUARE = { red: '🟥', blue: '🟦', yellow: '🟨', green: '🟩', purple: '🟪', orange: '🟧' };
const spoken = (t) => t.replace(/[A-Z]{2,}/g, (w) => w.toLowerCase());

/** Shared question shape: two or three words to tap, a picture that moves, a plain reason. */
function make(mode, o, right, wrong, label) {
  const pic = typeof right === 'object';
  return ch({
    topic, story: st(mode, '🔬', 'Try It & See'), speak: spoken(o.prompt), answerLabel: pic ? label : right,
    ...o,
  }, pic ? right : txt(right), pic ? wrong : wrong.map(txt));
}

/* ------------------------------ will it stay up? ------------------------------ */
const STACK_TEXT = {
  bigOnSmall: { prompt: 'We put a BIG block on top of a tiny block. Will it stay up or fall down?', up: false, hint: 'Look at the bottom block. Is it wide enough to hold the top one?', why: 'A big block on a tiny block is wobbly. It falls down!' },
  smallOnBig: { prompt: 'We put a small block on top of a BIG block. Will it stay up or fall down?', up: true, hint: 'Look at the bottom block. Is it wide enough to hold the top one?', why: 'A small block on a big block is steady. It stays up!' },
  blockOnBlock: { prompt: 'We put one block on top of another block, the same size. Will it stay up or fall down?', up: true, hint: 'Flat sides sit nicely on flat sides.', why: 'Two blocks the same size sit steady. It stays up!' },
  ballOnBlock: { prompt: 'We put a ball on top of a block. Will it stay up or fall down?', up: false, hint: 'What do balls like to do?', why: 'A ball rolls! It rolls right off. It falls down!' },
  blockOnBall: { prompt: 'We put a block on top of a ball. Will it stay up or fall down?', up: false, hint: 'A ball is round. Can a block sit still on something round?', why: 'A block cannot sit still on a round ball. It tips over and falls down!' },
  hangingOff: { prompt: 'We put a block on top, with half of it hanging off the edge. Will it stay up or fall down?', up: false, hint: 'Is there anything under the part that sticks out?', why: 'Nothing is holding up the part that sticks out. It falls down!' },
};
function stack(mode, lv) {
  const scene = pick([['bigOnSmall', 'smallOnBig'], ['blockOnBlock', 'ballOnBlock', 'smallOnBig'], ['blockOnBall', 'hangingOff', 'ballOnBlock']][lv]);
  const T = STACK_TEXT[scene];
  const [baseColor, topColor] = sample(COLS, 2);
  return make(mode, {
    key: `mo:stack:${scene}:${baseColor}:${topColor}`, prompt: T.prompt, hints: [T.hint], summary: `Stack: ${scene}`, explanation: T.why,
    visual: { type: 'motion', kind: 'stack', scene, baseColor, topColor, alt: 'Blocks stacked up' },
  }, T.up ? 'Stay up' : 'Fall down', [T.up ? 'Fall down' : 'Stay up']);
}

/* ------------------------------ which car is first? ------------------------------ */
function race(mode, lv) {
  const three = lv === 2;
  const cars = sample(COLS, three ? 3 : 2);
  const heights = three ? [100, 62, 30] : lv === 0 ? [108, 32] : [110, 62];
  const order = shuffle(cars.map((c, i) => ({ color: c, h: heights[i] })));
  const slowest = three && Math.random() < 0.5;
  const winner = order.reduce((a, b) => ((slowest ? b.h < a.h : b.h > a.h) ? b : a));
  const prompt = three
    ? `Three cars start at the top of three ramps. Which car will get to the bottom ${slowest ? 'LAST' : 'FIRST'}?`
    : 'Two cars start at the top of two ramps. Which car will get to the bottom FIRST?';
  const hint = slowest ? 'A flat ramp is slow. A steep ramp is fast.' : 'A steep ramp makes a car go fast. A flat ramp is slow.';
  const why = slowest
    ? `The ${winner.color} car is on the flattest ramp. A flat ramp is slow, so it comes in last.`
    : `The ${winner.color} car is on the steepest ramp. A steep ramp is fast, so it wins!`;
  return make(mode, {
    key: `mo:race:${order.map((o) => `${o.color}${o.h}`).join('-')}:${slowest ? 'last' : 'first'}`, prompt, hints: [hint], summary: 'Ramp race', explanation: why,
    visual: { type: 'motion', kind: 'race', lanes: order.map((o) => ({ color: o.color, h: o.h })), alt: 'Cars on ramps' },
  }, cap(winner.color), order.filter((o) => o !== winner).map((o) => cap(o.color)));
}

/* ------------------------------ who rolls? ------------------------------ */
const ROUND = [['⚽', 'soccer ball'], ['🏀', 'basketball'], ['🎾', 'tennis ball'], ['🍎', 'apple'], ['🍊', 'orange'], ['🏐', 'ball']];
const FLAT = [['📦', 'box'], ['🧱', 'brick'], ['📚', 'stack of books'], ['🧊', 'ice cube']];
function roll(mode, lv) {
  const asNot = lv >= 1 && Math.random() < 0.5; // "which will NOT roll?"
  const n = lv === 2 ? 3 : 2;
  // Three ramps: the answer is the odd one out.
  const askFor = asNot ? 'flat' : 'round';
  const answerPool = askFor === 'round' ? ROUND : FLAT;
  const otherPool = askFor === 'round' ? FLAT : ROUND;
  const ans = pick(answerPool);
  const others = sample(otherPool.filter((o) => o !== ans), n - 1);
  const items = shuffle([{ it: ans, rolls: askFor === 'round' }, ...others.map((it) => ({ it, rolls: askFor !== 'round' }))]);
  const prompt = asNot
    ? `${n === 3 ? 'Three' : 'Two'} things start at the top of the ramps. Which one will NOT roll?`
    : `${n === 3 ? 'Three' : 'Two'} things start at the top of the ramps. Which one will ROLL down?`;
  const why = asNot
    ? `The ${ans[1]} has flat sides, so it does not roll. The round things roll!`
    : `The ${ans[1]} is round, so it rolls. Flat things do not roll!`;
  return make(mode, {
    key: `mo:roll:${asNot ? 'not' : 'yes'}:${items.map((o) => o.it[0]).join('')}`, prompt, hints: [asNot ? 'Look for the one with flat sides.' : 'Look for the round one.'], summary: 'Which one rolls', explanation: why,
    visual: { type: 'motion', kind: 'roll', lanes: items.map((o) => ({ emoji: o.it[0], rolls: o.rolls, h: 70 })), alt: 'Things on ramps' },
  }, { visual: emo(ans[0], 0.9), text: undefined }, items.filter((o) => o.it !== ans).map((o) => ({ visual: emo(o.it[0], 0.9) })), ans[1]);
}

/* ------------------------------ sink or float? ------------------------------ */
const FLOATERS = [
  [['🦆', 'rubber duck'], ['🏀', 'ball'], ['🪵', 'log']],
  [['🍎', 'apple'], ['🍃', 'leaf'], ['🎈', 'balloon'], ['🧊', 'ice cube']],
  [['🚢', 'big ship'], ['🍉', 'watermelon'], ['🛶', 'canoe'], ['🧊', 'ice cube']],
];
const SINKERS = [
  [['🪨', 'rock'], ['🔑', 'key'], ['🪙', 'coin']],
  [['🧱', 'brick'], ['⚓', 'anchor'], ['🔨', 'hammer'], ['🥔', 'potato']],
  [['🥕', 'carrot'], ['🥔', 'potato'], ['🔩', 'bolt'], ['🪙', 'coin']],
];
function float(mode, lv) {
  const floats = Math.random() < 0.5;
  const it = pick((floats ? FLOATERS : SINKERS)[lv]);
  const holds = ['big ship', 'canoe'].includes(it[1]);
  const why = floats
    ? (holds ? `The ${it[1]} is shaped to hold air, so it floats.` : `The ${it[1]} is light for its size, so it floats on top.`)
    : `The ${it[1]} is heavy for its size, so it sinks to the bottom.`;
  return make(mode, {
    key: `mo:float:${it[0]}`, prompt: `We drop a ${it[1]} in the water. Will it float or sink?`, hints: [floats ? 'Light things like to stay on top.' : 'Heavy things go down.'], summary: 'Sink or float', explanation: why,
    visual: { type: 'motion', kind: 'float', emoji: it[0], floats, alt: `A ${it[1]} over a tub of water` },
  }, floats ? 'Float' : 'Sink', [floats ? 'Sink' : 'Float']);
}

/* ------------------------------ seesaw ------------------------------ */
// Rough weights in pounds, only used to tell which animal is heavier
const HEAVY = [['🐘', 'elephant'], ['🦒', 'giraffe'], ['🐻', 'bear']];
const MID = [['🐻', 'bear'], ['🐶', 'dog']];
const SMALL = [['🐱', 'kitten'], ['🐰', 'bunny'], ['🐥', 'chick']];
const LIGHT = [['🐭', 'mouse'], ['🐥', 'chick'], ['🐝', 'bee']];
function seesaw(mode, lv) {
  const heavierLeft = Math.random() < 0.5;
  let hv; let lt; let why; let pickHeavy; let pickLight; let label; let prompt; let hint;
  if (lv === 2) {
    const color = pick(COLS);
    const a = pick([3, 4, 5]); const b = pick([1, 2].filter((x) => x < a));
    const sq = SQUARE[color];
    hv = { blocks: a, color }; lt = { blocks: b, color };
    pickHeavy = { visual: { type: 'objects', emoji: sq, count: a } }; pickLight = { visual: { type: 'objects', emoji: sq, count: b } };
    label = `${a} blocks`;
    prompt = 'Blocks sit on both ends of a seesaw. Which pile will go DOWN?';
    hint = 'The pile with more blocks is heavier.';
    why = `One pile has ${a} blocks and the other has ${b}. More blocks are heavier, so that pile goes down!`;
  } else {
    // Warm-up: huge vs tiny. Standard: a closer call, like a dog and a kitten.
    const h = pick(lv === 0 ? HEAVY : MID);
    const l = pick(lv === 0 ? LIGHT : SMALL);
    hv = { emoji: h[0] }; lt = { emoji: l[0] };
    pickHeavy = { visual: emo(h[0], 0.9) }; pickLight = { visual: emo(l[0], 0.9) };
    label = h[1];
    prompt = 'Two animals sit on a seesaw. Which one will go DOWN?';
    hint = 'The heavier one goes down.';
    why = `The ${h[1]} is heavier than the ${l[1]}, so the ${h[1]} goes down!`;
  }
  const left = heavierLeft ? hv : lt; const right = heavierLeft ? lt : hv;
  const side = heavierLeft ? 'left' : 'right';
  return make(mode, {
    key: `mo:seesaw:${side}:${lv === 2 ? `${hv.blocks}v${lt.blocks}:${hv.color}` : `${hv.emoji}${lt.emoji}`}`,
    prompt, hints: [hint], summary: 'Seesaw', explanation: why,
    visual: { type: 'motion', kind: 'seesaw', left, right, heavier: side, alt: 'A seesaw' },
  }, pickHeavy, [pickLight], label);
}

/* ------------------------------ will the magnet pick it up? ------------------------------ */
const MAGNETIC = [[['🔩', 'bolt'], ['📎', 'paper clip']], [['🔩', 'bolt'], ['📎', 'paper clip'], ['🥫', 'tin can'], ['🔧', 'wrench']], [['🔧', 'wrench'], ['🥫', 'tin can'], ['✂️', 'pair of scissors'], ['🔨', 'hammer']]];
const NOT_MAGNETIC = [[['🍎', 'apple'], ['🧦', 'sock'], ['🪵', 'stick']], [['🧸', 'teddy bear'], ['🍪', 'cookie'], ['🪨', 'rock'], ['📄', 'paper']], [['🧱', 'brick'], ['🪶', 'feather'], ['🍌', 'banana'], ['🧽', 'sponge']]];
function magnet(mode, lv) {
  const sticks = Math.random() < 0.5;
  const it = pick((sticks ? MAGNETIC : NOT_MAGNETIC)[lv]);
  return make(mode, {
    key: `mo:magnet:${it[0]}`, prompt: `We hold a magnet next to a ${it[1]}. Will the ${it[1]} stick to the magnet?`,
    hints: [sticks ? 'Magnets grab some metal things.' : 'Magnets do not grab everything.'], summary: 'Magnet',
    explanation: sticks ? `The ${it[1]} is made of metal that a magnet grabs, so it sticks!` : `The ${it[1]} is not the kind of thing a magnet grabs, so it does not stick.`,
    visual: { type: 'motion', kind: 'magnet', emoji: it[0], sticks, alt: 'A magnet' },
  }, sticks ? 'It sticks' : 'It does not stick', [sticks ? 'It does not stick' : 'It sticks']);
}

/* ------------------------------ melt or stay hard? ------------------------------ */
const MELT = [
  [{ e: '🧊', n: 'ice cube', hot: true, melts: true }, { e: '⛄', n: 'snowman', hot: true, melts: true }, { e: '🧊', n: 'ice cube', hot: false, melts: false }, { e: '⛄', n: 'snowman', hot: false, melts: false }],
  [{ e: '🍦', n: 'ice cream cone', hot: true, melts: true }, { e: '🍫', n: 'chocolate bar', hot: true, melts: true }, { e: '🪨', n: 'rock', hot: true, melts: false }, { e: '🍦', n: 'ice cream cone', hot: false, melts: false }],
  [{ e: '🧈', n: 'butter', hot: true, melts: true }, { e: '🍫', n: 'chocolate bar', hot: true, melts: true }, { e: '🍎', n: 'apple', hot: true, melts: false }, { e: '🧱', n: 'brick', hot: true, melts: false }, { e: '🧊', n: 'ice cube', hot: false, melts: false }],
];
function melt(mode, lv) {
  const c = pick(MELT[lv]);
  const where = c.hot ? 'out in the hot sun' : 'in the cold snow';
  return make(mode, {
    key: `mo:melt:${c.e}:${c.hot ? 'hot' : 'cold'}`, prompt: `We put a ${c.n} ${where}. Will it melt?`,
    hints: [c.hot ? 'Heat can make some things soft and runny.' : 'Cold keeps things hard.'], summary: 'Melt',
    explanation: c.melts ? `The sun is hot. The ${c.n} gets warm and melts into a puddle!` : c.hot ? `The ${c.n} does not melt in the sun. Only things like ice, ice cream and chocolate melt.` : `It is cold, so the ${c.n} stays hard.`,
    visual: { type: 'motion', kind: 'melt', emoji: c.e, hot: c.hot, melts: c.melts, alt: `A ${c.n}` },
  }, c.melts ? 'It melts' : 'It stays hard', [c.melts ? 'It stays hard' : 'It melts']);
}

/* ------------------------------ mix the colors ------------------------------ */
const MIXES = [{ a: 'red', b: 'yellow', r: 'orange' }, { a: 'blue', b: 'yellow', r: 'green' }, { a: 'red', b: 'blue', r: 'purple' }];
const swatch = (c) => ({ visual: { type: 'shape', shape: 'circle', color: c, size: 0.7 } });
function mix(mode, lv) {
  const m = pick(lv === 0 ? MIXES.slice(0, 2) : MIXES);
  const pool = lv === 2 ? ['orange', 'green', 'purple', 'pink', 'teal'] : ['orange', 'green', 'purple'];
  const wrong = sample(pool.filter((c) => c !== m.r), lv === 0 ? 1 : lv === 1 ? 2 : 3);
  const [a, b] = Math.random() < 0.5 ? [m.a, m.b] : [m.b, m.a];
  return make(mode, {
    key: `mo:mix:${a}:${b}:${wrong.length}`, prompt: `We mix ${a} paint and ${b} paint together. What color will we get?`,
    hints: [`Watch what happens when ${a} and ${b} touch.`], summary: 'Mixing colors', explanation: `${cap(a)} and ${b} make ${m.r}!`,
    visual: { type: 'motion', kind: 'mix', a, b, result: m.r, alt: 'Two colors mixing' },
  }, swatch(m.r), wrong.map(swatch), m.r);
}

/* ------------------------------ what does a plant need? ------------------------------ */
function plant(mode, lv) {
  const cases = lv === 0
    ? [{ sun: true, water: true }, { sun: false, water: false }]
    : [{ sun: true, water: true }, { sun: true, water: false }, { sun: false, water: true }];
  const c = pick(cases);
  const grows = c.sun && c.water;
  const gives = c.sun && c.water ? 'water and sunshine' : c.sun ? 'sunshine but NO water' : c.water ? 'water but NO sunshine' : 'NO water and NO sunshine';
  const why = grows ? 'Plants need water and sunshine to grow. This one gets both, so it grows tall!'
    : !c.water && c.sun ? 'Plants need water to grow. With no water, it droops.' : !c.sun && c.water ? 'Plants need sunshine to grow. With no sunshine, it droops.' : 'Plants need water and sunshine. With neither, it droops.';
  return make(mode, {
    key: `mo:plant:${c.sun ? 's' : '-'}${c.water ? 'w' : '-'}`, prompt: `We plant a seed. We give it ${gives}. Will it grow into a plant?`,
    hints: ['Plants need water and sunshine.'], summary: 'Plants', explanation: why,
    visual: { type: 'motion', kind: 'plant', sun: c.sun, water: c.water, grows, alt: 'A seed in a pot' },
  }, grows ? 'It grows' : 'It droops', [grows ? 'It droops' : 'It grows']);
}

/* ------------------------------ what will the wind blow away? ------------------------------ */
const LIGHTS = [[['🪶', 'feather'], ['🍃', 'leaf']], [['🍃', 'leaf'], ['🎈', 'balloon'], ['🪶', 'feather']], [['🎈', 'balloon'], ['🍃', 'leaf'], ['🪶', 'feather']]];
const HEAVIES = [[['🪨', 'rock'], ['🧱', 'brick']], [['🍎', 'apple'], ['🥔', 'potato'], ['🪨', 'rock']], [['🍎', 'apple'], ['🥔', 'potato'], ['🧱', 'brick'], ['🔨', 'hammer']]];
function wind(mode, lv) {
  const n = lv === 2 ? 3 : 2;
  const ans = pick(LIGHTS[lv]);
  const others = sample(HEAVIES[lv], n - 1);
  const items = shuffle([{ it: ans, blows: true }, ...others.map((it) => ({ it, blows: false }))]);
  return make(mode, {
    key: `mo:wind:${items.map((o) => o.it[0]).join('')}`, prompt: `A fan blows a big wind. Which one will the wind blow away?`,
    hints: ['Light things blow away. Heavy things stay.'], summary: 'Wind', explanation: `The ${ans[1]} is very light, so the wind blows it away. The ${others.map((o) => o[1]).join(' and the ')} ${others.length > 1 ? 'are' : 'is'} too heavy.`,
    visual: { type: 'motion', kind: 'wind', items: items.map((o) => ({ emoji: o.it[0], blows: o.blows })), alt: 'A fan and some things' },
  }, { visual: emo(ans[0], 0.9) }, items.filter((o) => !o.blows).map((o) => ({ visual: emo(o.it[0], 0.9) })), ans[1]);
}

/* ------------------------------ push or pull? ------------------------------ */
function push(mode, lv) {
  const scene = pick([['push', 'pull'], ['push', 'pull', 'strong'], ['strong', 'weak']][lv]);
  const T = {
    push: { prompt: 'I want the wagon to roll AWAY from me. Do I push it or pull it?', right: 'Push', wrong: 'Pull', hint: 'Push sends things away. Pull brings them close.', why: 'You push to make it go away from you!' },
    pull: { prompt: 'I want the wagon to come TO me. Do I push it or pull it?', right: 'Pull', wrong: 'Push', hint: 'Push sends things away. Pull brings them close.', why: 'You pull to make it come to you!' },
    strong: { prompt: 'I give the ball a BIG push. Will it roll far or just a little?', right: 'Far', wrong: 'Just a little', hint: 'A big push is strong.', why: 'A big push makes the ball go far!' },
    weak: { prompt: 'I give the ball a tiny, gentle push. Will it roll far or just a little?', right: 'Just a little', wrong: 'Far', hint: 'A gentle push is soft.', why: 'A gentle push only makes the ball go a little way.' },
  }[scene];
  return make(mode, {
    key: `mo:push:${scene}`, prompt: T.prompt, hints: [T.hint], summary: 'Push and pull', explanation: T.why,
    visual: { type: 'motion', kind: 'push', scene, alt: 'A child and a wagon' },
  }, T.right, [T.wrong]);
}

/** One predict-and-test question. */
export function tryIt(mode, lv) {
  return pick([stack, race, roll, float, seesaw, magnet, melt, mix, plant, wind, push])(mode, lv);
}
