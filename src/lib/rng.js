export const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const chance = (p) => Math.random() < p;
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const sample = (arr, n) => shuffle(arr).slice(0, n);
export function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}
export const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const round = (n, places = 2) => Math.round(n * 10 ** places) / 10 ** places;
/** Pick n distinct values from [min,max] excluding `exclude`. */
export function distinctInts(n, min, max, exclude = []) {
  const out = new Set();
  const ex = new Set(exclude);
  let guard = 0;
  while (out.size < n && guard++ < 500) {
    const v = rand(min, max);
    if (!ex.has(v)) out.add(v);
  }
  return [...out];
}
