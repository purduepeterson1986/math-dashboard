// Kid profiles on one device. Each child has their own name, age, level filters and saved sessions.
// Shared across children: sound, read-aloud, Middle-earth, and the parent PIN.
//
// Storage layout (nothing from the single-child version is moved or deleted):
//   lumen.profiles.v1        the list of children
//   lumen.sessions.v1        sessions of the FIRST child (id 'p1'), the same key the old app used
//   lumen.sessions.<id>.v1   sessions of every other child
import { safeGet, safeSet, saveJSONFile } from './storage.js';

const KEY_PROFILES = 'lumen.profiles.v1';
export const AVATARS = ['🧙', '🧝', '🧑‍🌾', '🦅', '🐴', '🐉', '🦉', '🐢', '🌟', '🦊', '🐻', '🦁', '🐼', '🐬', '🦄', '🚀', '⚔️', '🛡️', '🏔️', '🔥'];
export const IDLE_MS = 15 * 60 * 1000; // back to "Who's learning?" after this long without a tap

export const sessionKey = (id) => (id === 'p1' ? 'lumen.sessions.v1' : `lumen.sessions.${id}.v1`);
export const displayName = (p, i = 0) => (p?.name || '').trim() || `Child ${i + 1}`;

export function loadProfiles() {
  const saved = safeGet(KEY_PROFILES, null);
  if (saved && Array.isArray(saved.list) && saved.list.length) return saved.list;
  // First launch of the profile version: the existing student becomes the first child
  const legacy = safeGet('lumen.settings.v1', {});
  return [{ id: 'p1', name: legacy.studentName || '', avatar: AVATARS[0], age: Number(legacy.age) || 3, filters: legacy.filters || {} }];
}
export const saveProfiles = (list) => safeSet(KEY_PROFILES, { list });

export function loadProfileSessions(id) {
  const list = safeGet(sessionKey(id), []);
  return Array.isArray(list) ? list : [];
}
export const saveProfileSessions = (id, list) => safeSet(sessionKey(id), list);
export function deleteProfileSessions(id) { try { window.localStorage.removeItem(sessionKey(id)); } catch { /* ignore */ } }

/** Shrink old sessions to save space: keep the score, topics and times (so stars and mastery are unchanged) but drop each question's text. */
export function compactSessions(list, keepFull = 60) {
  const sorted = [...list].sort((a, b) => b.startedAt - a.startedAt);
  const full = new Set(sorted.slice(0, keepFull).map((s) => s.id));
  return list.map((s) => (full.has(s.id) || s.compact ? s : {
    ...s, compact: true,
    questions: s.questions.map((q) => ({ topic: q.topic, mode: q.mode, correct: q.correct, ms: q.ms, hints: q.hints, retried: q.retried, skipped: q.skipped })),
  }));
}

export function newProfile(list) {
  const used = new Set(list.map((p) => p.avatar));
  const avatar = AVATARS.find((a) => !used.has(a)) || AVATARS[list.length % AVATARS.length];
  const id = `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  return { id, name: '', avatar, age: list[list.length - 1]?.age || 3, filters: {} };
}

/* ------------------------------ backup / restore ------------------------------ */
export function mergeSessions(current, incoming) {
  const byId = new Map(current.map((s) => [s.id, s]));
  let added = 0;
  for (const s of incoming || []) {
    if (s && s.id && Array.isArray(s.questions) && !byId.has(s.id)) { byId.set(s.id, s); added++; }
  }
  return { merged: [...byId.values()].sort((a, b) => b.startedAt - a.startedAt), added };
}

export function exportFamily(entries, settings) {
  saveJSONFile({
    app: 'lumen-math-lab', version: 2, exportedAt: new Date().toISOString(),
    settings: { sound: settings.sound, voice: settings.voice, middleEarth: settings.middleEarth, pin: settings.pin ? '(set)' : null },
    profiles: entries.map(({ profile, sessions }) => ({ profile, sessions })),
  });
}

/** Read a backup file. Old single-child backups come back as one entry with no profile. */
export async function readBackup(file) {
  const data = JSON.parse(await file.text());
  if (data && Array.isArray(data.profiles)) {
    return data.profiles.filter((e) => e && e.profile && e.profile.id && Array.isArray(e.sessions));
  }
  const sessions = Array.isArray(data) ? data : data?.sessions;
  if (!Array.isArray(sessions)) throw new Error('This file does not look like a Lumen backup.');
  return [{ profile: null, sessions }];
}
