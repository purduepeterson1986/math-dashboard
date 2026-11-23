// Decides when an age uses one of the extra question generators (extraEarly.js, extraMid.js).
// New topics always use them; topics that had small pools use them part of the time, so the old questions
// are still in the mix and the pool is much bigger.
import { chance } from '../lib/rng.js';
import * as E from './extraEarly.js';
import * as M from './extraMid.js';

const LV = { gentle: 0, ready: 1, stretch: 2, easy: 0, standard: 1, challenge: 2 };
const up = (n) => Math.min(2, n + 1);
// Ages 6 and up use the typed keypad for whole-number answers, not the big tap-a-number pad.
const toKeypad = (q) => (q && q.input === 'kidpad' ? { ...q, input: 'keypad' } : q);

/** Returns an extra question, or null to let the age use its regular generator. */
export function extraFor(age, mode, topic, d) {
  const lv = LV[d] ?? 1;
  const p = (x) => chance(x);
  switch (age) {
    case 3:
      if (topic === 'position') return E.position(mode, lv);
      if (topic === 'numerals' && p(0.55)) return E.numeralsMore(mode, lv);
      if (topic === 'size' && p(0.55)) return E.sizesMore(mode, lv);
      if (topic === 'oneMore' && p(0.55)) return E.oneMoreMore(mode, lv);
      if (topic === 'shapes' && p(0.4)) return E.shapesMore(mode, lv);
      return null;
    case 4:
      if (topic === 'position') return E.position(mode, lv);
      if (topic === 'numerals' && p(0.55)) return E.numeralsMore(mode, lv);
      if (topic === 'skip' && p(0.65)) return E.skipMore(mode, lv, [[1, 10], [2, 10], [2, 5, 10]][lv], [30, 50, 60][lv]);
      if (topic === 'shapes' && p(0.5)) return E.shapesMore(mode, lv);
      if (topic === 'measure' && p(0.5)) return E.measureMore(mode, lv);
      if (topic === 'oneMore' && p(0.5)) return E.oneMoreMore(mode, lv);
      return null;
    case 5:
      if (topic === 'position') return E.position(mode, up(lv));
      if (topic === 'teens' && p(lv === 0 ? 0.75 : 0.4)) return E.teensMore(mode, lv);
      if (topic === 'time' && p(0.55)) return E.timeMore(mode, lv);
      if (topic === 'skip' && p(0.6)) return E.skipMore(mode, lv, [[2, 10], [2, 5, 10], [2, 5, 10]][lv], [40, 60, 100][lv]);
      if (topic === 'shapes' && p(0.4)) return E.shapesMore(mode, lv);
      if (topic === 'measure' && p(0.5)) return E.measureMore(mode, lv);
      if (topic === 'bonds' && p(0.5)) return E.bondsMore(mode, lv);
      return null;
    case 6:
      if (topic === 'fractions') return toKeypad(E.halvesFourths(mode, lv));
      if (topic === 'shapes' && p(0.4)) return toKeypad(E.shapesMore(mode, up(lv)));
      if (topic === 'skip' && p(0.55)) return toKeypad(E.skipMore(mode, up(lv), [[2, 5, 10], [2, 5, 10], [2, 3, 4, 5, 10, 20]][lv], [60, 100, 120][lv]));
      if (topic === 'time' && p(0.55)) return toKeypad(E.timeMore(mode, up(lv)));
      if (topic === 'measure' && p(0.5)) return toKeypad(E.measureMore(mode, up(lv)));
      if (topic === 'bonds' && p(0.5)) return toKeypad(E.bondsMore(mode, up(lv), [[6, 8, 10], [10, 12, 15, 20], [20, 30, 50]][lv]));
      if (topic === 'money' && p(lv === 0 ? 0.65 : 0.4)) return toKeypad(E.moneyMore(mode, lv));
      return null;
    case 7:
      if (topic === 'fractions' && p(0.55)) return M.fractionsMore(mode, lv);
      if (topic === 'geometry' && p(0.55)) return M.geometryMore(mode, lv);
      if (topic === 'evenodd' && p(0.55)) return M.evenOddMore(mode, lv);
      if (topic === 'skip' && p(0.6)) return toKeypad(E.skipMore(mode, lv, [[2, 5, 10], [2, 3, 4, 5, 10], [2, 3, 4, 5, 10, 25, 50, 100]][lv], [100, 200, 500][lv]));
      if (topic === 'patterns') return toKeypad(chance(0.5) ? M.functionTable(mode, lv) : E.numberRule(mode, lv, [60, 120, 300][lv]));
      return null;
    case 8:
      if (topic === 'fractions' && p(0.4)) return M.fractionsMore(mode, lv === 0 ? 1 : 2);
      if (topic === 'area' && p(0.4)) return M.perimeterMore(mode, lv);
      if (topic === 'mass' && p(0.5)) return M.capacityMore(mode, lv);
      if (topic === 'money') return M.moneyA8(mode, lv);
      return null;
    default:
      return null;
  }
}
