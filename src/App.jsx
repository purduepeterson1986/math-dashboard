import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import Home from './screens/Home.jsx';
import SetupSheet from './screens/SetupSheet.jsx';
import Summary from './screens/Summary.jsx';
import ParentGate from './screens/ParentGate.jsx';
import ParentPortal from './screens/ParentPortal.jsx';
import FlashCards from './modes/FlashCards.jsx';
import Worksheet from './modes/Worksheet.jsx';
import Runner from './modes/Runner.jsx';
import { getCurriculum } from './curriculum/index.js';
import { loadSettings, saveSettings, loadSessions, saveSessions } from './lib/storage.js';
import { setSoundEnabled, setVoiceEnabled, unlockAudio, audioReady, stopSpeaking } from './lib/audio.js';
import { starsFor, practiceStreakDays } from './lib/diagnostics.js';
import { topicsForMode } from './lib/session.js';
import { uid } from './lib/rng.js';

export default function App() {
  const [settings, setSettings] = useState(loadSettings);
  const [sessions, setSessions] = useState(loadSessions);
  const [view, setView] = useState({ name: 'home' });
  const [setupMode, setSetupMode] = useState(null);

  useEffect(() => { saveSettings(settings); setSoundEnabled(settings.sound); setVoiceEnabled(settings.voice); }, [settings]);
  useEffect(() => { saveSessions(sessions); }, [sessions]);

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

  const patchSettings = useCallback((p) => setSettings((s) => ({ ...s, ...p })), []);
  const age = settings.age;
  const curriculum = getCurriculum(age);
  const totalStars = useMemo(() => sessions.reduce((a, s) => a + (s.stars || 0), 0), [sessions]);
  const dayStreak = useMemo(() => practiceStreakDays(sessions), [sessions]);

  const startSession = (sessionAge, mode, config, opts = {}) => {
    setSetupMode(null);
    if (!opts.targeted) {
      setSettings((s) => ({ ...s, filters: { ...s.filters, [sessionAge]: { ...(s.filters[sessionAge] || {}), [mode]: config } } }));
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
    if (sessionAge !== settings.age) patchSettings({ age: sessionAge });
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

  /* ------------------------------ routing ------------------------------ */
  if (view.name === 'play') {
    const cur = getCurriculum(view.age);
    const props = { curriculum: cur, config: view.config, onFinish: finishSession, onExit: () => setView({ name: 'home' }), settings };
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
        onExit={() => setView({ name: 'home' })} onLaunch={launchTargeted} />
    );
  }

  return (
    <div className="min-h-[100dvh] pb-8">
      <Header name={settings.studentName} stars={totalStars} dayStreak={dayStreak} sound={settings.sound}
        onToggleSound={() => patchSettings({ sound: !settings.sound })} onParent={() => setView({ name: 'gate' })} />
      <Home age={age} onAge={(a) => patchSettings({ age: a })} sessions={sessions}
        onPickMode={(m) => setSetupMode(m)} onQuickStart={(m, topics) => launchTargeted(age, m, topics)} />
      {setupMode && curriculum && (
        <SetupSheet key={`${age}-${setupMode}`} curriculum={curriculum} mode={setupMode} saved={settings.filters[age]?.[setupMode]}
          onClose={() => setSetupMode(null)} onStart={(config) => startSession(age, setupMode, config)} />
      )}
    </div>
  );
}
