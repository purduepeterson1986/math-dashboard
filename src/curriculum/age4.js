/**
 * Age 4 — "Little Counters" (Pre-K)
 * Pitched for advanced 4-year-olds: "Advanced" is the default; "Stretch" reaches into
 * Kindergarten (count to 20, numbers to 20, add & take away within 10, 3D shapes, ABC patterns).
 *
 * Built from the Age 3 and Age 5 generators, each called at the level that fits a 4-year-old.
 */
import * as A3 from './age3.js';
import * as A5 from './age5.js';
import { retopic } from './shared.js';
import { themed4, middleEarthOn, THEME_RATE } from './middleEarth.js';
import { chance } from '../lib/rng.js';

const lvl = (d) => (d === 'gentle' || d === 'stretch' ? d : 'ready');
// Age 3 level to use for each Age 4 level, and the same for Age 5
const D3 = { gentle: 'ready', ready: 'stretch', stretch: 'stretch' };
const D5 = { gentle: 'gentle', ready: 'gentle', stretch: 'ready' };

const ALL = ['flash', 'worksheet', 'story', 'stem'];

export default {
  age: 4,
  title: 'Little Counters',
  tagline: 'Counting to 20, numbers, shapes, patterns & measuring',
  accent: 'rose',
  allowRetry: true,
  bigInput: true,
  readAloud: true,
  keypad: 'simple',
  topics: [
    { id: 'count10', label: 'Counting to 10', group: 'Numbers', modes: ALL },
    { id: 'count20', label: 'Counting to 20', group: 'Numbers', modes: ALL },
    { id: 'numerals', label: 'Number Recognition', group: 'Numbers', modes: ALL },
    { id: 'compare', label: 'More, Fewer & Same', group: 'Numbers', modes: ALL },
    { id: 'oneMore', label: 'One More & Take Away', group: 'Numbers', modes: ['flash', 'worksheet', 'story'] },
    { id: 'skip', label: 'Counting On & by 10s', group: 'Numbers', modes: ['flash', 'worksheet', 'stem'] },
    { id: 'shapes', label: 'Shapes in the World', group: 'Shapes & Measuring', modes: ALL },
    { id: 'patterns', label: 'AB & ABC Patterns', group: 'Shapes & Measuring', modes: ['worksheet', 'story', 'stem'] },
    { id: 'measure', label: 'Measuring with Objects', group: 'Shapes & Measuring', modes: ['worksheet', 'story', 'stem'] },
    { id: 'sorting', label: 'Sorting & Classifying', group: 'Shapes & Measuring', modes: ['worksheet', 'story', 'stem'] },
  ],
  difficulties: [
    { id: 'gentle', label: 'Warm-up', detail: 'Count to 10, one more, AB & AAB patterns, flat shapes' },
    { id: 'ready', label: 'Advanced', detail: 'Count to 12+, numbers to 20, add & take away within 10, ABC patterns' },
    { id: 'stretch', label: 'Stretch', detail: 'Kindergarten reach: count to 20, 3D shapes, sides & corners, measuring with cubes' },
  ],
  defaultDifficulty: 'ready',
  defaults: {
    flash: { seconds: 90, maxCards: 15 },
    worksheet: { count: 10 },
    story: { count: 6 },
    stem: { count: 8 },
    mix: { count: 10 },
  },
  countOptions: { worksheet: [6, 8, 10, 12], story: [4, 6, 8], stem: [6, 8, 10], mix: [8, 10, 12] },
  secondsOptions: [60, 90, 120],
  expectedMs: { flash: 8000, worksheet: 13000, story: 17000, stem: 17000, mix: 15000 },

  generate(mode, topic, difficulty = 'ready') {
    const d = lvl(difficulty);
    if (middleEarthOn() && chance(THEME_RATE)) {
      const themed = themed4(mode, topic, d);
      if (themed) return themed;
    }
    switch (topic) {
      case 'count10': return A3.counting('count10', mode, D3[d], d === 'gentle' ? 3 : 5, 10);
      case 'count20': return retopic(A5.count20(mode, D5[d]), 'count20');
      case 'numerals': return retopic(A3.numerals(mode, D3[d]), 'numerals');
      case 'compare': return retopic(d === 'stretch' && chance(0.5) ? A5.compare(mode, 'gentle') : A3.compare(mode, D3[d]), 'compare');
      case 'oneMore': return retopic(A3.oneMore(mode, D3[d]), 'oneMore');
      case 'skip': return retopic(A5.skip(mode, 'gentle'), 'skip');
      case 'shapes': return retopic(d === 'stretch' && chance(0.6) ? A5.shapes(mode, 'ready') : A3.shapes(mode, D3[d]), 'shapes');
      case 'patterns': return retopic(A3.patterns(mode, D3[d]), 'patterns');
      case 'measure': return retopic(A5.measure(mode, D5[d]), 'measure');
      case 'sorting': return retopic(A5.sorting(mode, D5[d]), 'sorting');
      default: return null;
    }
  },
};
