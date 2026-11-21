const KEY_SESSIONS = 'lumen.sessions.v1';
const KEY_SETTINGS = 'lumen.settings.v1';

function safeGet(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // private mode / quota — app keeps working in memory
  }
}

export const DEFAULT_SETTINGS = {
  age: 3,
  studentName: '',
  sound: true,
  voice: true,
  pin: null,
  filters: {}, // { [age]: { [mode]: { topics: [...], difficulty, count, seconds } } }
};

export function loadSettings() {
  const s = safeGet(KEY_SETTINGS, {});
  return { ...DEFAULT_SETTINGS, ...s, filters: { ...(s.filters || {}) } };
}
export const saveSettings = (s) => safeSet(KEY_SETTINGS, s);

export function loadSessions() {
  const list = safeGet(KEY_SESSIONS, []);
  return Array.isArray(list) ? list : [];
}
export function saveSessions(list) { return safeSet(KEY_SESSIONS, list); }

export function exportData(sessions, settings) {
  const payload = {
    app: 'lumen-math-lab',
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: { ...settings, pin: settings.pin ? '(set)' : null },
    sessions,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `lumen-math-backup-${stamp}.json`;
  // iPad (especially Home Screen mode): the share sheet is more reliable than a download link
  try {
    const f = new File([blob], filename, { type: 'application/json' });
    if (navigator.canShare?.({ files: [f] })) {
      navigator.share({ files: [f], title: 'Lumen Math backup' }).catch(() => {});
      return;
    }
  } catch { /* fall through to download */ }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Read a backup file; returns sessions merged (by id) with the current list. */
export async function importData(file, current) {
  const text = await file.text();
  const data = JSON.parse(text);
  const incoming = Array.isArray(data) ? data : data.sessions;
  if (!Array.isArray(incoming)) throw new Error('This file does not look like a Lumen backup.');
  const byId = new Map(current.map((s) => [s.id, s]));
  let added = 0;
  for (const s of incoming) {
    if (s && s.id && Array.isArray(s.questions) && !byId.has(s.id)) {
      byId.set(s.id, s);
      added++;
    }
  }
  const merged = [...byId.values()].sort((a, b) => b.startedAt - a.startedAt);
  return { merged, added };
}
