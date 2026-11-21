/**
 * Middle-earth themed questions, mixed into the normal topics (about half the time, for topics that have themed versions).
 * Ages 3 and 5 get pictures of the Fellowship (imported from the Middle Earth game);
 * Ages 7 and 12 mostly get Middle-earth wording.
 *
 * Each themed(mode, topic, d) returns a question, or null when it has nothing for that topic/mode
 * (then the normal generator is used).
 */
import { rand, pick, sample, shuffle, chance, gcd } from '../lib/rng.js';
import { makeChoices } from './shared.js';
import { ART } from './middleEarthArt.js';

let enabled = true;
export const setMiddleEarth = (v) => { enabled = !!v; };
export const middleEarthOn = () => enabled;
export const THEME_RATE = 0.5;

// height tiers (never compare two people in the same tier: Aragorn vs Boromir is too close to call)
const TIER = { gandalf: 4, legolas: 3, aragorn: 3, boromir: 3, gimli: 2, frodo: 1, sam: 1, merry: 1, pippin: 1 };
const HOBBITS = ['frodo', 'sam', 'merry', 'pippin'];
const nameOf = (id) => ART[id].name;
const hobbitCrowd = (n) => Array.from({ length: n }, () => pick(HOBBITS));
const pickAcrossTiers = (k) => {
  const tiers = sample([...new Set(Object.values(TIER))], k).sort((a, b) => b - a);
  return tiers.map((t) => pick(Object.keys(TIER).filter((id) => TIER[id] === t)));
};
const charChoice = (id) => ({ text: nameOf(id), visual: { type: 'character', id, toScale: true } });
function choose(o, correct, wrong) {
  const { choices, answer } = makeChoices(correct, wrong);
  return { input: 'choice', choices, answer, answerLabel: correct.text, ...o };
}
const small = (o) => ({ ...o, input: Number(o.answer) <= 10 ? 'kidpad' : 'keypad', answer: String(o.answer), answerLabel: String(o.answer) });
const typed = (o) => ({ input: 'keypad', answerLabel: String(o.answer), ...o, answer: String(o.answer) });
const frac = (n, d) => { const g = gcd(n, d); return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`; };
const F = (n, d) => `[[${n}/${d}]]`;
const FR = (n, d) => { const s = frac(n, d); return s.includes('/') ? `[[${s}]]` : s; };
const money = (c) => (c >= 100 ? `$${Math.floor(c / 100)}.${String(c % 100).padStart(2, '0')}` : `${c}¢`);

/* --------------------------- shared picture questions --------------------------- */
function whoTaller(topic, mode, three) {
  const ids = pickAcrossTiers(three ? 3 : 2);
  const askTall = chance(0.5);
  const right = askTall ? ids[0] : ids[ids.length - 1];
  const word = three ? (askTall ? 'TALLEST' : 'SHORTEST') : (askTall ? 'TALLER' : 'SHORTER');
  const names = ids.map(nameOf);
  const q = three ? `Who is the ${word}?` : `Who is ${word}, ${names[0]} or ${names[1]}?`;
  return choose({
    key: `me:${topic}:tall:${[...ids].sort().join(',')}:${askTall}`, topic, story: mode === 'story' ? { emoji: '🧙', title: 'The Fellowship' } : undefined,
    prompt: q, speak: three ? `${names.join(', ')}. Who is the ${word.toLowerCase()}?` : `Who is ${word.toLowerCase()}, ${names[0]} or ${names[1]}?`,
    hints: ['Look at the tops of their heads.'], summary: `${word.toLowerCase()}: ${names.join(' vs ')}`,
    explanation: three ? `${nameOf(right)} is the ${word.toLowerCase()}.` : `${nameOf(right)} is ${word.toLowerCase()} than ${nameOf(ids.find((x) => x !== right))}.`,
  }, charChoice(right), ids.filter((x) => x !== right).map(charChoice));
}

function countHobbits(topic, lo, hi, mixed) {
  const n = rand(lo, hi);
  let ids = hobbitCrowd(n);
  let prompt = 'How many hobbits do you count?';
  if (mixed) {
    const others = Array.from({ length: rand(1, 3) }, () => pick(['gandalf', 'gimli', 'legolas', 'aragorn']));
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
  if (topic === 'size') return whoTaller(topic, mode, d === 'stretch');
  if (topic === 'count5') return countHobbits(topic, 1, 5, mode === 'stem' && d !== 'gentle');
  if (topic === 'count10') return countHobbits(topic, 6, 10, mode === 'stem' && d !== 'gentle');
  if (topic === 'patterns') {
    const [a, b] = pickAcrossTiers(2);
    const type = d === 'gentle' ? 'AB' : pick(['AB', 'AAB', 'ABB']);
    const map = { A: a, B: b };
    const seq = Array.from({ length: type.length * 2 + 1 }, (_, i) => map[type[i % type.length]]);
    const ans = seq[seq.length - 1];
    const item = (id) => ({ type: 'character', id, px: 80 });
    return choose({
      key: `me:patterns:${type}:${a}:${b}`, topic, prompt: 'What comes next?', visual: { type: 'pattern', items: [...seq.slice(0, -1).map(item), null] },
      speak: `${seq.slice(0, -1).map(nameOf).join(', ')}. Who comes next?`, hints: [`It goes ${type.split('').join('-')}.`],
      summary: `${type} pattern with ${nameOf(a)} and ${nameOf(b)}`, explanation: `The pattern repeats, so ${nameOf(ans)} is next.`,
    }, { visual: { type: 'character', id: ans, px: 110 } }, [{ visual: { type: 'character', id: ans === a ? b : a, px: 110 } }]);
  }
  if (topic === 'compare' && mode !== 'story') {
    const x = rand(1, 4); const y = x + rand(1, 2); const askMore = chance(0.5);
    return choose({
      key: `me:compare:${x}:${y}:${askMore}`, topic, prompt: `Which group has ${askMore ? 'MORE' : 'FEWER'} hobbits?`,
      speak: `Which group has ${askMore ? 'more' : 'fewer'} hobbits?`, summary: `${x} vs ${y} hobbits`, explanation: `${y} is more than ${x}.`,
    }, { visual: { type: 'crowd', ids: hobbitCrowd(askMore ? y : x), px: 50 } }, [{ visual: { type: 'crowd', ids: hobbitCrowd(askMore ? x : y), px: 50 } }]);
  }
  return null;
}

/* ------------------------------------ Age 5 ------------------------------------ */
export function themed5(mode, topic, d) {
  if (topic === 'count20') {
    const n = rand(d === 'gentle' ? 6 : 11, d === 'gentle' ? 12 : 20);
    return small({
      key: `me:count20:${n}`, topic, story: mode === 'story' ? { emoji: '🎉', title: "Bilbo's Party" } : undefined,
      prompt: 'Hobbits are coming to Bilbo’s party! How many hobbits?', visual: { type: 'crowd', ids: hobbitCrowd(n) }, answer: n,
      speak: 'Hobbits are coming to Bilbo’s party! How many hobbits do you count?', hints: ['Count each row of 5.'],
      summary: `Count ${n} hobbits`, explanation: `There are ${n} hobbits at the party.`,
    });
  }
  if (topic === 'measure') {
    if (mode === 'story' && d !== 'gentle') {
      const tall = rand(7, 10); const short = rand(3, tall - 2); const [big, little] = pickAcrossTiers(2);
      const text = `${nameOf(big)} is ${tall} blocks tall. ${nameOf(little)} is ${short} blocks tall. How many blocks taller is ${nameOf(big)}?`;
      return small({ key: `me:measure:blocks:${big}:${little}:${tall}:${short}`, topic, story: { emoji: '🧱', title: 'How Tall?' }, prompt: text, speak: text,
        visual: { type: 'lineup', ids: [big, little] }, answer: tall - short, hints: [`Count up from ${short} to ${tall}.`],
        summary: `${tall} vs ${short} blocks`, explanation: `${tall} take away ${short} is ${tall - short}. ${nameOf(big)} is ${tall - short} blocks taller.` });
    }
    return whoTaller(topic, mode, d === 'stretch');
  }
  if (topic === 'add' && mode === 'story') {
    const a = rand(2, d === 'stretch' ? 9 : 5); const b = rand(1, d === 'stretch' ? 9 : 5);
    const text = `${a} hobbits are at Bag End. ${b} ${b === 1 ? 'dwarf knocks' : 'dwarves knock'} on the door. How many friends are there now?`;
    return small({ key: `me:add:${a}:${b}`, topic, story: { emoji: '🚪', title: 'Unexpected Guests' }, prompt: text, speak: text, answer: a + b,
      visual: { type: 'crowd', ids: [...hobbitCrowd(a), ...Array(b).fill('gimli')], toScale: true }, hints: [`Start at ${a}. Count on ${b} more.`],
      summary: `${a} + ${b} (Bag End)`, explanation: `${a} and ${b} more makes ${a + b}.` });
  }
  if (topic === 'sub' && mode === 'story') {
    const a = rand(4, d === 'stretch' ? 18 : 10); const b = rand(1, a - 1);
    const text = pick([
      `Sam baked ${a} seed cakes. The hobbits ate ${b}. How many seed cakes are left?`,
      `${a} hobbits are dancing at the party. ${b} go home to bed. How many are still dancing?`,
      `Gandalf has ${a} fireworks. He sets off ${b}. How many fireworks are left?`,
    ]);
    return small({ key: `me:sub:${a}:${b}:${text.length}`, topic, story: { emoji: '🎆', title: 'In the Shire' }, prompt: text, speak: text, answer: a - b,
      hints: [`Start at ${a}. Count back ${b}.`], summary: `${a} − ${b} (Shire)`, explanation: `${a} take away ${b} leaves ${a - b}.` });
  }
  if (topic === 'compare' && mode === 'story') {
    const [p, q] = sample(HOBBITS, 2); const x = rand(3, 18); let y = rand(3, 18); if (y === x) y += 2;
    const more = chance(0.5); const win = (more ? x > y : x < y) ? p : q;
    return choose({ key: `me:compare:${p}:${q}:${x}:${y}:${more}`, topic, story: { emoji: '🍄', title: 'Mushroom Hunt' },
      prompt: `${nameOf(p)} found ${x} mushrooms. ${nameOf(q)} found ${y}. Who found ${more ? 'MORE' : 'FEWER'}?`,
      speak: `${nameOf(p)} found ${x} mushrooms. ${nameOf(q)} found ${y}. Who found ${more ? 'more' : 'fewer'}?`,
      hints: [`Which is ${more ? 'bigger' : 'smaller'}, ${x} or ${y}?`], summary: `${x} vs ${y} mushrooms`,
      explanation: `${Math.max(x, y)} is more than ${Math.min(x, y)}, so ${nameOf(win)} found ${more ? 'more' : 'fewer'}.` },
    { text: nameOf(win), visual: { type: 'character', id: win } }, [{ text: nameOf(win === p ? q : p), visual: { type: 'character', id: win === p ? q : p } }]);
  }
  if (topic === 'skip') {
    const n = rand(3, d === 'gentle' ? 5 : 10);
    return small({ key: `me:skip:feet:${n}`, topic, prompt: 'Hobbits have big hairy feet! Count by 2s. How many feet?', visual: { type: 'crowd', ids: hobbitCrowd(n) },
      answer: n * 2, speak: 'Hobbits have big hairy feet. Count by twos. How many feet are there?', hints: ['Each hobbit has 2 feet.', 'Count 2, 4, 6, 8…'],
      summary: `${n} hobbits' feet`, explanation: `${n} hobbits with 2 feet each: ${Array.from({ length: n }, (_, i) => 2 * (i + 1)).join(', ')}. That's ${n * 2} feet.` });
  }
  if (topic === 'sorting') {
    const n = rand(2, 6);
    const ids = shuffle([...hobbitCrowd(n), ...Array.from({ length: rand(2, 4) }, () => pick(['gandalf', 'gimli', 'legolas', 'aragorn', 'boromir']))]);
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
    const item = pick(['a coil of elven rope', 'a bag of pipe-weed', 'a loaf of bread', 'a new cooking pan', 'a lantern']);
    return typed({ key: `me:money:${price}:${paid}`, topic, story: { emoji: '🛒', title: 'Market in Bree' }, answer: paid - price,
      prompt: `At the market in Bree, Sam buys ${item} for ${money(price)}. He pays with ${money(paid)}. How much change, in cents?`,
      hints: [`Count up from ${money(price)} to ${money(paid)}.`], explanation: `${paid} − ${price} = ${paid - price}¢ change.` });
  }
  if (topic === 'data') {
    const n = d === 'easy' ? 3 : 4; const step = d === 'challenge' ? 2 : 1;
    const vals = sample([2, 3, 4, 5, 6, 7, 8, 9], n).map((v) => v * step);
    const ids = HOBBITS.slice(0, n);
    const items = ids.map((id, i) => ({ label: nameOf(id), emoji: '🍄', value: vals[i] }));
    const [A, B] = sample(items, 2); const [hi, lo] = A.value > B.value ? [A, B] : [B, A];
    const f = d === 'easy' ? 'read' : pick(['more', 'total']);
    const visual = { type: 'bargraph', items, step, title: 'Mushrooms Found' };
    const key = `me:data:${vals.join(',')}:${f}:${A.label}:${B.label}`;
    const scaleHint = step > 1 ? 'Careful: each line counts by 2.' : 'Read across from the top of the bar.';
    if (f === 'read') return typed({ key, topic, prompt: `How many mushrooms did ${A.label} find?`, visual, answer: A.value, hints: [scaleHint], explanation: `${A.label}'s bar reaches ${A.value}.` });
    if (f === 'more') return typed({ key, topic, prompt: `How many MORE mushrooms did ${hi.label} find than ${lo.label}?`, visual, answer: hi.value - lo.value, hints: [scaleHint, 'Find both numbers, then subtract.'], explanation: `${hi.value} − ${lo.value} = ${hi.value - lo.value}.` });
    const total = vals.reduce((a, b) => a + b, 0);
    return typed({ key, topic, prompt: 'How many mushrooms did the hobbits find in all?', visual, answer: total, hints: [scaleHint, 'Add all the bars.'], explanation: `${vals.join(' + ')} = ${total}.` });
  }
  if (topic === 'puzzles' && d !== 'easy') {
    const g = rand(4, 15); const more = rand(2, 6);
    return typed({ key: `me:puzzles:orcs:${g}:${more}`, topic, story: { emoji: '🪓', title: 'Gimli and Legolas' }, answer: g,
      prompt: `Gimli and Legolas have a contest. Legolas counts ${more} more orcs than Gimli. Together they count ${2 * g + more}. How many did Gimli count?`,
      hints: [`Take away Legolas's extra ${more}: ${2 * g + more} − ${more} = ${2 * g}.`, 'Now split that equally between the two.'],
      explanation: `${2 * g + more} − ${more} = ${2 * g}, and half of ${2 * g} is ${g}. Gimli counted ${g}; Legolas counted ${g + more}.` });
  }
  if (topic === 'measure' && mode === 'story') {
    const staff = rand(60, 80); const frodo = rand(36, 44);
    return typed({ key: `me:measure:${staff}:${frodo}`, topic, story: { emoji: '🧙', title: "Gandalf's Staff" }, answer: staff - frodo,
      prompt: `Gandalf's staff is ${staff} inches long. Frodo is ${frodo} inches tall. How much longer is the staff than Frodo is tall?`,
      visual: { type: 'lineup', ids: ['gandalf', 'frodo'] }, hints: [`Subtract ${staff} − ${frodo}.`], explanation: `${staff} − ${frodo} = ${staff - frodo} inches.` });
  }
  return null;
}

/* ------------------------------------ Age 12 ------------------------------------ */
const FELLOWSHIP_AGES = { Frodo: 50, Sam: 38, Merry: 36, Pippin: 28 }; // their ages when they left the Shire
export function themed12(mode, topic, d) {
  const by = (e, s, c) => (d === 'easy' ? e : d === 'challenge' ? c : s);
  if (topic === 'rates') {
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
    const f = pick(by(['one', 'not'], ['one', 'not', 'two'], ['two', 'two', 'one']));
    if (f === 'two') {
      return typed({ key: 'me:prob:twohobbits', topic, story: { emoji: '💍', title: 'The Fellowship' }, answer: '1/6',
        prompt: 'The Fellowship has 9 members: 4 hobbits, 2 men, 1 elf, 1 dwarf and 1 wizard. Two different members are picked at random to keep watch. What is P(both are hobbits)?',
        hint: 'Answer as a fraction', hints: [`First pick: ${F(4, 9)}.`, `Second pick (one hobbit fewer, one member fewer): ${F(3, 8)}.`], explanation: `${F(4, 9)} × ${F(3, 8)} = ${F(12, 72)} = ${F(1, 6)}.` });
    }
    const groups = [['a hobbit', 4], ['a man', 2], ['an elf', 1], ['a dwarf', 1], ['the wizard', 1]];
    const [what, k] = pick(groups); const not = f === 'not';
    return typed({ key: `me:prob:${what}:${not}`, topic, story: { emoji: '💍', title: 'The Fellowship' }, answer: frac(not ? 9 - k : k, 9),
      prompt: `The Fellowship has 9 members: 4 hobbits, 2 men, 1 elf, 1 dwarf and 1 wizard. One is chosen at random. What is P(${not ? 'NOT ' : ''}${what})?`,
      hint: 'Answer as a fraction', explanation: `${not ? 9 - k : k} of the 9 members: ${FR(not ? 9 - k : k, 9)}.` });
  }
  if (topic === 'algebra' && mode === 'story') {
    const g = rand(5, 20); const k = pick([2, 3]); const extra = rand(1, 8);
    const l = k * g + extra;
    return typed({ key: `me:alg:${g}:${k}:${extra}`, topic, story: { emoji: '🏹', title: 'The Orc Contest' }, answer: g,
      prompt: `At Helm's Deep, Legolas counts ${extra} more than ${k === 2 ? 'twice' : 'three times'} as many orcs as Gimli. Together they count ${g + l}. How many did Gimli count?`,
      hints: [`Let g = Gimli's count. Legolas = ${k}g + ${extra}.`, `g + ${k}g + ${extra} = ${g + l}.`], explanation: `${k + 1}g + ${extra} = ${g + l}, so ${k + 1}g = ${g + l - extra} and g = ${g}.` });
  }
  if (topic === 'ratio' && (mode === 'story' || mode === 'stem')) {
    const e = rand(2, 5); const m = rand(e + 1, 8); const unit = rand(by(10, 20, 30), by(25, 60, 120));
    const total = (e + m) * unit; const askE = chance(0.5);
    return typed({ key: `me:ratio:${e}:${m}:${unit}:${askE}`, topic, story: { emoji: '🛡️', title: "Helm's Deep" }, answer: (askE ? e : m) * unit,
      prompt: `At Helm's Deep the ratio of elves to men is ${e} : ${m}. There are ${total} defenders in all. How many are ${askE ? 'elves' : 'men'}?`,
      visual: mode === 'stem' ? { type: 'tape', parts: [{ label: 'elves', units: e }, { label: 'men', units: m }], total } : undefined,
      hints: [`There are ${e} + ${m} = ${e + m} equal parts.`, `Each part is ${total} ÷ ${e + m} = ${unit}.`], explanation: `${askE ? e : m} × ${unit} = ${(askE ? e : m) * unit}.` });
  }
  if (topic === 'stats') {
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
      const per = pick([8, 12, 15, 24]); const n = rand(by(6, 15, 30), by(12, 40, 90));
      return typed({ key: `me:div:${per}:${n}`, topic, story: { emoji: '🍞', title: 'Lembas Bread' }, answer: n,
        prompt: `The elves of Lórien baked ${per * n} lembas wafers and wrapped them in leaves, ${per} to a bundle. How many bundles?`, hints: [`Divide ${per * n} by ${per}.`], explanation: `${per * n} ÷ ${per} = ${n}.` });
    }
    const a = rand(by(120, 380, 1200), by(480, 920, 4800)); const b = rand(by(80, 150, 600), by(300, 600, 2900));
    if (topic === 'add') {
      return typed({ key: `me:add12:${a}:${b}`, topic, story: { emoji: '🗺️', title: 'Across Middle-earth' }, answer: a + b,
        prompt: `Frodo and Sam travel ${a} miles from the Shire to Rivendell, then ${b} miles more toward Mordor. How far have they gone?`, hints: [`Add ${a} + ${b}.`], explanation: `${a} + ${b} = ${a + b} miles.` });
    }
    const [big, sm] = a > b ? [a, b] : [b + a, b];
    return typed({ key: `me:sub12:${big}:${sm}`, topic, story: { emoji: '🌋', title: 'Mount Doom' }, answer: big - sm,
      prompt: `The journey to Mount Doom is ${big} miles. Frodo and Sam have gone ${sm} miles. How many miles are left?`, hints: [`Subtract ${big} − ${sm}.`], explanation: `${big} − ${sm} = ${big - sm} miles.` });
  }
  if (topic === 'fracdec' && mode === 'story') {
    const den = pick([4, 5, 6, 8]); const n = rand(1, den - 1); const total = den * rand(30, 90);
    return typed({ key: `me:frac:${n}:${den}:${total}`, topic, story: { emoji: '🗻', title: 'Over the Mountains' }, answer: total - (total / den) * n,
      prompt: `The pass over the mountains is ${total} miles long. The Fellowship has walked ${F(n, den)} of it. How many miles are left?`,
      hints: [`${F(n, den)} of ${total} = ${(total / den) * n}.`, `Subtract from ${total}.`], explanation: `${total} − ${(total / den) * n} = ${total - (total / den) * n} miles.` });
  }
  return null;
}

export const THEMED = { 3: themed3, 5: themed5, 7: themed7, 12: themed12 };
