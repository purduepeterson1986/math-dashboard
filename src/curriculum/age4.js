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
// Every level calls a different generator or settings: Warm-up is still Pre-K, Stretch reaches into Kindergarten.
const by = (d, g, r, st) => (d === 'gentle' ? g : d === 'stretch' ? st : r);

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
    { id: 'gentle', label: 'Warm-up', detail: 'Count to 10, numbers to 10, “one more”, AB patterns, flat shapes' },
    { id: 'ready', label: 'Advanced', detail: 'Count to 16, numbers to 20, one more & one less, AAB & ABB patterns, counting by 10s' },
    { id: 'stretch', label: 'Stretch', detail: 'Kindergarten reach: count to 20, teen numbers, add & take away, greatest/least, 3D shapes, ABC patterns, inches' },
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
      case 'count10': return by(d,
        () => A3.counting('count10', mode, 'gentle', 2, 5),
        () => A3.counting('count10', mode, 'ready', 5, 10),
        () => (chance(0.5) ? A3.counting('count10', mode, 'stretch', 8, 10) : retopic(A5.count20(mode, 'gentle', [11, 14]), 'count10')))();
      case 'count20': return retopic(by(d, () => A5.count20(mode, 'gentle', [8, 12]), () => A5.count20(mode, 'gentle', [12, 16]), () => A5.count20(mode, 'ready', [16, 20]))(), 'count20');
      case 'numerals': return retopic(by(d, () => A3.numerals(mode, 'ready'), () => A3.numerals(mode, 'stretch'), () => A5.teens(mode, 'gentle'))(), 'numerals');
      case 'compare': return retopic(by(d, () => A3.compare(mode, 'gentle'), () => A3.compare(mode, 'ready'), () => A5.compare(mode, 'ready'))(), 'compare');
      case 'oneMore': return retopic(by(d, () => A3.oneMore(mode, 'gentle'), () => A3.oneMore(mode, 'ready'), () => (chance(0.5) ? A5.addition(mode, 'gentle') : A5.subtraction(mode, 'gentle')))(), 'oneMore');
      case 'skip': return retopic(by(d, () => A5.skip(mode, 'gentle', [1]), () => A5.skip(mode, 'gentle', [10]), () => A5.skip(mode, 'ready'))(), 'skip');
      case 'shapes': return retopic(by(d, () => A3.shapes(mode, 'ready'), () => A3.shapes(mode, 'stretch'), () => A5.shapes(mode, 'gentle'))(), 'shapes');
      case 'patterns': return retopic(A3.patterns(mode, d), 'patterns');
      case 'measure': return retopic(A5.measure(mode, d), 'measure');
      case 'sorting': return retopic(A5.sorting(mode, d), 'sorting');
      default: return null;
    }
  },
};
