let ctx = null;
let enabled = true;
let voiceEnabled = true;

export function setSoundEnabled(v) { enabled = v; }
export function setVoiceEnabled(v) { voiceEnabled = v; if (!v) stopSpeaking(); }

function getCtx() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

let speechPrimed = false;
export const audioReady = () => !!ctx && ctx.state === 'running';

/** Safari only allows audio after a user gesture (touchend / click / keydown). Call from one. */
export function unlockAudio() {
  if (!speechPrimed) {
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis?.speak(u);
      speechPrimed = true;
    } catch { /* ignore */ }
  }
  const c = getCtx();
  if (!c) return;
  // play a silent buffer to fully unlock iOS audio
  try {
    const b = c.createBuffer(1, 1, 22050);
    const s = c.createBufferSource();
    s.buffer = b; s.connect(c.destination); s.start(0);
  } catch { /* ignore */ }
}

function tone(freq, start, dur, { type = 'sine', gain = 0.14, slide } = {}) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

export const sfx = {
  tap() { if (enabled) tone(660, 0, 0.05, { type: 'triangle', gain: 0.06 }); },
  tick() { if (enabled) tone(1200, 0, 0.03, { type: 'square', gain: 0.025 }); },
  correct() { if (!enabled) return; tone(784, 0, 0.12, { type: 'triangle' }); tone(1175, 0.09, 0.18, { type: 'triangle' }); },
  wrong() { if (!enabled) return; tone(260, 0, 0.18, { type: 'sine', gain: 0.12, slide: 180 }); },
  streak() { if (!enabled) return; [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.06, 0.12, { type: 'triangle', gain: 0.1 })); },
  celebrate() { if (!enabled) return; [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.2, { type: 'triangle', gain: 0.12 })); },
  warn() { if (enabled) tone(440, 0, 0.08, { type: 'square', gain: 0.04 }); },
};

export function speak(text) {
  if (!voiceEnabled || !text) return;
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1.15;
    const voices = synth.getVoices();
    const preferred = voices.find((v) => /en-US/i.test(v.lang) && /Samantha|Karen|Moira|Google US/i.test(v.name))
      || voices.find((v) => /^en/i.test(v.lang));
    if (preferred) u.voice = preferred;
    synth.speak(u);
  } catch { /* ignore */ }
}
export function stopSpeaking() { try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } }
export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
