// One-time import of the Fellowship drawings from the Middle Earth game (Game 3), so the
// characters look the same everywhere. Writes src/curriculum/middleEarthArt.js.
// Usage: node scripts/extract-middle-earth-art.mjs "/path/to/Game 3 - Middle Earth/index.html"
import fs from 'node:fs';
import vm from 'node:vm';

const src = process.argv[2];
const html = fs.readFileSync(src, 'utf8');
const start = html.indexOf('var SK = {');
const end = html.indexOf('];', html.indexOf('var CHARS = ['));
if (start < 0 || end < 0) throw new Error('Could not find the character definitions');
const code = html.slice(start, end + 2) + '\nthis.OUT = CHARS.map(function (c) { return { id: c.id, name: c.name, h: c.h, svg: c.svg() }; });';
const ctx = {};
vm.runInNewContext(code, ctx);
const clean = (s) => s
  .replace(/<g class="(RG|PAN|FS)"[^>]*style="display:none">[\s\S]*?<\/g>(?=(<g|<path|<circle|<rect|<ellipse|$))/g, '') // hidden props (ring, pan, fish)
  .replace(/ class="[^"]*"/g, '').replace(/ data-p[xy]="[^"]*"/g, '');
const art = Object.fromEntries(ctx.OUT.map((c) => [c.id, { name: c.name, h: c.h, svg: clean(c.svg) }]));
const out = `/* Fellowship drawings imported from the Middle Earth game (Game 3) by
   scripts/extract-middle-earth-art.mjs. Feet are at (0,0); h is the drawn height. Do not edit by hand. */
export const ART = ${JSON.stringify(art, null, 1)};
`;
fs.writeFileSync(new URL('../src/curriculum/middleEarthArt.js', import.meta.url), out);
console.log('wrote', Object.keys(art).join(', '), (out.length / 1024).toFixed(1) + ' KB');
