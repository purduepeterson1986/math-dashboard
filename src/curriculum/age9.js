/**
 * Age 9 — "Number Navigators" (4th grade)
 * Warm-up ≈ the end of 3rd grade / start of 4th; Standard = core 4th grade (multi-digit multiplication, long
 * division, equivalent fractions, angles, factors & multiples); Challenge reaches into 5th grade
 * (bigger numbers, mixed-number operations, unlike denominators, decimals to thousandths).
 *
 * Typed answers are whole numbers (simple keypad). Fractions are "fill in the missing number";
 * decimals and mixed numbers are tap-to-choose.
 */
import { chance } from '../lib/rng.js';
import { themed9, middleEarthOn, THEME_RATE } from './middleEarth.js';
import { mul, div, factors, patterns, add, sub, placevalue } from './age9a.js';
import { fractions, fracops, decimals, geometry, area, measure, time, moneyTopic, data } from './age9b.js';

const L = (d) => (d === 'easy' || d === 'challenge' ? d : 'standard');
const ALL = ['flash', 'worksheet', 'story', 'stem'];

export default {
  age: 9,
  title: 'Number Navigators',
  tagline: 'Multi-digit multiplication, long division, fractions & decimals, angles',
  accent: 'violet',
  allowRetry: true,
  bigInput: false,
  readAloud: false,
  keypad: 'simple',
  topics: [
    { id: 'mul', label: 'Multi-digit Multiplication', group: 'Multiply & Divide', modes: ALL },
    { id: 'div', label: 'Long Division & Remainders', group: 'Multiply & Divide', modes: ALL },
    { id: 'factors', label: 'Factors & Multiples', group: 'Multiply & Divide', modes: ALL },
    { id: 'patterns', label: 'Patterns & Rules', group: 'Multiply & Divide', modes: ['worksheet', 'story', 'stem'] },
    { id: 'add', label: 'Adding Big Numbers', group: 'Big Numbers', modes: ALL },
    { id: 'sub', label: 'Subtracting Big Numbers', group: 'Big Numbers', modes: ALL },
    { id: 'placevalue', label: 'Place Value & Rounding', group: 'Big Numbers', modes: ['flash', 'worksheet', 'stem'] },
    { id: 'fractions', label: 'Equivalent Fractions & Mixed Numbers', group: 'Fractions & Decimals', modes: ['flash', 'worksheet', 'stem'] },
    { id: 'fracops', label: 'Adding & Subtracting Fractions', group: 'Fractions & Decimals', modes: ['worksheet', 'story', 'stem'] },
    { id: 'decimals', label: 'Decimals', group: 'Fractions & Decimals', modes: ['flash', 'worksheet', 'stem'] },
    { id: 'geometry', label: 'Angles, Lines & Shapes', group: 'Geometry & Measurement', modes: ['flash', 'worksheet', 'stem'] },
    { id: 'area', label: 'Area & Perimeter', group: 'Geometry & Measurement', modes: ['worksheet', 'story', 'stem'] },
    { id: 'measure', label: 'Measurement & Conversion', group: 'Geometry & Measurement', modes: ALL },
    { id: 'time', label: 'Time & Elapsed Time', group: 'Geometry & Measurement', modes: ALL },
    { id: 'money', label: 'Money & Decimals', group: 'Data & Money', modes: ALL },
    { id: 'data', label: 'Bar Graphs & Data', group: 'Data & Money', modes: ['worksheet', 'stem'] },
  ],
  difficulties: [
    { id: 'easy', label: 'Warm-up', detail: '2-digit × 1-digit, division facts, 4-digit adding & subtracting, simple fractions, right/acute/obtuse angles' },
    { id: 'standard', label: 'Standard', detail: '3-digit × 1-digit and 2-digit × 2-digit, long division with remainders, equivalent fractions, 6-digit numbers, angle measures' },
    { id: 'challenge', label: 'Challenge', detail: '5th-grade reach: 4-digit × 1-digit, 3-digit × 2-digit, mixed-number fractions, decimals to thousandths, 7-digit numbers' },
  ],
  defaultDifficulty: 'standard',
  defaults: {
    flash: { seconds: 60, maxCards: 50 },
    worksheet: { count: 15 },
    story: { count: 6 },
    stem: { count: 8 },
    mix: { count: 12 },
  },
  countOptions: { worksheet: [10, 15, 20], story: [4, 6, 8], stem: [6, 8, 10], mix: [8, 12, 16] },
  secondsOptions: [60, 90, 120],
  expectedMs: { flash: 7000, worksheet: 35000, story: 55000, stem: 45000, mix: 40000 },

  generate(mode, topic, difficulty = 'standard') {
    const d = L(difficulty);
    if (middleEarthOn() && chance(THEME_RATE)) {
      const themed = themed9(mode, topic, d);
      if (themed) return themed;
    }
    switch (topic) {
      case 'mul': return mul(mode, d);
      case 'div': return div(mode, d);
      case 'factors': return factors(mode, d);
      case 'patterns': return patterns(mode, d);
      case 'add': return add(mode, d);
      case 'sub': return sub(mode, d);
      case 'placevalue': return placevalue(mode, d);
      case 'fractions': return fractions(mode, d);
      case 'fracops': return fracops(mode, d);
      case 'decimals': return decimals(mode, d);
      case 'geometry': return geometry(mode, d);
      case 'area': return area(mode, d);
      case 'measure': return measure(mode, d);
      case 'time': return time(mode, d);
      case 'money': return moneyTopic(mode, d);
      case 'data': return data(mode, d);
      default: return null;
    }
  },
};
