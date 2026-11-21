const pct = (x) => Math.round(x * 100);
const secs = (ms) => (ms / 1000).toFixed(ms < 10000 ? 1 : 0);

export function topicStats(questions) {
  const map = new Map();
  for (const q of questions) {
    if (!map.has(q.topic)) map.set(q.topic, { topic: q.topic, attempts: 0, correct: 0, totalMs: 0 });
    const s = map.get(q.topic);
    s.attempts++;
    if (q.correct) s.correct++;
    s.totalMs += q.ms || 0;
  }
  return [...map.values()].map((s) => ({
    ...s,
    accuracy: s.attempts ? s.correct / s.attempts : 0,
    avgMs: s.attempts ? s.totalMs / s.attempts : 0,
  }));
}

const labelOf = (curriculum, id) => curriculum?.topics.find((t) => t.id === id)?.label ?? id;

/** Diagnostic notes for one finished session. */
export function analyzeSession(session, curriculum) {
  const expected = curriculum?.expectedMs?.[session.mode] ?? 15000;
  const stats = topicStats(session.questions);
  const wentWell = [];
  const needsWork = [];

  for (const s of stats) {
    const label = labelOf(curriculum, s.topic);
    const fast = s.avgMs <= expected;
    const slow = s.avgMs > expected * 1.6;
    if (s.accuracy >= 0.8 && !slow) {
      wentWell.push({
        topic: s.topic, label,
        text: `${pct(s.accuracy)}% correct${fast ? `, quick at ${secs(s.avgMs)}s each` : ''}.`,
      });
    } else if (s.accuracy < 0.7) {
      const missed = session.questions.filter((q) => q.topic === s.topic && !q.correct).slice(0, 2);
      needsWork.push({
        topic: s.topic, label,
        text: `${s.correct} of ${s.attempts} correct.${missed.length ? ` Missed: ${missed.map((m) => m.prompt).join('; ')}` : ''}`,
      });
    } else if (slow) {
      needsWork.push({
        topic: s.topic, label,
        text: `Accurate (${pct(s.accuracy)}%) but slow — ${secs(s.avgMs)}s each. More fluency practice will help.`,
      });
    }
  }

  const notes = [];
  const acc = session.total ? session.score / session.total : 0;
  const hinted = session.questions.filter((q) => q.hints > 0).length;
  if (acc === 1 && session.total >= 5) notes.push('Perfect score! Ready for a harder setting.');
  else if (acc >= 0.85) notes.push('Strong session overall.');
  else if (acc < 0.5) notes.push('This set was tough. Try an easier setting or fewer topics at once.');
  if (hinted) notes.push(`Used hints on ${hinted} problem${hinted > 1 ? 's' : ''}; hints are good practice, keep encouraging them.`);
  if (session.bestStreak >= 5) notes.push(`Best streak: ${session.bestStreak} in a row.`);

  wentWell.sort((a, b) => a.label.localeCompare(b.label));
  return { stats, wentWell, needsWork, notes };
}

export function starsFor(accuracy) {
  if (accuracy >= 0.9) return 3;
  if (accuracy >= 0.7) return 2;
  if (accuracy > 0) return 1;
  return 0;
}

/**
 * Mastery for one age: per topic, using the most recent 30 attempts,
 * so improvement shows up quickly.
 */
export function masteryForAge(sessions, curriculum) {
  const byTopic = new Map(curriculum.topics.map((t) => [t.id, []]));
  const sorted = [...sessions].sort((a, b) => b.startedAt - a.startedAt);
  for (const s of sorted) {
    for (const q of s.questions) {
      const list = byTopic.get(q.topic);
      if (list && list.length < 30) list.push(q);
    }
  }
  return curriculum.topics.map((t) => {
    const qs = byTopic.get(t.id);
    const attempts = qs.length;
    const correct = qs.filter((q) => q.correct).length;
    const accuracy = attempts ? correct / attempts : null;
    const avgMs = attempts ? qs.reduce((a, q) => a + (q.ms || 0), 0) / attempts : null;
    let status = 'new';
    if (attempts >= 3) {
      if (accuracy >= 0.85) status = 'mastered';
      else if (accuracy >= 0.65) status = 'developing';
      else status = 'practice';
    } else if (attempts > 0) status = 'started';
    return { topic: t.id, label: t.label, group: t.group, attempts, correct, accuracy, avgMs, status };
  });
}

export const STATUS = {
  mastered: { label: 'Mastered', tone: 'good' },
  developing: { label: 'Developing', tone: 'warn' },
  practice: { label: 'Needs practice', tone: 'bad' },
  started: { label: 'Just started', tone: 'muted' },
  new: { label: 'Not started', tone: 'muted' },
};

export function weakTopics(mastery, max = 3) {
  return mastery
    .filter((m) => m.status === 'practice' || m.status === 'developing')
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, max)
    .map((m) => m.topic);
}

export function practiceStreakDays(sessions) {
  const days = new Set(sessions.map((s) => new Date(s.startedAt).toDateString()));
  let streak = 0;
  const d = new Date();
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1); // today not done yet: count from yesterday
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export const formatDuration = (ms) => {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
};

/**
 * Results by difficulty level for one age: overall per level, and per topic per level.
 * Uses each session's chosen level (session.config.difficulty) and each question's first-try result.
 */
export function levelStats(sessions, curriculum) {
  const levels = curriculum.difficulties.map((d) => ({ id: d.id, label: d.label, sessions: 0, attempts: 0, correct: 0, ms: 0 }));
  const byId = Object.fromEntries(levels.map((l) => [l.id, l]));
  const topics = curriculum.topics.map((t) => ({ topic: t.id, label: t.label, group: t.group, per: Object.fromEntries(levels.map((l) => [l.id, { attempts: 0, correct: 0, ms: 0 }])) }));
  const tById = Object.fromEntries(topics.map((t) => [t.topic, t]));
  for (const s of sessions) {
    const lv = byId[s.config?.difficulty];
    if (!lv) continue;
    lv.sessions += 1;
    for (const q of s.questions || []) {
      lv.attempts += 1; lv.correct += q.correct ? 1 : 0; lv.ms += q.ms || 0;
      const t = tById[q.topic];
      if (t) { const c = t.per[lv.id]; c.attempts += 1; c.correct += q.correct ? 1 : 0; c.ms += q.ms || 0; }
    }
  }
  return { levels, topics };
}
