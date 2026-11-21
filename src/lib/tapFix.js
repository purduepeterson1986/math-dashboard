/**
 * iPad Safari sometimes drops the click on a normal-speed tap (finger drifts a few pixels, or the
 * button shrinks under the finger). This watches touch pointers and, if a tap on a button ended
 * close to where it began but the browser never produced a click, fires the click ourselves.
 */
export function installTapFix() {
  if (typeof document === 'undefined') return;
  let down = null;
  let lastClick = 0;
  document.addEventListener('click', () => { lastClick = performance.now(); }, true);
  document.addEventListener('pointerdown', (e) => {
    down = e.pointerType === 'touch' ? { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId } : null;
  }, true);
  document.addEventListener('pointercancel', () => { down = null; }, true);
  document.addEventListener('pointerup', (e) => {
    const d = down; down = null;
    if (!d || d.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 30) return; // a swipe or drag, not a tap
    if (performance.now() - d.t > 2500) return;                    // a long hold
    const el = e.target.closest?.('button, [role="button"]');
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    const t0 = performance.now();
    setTimeout(() => {
      if (lastClick >= t0 - 5) return; // the browser delivered its own click
      if (el.isConnected && !el.disabled) el.click();
    }, 80);
  }, true);
}
