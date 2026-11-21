// Stress-test every curriculum generator: valid answers, choices include the answer,
// no NaN/Infinity/undefined in visible text, and dedupe streams don't hang.
import { CURRICULA } from '../src/curriculum/index.js';
import { checkAnswer, parseValue } from '../src/lib/answer.js';
import { createQuestionStream } from '../src/lib/session.js';

const MODES = ['flash', 'worksheet', 'story', 'stem'];
let failures = 0;
let total = 0;
const fail = (msg, q) => { failures++; if (failures < 40) console.error('FAIL:', msg, JSON.stringify(q).slice(0, 400)); };
const BAD = /NaN|Infinity|undefined|null|\[object/;

for (const [age, cur] of Object.entries(CURRICULA)) {
  for (const diff of cur.difficulties.map((d) => d.id)) {
    for (const topic of cur.topics) {
      for (const mode of MODES.filter((m) => topic.modes.includes(m))) {
        for (let i = 0; i < 300; i++) {
          total++;
          let q;
          try { q = cur.generate(mode, topic.id, diff); } catch (e) { fail(`throw ${age}/${topic.id}/${mode}/${diff}: ${e.message}`, {}); break; }
          if (!q) { fail(`null ${age}/${topic.id}/${mode}/${diff}`, {}); break; }
          if (!q.key || q.topic !== topic.id) fail(`key/topic ${age}/${topic.id}/${mode}`, q);
          const text = [q.prompt, q.display, q.explanation, q.answerLabel, ...(q.hints || []), ...(q.choices || []).map((c) => c.text || '')].join(' ');
          if (BAD.test(text)) fail(`bad text ${age}/${topic.id}/${mode}/${diff}`, q);
          if (!q.prompt && !q.display) fail('no prompt', q);
          if (q.input === 'choice') {
            if (!q.choices || q.choices.length < 2) fail('few choices', q);
            if (!q.choices.some((c) => c.id === q.answer)) fail('answer not in choices', q);
            const texts = q.choices.map((c) => c.text).filter(Boolean);
            if (new Set(texts).size !== texts.length) fail(`duplicate choice text ${topic.id}`, q);
            if (!checkAnswer(q.answer, q)) fail('choice self-check', q);
          } else {
            const v = parseValue(q.answer);
            if (v === null || !Number.isFinite(v)) fail(`answer unparsable ${age}/${topic.id}/${mode}/${diff}`, q);
            if (!checkAnswer(q.answer, q)) fail(`self-check ${age}/${topic.id}/${mode}/${diff}`, q);
            if (q.input === 'kidpad' && (v < 0 || v > 10 || !Number.isInteger(v))) fail('kidpad out of range', q);
            if (String(q.answer).length > 14) fail('answer too long', q);
          }
          if (q.visual?.type === 'objects' && (q.visual.count < 0 || q.visual.count > 20)) fail('objects count', q);
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

console.log(`${total} checks, ${failures} failures`);
process.exit(failures ? 1 : 0);
