// Advisory report: where do the three levels of a topic feel the same?
//   node scripts/audit-levels.mjs              all ages
//   node scripts/audit-levels.mjs 4            one age
//   node scripts/audit-levels.mjs 4 --show     also print sample questions per level
import { auditLevels } from './level-audit-lib.mjs';
const onlyAge = process.argv[2] && /^\d+$/.test(process.argv[2]) ? process.argv[2] : undefined;
const { weak, compared } = auditLevels({ N: 1500, onlyAge, show: process.argv.includes('--show') });
console.log(`\n${compared} comparisons, ${weak.length} too alike`);
const by = new Map();
for (const r of weak) { const k = `age ${r.age} ${r.topic}${r.themed ? ' [themed]' : ''}`; (by.get(k) || by.set(k, []).get(k)).push(`${r.mode} ${r.pair} (same ${(r.same * 100) | 0}%, shape ${(r.shape * 100) | 0}%, #${r.mag})`); }
for (const [k, v] of by) console.log(`${k}:\n   ${v.join('\n   ')}`);
