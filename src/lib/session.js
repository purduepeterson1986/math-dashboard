import { givenLabel } from './answer.js';
import { shuffle, pick, uid } from './rng.js';

const MAX_TRIES = 60;

/** Topics from `selected` that the curriculum supports in `mode`. */
export function topicsForMode(curriculum, mode, selected) {
  const supported = curriculum.topics.filter((t) =>
    mode === 'mix' ? true : t.modes.includes(mode));
  const ids = supported.map((t) => t.id);
  return selected ? ids.filter((id) => selected.includes(id)) : ids;
}

const MIX_MODES = ['flash', 'story', 'stem'];

/**
 * Returns a `next()` function producing randomized questions with no duplicates
 * within the session. Topics rotate through a shuffled deck so coverage stays even.
 */
export function createQuestionStream(curriculum, mode, config) {
  const topics = topicsForMode(curriculum, mode, config.topics);
  if (!topics.length) throw new Error('No topics selected');
  const seen = new Set();
  let deck = [];
  let counter = 0;

  const nextTopic = () => {
    if (!deck.length) deck = shuffle(topics);
    return deck.pop();
  };

  const generateFor = (topic) => {
    let m = mode;
    if (mode === 'mix') {
      const t = curriculum.topics.find((x) => x.id === topic);
      const options = MIX_MODES.filter((mm) => t.modes.includes(mm));
      m = options.length ? pick(options) : t.modes[0];
    }
    const q = curriculum.generate(m, topic, config.difficulty);
    return q ? { ...q, sourceMode: m } : null;
  };

  return function next() {
    counter++;
    let topic = nextTopic();
    for (let i = 0; i < MAX_TRIES; i++) {
      if (i > 0 && i % 12 === 0) topic = nextTopic(); // this topic is exhausted — rotate
      const q = generateFor(topic);
      if (!q) continue;
      if (seen.has(q.key)) continue;
      seen.add(q.key);
      return { ...q, id: uid(), n: counter };
    }
    // pool exhausted: allow a repeat rather than hang
    const q = generateFor(topic) || generateFor(topics[0]);
    return { ...q, id: uid(), n: counter, repeat: true };
  };
}

export function buildQuestionSet(curriculum, mode, config, count) {
  const next = createQuestionStream(curriculum, mode, config);
  return Array.from({ length: count }, () => next());
}

/** Build the record we persist for each answered question. */
export function makeRecord(q, given, correct, ms, extra = {}) {
  return {
    topic: q.topic,
    mode: q.sourceMode,
    prompt: q.summary || q.display || q.prompt,
    answer: q.answerLabel ?? String(q.answer),
    given,
    givenText: givenLabel(given, q),
    why: q.explanation || '',
    correct,
    ms: Math.round(ms),
    ...extra,
  };
}
