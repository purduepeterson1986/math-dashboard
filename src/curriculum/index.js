import age3 from './age3.js';
import age5 from './age5.js';
import age7 from './age7.js';
import age12 from './age12.js';

/**
 * Plug-and-play registry. To add an age:
 *   1. create src/curriculum/ageN.js following the contract in PLAN.md
 *   2. import it and add it here.
 */
export const CURRICULA = { 3: age3, 5: age5, 7: age7, 12: age12 };
export const getCurriculum = (age) => CURRICULA[age] || null;

export const MIN_AGE = 3;
export const MAX_AGE = 18;

export const AGE_META = {
  3: { stage: 'Preschool', planned: [] },
  4: { stage: 'Pre-K', planned: ['Counting to 20', 'Comparing numbers', 'Shapes in the world', 'AB/ABC patterns', 'Measuring with objects'] },
  5: { stage: 'Kindergarten', planned: [] },
  6: { stage: '1st Grade', planned: ['Add & subtract within 20', 'Place value to 120', 'Telling time', 'Measuring length', 'Picture graphs'] },
  7: { stage: '2nd Grade', planned: [] },
  8: { stage: '3rd Grade', planned: ['Multiplication & division facts', 'Unit fractions', 'Area & perimeter', 'Elapsed time', 'Rounding'] },
  9: { stage: '4th Grade', planned: ['Multi-digit multiplication', 'Long division', 'Equivalent fractions', 'Angles', 'Factors & multiples'] },
  10: { stage: '5th Grade', planned: ['Fraction operations', 'Decimals to thousandths', 'Volume', 'Order of operations', 'Coordinate plane'] },
  11: { stage: '6th Grade', planned: ['Ratios & rates', 'Dividing fractions', 'Expressions', 'Statistics', 'Negative numbers'] },
  12: { stage: '7th Grade', planned: [] },
  13: { stage: '8th Grade', planned: ['Linear equations', 'Functions', 'Pythagorean theorem', 'Exponents & scientific notation', 'Transformations'] },
  14: { stage: 'Algebra I', planned: ['Systems of equations', 'Quadratics', 'Polynomials', 'Inequalities', 'Exponential growth'] },
  15: { stage: 'Geometry', planned: ['Proofs & logic', 'Similarity', 'Right-triangle trig', 'Circles', 'Coordinate geometry'] },
  16: { stage: 'Algebra II', planned: ['Functions & inverses', 'Logarithms', 'Complex numbers', 'Sequences & series', 'Probability'] },
  17: { stage: 'Precalculus', planned: ['Trigonometric functions', 'Vectors', 'Polar coordinates', 'Limits', 'Matrices'] },
  18: { stage: 'Calculus & Statistics', planned: ['Derivatives', 'Integrals', 'Optimization', 'Inference', 'Regression'] },
};

export const MODES = [
  { id: 'flash', label: 'Flash Cards', blurb: 'Timed speed drills. Build streaks!', icon: 'Zap', tone: 'amber' },
  { id: 'worksheet', label: 'Worksheets', blurb: 'A full problem set to work through and review.', icon: 'ClipboardList', tone: 'sky' },
  { id: 'story', label: 'Story Problems', blurb: 'Real-world problems with step-by-step hints.', icon: 'BookOpen', tone: 'rose' },
  { id: 'stem', label: 'STEM Lab', blurb: 'Logic, patterns, spatial & applied puzzles.', icon: 'FlaskConical', tone: 'emerald' },
  { id: 'mix', label: 'Daily Mix', blurb: 'A little of everything. Great for daily review.', icon: 'Shuffle', tone: 'violet' },
];
export const modeById = (id) => MODES.find((m) => m.id === id);
