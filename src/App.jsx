import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Home from './screens/Home.jsx';
import SetupSheet from './screens/SetupSheet.jsx';
import Summary from './screens/Summary.jsx';
import ParentGate from './screens/ParentGate.jsx';
import ParentPortal from './screens/ParentPortal.jsx';
import WhoIsLearning from './screens/WhoIsLearning.jsx';
import FlashCards from './modes/FlashCards.jsx';
import Worksheet from './modes/Worksheet.jsx';
import Runner from './modes/Runner.jsx';
import { getCurriculum } from './curriculum/index.js';
import { loadSettings, saveSettings } from './lib/storage.js';
import {
  loadProfiles, saveProfiles, withGuest, isGuest, loadProfileSessions, saveProfileSessions, deleteProfileSessions, newProfile,
  mergeSessions, exportFamily, readBackup, IDLE_MS, displayName, compactSessions,
} from './lib/profiles.js';
import { setSoundEnabled, setVoiceEnabled, unlockAudio, audioReady, stopSpeaking } from './lib/audio.js';
import { starsFor } from './lib/diagnostics.js';
import { topicsForMode } from './lib/session.js';
import { uid } from './lib/rng.js';
import { setMiddleEarth } from './curriculum/middleEarth.js';
import { CURRENT_VERSION, latestVersion, reloadFresh } from './lib/update.js';

export default function App() {
  // Shared by every child: sound, read-aloud, Middle-earth, parent PIN
  const [shared, setShared] = useState(() => { const { age, filters, studentName, ...rest } = loadSettings(); return rest; }); // eslint-disable-line no-unused-vars
  const [profiles, setProfiles] = useState(loadProfiles);
  // With one child the app opens straight to them; with several it asks "Who's learning?"
  const [activeId, setActiveId] = useState(() => (profiles.filter((p) => !isGuest(p)).length === 1 ? profiles[0].id : null));
  const [sessions, setSessions] = useState(() => (activeId ? loadProfileSessions(activeId) : []));
  const [view, setView] = useState({ name: 'home' });
  const [setupMode, setSetupMode] = useState(null);
  const [pickerGate, setPickerGate] = useState(false);
  // A child may browse other grade levels, but that never changes their default (the parent sets that in the portal)
  const [tryAge, setTryAge] = useState(null);

  const active = profiles.find((p) => p.id === activeId) || null;
  const activeIndex = Math.max(0, profiles.findIndex((p) => p.id === activeId));
  const multi = profiles.length > 1;
  // What the rest of the app sees: shared settings plus the active child's own age, filters and name
  const settings = useMemo(() => ({ ...shared, age: active?.age ?? 3, filters: active?.filters || {}, studentName: active?.name || '' }), [shared, active]);

  useEffect(() => { saveSettings(shared); setSoundEnabled(shared.sound); setVoiceEnabled(shared.voice); setMiddleEarth(shared.middleEarth !== false); }, [shared]);
  // If the browser refuses a save (storage full) the parent is told, instead of progress silently going unsaved
  const [saveFailed, setSaveFailed] = useState(false);
  useEffect(() => { if (!saveProfiles(profiles)) setSaveFailed(true); }, [profiles]);
  useEffect(() => { if (activeId) setSaveFailed(!saveProfileSessions(activeId, sessions)); }, [sessions, activeId]);

  const updateProfile = useCallback((id, patch) => setProfiles((list) => list.map((p) => (p.id === id ? { ...p, ...(typeof patch === 'function' ? patch(p) : patch) } : p))), []);
  const activate = (id) => { setTryAge(null); setSessions(loadProfileSessions(id)); setActiveId(id); setSetupMode(null); setView({ name: 'home' }); };
  const selectChild = (id) => { setTryAge(null); setSessions(loadProfileSessions(id)); setActiveId(id); }; // parent switching: stay where you are
  const switchChild = () => { setTryAge(null); setSetupMode(null); setView({ name: 'home' }); setActiveId(null); };

  // A newer version has been published: offer a one-tap fresh reload (checked at launch and whenever the app comes back to the front)
  const [updateReady, setUpdateReady] = useState(false);
  useEffect(() => {
    let alive = true;
    const check = async () => { const v = await latestVersion(); if (alive && v && v !== CURRENT_VERSION) setUpdateReady(true); };
    check();
    const onVis = () => { if (!document.hidden) check(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { alive = false; document.removeEventListener('visibilitychange', onVis); };
  }, []);

  // Back to "Who's learning?" after a quiet spell, so a sibling never works on the wrong profile.
  // Never in the middle of a lesson or while a parent is in the portal.
  const live = useRef({});
  live.current = { multi: profiles.filter((p) => !isGuest(p)).length > 1, activeId, screen: view.name };
  const lastTouch = useRef(Date.now());
  useEffect(() => {
    const bump = () => { lastTouch.current = Date.now(); };
    const evts = ['pointerdown', 'touchstart', 'keydown'];
    evts.forEach((e) => window.addEventListener(e, bump, true));
    const check = () => {
      const l = live.current;
      if (l.multi && l.activeId && (l.screen === 'home' || l.screen === 'summary') && Date.now() - lastTouch.current > IDLE_MS) {
        setTryAge(null); setSetupMode(null); setView({ name: 'home' }); setActiveId(null);
      }
    };
    const onVis = () => { if (!document.hidden) check(); };
    const t = setInterval(check, 20000);
    document.addEventListener('visibilitychange', onVis);
    return () => { evts.forEach((e) => window.removeEventListener(e, bump, true)); clearInterval(t); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  // Safari: audio may only start inside a user-activation event (touchend / click / keydown),
  // so keep listening until the AudioContext is actually running.
  useEffect(() => {
    const evts = ['touchend', 'click', 'keydown'];
    const unlock = () => {
      unlockAudio();
      if (audioReady()) evts.forEach((e) => window.removeEventListener(e, unlock, true));
    };
    evts.forEach((e) => window.addEventListener(e, unlock, true));
    try { navigator.storage?.persist?.(); } catch { /* ignore */ }
    return () => evts.forEach((e) => window.removeEventListener(e, unlock, true));
  }, []);
  useEffect(() => { window.scrollTo(0, 0); stopSpeaking(); }, [view.name]);

  const patchSettings = useCallback((p) => {
    const { age, filters, studentName, ...rest } = p;
    if (Object.keys(rest).length) setShared((s) => ({ ...s, ...rest }));
    const mine = {};
    if (age !== undefined) mine.age = age;
    if (filters !== undefined) mine.filters = filters;
    if (studentName !== undefined) mine.name = studentName;
    if (Object.keys(mine).length && activeId) updateProfile(activeId, mine);
  }, [activeId, updateProfile]);
  const todayCount = useMemo(() => { const d = new Date().toDateString(); return sessions.filter((s) => new Date(s.startedAt).toDateString() === d).length; }, [sessions]);
  const age = tryAge ?? settings.age;
  const curriculum = getCurriculum(age);

  const startSession = (sessionAge, mode, config, opts = {}) => {
    setSetupMode(null);
    if (!opts.targeted) {
      updateProfile(activeId, (p) => ({ filters: { ...p.filters, [sessionAge]: { ...(p.filters[sessionAge] || {}), [mode]: config } } }));
    }
    setView({ name: 'play', age: sessionAge, mode, config, targeted: !!opts.targeted, key: uid() });
  };

  const launchTargeted = (sessionAge, mode, topics) => {
    const cur = getCurriculum(sessionAge);
    const saved = settings.filters[sessionAge]?.[mode] || {};
    const t = topicsForMode(cur, mode, topics);
    const config = mode === 'flash'
      ? { topics: t, difficulty: saved.difficulty || cur.defaultDifficulty, seconds: saved.seconds || cur.defaults.flash.seconds, maxCards: cur.defaults.flash.maxCards }
      : { topics: t, difficulty: saved.difficulty || cur.defaultDifficulty, count: saved.count || cur.defaults[mode].count };
    if (sessionAge !== age) setTryAge(sessionAge);
    startSession(sessionAge, mode, config, { targeted: true });
  };

  const finishSession = ({ questions, bestStreak = 0, durationMs }) => {
    const { age: a, mode, config, targeted } = view;
    const score = questions.filter((q) => q.correct).length;
    const total = questions.length;
    const accuracy = total ? score / total : 0;
    const now = Date.now();
    const session = {
      id: uid(), startedAt: now - durationMs, endedAt: now, durationMs: Math.round(durationMs),
      age: a, mode, config, targeted, questions, score, total, accuracy, bestStreak, stars: total ? starsFor(accuracy) : 0,
    };
    if (total > 0) setSessions((list) => [session, ...list]);
    setView({ name: 'summary', session, config });
  };

  /* ------------------------------ children & backup ------------------------------ */
  const sessionsFor = (id) => (id === activeId ? sessions : loadProfileSessions(id));
  const addChild = () => { const p = newProfile(profiles); setProfiles((l) => withGuest([...l, p])); return p.id; };
  const removeChild = (id) => {
    if (isGuest({ id }) || profiles.filter((p) => !isGuest(p)).length < 2) return;
    deleteProfileSessions(id);
    const rest = profiles.filter((p) => p.id !== id);
    setProfiles(rest);
    if (id === activeId) activate(rest[0].id);
  };
  // Shrink every child's older sessions (keeps scores, stars and mastery; drops question text)
  const compactAll = () => {
    let changed = 0;
    for (const p of profiles) {
      const before = sessionsFor(p.id);
      const after = compactSessions(before);
      const n = after.filter((s, i) => s.compact && !before[i].compact).length;
      if (n) { changed += n; if (p.id === activeId) setSessions(after); else saveProfileSessions(p.id, after); }
    }
    return changed;
  };
  const exportAll = () => exportFamily(profiles.filter((p) => !isGuest(p)).map((p) => ({ profile: p, sessions: sessionsFor(p.id) })), settings);
  const importAll = async (file) => {
    const entries = await readBackup(file);
    let added = 0; let kids = 0; const known = new Set(profiles.map((p) => p.id)); const fresh = [];
    for (const e of entries) {
      const id = e.profile ? (known.has(e.profile.id) ? e.profile.id : (fresh.push(e.profile), known.add(e.profile.id), e.profile.id)) : activeId;
      if (e.profile && fresh.includes(e.profile)) kids++;
      const { merged, added: n } = mergeSessions(sessionsFor(id), e.sessions);
      added += n;
      if (id === activeId) setSessions(merged); else saveProfileSessions(id, merged);
    }
    if (fresh.length) setProfiles((l) => withGuest([...l, ...fresh.map((p) => ({ avatar: '🌟', age: 3, filters: {}, name: '', ...p })).filter((p) => !isGuest(p))]));
    return `Imported ${added} new session${added === 1 ? '' : 's'}${kids ? ` and ${kids} child profile${kids === 1 ? '' : 's'}` : ''}.`;
  };

  /* ------------------------------ routing ------------------------------ */
  if (!active) {
    if (pickerGate) {
      return <ParentGate pin={settings.pin} onPass={() => { setPickerGate(false); activate(profiles[0].id); setView({ name: 'parent' }); }} onCancel={() => setPickerGate(false)} />;
    }
    return <WhoIsLearning profiles={profiles} onPick={activate} onParent={() => setPickerGate(true)} />;
  }
  if (view.name === 'play') {
    const cur = getCurriculum(view.age);
    const props = { curriculum: cur, config: view.config, onFinish: finishSession, onExit: () => setView({ name: 'home' }), settings, onToggleVoice: () => patchSettings({ voice: !settings.voice }) };
    if (view.mode === 'flash') return <FlashCards key={view.key} {...props} />;
    if (view.mode === 'worksheet') return <Worksheet key={view.key} {...props} />;
    return <Runner key={view.key} mode={view.mode} {...props} />;
  }
  if (view.name === 'summary') {
    const s = view.session;
    return (
      <Summary session={s} curriculum={getCurriculum(s.age)}
        onAgain={() => startSession(s.age, s.mode, view.config, { targeted: s.targeted })}
        onHome={() => setView({ name: 'home' })}
        onTarget={(topics) => launchTargeted(s.age, s.mode, topics)} />
    );
  }
  if (view.name === 'gate') {
    return <ParentGate pin={settings.pin} onPass={() => setView({ name: 'parent' })} onCancel={() => setView({ name: 'home' })} />;
  }
  if (view.name === 'parent') {
    return (
      <ParentPortal sessions={sessions} settings={settings} onSettings={patchSettings} onSessions={setSessions}
        profiles={profiles} activeId={activeId} sessionsFor={sessionsFor}
        onSwitchChild={selectChild} onAddChild={addChild} onUpdateChild={(id, patch) => { if (typeof patch === 'object' && 'age' in patch && id === activeId) setTryAge(null); updateProfile(id, patch); }} onRemoveChild={removeChild}
        onExportAll={exportAll} onImportAll={importAll} onCompact={compactAll}
        onExit={() => setView({ name: 'home' })} onLaunch={launchTargeted} />
    );
  }

  return (
    <div className="min-h-[100dvh] pb-8">
      <Header name={settings.studentName} child={multi ? { name: displayName(active, activeIndex), avatar: active.avatar } : null} onSwitch={switchChild} today={todayCount} sound={settings.sound}
        onToggleSound={() => patchSettings({ sound: !settings.sound })} onParent={() => setView({ name: 'gate' })} />
      {saveFailed && (
        <div role="alert" className="mx-4 sm:mx-6 mt-3 max-w-6xl md:mx-auto rounded-2xl bg-bad-soft border-2 border-bad/40 text-bad px-4 py-3 font-bold">
          This device’s saved-data space is full, so new sessions are not being saved. A grown-up can free space in Parent Portal → Settings → Storage.
        </div>
      )}
      <Home age={age} onAge={setTryAge} sessions={sessions}
        onPickMode={(m) => setSetupMode(m)} onQuickStart={(m, topics) => launchTargeted(age, m, topics)} />
      {updateReady && (
        <div className="fixed left-3 right-3 bottom-3 z-40 max-w-md mx-auto rounded-2xl bg-ink text-white shadow-2xl px-4 py-3 flex items-center gap-3 safe-bottom">
          <span className="flex-1 font-bold text-sm">A new version is ready.</span>
          <button type="button" onClick={reloadFresh} className="press min-h-11 px-4 rounded-xl bg-white text-ink font-extrabold">Update now</button>
        </div>
      )}
      {setupMode && curriculum && (
        <SetupSheet key={`${age}-${setupMode}`} curriculum={curriculum} mode={setupMode} saved={settings.filters[age]?.[setupMode]}
          child={multi ? { name: displayName(active, activeIndex), avatar: active.avatar } : null} onNotMe={switchChild}
          onClose={() => setSetupMode(null)} onStart={(config) => startSession(age, setupMode, config)} />
      )}
    </div>
  );
}
