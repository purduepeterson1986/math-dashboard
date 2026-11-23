// Stress-test every curriculum generator: valid answers, choices include the answer,
// no NaN/Infinity/undefined in visible text, and dedupe streams don't hang.
import { CURRICULA } from '../src/curriculum/index.js';
import { checkAnswer, parseValue } from '../src/lib/answer.js';
import { createQuestionStream } from '../src/lib/session.js';
import { toSpeech } from '../src/lib/audio.js';
import { THEMED } from '../src/curriculum/middleEarth.js';
import { auditLevels } from './level-audit-lib.mjs';
import { auditLadder } from './ladder-audit-lib.mjs';
import { readFileSync } from 'node:fs';

// Every picture type a question asks for must exist in Visual.jsx (an unknown type renders as a blank space).
const VIS_SRC = readFileSync(new URL('../src/components/Visual.jsx', import.meta.url), 'utf8');
const KNOWN_VISUALS = new Set([...VIS_SRC.matchAll(/(?:case|type ===) '([a-z0-9]+)'/gi)].map((m) => m[1]));

const MODES = ['flash', 'worksheet', 'story', 'stem'];
let failures = 0;
let total = 0;
const kinds = {};
const fail = (msg, q) => { failures++; const k = msg.replace(/[:\d].*$/, '').trim() + ' ' + (msg.match(/\d+\/[a-z0-9]+/i)?.[0] || ''); kinds[k] = (kinds[k] || 0) + 1; if (kinds[k] <= 2 && failures < 60) console.error('FAIL:', msg, JSON.stringify(q).slice(0, 400)); };
const BAD = /NaN|Infinity|undefined|null|\[object/;

for (const [age, cur] of Object.entries(CURRICULA)) {
  for (const diff of cur.difficulties.map((d) => d.id)) {
    for (const topic of cur.topics) {
      for (const mode of MODES.filter((m) => topic.modes.includes(m))) {
        for (let i = 0; i < 300; i++) {
          total++;
          let q;
          try { q = (i % 3 === 0 && THEMED[age] && THEMED[age](mode, topic.id, diff)) || cur.generate(mode, topic.id, diff); } catch (e) { fail(`throw ${age}/${topic.id}/${mode}/${diff}: ${e.message}`, {}); break; }
          if (!q) { fail(`null ${age}/${topic.id}/${mode}/${diff}`, {}); break; }
          if (!q.key || q.topic !== topic.id) fail(`key/topic ${age}/${topic.id}/${mode}`, q);
          const text = [q.prompt, q.display, q.explanation, q.answerLabel, ...(q.hints || []), ...(q.choices || []).map((c) => c.text || '')].join(' ');
          if (BAD.test(text)) fail(`bad text ${age}/${topic.id}/${mode}/${diff}`, q);
          if (!q.prompt && !q.display) fail('no prompt', q);
          for (const vz of [q.visual, ...(q.choices || []).map((c) => c.visual)]) if (vz && !KNOWN_VISUALS.has(vz.type)) fail(`unknown visual type ${vz.type} ${age}/${topic.id}`, q);
          if (q.answerLabel === undefined || q.answerLabel === null || q.answerLabel === '') fail(`no answer label ${age}/${topic.id}`, q);
          { const m = /value of the (\d) in ([\d,]+)/i.exec(q.prompt || ''); if (m && m[2].replace(/,/g, '').split(m[1]).length > 2) fail(`ambiguous digit ${age}/${topic.id}`, q); }
          if (q.input === 'choice') {
            if (!q.choices || q.choices.length < 2) fail('few choices', q);
            if (!q.choices.some((c) => c.id === q.answer)) fail('answer not in choices', q);
            const texts = q.choices.map((c) => c.text).filter(Boolean);
            if (new Set(texts).size !== texts.length) fail(`duplicate choice text ${topic.id}`, q);
            // Two options with the same VALUE are both right: fractions, mixed numbers (3 [[7/6]] = 4 [[1/6]]), decimals, money
            const textValue = (t) => {
              let m = t.match(/^\[\[(\d+)\/(\d+)\]\]$/); if (m) return Number(m[1]) / Number(m[2]);
              m = t.match(/^(\d+) \[\[(\d+)\/(\d+)\]\]$/); if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]);
              m = t.replace(/[$,]/g, '').match(/^-?\d+(\.\d+)?$/); return m ? Number(m[0]) : null;
            };
            const vals = texts.map(textValue).filter((v) => v !== null);
            if (new Set(vals.map((v) => v.toFixed(9))).size !== vals.length) fail(`equal-value fraction choices ${age}/${topic.id}`, q);
            if (!checkAnswer(q.answer, q)) fail('choice self-check', q);
            if (q.choices.every((c) => !c.text)) {
              const vis = q.choices.map((c) => JSON.stringify(c.visual));
              if (new Set(vis).size !== vis.length) fail(`duplicate picture choices ${age}/${topic.id}`, q);
            }
          } else {
            const v = parseValue(q.answer);
            if (v === null || !Number.isFinite(v)) fail(`answer unparsable ${age}/${topic.id}/${mode}/${diff}`, q);
            if (!checkAnswer(q.answer, q)) fail(`self-check ${age}/${topic.id}/${mode}/${diff}`, q);
            if (q.input === 'kidpad' && (v < 0 || v > 10 || !Number.isInteger(v))) fail('kidpad out of range', q);
            if (String(q.answer).length > 14) fail('answer too long', q);
            if (cur.keypad === 'simple' && !/^\d+$/.test(String(q.answer))) fail(`simple keypad needs whole-number answer ${age}/${topic.id}`, q);
          }
          if (q.visual?.type === 'objects' && (q.visual.count < 0 || q.visual.count > 20)) fail('objects count', q);
          if (cur.readAloud) {
            if (!q.speak) fail(`missing speak ${age}/${topic.id}/${mode}`, q);
            else if (/\[\[|[×÷−=<>+]|NaN|undefined/.test(q.speak)) fail(`speak has symbols ${age}/${topic.id}`, q);
            for (const said of [q.explanation, ...(q.hints || [])]) {
              if (said && /\[\[|[×÷−=<>+]/.test(toSpeech(said))) fail(`spoken text has symbols ${age}/${topic.id}: ${toSpeech(said)}`, q);
            }
          }
          (q.choices || []).forEach((c) => { if (c.visual?.type === 'objects' && c.visual.count > 10) fail('choice card with >10 objects', q); });
          if (q.visual?.type === 'clock' && !(q.visual.h >= 1 && q.visual.h <= 12 && q.visual.m >= 0 && q.visual.m < 60)) fail('bad clock', q);
        }
      }
    }
    // stream / dedupe check per mode incl. mix
    for (const mode of [...MODES, 'mix']) {
      const topics = cur.topics.filter((t) => mode === 'mix' || t.modes.includes(mode)).map((t) => t.id);
      const next = createQuestionStream(cur, mode, { topics, difficulty: diff });
      const keys = new Set();
      let repeats = 0;
      for (let i = 0; i < 25; i++) { const q = next(); if (keys.has(q.key)) repeats++; keys.add(q.key); }
      if (repeats) fail(`stream repeats ${age}/${mode}/${diff}: ${repeats}`, {});
    }
    // narrow filter: single small topic, must not hang
    const narrow = createQuestionStream(cur, 'flash', { topics: [cur.topics[0].id], difficulty: diff });
    for (let i = 0; i < 80; i++) narrow();
  }
}

// answer checker unit tests
const kq = (answer, extra = {}) => ({ input: 'keypad', answer, ...extra });
const cases = [
  ['3/4', kq('0.75'), true], ['.75', kq('3/4'), true], ['6/8', kq('3/4'), true], ['6/8', kq('3/4', { mustSimplify: true }), false],
  ['-5', kq('-5'), true], ['5', kq('-5'), false], ['12.0', kq('12'), true], ['1/0', kq('0'), false], ['', kq('0'), false],
  ['3.0', kq('3.14', { tolerance: 0.05 }), false], ['3.15', kq('3.14', { tolerance: 0.05 }), true], ['-3/4', kq('-0.75'), true], ['2/1', kq('2', { mustSimplify: true }), false],
];
for (const [g, q, want] of cases) { total++; if (checkAnswer(g, q) !== want) fail(`checkAnswer(${g}, ${q.answer}) != ${want}`, q); }

// Levels must feel different: no topic may serve (nearly) the same questions at two levels.
// (Run `node scripts/audit-levels.mjs <age> --show` to read samples when this fails.)
{
  const { weak, compared } = auditLevels({ N: 800 });
  total += compared;
  for (const w of weak) fail(`levels too alike ${w.age}/${w.topic}/${w.mode}${w.themed ? '/themed' : ''} ${w.pair}`, w);
}

// Levels must also rise from age to age: a topic's levels climb inside an age, and an older age never
// tops out below a younger one. (Run `node scripts/audit-ladder.mjs --show` to read samples when this fails.)
{
  const { findings } = auditLadder({ N: 400 });
  total += findings.length + 1;
  for (const f of findings) fail(`ladder ${f.kind} ${f.fam} age ${f.age}: ${f.detail}`, f);
}

if (failures) console.error(kinds);
console.log(`${total} checks, ${failures} failures`);
process.exit(failures ? 1 : 0);
