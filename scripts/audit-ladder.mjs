// Advisory report: do difficulty levels rise smoothly from age to age within each topic?
//   node scripts/audit-ladder.mjs          table + findings
//   node scripts/audit-ladder.mjs --show   also print sample questions for every rung
import { auditLadder } from './ladder-audit-lib.mjs';
const { findings, table, rungs } = auditLadder({ N: 600 });
console.log('Hardest-number score per age, for the easiest/middle/hardest level (digits; decimals count extra).\n* = not flagged (number size is a poor yardstick there)\n');
console.log(table.join('\n'));
console.log(`\n${findings.length} findings`);
for (const f of findings) console.log(`  [${f.kind}] ${f.fam} age ${f.age}: ${f.detail}`);
if (process.argv.includes('--show')) for (const [fam, list] of Object.entries(rungs)) {
  console.log(`\n== ${fam}`); for (const r of list) console.log(`  age ${r.age} ${r.level} (${r.mag}): ${r.shown.join(' | ')}`);
}
