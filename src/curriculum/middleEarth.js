/**
 * Middle-earth themed questions, mixed into the normal topics (about half the time, for topics that have themed versions).
 * Ages 3 and 5 get pictures of the Fellowship (imported from the Middle Earth game);
 * Ages 7 and 12 mostly get Middle-earth wording.
 *
 * Each themed(mode, topic, d) returns a question, or null when it has nothing for that topic/mode
 * (then the normal generator is used).
 */
import { rand, pick, sample, shuffle, chance, gcd } from '../lib/rng.js';
import { makeChoices, withSpeak, withFractionNote } from './shared.js';
import { toSpeech } from '../lib/audio.js';
import { ART } from './middleEarthArt.js';

let enabled = true;
export const setMiddleEarth = (v) => { enabled = !!v; };
export const middleEarthOn = () => enabled;
export const THEME_RATE = 0.5;

// height tiers (never compare two people in the same tier: Aragorn vs Boromir is too close to call)
const TIER = { gandalf: 4, legolas: 3, aragorn: 3, boromir: 3, gimli: 2, frodo: 1, sam: 1, merry: 1, pippin: 1 };
const HOBBITS = ['frodo', 'sam', 'merry', 'pippin'];
const nameOf = (id) => ART[id].name;
// Cycle through all four hobbits so a group shows variety instead of the same one four times in a row
const hobbitCrowd = (n) => { const bag = shuffle([...HOBBITS]); return Array.from({ length: n }, (_, i) => bag[i % bag.length]); };
const pickAcrossTiers = (k) => {
  const tiers = sample([...new Set(Object.values(TIER))], k).sort((a, b) => b - a);
  return tiers.map((t) => pick(Object.keys(TIER).filter((id) => TIER[id] === t)));
};
const charChoice = (id) => ({ text: nameOf(id), visual: { type: 'character', id, toScale: true } });
function choose(o, correct, wrong) {
  const { choices, answer } = makeChoices(correct, wrong);
  return { input: 'choice', choices, answer, answerLabel: correct.text ?? o.answerLabel ?? 'picture', ...o };
}
const small = (o) => ({ ...o, input: Number(o.answer) <= 10 ? 'kidpad' : 'keypad', answer: String(o.answer), answerLabel: String(o.answer) });
const typed = (o) => ({ input: 'keypad', answerLabel: Number.isInteger(o.answer) && Math.abs(o.answer) >= 1000 ? o.answer.toLocaleString('en-US') : String(o.answer), ...o, answer: String(o.answer) });
const frac = (n, d) => { const g = gcd(n, d); return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`; };
const F = (n, d) => `[[${n}/${d}]]`;
const FR = (n, d) => { const s = frac(n, d); return s.includes('/') ? `[[${s}]]` : s; };
const money = (c) => (c >= 100 ? `$${Math.floor(c / 100)}.${String(c % 100).padStart(2, '0')}` : `${c}¢`);

/* --------------------------- shared picture questions --------------------------- */
function whoTaller(topic, mode, count) {
  const k = count === true ? 3 : count === false ? 2 : count;
  const three = k > 2;
  const ids = pickAcrossTiers(k);
  const askTall = chance(0.5);
  const right = askTall ? ids[0] : ids[ids.length - 1];
  const word = three ? (askTall ? 'TALLEST' : 'SHORTEST') : (askTall ? 'TALLER' : 'SHORTER');
  const names = ids.map(nameOf);
  const q = three ? `Who is the ${word}?` : `Who is ${word}, ${names[0]} or ${names[1]}?`;
  return choose({
    key: `me:${topic}:tall:${k}:${[...ids].sort().join(',')}:${askTall}`, topic, story: mode === 'story' ? { emoji: '🧙', title: 'The Fellowship' } : undefined,
    prompt: q, speak: three ? `${names.join(', ')}. Who is the ${word.toLowerCase()}?` : `Who is ${word.toLowerCase()}, ${names[0]} or ${names[1]}?`,
    hints: ['Look at the tops of their heads.'], summary: `${word.toLowerCase()}: ${names.join(' vs ')}`,
    explanation: three ? `${nameOf(right)} is the ${word.toLowerCase()}.` : `${nameOf(right)} is ${word.toLowerCase()} than ${nameOf(ids.find((x) => x !== right))}.`,
  }, charChoice(right), ids.filter((x) => x !== right).map(charChoice));
}

function countHobbits(topic, lo, hi, mixed) {
  // In a mixed group keep the whole picture to 10 figures (two rows of five) so it fits on screen without scrolling
  const nOthers = mixed ? rand(1, 2) : 0;
  const n = Math.min(rand(lo, hi), 10 - nOthers);
  let ids = hobbitCrowd(n);
  let prompt = 'How many hobbits do you count?';
  if (mixed) {
    const others = Array.from({ length: nOthers }, () => pick(['gandalf', 'gimli', 'legolas', 'aragorn']));
    ids = shuffle([...ids, ...others]);
    prompt = 'How many HOBBITS? (Only count the hobbits!)';
  }
  return small({
    key: `me:${topic}:count:${n}:${mixed ? 'mixed' : 'all'}`, topic, prompt, answer: n, visual: { type: 'crowd', ids, toScale: mixed },
    speak: mixed ? 'How many hobbits do you count? Only count the hobbits.' : 'How many hobbits do you count?',
    hints: mixed ? ['Hobbits are the short ones with curly hair and bare feet.'] : ['Touch each hobbit as you count.'],
    summary: `Count ${n} hobbits`, explanation: `There are ${n} hobbits.`,
  });
}

/* ------------------------------------ Age 3 ------------------------------------ */
export function themed3(mode, topic, d) {
  if (topic === 'size') return whoTaller(topic, mode, d === 'gentle' ? 2 : d === 'ready' ? 3 : 4);
  if (topic === 'count5') return countHobbits(topic, d === 'gentle' ? 1 : d === 'ready' ? 2 : 4, d === 'gentle' ? 3 : 5, d === 'stretch');
  if (topic === 'count10') return countHobbits(topic, d === 'gentle' ? 5 : d === 'ready' ? 6 : 8, d === 'gentle' ? 6 : d === 'ready' ? 8 : 10, d === 'stretch');
  if (topic === 'patterns') {
    const type = d === 'gentle' ? 'AB' : d === 'ready' ? pick(['AAB', 'ABB']) : pick(['ABC', 'AABB', 'ABBC']);
    const letters = [...new Set(type.split(''))];
    const ids = pickAcrossTiers(Math.min(3, letters.length));
    const map = Object.fromEntries(letters.map((l, i) => [l, ids[i]]));
    const seq = Array.from({ length: type.length * 2 + 1 }, (_, i) => map[type[i % type.length]]);
    const ans = seq[seq.length - 1];
    const item = (id) => ({ type: 'character', id, px: 80 });
    return choose({
      key: `me:patterns:${type}:${ids.join(':')}`, topic, prompt: 'What comes next?', visual: { type: 'pattern', items: [...seq.slice(0, -1).map(item), null] },
      speak: `${seq.slice(0, -1).map(nameOf).join(', ')}. Who comes next?`, hints: [`It goes ${type.split('').join('-')}.`],
      answerLabel: nameOf(ans), summary: `${type} pattern with ${ids.map(nameOf).join(', ')}`, explanation: `The pattern repeats, so ${nameOf(ans)} is next.`,
    }, { visual: { type: 'character', id: ans, px: 110 } }, ids.filter((x) => x !== ans).map((x) => ({ visual: { type: 'character', id: x, px: 110 } })));
  }
  if (topic === 'compare' && mode !== 'story') {
    const x = d === 'gentle' ? rand(1, 2) : d === 'ready' ? rand(3, 8) : rand(5, 9); const y = x + (d === 'gentle' ? rand(2, 3) : d === 'ready' ? rand(1, 2) : 1); const askMore = chance(0.5);
    return choose({
      key: `me:compare:${x}:${y}:${askMore}`, topic, prompt: `Which group has ${askMore ? 'MORE' : 'FEWER'} hobbits?`,
      speak: `Which group has ${askMore ? 'more' : 'fewer'} hobbits?`, answerLabel: `${askMore ? y : x} hobbit${(askMore ? y : x) === 1 ? '' : 's'}`, summary: `${x} vs ${y} hobbits`, explanation: `${y} is more than ${x}.`,
    }, { visual: { type: 'crowd', ids: hobbitCrowd(askMore ? y : x), px: 50 } }, [{ visual: { type: 'crowd', ids: hobbitCrowd(askMore ? x : y), px: 50 } }]);
  }
  return null;
}

/* ------------------------------------ Age 5 ------------------------------------ */
function blocksDiff(topic, mode, lo, hi) {
  const tall = rand(lo, hi); const short = rand(Math.max(2, lo - 4), tall - 2); const [big, little] = pickAcrossTiers(2);
  const text = `${nameOf(big)} is ${tall} blocks tall. ${nameOf(little)} is ${short} blocks tall. How many blocks taller is ${nameOf(big)}?`;
  return small({ key: `me:measure:blocks:${big}:${little}:${tall}:${short}`, topic, story: mode === 'story' ? { emoji: '🧱', title: 'How Tall?' } : undefined, prompt: text, speak: text,
    visual: { type: 'lineup', ids: [big, little] }, answer: tall - short, hints: [`Count up from ${short} to ${tall}.`],
    summary: `${tall} vs ${short} blocks`, explanation: `${tall} take away ${short} is ${tall - short}. ${nameOf(big)} is ${tall - short} blocks taller.` });
}
export function themed5(mode, topic, d) {
  if (topic === 'count20') {
    const n = d === 'gentle' ? rand(6, 10) : d === 'ready' ? rand(11, 15) : rand(16, 20);
    return small({
      key: `me:count20:${n}`, topic, story: mode === 'story' ? { emoji: '🎉', title: "Bilbo's Party" } : undefined,
      prompt: 'Hobbits are coming to Bilbo’s party! How many hobbits?', visual: { type: 'crowd', ids: hobbitCrowd(n) }, answer: n,
      speak: 'Hobbits are coming to Bilbo’s party! How many hobbits do you count?', hints: ['Count each row of 5.'],
      summary: `Count ${n} hobbits`, explanation: `There are ${n} hobbits at the party.`,
    });
  }
  if (topic === 'measure') {
    if (d === 'stretch') return blocksDiff(topic, mode, 7, 10);
    return whoTaller(topic, mode, d === 'gentle' ? 2 : 3);
  }
  if (topic === 'add' && mode === 'story') {
    const top = d === 'stretch' ? 9 : d === 'ready' ? 7 : 5; const a = rand(2, top); const b = rand(1, top);
    const text = `${a} hobbits are at Bag End. ${b} ${b === 1 ? 'dwarf knocks' : 'dwarves knock'} on the door. How many friends are there now?`;
    return small({ key: `me:add:${a}:${b}`, topic, story: { emoji: '🚪', title: 'Unexpected Guests' }, prompt: text, speak: text, answer: a + b,
      visual: { type: 'crowd', ids: [...hobbitCrowd(a), ...Array(b).fill('gimli')], toScale: true }, hints: [`Start at ${a}. Count on ${b} more.`],
      summary: `${a} + ${b} (Bag End)`, explanation: `${a} and ${b} more makes ${a + b}.` });
  }
  if (topic === 'sub' && mode === 'story') {
    const a = rand(4, d === 'stretch' ? 18 : d === 'ready' ? 10 : 7); const b = rand(1, a - 1);
    const text = pick([
      `Sam baked ${a} seed cakes. The hobbits ate ${b}. How many seed cakes are left?`,
      `${a} hobbits are dancing at the party. ${b} go home to bed. How many are still dancing?`,
      `Gandalf has ${a} fireworks. He sets off ${b}. How many fireworks are left?`,
    ]);
    return small({ key: `me:sub:${a}:${b}:${text.length}`, topic, story: { emoji: '🎆', title: 'In the Shire' }, prompt: text, speak: text, answer: a - b,
      hints: [`Start at ${a}. Count back ${b}.`], summary: `${a} − ${b} (Shire)`, explanation: `${a} take away ${b} leaves ${a - b}.` });
  }
  if (topic === 'compare' && mode === 'story') {
    const top = d === 'gentle' ? 9 : d === 'ready' ? 18 : 45; const [p, q] = sample(HOBBITS, 2); const lo2 = d === 'stretch' ? 12 : 3; const x = rand(lo2, top); let y = rand(lo2, top);
    for (let tries = 0; tries < 30 && (y === x || Math.abs(x - y) > (d === 'gentle' ? 5 : d === 'ready' ? 7 : 30)); tries++) y = rand(lo2, top);
    if (y === x) y = x < top ? x + 1 : x - 1;
    const more = chance(0.5); const win = (more ? x > y : x < y) ? p : q;
    return choose({ key: `me:compare:${p}:${q}:${x}:${y}:${more}`, topic, story: { emoji: '🍄', title: 'Mushroom Hunt' },
      prompt: `${nameOf(p)} found ${x} mushrooms. ${nameOf(q)} found ${y}. Who found ${more ? 'MORE' : 'FEWER'}?`,
      speak: `${nameOf(p)} found ${x} mushrooms. ${nameOf(q)} found ${y}. Who found ${more ? 'more' : 'fewer'}?`,
      hints: [`Which is ${more ? 'bigger' : 'smaller'}, ${x} or ${y}?`], summary: `${x} vs ${y} mushrooms`,
      explanation: `${Math.max(x, y)} is more than ${Math.min(x, y)}, so ${nameOf(win)} found ${more ? 'more' : 'fewer'}.` },
    { text: nameOf(win), visual: { type: 'character', id: win } }, [{ text: nameOf(win === p ? q : p), visual: { type: 'character', id: win === p ? q : p } }]);
  }
  if (topic === 'skip' && d === 'stretch') {
    const n = rand(4, 10);
    return small({ key: `me:skip:fives:${n}`, topic, prompt: 'Each hobbit carries 5 mushrooms. Count by 5s. How many mushrooms?', visual: { type: 'crowd', ids: hobbitCrowd(n) },
      answer: n * 5, speak: 'Each hobbit carries 5 mushrooms. Count by fives. How many mushrooms are there?', hints: ['Count 5, 10, 15, 20…'],
      summary: `${n} hobbits with 5 mushrooms`, explanation: `${n} hobbits with 5 each: ${Array.from({ length: n }, (_, i) => 5 * (i + 1)).join(', ')}. That's ${n * 5}.` });
  }
  if (topic === 'skip' && d === 'gentle') return null; // counting by 2s starts at Advanced
  if (topic === 'skip') {
    const n = rand(3, 10);
    return small({ key: `me:skip:feet:${n}`, topic, prompt: 'Hobbits have big hairy feet! Count by 2s. How many feet?', visual: { type: 'crowd', ids: hobbitCrowd(n) },
      answer: n * 2, speak: 'Hobbits have big hairy feet. Count by twos. How many feet are there?', hints: ['Each hobbit has 2 feet.', 'Count 2, 4, 6, 8…'],
      summary: `${n} hobbits' feet`, explanation: `${n} hobbits with 2 feet each: ${Array.from({ length: n }, (_, i) => 2 * (i + 1)).join(', ')}. That's ${n * 2} feet.` });
  }
  if (topic === 'sorting') {
    const n = d === 'gentle' ? rand(2, 4) : d === 'ready' ? rand(2, 6) : rand(4, 7);
    const others = d === 'gentle' ? rand(1, 2) : d === 'ready' ? rand(2, 4) : rand(2, 3); // never more than 10 figures in all
    const ids = shuffle([...hobbitCrowd(n), ...Array.from({ length: others }, () => pick(['gandalf', 'gimli', 'legolas', 'aragorn', 'boromir']))]);
    if (d === 'stretch' && chance(0.5)) {
      return small({ key: `me:sorting:not:${ids.join(',')}`, topic, story: mode === 'story' ? { emoji: '🧺', title: 'Who Is NOT a Hobbit?' } : undefined,
        prompt: 'How many are NOT hobbits?', visual: { type: 'crowd', ids, toScale: true }, answer: others,
        speak: 'How many are not hobbits? Count only the ones who are not hobbits.', hints: ['Hobbits are the short ones with curly hair.', 'Count the others.'],
        summary: `Sort: ${others} not hobbits`, explanation: `${others} of them are not hobbits.` });
    }
    return small({ key: `me:sorting:${ids.join(',')}`, topic, story: mode === 'story' ? { emoji: '🧺', title: 'Who Is a Hobbit?' } : undefined,
      prompt: 'How many HOBBITS are in the group?', visual: { type: 'crowd', ids, toScale: true }, answer: n,
      speak: 'How many hobbits are in the group? Only count the hobbits.', hints: ['Hobbits are the short ones with curly hair.'],
      summary: `Sort: ${n} hobbits`, explanation: `${n} of them are hobbits.` });
  }
  return null;
}

/* ------------------------------------ Age 7 ------------------------------------ */
export function themed7(mode, topic, d) {
  const by = (e, s, c) => (d === 'easy' ? e : d === 'challenge' ? c : s);
  if (topic === 'add' && mode === 'story') {
    const a = rand(by(20, 120, 230), by(60, 380, 560)); const b = rand(by(15, 90, 170), by(39, 290, 420));
    return typed({ key: `me:add:${a}:${b}`, topic, story: { emoji: '🗺️', title: 'The Long Road' }, answer: a + b,
      prompt: `The Fellowship walked ${a} miles to reach the mountains, then ${b} more miles to the Mines of Moria. How many miles in all?`,
      hints: [`Add ${a} + ${b}.`], explanation: `${a} + ${b} = ${a + b} miles.` });
  }
  if (topic === 'sub' && mode === 'story') {
    const a = rand(by(40, 140, 300), by(99, 450, 1000)); const b = rand(by(12, 58, 145), a - 20);
    return typed({ key: `me:sub:${a}:${b}`, topic, story: { emoji: '🎂', title: "Bilbo's Birthday" }, answer: a - b,
      prompt: `${a} guests came to Bilbo's birthday party. ${b} went home before the fireworks. How many stayed for the fireworks?`,
      hints: [`Subtract ${a} − ${b}.`], explanation: `${a} − ${b} = ${a - b} guests.` });
  }
  if (topic === 'arrays' && (mode === 'story' || mode === 'stem')) {
    const r = rand(2, by(5, 6, 9)); const c = rand(3, by(5, 8, 9));
    return typed({ key: `me:arrays:${r}:${c}`, topic, story: { emoji: '🏹', title: 'Elves of Lórien' }, answer: r * c,
      prompt: `The elves of Lórien line up in ${r} rows with ${c} elves in each row. How many elves?`, visual: { type: 'array', rows: r, cols: c, emoji: '🧝' },
      hints: [`${r} rows of ${c}.`, `Skip count by ${c}.`], explanation: `${r} × ${c} = ${r * c} elves.` });
  }
  if (topic === 'money' && (mode === 'story' || mode === 'stem')) {
    const price = rand(by(12, 25, 115), by(45, 95, 450)); const paid = d === 'easy' ? 50 : price < 100 ? 100 : Math.ceil(price / 100) * 100;
    const item = pick(['a coil of elven rope', 'a bag of dried apples', 'a loaf of bread', 'a new cooking pan', 'a lantern']);
    return typed({ key: `me:money:${price}:${paid}`, topic, story: { emoji: '🛒', title: 'Market in Bree' }, answer: paid - price,
      prompt: `At the market in Bree, Sam buys ${item} for ${money(price)}. He pays with ${money(paid)}. How much change, in cents?`,
      hints: [`Count up from ${money(price)} to ${money(paid)}.`], explanation: `${paid} − ${price} = ${paid - price}¢ change.` });
  }
  if (topic === 'data') {
    const n = d === 'easy' ? 3 : 4; const step = d === 'xl' ? 5 : d === 'challenge' ? 2 : 1;
    const vals = sample([2, 3, 4, 5, 6, 7, 8, 9], n).map((v) => v * step);
    const ids = HOBBITS.slice(0, n);
    const items = ids.map((id, i) => ({ label: nameOf(id), emoji: '🍄', value: vals[i] }));
    const [A, B] = sample(items, 2); const [hi, lo] = A.value > B.value ? [A, B] : [B, A];
    const f = d === 'easy' ? 'read' : pick(['more', 'total']);
    const visual = { type: 'bargraph', items, step, title: 'Mushrooms Found' };
    const key = `me:data:${vals.join(',')}:${f}:${A.label}:${B.label}`;
    const scaleHint = step > 1 ? `Careful: each line counts by ${step}.` : 'Read across from the top of the bar.';
    if (f === 'read') return typed({ key, topic, prompt: `How many mushrooms did ${A.label} find?`, visual, answer: A.value, hints: [scaleHint], explanation: `${A.label}'s bar reaches ${A.value}.` });
    if (f === 'more') return typed({ key, topic, prompt: `How many MORE mushrooms did ${hi.label} find than ${lo.label}?`, visual, answer: hi.value - lo.value, hints: [scaleHint, 'Find both numbers, then subtract.'], explanation: `${hi.value} − ${lo.value} = ${hi.value - lo.value}.` });
    const total = vals.reduce((a, b) => a + b, 0);
    return typed({ key, topic, prompt: 'How many mushrooms did the hobbits find in all?', visual, answer: total, hints: [scaleHint, 'Add all the bars.'], explanation: `${vals.join(' + ')} = ${total}.` });
  }
  if (topic === 'puzzles' && d !== 'easy') {
    const g = d === 'challenge' ? rand(15, 45) : rand(4, 12); const more = d === 'challenge' ? rand(5, 15) : rand(2, 6);
    return typed({ key: `me:puzzles:orcs:${g}:${more}`, topic, story: { emoji: '🪓', title: 'Gimli and Legolas' }, answer: 2 * g + more,
      prompt: `Gimli and Legolas have a contest. Gimli counts ${g} orcs. Legolas counts ${more} more orcs than Gimli. How many orcs do they count together?`,
      hints: [`Legolas counts ${g} + ${more}.`, 'Now add what both of them counted.'],
      explanation: `Legolas counted ${g} + ${more} = ${g + more}. Together: ${g} + ${g + more} = ${2 * g + more}.` });
  }
  if (topic === 'measure' && mode === 'story') {
    const unit = d === 'challenge' ? 'centimeters' : 'inches';
    const staff = d === 'easy' ? rand(40, 55) : d === 'challenge' ? rand(150, 210) : rand(60, 80); const frodo = d === 'easy' ? rand(30, 36) : d === 'challenge' ? rand(95, 120) : rand(36, 44);
    return typed({ key: `me:measure:${staff}:${frodo}:${unit}`, topic, story: { emoji: '🧙', title: "Gandalf's Staff" }, answer: staff - frodo,
      prompt: `Gandalf's staff is ${staff} ${unit} long. Frodo is ${frodo} ${unit} tall. How much longer is the staff than Frodo is tall?`,
      visual: { type: 'lineup', ids: ['gandalf', 'frodo'] }, hints: [`Subtract ${staff} − ${frodo}.`], explanation: `${staff} − ${frodo} = ${staff - frodo} ${unit}.` });
  }
  return null;
}

/* ------------------------------------ Age 12 ------------------------------------ */
const FELLOWSHIP_AGES = { Frodo: 50, Sam: 38, Merry: 36, Pippin: 28 }; // their ages when they left the Shire
export function themed12(mode, topic, d) {
  return withFractionNote(themed12raw(mode, topic, d));
}
function themed12raw(mode, topic, d) {
  const by = (e, s, c) => (d === 'easy' ? e : d === 'challenge' ? c : s);
  if (topic === 'rates') {
    if (d === 'challenge' && chance(0.6)) {
      const r1 = rand(24, 48); const r2 = rand(30, 56); const t1 = pick([1.5, 2.5, 3.5]); const t2 = pick([2, 2.5, 3]); const tot = r1 * t1 + r2 * t2;
      return typed({ key: `me:rates:ride2:${r1}:${r2}:${t1}:${t2}`, topic, story: { emoji: '🐎', title: 'Shadowfax' }, answer: String(tot),
        prompt: `Gandalf rides Shadowfax at ${r1} miles per hour for ${t1} hours, then at ${r2} miles per hour for ${t2} hours. How many miles does he ride in all?`,
        hints: [`First part: ${r1} × ${t1} = ${r1 * t1}.`, `Second part: ${r2} × ${t2} = ${r2 * t2}.`, 'Add them.'], explanation: `${r1 * t1} + ${r2 * t2} = ${tot} miles.` });
    }
    const f = pick(['ride', 'days']);
    if (f === 'ride') {
      const r = rand(30, 55); const t = pick([1.5, 2, 2.5, 3, 3.5]);
      return typed({ key: `me:rates:ride:${r}:${t}`, topic, story: { emoji: '🐎', title: 'Shadowfax' }, answer: String(r * t),
        prompt: `Gandalf rides Shadowfax at ${r} miles per hour for ${t} hours. How many miles does he ride?`, hints: ['distance = rate × time'], explanation: `${r} × ${t} = ${r * t} miles.` });
    }
    const per = rand(12, 24); const days = rand(by(5, 8, 12), by(10, 18, 30));
    return typed({ key: `me:rates:days:${per}:${days}`, topic, story: { emoji: '🥾', title: 'To Rivendell' }, answer: days,
      prompt: `The hobbits walk ${per} miles a day. The road to Rivendell is ${per * days} miles. How many days will it take?`, hints: ['time = distance ÷ rate'], explanation: `${per * days} ÷ ${per} = ${days} days.` });
  }
  if (topic === 'probability') {
    const f = pick(by(['one'], ['not', 'not', 'one'], ['two', 'two', 'one']));
    if (f === 'two') {
      return typed({ key: 'me:prob:twohobbits', topic, story: { emoji: '💍', title: 'The Fellowship' }, answer: '1/6',
        prompt: 'The Fellowship has 9 members: 4 hobbits, 2 men, 1 elf, 1 dwarf and 1 wizard. Two different members are picked at random to keep watch. What is P(both are hobbits)? (The chance that both are hobbits.)',
        hint: 'Answer as a fraction', hints: [`First pick: ${F(4, 9)}.`, `Second pick (one hobbit fewer, one member fewer): ${F(3, 8)}.`], explanation: `${F(4, 9)} × ${F(3, 8)} = ${F(12, 72)} = ${F(1, 6)}.` });
    }
    const groups = [['a hobbit', 4], ['a man', 2], ['an elf', 1], ['a dwarf', 1], ['the wizard', 1]];
    const [what, k] = pick(groups); const not = f === 'not';
    return typed({ key: `me:prob:${what}:${not}`, topic, story: { emoji: '💍', title: 'The Fellowship' }, answer: frac(not ? 9 - k : k, 9),
      prompt: `The Fellowship has 9 members: 4 hobbits, 2 men, 1 elf, 1 dwarf and 1 wizard. One is chosen at random. What is the probability that the one chosen is ${not ? 'NOT ' : ''}${what}? (Written P(${not ? 'NOT ' : ''}${what}).)`,
      hint: 'Answer as a fraction', explanation: `${not ? 9 - k : k} of the 9 members: ${FR(not ? 9 - k : k, 9)}.` });
  }
  if (topic === 'algebra' && mode === 'story' && d !== 'easy') {
    const g = by(rand(3, 12), rand(5, 20), rand(10, 40)); const k = by(2, pick([2, 3]), pick([3, 4, 5])); const extra = by(rand(1, 4), rand(1, 8), rand(6, 18));
    const l = k * g + extra;
    return typed({ key: `me:alg:${g}:${k}:${extra}`, topic, story: { emoji: '🏹', title: 'The Orc Contest' }, answer: g,
      prompt: `At Helm's Deep, Legolas counts ${extra} more than ${({ 2: 'twice', 3: 'three times', 4: 'four times', 5: 'five times' })[k]} as many orcs as Gimli. Together they count ${g + l}. How many did Gimli count?`,
      hints: [`Let g = Gimli's count. Legolas = ${k}g + ${extra}.`, `g + ${k}g + ${extra} = ${g + l}.`], explanation: `${k + 1}g + ${extra} = ${g + l}, so ${k + 1}g = ${g + l - extra} and g = ${g}.` });
  }
  if (topic === 'ratio' && d !== 'easy' && (mode === 'story' || mode === 'stem')) {
    const e = rand(2, 5); const m = rand(e + 1, 8); const unit = rand(by(10, 20, 30), by(25, 60, 120));
    const total = (e + m) * unit; const askE = chance(0.5);
    return typed({ key: `me:ratio:${e}:${m}:${unit}:${askE}`, topic, story: { emoji: '🛡️', title: "Helm's Deep" }, answer: (askE ? e : m) * unit,
      prompt: `At Helm's Deep the ratio of elves to men is ${e} : ${m}. There are ${total} defenders in all. How many are ${askE ? 'elves' : 'men'}?`,
      visual: mode === 'stem' ? { type: 'tape', parts: [{ label: 'elves', units: e }, { label: 'men', units: m }], total } : undefined,
      hints: [`There are ${e} + ${m} = ${e + m} equal parts.`, `Each part is ${total} ÷ ${e + m} = ${unit}.`], explanation: `${askE ? e : m} × ${unit} = ${(askE ? e : m) * unit}.` });
  }
  if (topic === 'stats') {
    if (d === 'easy') {
      const f = pick(['median', 'range']);
      return typed({ key: `me:stats:easy:${f}`, topic, story: { emoji: '🎂', title: 'Hobbit Ages' }, answer: f === 'median' ? 38 : 14,
        prompt: `When they left the Shire, Frodo was 50, Sam was 38 and Merry was 36. What is the ${f} of their ages?`, visual: { type: 'bars', values: [50, 38, 36] },
        explanation: f === 'median' ? 'In order: 36, 38, 50. The middle one is 38.' : '50 − 36 = 14.' });
    }
    if (d === 'challenge') {
      const f = pick(['mean', 'change', 'range']);
      const vals = [50, 38, 36, 28, 111];
      const text = 'Frodo was 50, Sam was 38, Merry was 36 and Pippin was 28. Bilbo, at 111, joins the group.';
      if (f === 'mean') return typed({ key: 'me:stats:ch:mean', topic, story: { emoji: '🎂', title: 'Hobbit Ages' }, answer: 52.6, prompt: `${text} What is the mean age of all five?`, visual: { type: 'bars', values: vals },
        explanation: '(50 + 38 + 36 + 28 + 111) ÷ 5 = 263 ÷ 5 = 52.6.' });
      if (f === 'change') return typed({ key: 'me:stats:ch:change', topic, story: { emoji: '🎂', title: 'Hobbit Ages' }, answer: 14.6, prompt: `${text} By how much does Bilbo raise the mean age? (The mean of the four hobbits alone is 38.)`, visual: { type: 'bars', values: vals },
        explanation: 'The mean of all five is 263 ÷ 5 = 52.6. That is 52.6 − 38 = 14.6 more.' });
      return typed({ key: 'me:stats:ch:range', topic, story: { emoji: '🎂', title: 'Hobbit Ages' }, answer: 83, prompt: `${text} What is the range of the five ages?`, visual: { type: 'bars', values: vals },
        explanation: '111 − 28 = 83.' });
    }
    const f = pick(['mean', 'median', 'range']);
    const vals = Object.values(FELLOWSHIP_AGES);
    const ans = f === 'mean' ? 38 : f === 'median' ? 37 : 22;
    return typed({ key: `me:stats:${f}`, topic, story: { emoji: '🎂', title: 'Hobbit Ages' }, answer: ans,
      prompt: `When they left the Shire, Frodo was 50, Sam was 38, Merry was 36 and Pippin was 28. What is the ${f} of their ages?`,
      visual: { type: 'bars', values: vals }, explanation: f === 'mean' ? '(50 + 38 + 36 + 28) ÷ 4 = 152 ÷ 4 = 38.' : f === 'median' ? 'In order: 28, 36, 38, 50. The middle two average to 37.' : '50 − 28 = 22.' });
  }
  if (['add', 'sub', 'mul', 'div'].includes(topic) && mode === 'story') {
    if (topic === 'mul') {
      const meals = 6; const days = rand(by(4, 7, 12), by(7, 14, 30)); const hobbits = 4;
      return typed({ key: `me:mul:${days}`, topic, story: { emoji: '🍳', title: 'Second Breakfast' }, answer: meals * days * hobbits,
        prompt: `Each hobbit eats ${meals} meals a day (breakfast, second breakfast, elevenses, luncheon, afternoon tea and dinner). How many meals do ${hobbits} hobbits eat in ${days} days?`,
        hints: [`One hobbit: ${meals} × ${days} = ${meals * days}.`, `Four hobbits: × ${hobbits}.`], explanation: `${meals} × ${days} × ${hobbits} = ${meals * days * hobbits}.` });
    }
    if (topic === 'div') {
      const per = pick(by([6, 8, 12], [8, 12, 15, 24], [12, 15, 24])); const n = rand(by(6, 15, 30), by(12, 40, 90));
      return typed({ key: `me:div:${per}:${n}`, topic, story: { emoji: '🍞', title: 'Lembas Bread' }, answer: n,
        prompt: `The elves of Lórien baked ${per * n} lembas wafers and wrapped them in leaves, ${per} to a bundle. How many bundles?`, hints: [`Divide ${per * n} by ${per}.`], explanation: `${per * n} ÷ ${per} = ${n}.` });
    }
    const a = rand(by(120, 380, 1200), by(480, 920, 4800)); const b = rand(by(80, 150, 600), by(300, 600, 2900));
    if (topic === 'add') {
      return typed({ key: `me:add12:${a}:${b}`, topic, story: { emoji: '🗺️', title: 'Across Middle-earth' }, answer: a + b,
        prompt: `Frodo and Sam travel ${a} miles from the Shire to Rivendell, then ${b} miles more toward Mordor. How far have they gone?`, hints: [`Add ${a} + ${b}.`], explanation: `${a} + ${b} = ${a + b} miles.` });
    }
    const [big, sm0] = a > b ? [a, b] : [b + a, b];
    let sm = sm0;
    if (d !== 'easy' && big % 10 < 9) { sm = sm - (sm % 10) + rand((big % 10) + 1, 9); if (sm >= big) sm -= 10; } // the ones digit forces a regroup
    return typed({ key: `me:sub12:${big}:${sm}`, topic, story: { emoji: '🌋', title: 'Mount Doom' }, answer: big - sm,
      prompt: `The journey to Mount Doom is ${big} miles. Frodo and Sam have gone ${sm} miles. How many miles are left?`, hints: [`Subtract ${big} − ${sm}.`], explanation: `${big} − ${sm} = ${big - sm} miles.` });
  }
  if (topic === 'fracdec' && mode === 'story') {
    if (d === 'challenge') {
      const den = pick([6, 8, 12]); const n1 = rand(1, 2); const n2 = rand(1, 3); const total = den * rand(40, 120);
      const left = total - (total / den) * (n1 + n2);
      return typed({ key: `me:frac2:${n1}:${n2}:${den}:${total}`, topic, story: { emoji: '🗻', title: 'Over the Mountains' }, answer: left,
        prompt: `The pass over the mountains is ${total} miles long. The Fellowship walks ${F(n1, den)} of it on the first day and ${F(n2, den)} of it on the second day. How many miles are left?`,
        hints: [`Add the fractions first: ${F(n1, den)} + ${F(n2, den)} = ${F(n1 + n2, den)}.`, `Then find that part of ${total} and subtract.`], explanation: `${total} − ${(total / den) * (n1 + n2)} = ${left} miles.` });
    }
    const den = d === 'easy' ? pick([2, 4, 5]) : pick([4, 5, 6, 8]); const n = rand(1, den - 1); const total = den * (d === 'easy' ? rand(6, 25) : rand(30, 90));
    return typed({ key: `me:frac:${n}:${den}:${total}`, topic, story: { emoji: '🗻', title: 'Over the Mountains' }, answer: total - (total / den) * n,
      prompt: `The pass over the mountains is ${total} miles long. The Fellowship has walked ${F(n, den)} of it. How many miles are left?`,
      hints: [`${F(n, den)} of ${total} = ${(total / den) * n}.`, `Subtract from ${total}.`], explanation: `${total} − ${(total / den) * n} = ${total - (total / den) * n} miles.` });
  }
  return null;
}

/* ----------------------------- shared: Bilbo's party clock ----------------------------- */
const ts = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
const addMin = (h, m, k) => { const t = ((h % 12) * 60 + m + k + 720) % 720; return [Math.floor(t / 60) || 12, t % 60]; };
function bilboParty(topic, durs, step) {
  const h = rand(1, 9); const m = step * rand(0, 60 / step - 1); const dur = pick(durs);
  const [eh, em] = addMin(h, m, dur);
  const what = pick(['Bilbo’s birthday party', 'Gandalf’s fireworks show', 'The hobbits’ dance', 'Second breakfast']);
  const wrong = [addMin(h, m, dur + 30), addMin(h, m, dur - step), addMin(h, m, dur + 60)].map(([a, b]) => ts(a, b)).filter((x, i, arr) => x !== ts(eh, em) && arr.indexOf(x) === i);
  return choose({ key: `me:${topic}:party:${h}:${m}:${dur}:${what}`, topic, story: { emoji: '🎉', title: 'Party in the Shire' },
    prompt: `${what} starts at the time on the clock and lasts ${dur} minutes. What time does it end?`, visual: { type: 'clock', h, m },
    hints: ['Count on by hours first, then minutes.', '60 minutes make 1 hour.'], explanation: `${ts(h, m)} plus ${dur} minutes is ${ts(eh, em)}.` },
  { text: ts(eh, em) }, wrong.slice(0, 3).map((x) => ({ text: x })));
}

/* ------------------------------------ Age 4 ------------------------------------ */
export function themed4(mode, topic, d) {
  const by = (g, r, st) => (d === 'gentle' ? g : d === 'stretch' ? st : r);
  if (topic === 'count10') {
    if (d === 'stretch') return countHobbits(topic, 8, 10, true);
    return countHobbits(topic, by(2, 5, 8), by(5, 10, 10), mode === 'stem' && d === 'ready');
  }
  if (topic === 'compare') return themed3(mode, topic, d);
  if (topic === 'patterns') return themed3(mode, topic, d);
  if (topic === 'measure') {
    return whoTaller(topic, mode, d === 'stretch' ? 4 : d === 'ready' ? 3 : 2);
  }
  if (topic === 'count20') {
    const [lo, hi] = by([6, 10], [11, 15], [16, 20]);
    const n = rand(lo, hi);
    return small({
      key: `me:count20:${n}`, topic, story: mode === 'story' ? { emoji: '🎉', title: "Bilbo's Party" } : undefined,
      prompt: 'Hobbits are coming to Bilbo’s party! How many hobbits?', visual: { type: 'crowd', ids: hobbitCrowd(n) }, answer: n,
      speak: 'Hobbits are coming to Bilbo’s party! How many hobbits do you count?', hints: ['Count each row of 5.'],
      summary: `Count ${n} hobbits`, explanation: `There are ${n} hobbits at the party.`,
    });
  }
  if (topic === 'sorting' && d !== 'gentle') return themed5(mode, topic, d);
  if (topic === 'skip' && d === 'stretch') {
    const n = rand(2, 5);
    return small({ key: `me:skip:feet4:${n}`, topic, prompt: 'Hobbits have big hairy feet! Count by 2s. How many feet?', visual: { type: 'crowd', ids: hobbitCrowd(n) },
      answer: n * 2, speak: 'Hobbits have big hairy feet. Count by twos. How many feet are there?', hints: ['Each hobbit has 2 feet.', 'Count 2, 4, 6, 8…'],
      summary: `${n} hobbits' feet`, explanation: `${n} hobbits with 2 feet each: ${Array.from({ length: n }, (_, i) => 2 * (i + 1)).join(', ')}. That's ${n * 2} feet.` });
  }
  return null;
}

/* ------------------------------------ Age 6 ------------------------------------ */
export const themed6 = (mode, topic, d) => withSpeak(themed6raw(mode, topic, d), toSpeech);
function themed6raw(mode, topic, d) {
  if ((topic === 'add' || topic === 'sub') && mode === 'story') {
    if (d === 'stretch') return themed7(mode, topic, 'easy');
    let q = themed5(mode, topic, d === 'gentle' ? 'ready' : 'stretch');
    if (topic === 'add' && d === 'ready') for (let i = 0; i < 12 && Number(q.answer) < 11; i++) q = themed5(mode, topic, 'stretch'); // Advanced: sums past 10
    return q;
  }
  if (topic === 'compare' && mode === 'story') return themed5(mode, topic, d);
  if (topic === 'measure') return d === 'gentle' ? blocksDiff(topic, mode, 4, 8) : d === 'ready' ? blocksDiff(topic, mode, 7, 12) : blocksDiff(topic, mode, 14, 24);
  if (topic === 'skip') return themed5(mode, topic, d);
  if (topic === 'money' && mode === 'story') return d === 'gentle' ? null : themed7(mode, topic, d === 'ready' ? 'easy' : 'standard');
  if (topic === 'time' && mode !== 'flash') return d === 'gentle' ? null : bilboParty(topic, d === 'ready' ? [30, 60, 90] : [45, 75, 90], d === 'stretch' ? 15 : 30);
  if (topic === 'graphs') {
    const n = d === 'gentle' ? 3 : 4; const each = d === 'stretch' ? 2 : 1;
    const vals = sample([1, 2, 3, 4, 5, 6, 7], n).map((v) => v * each);
    const rows = HOBBITS.slice(0, n).map((id, i) => ({ label: nameOf(id), value: vals[i] }));
    const [A, B] = sample(rows, 2); const [hi, lo] = A.value > B.value ? [A, B] : [B, A];
    const visual = { type: 'picgraph', rows, emoji: '🍄', each, title: 'Mushrooms the Hobbits Found' };
    if (d === 'gentle' || (d === 'stretch' && chance(0.4))) {
      return typed({ key: `me:graphs:${vals.join(',')}:read:${A.label}`, topic, prompt: `How many mushrooms did ${A.label} find?`, visual, answer: A.value,
        hints: [each > 1 ? 'Each mushroom means 2!' : 'Count the mushrooms in the row.'], explanation: `${A.label} found ${A.value}.` });
    }
    return typed({ key: `me:graphs:${vals.join(',')}:more:${A.label}:${B.label}`, topic, prompt: `How many more mushrooms did ${hi.label} find than ${lo.label}?`, visual, answer: hi.value - lo.value,
      hints: [each > 1 ? 'Each mushroom means 2!' : 'Count both rows.', 'Then take away.'], explanation: `${hi.value} take away ${lo.value} is ${hi.value - lo.value}.` });
  }
  return null;
}

/* ------------------------------------ Age 8 ------------------------------------ */
const retopicME = (q, topic) => (q ? { ...q, topic, key: `${topic}|${q.key}` } : q);
export function themed8(mode, topic, d) {
  const by = (e, s, c) => (d === 'easy' ? e : d === 'challenge' ? c : s);
  if (topic === 'mul' && (mode === 'story' || mode === 'stem')) {
    const r = rand(3, by(5, 9, 12)); const c = rand(3, by(5, 9, 12));
    return typed({ key: `me:mul:elves:${r}:${c}`, topic, story: { emoji: '🏹', title: "Helm's Deep" }, answer: r * c,
      prompt: `At Helm's Deep, the elves stand on the wall in ${r} rows of ${c}. How many elves?`, visual: mode === 'stem' ? { type: 'array', rows: r, cols: c, emoji: '🧝' } : undefined,
      hints: [`${r} × ${c}`], explanation: `${r} × ${c} = ${r * c} elves.` });
  }
  if (topic === 'div' && mode === 'story') {
    const per = rand(3, by(5, 9, 12)); const n = rand(3, by(5, 9, 12));
    return typed({ key: `me:div:lembas:${per}:${n}`, topic, story: { emoji: '🍃', title: 'Lembas Bread' }, answer: n,
      prompt: `The Fellowship has ${per * n} lembas wafers. Each traveler gets ${per}. How many travelers can be fed?`, hints: [`${per} × ? = ${per * n}`], explanation: `${per * n} ÷ ${per} = ${n}.` });
  }
  if (topic === 'add' && mode === 'story' && d === 'challenge') {
    const a = rand(1200, 6900); const b = rand(1100, 2900);
    return typed({ key: `me:add:xl:${a}:${b}`, topic, story: { emoji: '🗺️', title: 'The Long Road' }, answer: a + b,
      prompt: `The Fellowship's road from Rivendell to Mordor is ${a.toLocaleString('en-US')} miles on the old maps, and ${b.toLocaleString('en-US')} more miles by the path through the mountains. How many miles in all?`, hints: ['Line up the digits.'], explanation: `${a} + ${b} = ${a + b}.` });
  }
  if (topic === 'sub' && mode === 'story' && d === 'challenge') {
    const a = rand(3000, 9000); const b = rand(1127, a - 500);
    return typed({ key: `me:sub:xl:${a}:${b}`, topic, story: { emoji: '🛡️', title: 'Army of Rohan' }, answer: a - b,
      prompt: `${a.toLocaleString('en-US')} riders gathered at Edoras. ${b.toLocaleString('en-US')} rode on to Helm's Deep. How many riders stayed behind?`, hints: ['Check by adding back.'], explanation: `${a} − ${b} = ${a - b}.` });
  }
  if ((topic === 'add' || topic === 'sub') && mode === 'story') return retopicME(themed7(mode, topic, d === 'easy' ? 'standard' : 'challenge'), topic);
  if (topic === 'data') return retopicME(themed7(mode, 'data', by('standard', 'challenge', 'xl')), topic);
  if (topic === 'time' && mode !== 'flash') return bilboParty(topic, by([30, 45, 60], [25, 40, 75, 95], [105, 130, 155, 185, 215]), by(15, 5, 5));
  if (topic === 'area' && (mode === 'story' || chance(0.4))) {
    const w = rand(4, by(8, 12, 15)); const h = rand(3, by(6, 9, 12)); const askP = chance(0.5);
    return typed({ key: `me:area:bagend:${w}:${h}:${askP}`, topic, story: { emoji: '🌻', title: 'Bag End Garden' }, answer: askP ? 2 * (w + h) : w * h,
      prompt: askP ? `Sam's garden at Bag End is ${w} meters long and ${h} meters wide. How many meters of fence go all the way around it?` : `Sam's garden at Bag End is ${w} meters long and ${h} meters wide. What is its area in square meters?`,
      visual: { type: 'rect', w, h, unit: 'm' }, hints: [askP ? 'Add all four sides.' : 'Area = length × width.'], explanation: askP ? `2 × (${w} + ${h}) = ${2 * (w + h)} m.` : `${w} × ${h} = ${w * h} square meters.` });
  }
  if (topic === 'mass' && mode === 'story') {
    const per = rand(2, 6); const k = rand(3, by(5, 8, 12));
    return typed({ key: `me:mass:pot:${per}:${k}`, topic, story: { emoji: '🍲', title: "Sam's Cooking" }, answer: per * k,
      prompt: `Sam's cooking pot holds ${per} liters of stew. He cooks ${k} pots for the hobbits. How many liters of stew is that?`, hints: [`${k} × ${per}`], explanation: `${k} × ${per} = ${per * k} liters.` });
  }
  return null;
}

export const THEMED = { 3: themed3, 4: themed4, 5: themed5, 6: themed6, 7: themed7, 8: themed8, 12: themed12 };
