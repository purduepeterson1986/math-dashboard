// Print sample questions for one age: 20 per difficulty level, with headings, ready to copy and paste.
//
//   node scripts/sample-questions.mjs            asks which age
//   node scripts/sample-questions.mjs 4          Age 4, 20 questions per level
//   node scripts/sample-questions.mjs 4 30       30 per level
//   node scripts/sample-questions.mjs 4 --plain  no Middle-earth questions
//   node scripts/sample-questions.mjs 4 --out ages/age4.md   also save to a file
//
// Questions are spread across the age's topics and modes. Pictures are described in words.
import readline from 'node:readline/promises';
import fs from 'node:fs';
import { CURRICULA } from '../src/curriculum/index.js';
import { setMiddleEarth } from '../src/curriculum/middleEarth.js';

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const outIdx = args.indexOf('--out');
const outFile = outIdx >= 0 ? args[outIdx + 1] : null;
const nums = args.filter((a, i) => /^\d+$/.test(a) && args[i - 1] !== '--out').map(Number);

let age = nums[0];
if (!age) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ages = Object.keys(CURRICULA).join(', ');
  age = Number(await rl.question(`Which age? (${ages}) `));
  rl.close();
}
const cur = CURRICULA[age];
if (!cur) { console.error(`Age ${age} isn't built yet. Built ages: ${Object.keys(CURRICULA).join(', ')}`); process.exit(1); }
const perLevel = nums[1] || 20;
setMiddleEarth(!flag('--plain'));

/* ----------------------------- describe pictures ----------------------------- */
const rep = (e, n) => (e || '•').repeat(Math.min(n, 40));
function describe(v) {
  if (!v) return '';
  switch (v.type) {
    case 'objects': return `${v.count} ${v.emoji}${v.faded ? ` (${v.faded} of them faded/crossed out)` : ''}`;
    case 'groups': return v.groups.map((g) => `${g.count} ${g.emoji}`).join(` ${v.op || '+'} `);
    case 'emoji': return v.emoji;
    case 'shape': { const w = `${v.color || ''} ${v.shape}`.trim(); return `${/^[aeiou]/i.test(w) ? 'an' : 'a'} ${w}`; }
    case 'sized': return `a ${v.emoji} drawn at ${Math.round((v.scale || 1) * 100)}% size`;
    case 'tenframe': return `${v.five ? 'five frame' : 'ten frame(s)'} with ${v.count} ${v.count === 1 ? 'dot' : 'dots'}`;
    case 'pattern': return `pattern: ${v.items.map((i) => (i ? describe(i) : '?')).join(', ')}`;
    case 'sequence': return `number line sequence: ${v.terms.join(', ')}${v.blank ? ', ?' : ''}`;
    case 'clock': return `clock showing ${v.h}:${String(v.m).padStart(2, '0')}`;
    case 'coins': return `coins: ${v.coins.join('¢, ')}¢`;
    case 'ruler': return `ruler, object from ${v.start || 0} to ${(v.start || 0) + v.length} ${v.unit}`;
    case 'cubes': return `${v.length} cubes in a row with ${v.emoji || 'an object'} above`;
    case 'stick': return `a stick, length ${v.len}`;
    case 'array': return `array: ${v.rows} rows of ${v.cols}`;
    case 'base10': return `base-ten blocks: ${v.hundreds ? `${v.hundreds} hundreds, ` : ''}${v.tens} tens, ${v.ones || 0} ${(v.ones || 0) === 1 ? 'one' : 'ones'}`;
    case 'fracshape': return `shape divided into ${v.parts || v.den || '?'} parts, ${v.shaded ?? v.num ?? '?'} shaded`;
    case 'bargraph': return `bar graph "${v.title}": ${v.items.map((i) => `${i.label} ${i.value}`).join(', ')} (scale ${v.step || 1})`;
    case 'picgraph': return `picture graph "${v.title}" (each ${v.emoji} = ${v.each}): ${v.rows.map((r) => `${r.label} ${r.value / v.each}`).join(', ')}`;
    case 'numberbond': return `number bond: whole ${v.whole}, parts ${v.parts.map((p) => (p == null ? '?' : p)).join(' and ')}`;
    case 'emojiset': return `items: ${v.items.join(' ')}`;
    case 'character': return v.id;
    case 'lineup': return `line-up of ${v.ids.join(', ')}`;
    case 'crowd': return `a crowd of ${v.ids.length}: ${v.ids.join(', ')}`;
    case 'areagrid': return `grid of squares ${v.w || '?'} × ${v.h || '?'}`;
    case 'fracline': return `number line from 0 to 1 split in ${v.den || '?'}, dot at ${v.num ?? '?'}/${v.den || '?'}`;
    case 'dice': return `${v.count} dice`;
    case 'marbles': return `marbles: ${v.groups.map((g) => `${g.count} ${g.color}`).join(', ')}`;
    case 'clues': return `clues: ${v.items.join(' | ')}`;
    case 'tape': return `tape diagram: ${v.parts.map((p) => `${p.label} ${p.units}`).join(', ')}, total ${v.total}`;
    case 'rect': return `rectangle ${v.w} by ${v.h} ${v.unit || ''}`;
    case 'bars': return `bars: ${v.values.join(', ')}`;
    case 'angle': return `angle drawing${v.flip ? ' (opening to the left)' : ''}: ${v.parts.map((p) => `${p.deg}°${p.label ? ` labeled "${p.label}"` : ' (no label)'}`).join(' next to ')}${v.parts.reduce((s, p) => s + p.deg, 0) === 180 ? ', on a straight line' : ''}`;
    case 'linepair': return `two lines drawn ${v.kind === 'parallel' ? 'side by side, never meeting' : v.kind === 'perpendicular' ? 'crossing at a square corner (marked)' : 'crossing at a slant'}`;
    case 'lshape': return `L-shaped figure: ${v.W} by ${v.H} ${v.unit || ''} with a ${v.cw} by ${v.ch} corner cut out`;
    default: return `picture (${v.type})`;
  }
}
const clean = (t) => String(t ?? '').replace(/\[\[(-?\d+)\/(\d+)\]\]/g, '$1/$2').replace(/\s+/g, ' ').trim();
const choiceText = (c) => clean(c.text) || describe(c.visual) || 'picture';

function format(q, topicLabel, mode) {
  const lines = [];
  const body = [clean(q.prompt), q.display && clean(q.display) !== clean(q.prompt) ? `[${clean(q.display)}]` : ''].filter(Boolean).join(' ');
  lines.push(`${body}${q.story ? `  (story: ${q.story.title})` : ''}`);
  if (q.visual) lines.push(`   Picture: ${describe(q.visual)}`);
  if (q.input === 'choice') {
    const letters = 'ABCDEFGH';
    q.choices.forEach((c, i) => lines.push(`   ${letters[i]}) ${choiceText(c)}`));
    const idx = q.choices.findIndex((c) => c.id === q.answer);
    lines.push(`   Answer: ${idx >= 0 ? `${letters[idx]} (${clean(q.answerLabel)})` : clean(q.answerLabel)}`);
  } else {
    lines.push(`   Answer: ${clean(q.answerLabel ?? q.answer)}${q.input === 'kidpad' ? '  (tap-number pad)' : ''}`);
  }
  lines.push(`   [${topicLabel} · ${mode}]`);
  return lines.join('\n');
}

/* ----------------------------- gather & print ----------------------------- */
const out = [];
out.push(`# Age ${age} — ${cur.title}`);
out.push(`${cur.tagline}`);
out.push(`${perLevel} sample questions per level${flag('--plain') ? ' (no Middle-earth questions)' : ' (Middle-earth questions mixed in as in the app)'}.`);
out.push('');

for (const diff of cur.difficulties) {
  out.push(`## ${diff.label}`);
  out.push(`_${diff.detail}_`);
  out.push('');
  const seen = new Set();
  let n = 0; let guard = 0;
  // go round the topics so every topic shows up, using a random mode each time
  while (n < perLevel && guard++ < perLevel * 60) {
    const topic = cur.topics[guard % cur.topics.length];
    const modes = topic.modes;
    const mode = modes[Math.floor(Math.random() * modes.length)];
    // generate() already mixes in Middle-earth questions about half the time, exactly as in the app
    const q = cur.generate(mode, topic.id, diff.id);
    if (!q || seen.has(q.key)) continue;
    seen.add(q.key); n++;
    out.push(`${n}. ${format(q, topic.label, mode)}`);
    out.push('');
  }
}

const text = out.join('\n');
console.log(text);
if (outFile) { fs.writeFileSync(outFile, text + '\n'); console.error(`\nSaved to ${outFile}`); }
process.exit(0);
