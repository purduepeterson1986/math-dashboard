import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, LayoutDashboard, History, Award, Settings, Download, Upload, Trash2, CheckCircle2, TrendingUp,
  AlertCircle, Circle, Crosshair, ChevronDown, Check, X, KeyRound, Volume2, Mic, User, Lightbulb, Mountain,
} from 'lucide-react';
import ModeIcon from '../components/ModeIcon.jsx';
import Modal from '../components/Modal.jsx';
import { MathText } from '../components/Visual.jsx';
import { CURRICULA, MODES, AGE_META, getCurriculum, modeById } from '../curriculum/index.js';
import { masteryForAge, weakTopics, STATUS, formatDuration, practiceStreakDays, topicStats } from '../lib/diagnostics.js';
import { exportData, importData } from '../lib/storage.js';
import { topicsForMode } from '../lib/session.js';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'mastery', label: 'Topic Mastery', icon: Award },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];
const STATUS_ICON = { mastered: CheckCircle2, developing: TrendingUp, practice: AlertCircle, started: Circle, new: Circle };
const TONE = {
  good: { text: 'text-good', bg: 'bg-good-soft', bar: 'bg-good' },
  warn: { text: 'text-warn', bg: 'bg-warn-soft', bar: 'bg-warn' },
  bad: { text: 'text-bad', bg: 'bg-bad-soft', bar: 'bg-bad' },
  muted: { text: 'text-ink-muted', bg: 'bg-slate-100', bar: 'bg-ink-muted' },
};
const pct = (x) => `${Math.round(x * 100)}%`;
const fmtDate = (t) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const fmtDateTime = (t) => new Date(t).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

function Chip({ on, onClick, children }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={`press min-h-11 px-4 rounded-full border-2 text-sm font-extrabold ${on ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line bg-white text-ink-soft'}`}>
      {children}
    </button>
  );
}
function Card({ title, icon, children, right, className = '' }) {
  return (
    <section className={`rounded-3xl bg-white border border-line card-shadow p-5 ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="flex items-center gap-2 text-lg font-black text-ink">{icon}{title}</h3>{right}
        </div>
      )}
      {children}
    </section>
  );
}
function StatusBadge({ status }) {
  const s = STATUS[status];
  const I = STATUS_ICON[status];
  const t = TONE[s.tone];
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${t.bg} ${t.text}`}><I size={14} />{s.label}</span>;
}

/* ------------------------------ Trend chart ------------------------------ */
function AccuracyTrend({ sessions }) {
  const [sel, setSel] = useState(null);
  const data = [...sessions].sort((a, b) => a.startedAt - b.startedAt).slice(-20);
  if (!data.length) return <p className="text-ink-muted font-semibold">No sessions yet.</p>;
  const H = 160;
  const active = sel !== null ? data[sel] : null;
  return (
    <div>
      <div className="relative h-[190px] pl-9 mt-12">
        {[1, 0.5, 0].map((g) => (
          <div key={g} className="absolute left-9 right-0 border-t border-line" style={{ top: (1 - g) * H }}>
            <span className="absolute -left-9 -top-2 w-8 text-right text-[11px] font-bold text-ink-muted tabular">{g * 100}%</span>
          </div>
        ))}
        <div className="absolute left-9 right-0 top-0 flex items-end gap-[2px]" style={{ height: H }} onPointerLeave={() => setSel(null)}>
          {data.map((s, i) => (
            <button key={s.id} type="button" aria-label={`${fmtDate(s.startedAt)} ${modeById(s.mode)?.label}: ${pct(s.accuracy)}`}
              onPointerEnter={() => setSel(i)} onClick={() => setSel(i)}
              className="relative flex-1 h-full flex items-end justify-center group">
              <span className={`w-full max-w-[28px] rounded-t-[4px] transition-colors ${sel === i ? 'bg-brand-700' : 'bg-brand-500'}`} style={{ height: `${Math.max(2, s.accuracy * 100)}%` }} />
            </button>
          ))}
          {active && (
            <div className="absolute z-10 bottom-full mb-1 pointer-events-none whitespace-nowrap rounded-xl bg-ink text-white text-xs font-bold px-3 py-2 shadow-lg"
              style={{ left: `${((sel + 0.5) / data.length) * 100}%`, transform: `translateX(${sel < data.length / 3 ? '-15%' : sel > (data.length * 2) / 3 ? '-85%' : '-50%'})` }}>
              {fmtDateTime(active.startedAt)} · Age {active.age}<br />{modeById(active.mode)?.label}: {active.score}/{active.total} ({pct(active.accuracy)})
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between pl-9 text-[11px] font-bold text-ink-muted mt-1">
        <span>{fmtDate(data[0].startedAt)}</span><span>{data.length > 1 ? fmtDate(data[data.length - 1].startedAt) : ''}</span>
      </div>
    </div>
  );
}

/* ------------------------------ Overview ------------------------------ */
function Overview({ sessions, ageFilter, onLaunch }) {
  const list = ageFilter === 'all' ? sessions : sessions.filter((s) => s.age === ageFilter);
  const qs = list.reduce((a, s) => a + s.total, 0);
  const correct = list.reduce((a, s) => a + s.score, 0);
  const time = list.reduce((a, s) => a + s.durationMs, 0);
  const ages = Object.keys(CURRICULA).map(Number).filter((a) => ageFilter === 'all' || a === ageFilter);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          ['Sessions', list.length],
          ['Questions', qs],
          ['Accuracy', qs ? pct(correct / qs) : '—'],
          ['Time practiced', formatDuration(time)],
          ['Day streak', practiceStreakDays(sessions)],
        ].map(([l, v]) => (
          <div key={l} className="rounded-3xl bg-white border border-line p-4 card-shadow">
            <div className="text-xs font-extrabold uppercase tracking-widest text-ink-muted">{l}</div>
            <div className="text-3xl font-black tabular mt-1">{v}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <Card title="Accuracy by session" className="lg:col-span-3" right={<span className="text-xs font-bold text-ink-muted">last 20 · tap a bar</span>}>
          <AccuracyTrend sessions={list} />
        </Card>
        <Card title="By learning mode" className="lg:col-span-2">
          <ul className="space-y-3">
            {MODES.map((m) => {
              const ms = list.filter((s) => s.mode === m.id);
              const t = ms.reduce((a, s) => a + s.total, 0);
              const c = ms.reduce((a, s) => a + s.score, 0);
              return (
                <li key={m.id} className="flex items-center gap-3">
                  <ModeIcon mode={m.id} size={18} box="w-9 h-9" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm font-extrabold"><span>{m.label}</span><span className="tabular text-ink-soft">{t ? pct(c / t) : '—'}</span></div>
                    <div className="mt-1 h-2 rounded-full bg-line overflow-hidden"><div className="h-full rounded-full bg-brand-500" style={{ width: t ? `${(c / t) * 100}%` : 0 }} /></div>
                    <div className="text-[11px] font-bold text-ink-muted mt-0.5">{ms.length} session{ms.length === 1 ? '' : 's'}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {ages.map((age) => {
        const cur = getCurriculum(age);
        const mine = sessions.filter((s) => s.age === age);
        const mastery = masteryForAge(mine, cur);
        const weak = weakTopics(mastery, 4);
        const strong = mastery.filter((m) => m.status === 'mastered');
        const recentQs = mine.slice(0, 5).flatMap((s) => s.questions);
        const slow = topicStats(recentQs).filter((t) => t.attempts >= 3 && t.avgMs > (cur.expectedMs.worksheet || 20000) * 1.3).map((t) => t.topic);
        return (
          <Card key={age} title={`Age ${age} diagnostics · ${cur.title}`} icon={<Lightbulb size={20} className="text-warn" />}>
            {!mine.length ? <p className="text-ink-muted font-semibold">No sessions at this age yet.</p> : (
              <div className="space-y-3">
                <ul className="space-y-2 text-ink font-semibold">
                  {strong.length > 0 && <li className="flex gap-2"><CheckCircle2 size={20} className="text-good shrink-0" />Strong in {strong.map((m) => m.label).join(', ')}. Consider moving up a level in these.</li>}
                  {weak.length > 0 && <li className="flex gap-2"><AlertCircle size={20} className="text-bad shrink-0" />Needs practice: {weak.map((id) => mastery.find((m) => m.topic === id).label).join(', ')}.</li>}
                  {slow.length > 0 && <li className="flex gap-2"><TrendingUp size={20} className="text-warn shrink-0" />Accurate but slow lately in {slow.map((id) => cur.topics.find((t) => t.id === id)?.label).join(', ')}. Short Flash Card drills build fluency.</li>}
                  {mastery.filter((m) => m.status === 'new').length > 0 && <li className="flex gap-2"><Circle size={20} className="text-ink-muted shrink-0" />Not tried yet: {mastery.filter((m) => m.status === 'new').map((m) => m.label).join(', ')}.</li>}
                  {!weak.length && !slow.length && <li className="flex gap-2"><CheckCircle2 size={20} className="text-good shrink-0" />No weak spots detected. Try the next difficulty level.</li>}
                </ul>
                {weak.length > 0 && <TargetButtons age={age} topics={weak} onLaunch={onLaunch} />}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function TargetButtons({ age, topics, onLaunch }) {
  const cur = getCurriculum(age);
  const modes = ['worksheet', 'flash', 'story', 'stem'].filter((m) => topicsForMode(cur, m, topics).length > 0);
  return (
    <div className="flex flex-wrap gap-2">
      {modes.map((m) => (
        <button key={m} type="button" onClick={() => onLaunch(age, m, topics)}
          className={`press min-h-12 px-4 rounded-2xl font-extrabold flex items-center gap-2 ${m === 'worksheet' ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700'}`}>
          <Crosshair size={18} /> Targeted {modeById(m).label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ Mastery ------------------------------ */
function Mastery({ sessions, age, onLaunch }) {
  const cur = getCurriculum(age);
  const mastery = masteryForAge(sessions.filter((s) => s.age === age), cur);
  const groups = [...new Set(mastery.map((m) => m.group))];
  const counts = Object.keys(STATUS).map((k) => [k, mastery.filter((m) => m.status === k).length]).filter(([, n]) => n);
  const weak = weakTopics(mastery, 4);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">{counts.map(([k, n]) => <span key={k} className="flex items-center gap-1.5"><StatusBadge status={k} /><span className="font-black tabular">{n}</span></span>)}</div>
      {weak.length > 0 && (
        <Card title="Launch targeted practice" icon={<Crosshair size={20} className="text-brand-600" />}>
          <p className="text-ink-soft font-semibold mb-3">Focus on: {weak.map((id) => mastery.find((m) => m.topic === id).label).join(', ')}</p>
          <TargetButtons age={age} topics={weak} onLaunch={onLaunch} />
        </Card>
      )}
      {groups.map((g) => (
        <Card key={g} title={g}>
          <ul className="divide-y divide-line">
            {mastery.filter((m) => m.group === g).map((m) => {
              const tone = TONE[STATUS[m.status].tone];
              return (
                <li key={m.topic} className="py-3 grid grid-cols-[1fr_auto] sm:grid-cols-[minmax(160px,1.2fr)_2fr_auto] items-center gap-x-4 gap-y-1">
                  <div className="font-extrabold text-ink">{m.label}</div>
                  <div className="sm:order-3 justify-self-end"><StatusBadge status={m.status} /></div>
                  <div className="col-span-2 sm:col-span-1 sm:order-2 flex items-center gap-3">
                    <div className="flex-1 h-3 rounded-full bg-line overflow-hidden">
                      <div className={`h-full rounded-full ${tone.bar}`} style={{ width: m.accuracy !== null ? `${m.accuracy * 100}%` : 0 }} />
                    </div>
                    <span className="w-28 text-right text-xs font-bold text-ink-soft tabular">
                      {m.attempts ? `${pct(m.accuracy)} · ${m.correct}/${m.attempts} · ${(m.avgMs / 1000).toFixed(1)}s` : 'no data'}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      ))}
      <p className="text-xs font-semibold text-ink-muted">Mastery uses each topic’s most recent 30 answers (first-try accuracy). Mastered ≥ 85%, Developing 65–84%, Needs practice &lt; 65%, with at least 3 attempts.</p>
    </div>
  );
}

/* ------------------------------ History ------------------------------ */
function HistoryTab({ sessions, ageFilter, onDelete }) {
  const [modeF, setModeF] = useState('all');
  const [open, setOpen] = useState(null);
  const [del, setDel] = useState(null);
  const list = sessions.filter((s) => (ageFilter === 'all' || s.age === ageFilter) && (modeF === 'all' || s.mode === modeF));
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Chip on={modeF === 'all'} onClick={() => setModeF('all')}>All modes</Chip>
        {MODES.map((m) => <Chip key={m.id} on={modeF === m.id} onClick={() => setModeF(m.id)}>{m.label}</Chip>)}
      </div>
      {!list.length && <Card><p className="text-ink-muted font-semibold">No sessions match these filters.</p></Card>}
      <div className="rounded-3xl bg-white border border-line card-shadow overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.3fr_0.6fr_1.4fr_0.8fr_0.8fr_0.8fr_48px] gap-3 px-5 py-3 text-xs font-extrabold uppercase tracking-widest text-ink-muted border-b border-line">
          <span>Date</span><span>Age</span><span>Mode</span><span>Score</span><span>Accuracy</span><span>Duration</span><span />
        </div>
        <ul className="divide-y divide-line">
          {list.map((s) => {
            const cur = getCurriculum(s.age);
            const isOpen = open === s.id;
            return (
              <li key={s.id}>
                <button type="button" onClick={() => setOpen(isOpen ? null : s.id)} aria-expanded={isOpen}
                  className="w-full text-left px-5 py-3 grid grid-cols-2 md:grid-cols-[1.3fr_0.6fr_1.4fr_0.8fr_0.8fr_0.8fr_48px] gap-x-3 gap-y-1 items-center min-h-16">
                  <span className="font-bold text-ink">{fmtDateTime(s.startedAt)}</span>
                  <span className="font-bold text-ink-soft md:text-ink">Age {s.age}</span>
                  <span className="flex items-center gap-2 font-bold"><ModeIcon mode={s.mode} size={16} box="w-8 h-8" />{modeById(s.mode)?.label}{s.targeted && <Crosshair size={14} className="text-brand-600" />}</span>
                  <span className="font-black tabular">{s.score}/{s.total}</span>
                  <span className={`font-black tabular ${s.accuracy >= 0.85 ? 'text-good' : s.accuracy >= 0.65 ? 'text-warn' : 'text-bad'}`}>{pct(s.accuracy)}</span>
                  <span className="font-bold text-ink-soft tabular">{formatDuration(s.durationMs)}</span>
                  <ChevronDown size={20} className={`hidden md:block text-ink-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 animate-rise">
                    <div className="text-xs font-bold text-ink-muted mb-2">
                      Level: {cur?.difficulties.find((d) => d.id === s.config?.difficulty)?.label || '—'} · Topics: {(s.config?.topics || []).map((id) => cur?.topics.find((t) => t.id === id)?.label || id).join(', ')}
                    </div>
                    <ul className="rounded-2xl border border-line divide-y divide-line">
                      {s.questions.map((q, i) => (
                        <li key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
                          <span className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center ${q.correct ? 'bg-good text-white' : 'bg-bad text-white'}`}>{q.correct ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}</span>
                          <span className="flex-1 min-w-0 truncate font-semibold"><MathText text={q.prompt} /></span>
                          <span className="hidden sm:block text-ink-muted font-bold">{cur?.topics.find((t) => t.id === q.topic)?.label}</span>
                          <span className="tabular font-bold text-ink-soft w-14 text-right">{(q.ms / 1000).toFixed(1)}s</span>
                        </li>
                      ))}
                    </ul>
                    <button type="button" onClick={() => setDel(s)} className="press mt-3 min-h-11 px-4 rounded-xl bg-bad-soft text-bad font-extrabold flex items-center gap-2"><Trash2 size={16} /> Delete session</button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <Modal open={!!del} onClose={() => setDel(null)} title="Delete this session?"
        actions={[{ label: 'Cancel', onClick: () => setDel(null) }, { label: 'Delete', tone: 'bad', onClick: () => { onDelete(del.id); setDel(null); } }]}>
        This permanently removes the {modeById(del?.mode)?.label} session from {del && fmtDateTime(del.startedAt)}. Consider exporting a backup first.
      </Modal>
    </div>
  );
}

/* ------------------------------ Settings ------------------------------ */
function SettingsTab({ settings, sessions, onSettings, onSessions }) {
  const [pin1, setPin1] = useState('');
  const [msg, setMsg] = useState('');
  const [clear, setClear] = useState(false);
  const file = useRef(null);
  const Toggle = ({ on, onClick, icon, label, desc }) => (
    <button type="button" role="switch" aria-checked={on} onClick={onClick} className="w-full min-h-16 flex items-center gap-3 text-left">
      <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">{icon}</span>
      <span className="flex-1"><span className="block font-extrabold">{label}</span><span className="block text-xs font-semibold text-ink-muted">{desc}</span></span>
      <span className={`w-14 h-8 rounded-full p-1 transition-colors ${on ? 'bg-brand-600' : 'bg-line'}`}><span className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-6' : ''}`} /></span>
    </button>
  );
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card title="Student" icon={<User size={20} className="text-brand-600" />}>
        <label className="block text-sm font-extrabold text-ink-soft mb-1" htmlFor="sname">Name shown on the home screen</label>
        <input id="sname" value={settings.studentName} maxLength={24} onChange={(e) => onSettings({ studentName: e.target.value })}
          className="w-full h-14 rounded-2xl border-2 border-line px-4 text-lg font-bold focus:border-brand-500 outline-none" placeholder="e.g. Maya" />
        <div className="mt-4 divide-y divide-line">
          <Toggle on={settings.sound} onClick={() => onSettings({ sound: !settings.sound })} icon={<Volume2 size={20} />} label="Sound effects" desc="Taps, correct/incorrect chimes, celebrations" />
          <Toggle on={settings.voice} onClick={() => onSettings({ voice: !settings.voice })} icon={<Mic size={20} />} label="Read aloud (Ages 3 & 5)" desc="Speaks each question for pre-readers" />
          <Toggle on={settings.middleEarth !== false} onClick={() => onSettings({ middleEarth: settings.middleEarth === false })} icon={<Mountain size={20} />} label="Middle-earth questions" desc="Mixes Lord of the Rings characters and stories into the questions" />
        </div>
      </Card>
      <Card title="Parent PIN" icon={<KeyRound size={20} className="text-brand-600" />}>
        <p className="text-ink-soft font-semibold mb-3">{settings.pin ? 'A PIN is set. Change it or remove it below.' : 'No PIN set: the portal uses a grown-up math question. Set a 4-digit PIN for faster entry.'}</p>
        <div className="flex gap-2">
          <input value={pin1} onChange={(e) => setPin1(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" enterKeyHint="done" type="password" autoComplete="off"
            onKeyDown={(e) => { if (e.key === 'Enter' && pin1.length === 4) { e.preventDefault(); onSettings({ pin: pin1 }); setPin1(''); setMsg('PIN saved.'); } }}
            aria-label="New 4-digit PIN" placeholder="New PIN" className="flex-1 h-14 rounded-2xl border-2 border-line px-4 text-2xl font-black tracking-[0.5em] outline-none focus:border-brand-500" />
          <button type="button" disabled={pin1.length !== 4} onClick={() => { onSettings({ pin: pin1 }); setPin1(''); setMsg('PIN saved.'); }}
            className="press h-14 px-5 rounded-2xl bg-brand-600 text-white font-extrabold disabled:opacity-40">Save PIN</button>
        </div>
        <p className="mt-2 text-sm font-semibold text-ink-muted">{pin1.length === 4 ? 'Tap Save PIN to finish.' : `Type 4 digits, then tap Save PIN (${pin1.length} of 4).`}</p>
        {settings.pin && <button type="button" onClick={() => { onSettings({ pin: null }); setMsg('PIN removed.'); }} className="press mt-3 min-h-11 px-4 rounded-xl bg-slate-100 font-extrabold">Remove PIN</button>}
        {msg && <p className="mt-2 text-good font-bold">{msg}</p>}
      </Card>
      <Card title="Backup & data" icon={<Download size={20} className="text-brand-600" />} className="lg:col-span-2">
        <p className="text-ink-soft font-semibold mb-3">Progress is saved in this browser on this device ({sessions.length} sessions). Export a JSON backup regularly, especially before clearing Safari data.</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => exportData(sessions, settings)} className="press min-h-12 px-5 rounded-2xl bg-brand-600 text-white font-extrabold flex items-center gap-2"><Download size={18} /> Export JSON backup</button>
          <button type="button" onClick={() => file.current?.click()} className="press min-h-12 px-5 rounded-2xl bg-brand-50 text-brand-700 font-extrabold flex items-center gap-2"><Upload size={18} /> Import backup</button>
          <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={async (e) => {
            const f = e.target.files?.[0]; e.target.value = '';
            if (!f) return;
            try { const { merged, added } = await importData(f, sessions); onSessions(merged); setMsg(`Imported ${added} new session${added === 1 ? '' : 's'}.`); }
            catch (err) { setMsg(`Import failed: ${err.message}`); }
          }} />
          <button type="button" onClick={() => setClear(true)} className="press min-h-12 px-5 rounded-2xl bg-bad-soft text-bad font-extrabold flex items-center gap-2 ml-auto"><Trash2 size={18} /> Clear all progress</button>
        </div>
      </Card>
      <Modal open={clear} onClose={() => setClear(false)} title="Clear all progress?"
        actions={[{ label: 'Cancel', onClick: () => setClear(false) }, { label: 'Delete everything', tone: 'bad', onClick: () => { onSessions([]); setClear(false); setMsg('All sessions deleted.'); } }]}>
        This permanently deletes all {sessions.length} saved sessions on this device. It can’t be undone unless you have an exported backup.
      </Modal>
    </div>
  );
}

/* ------------------------------ Portal ------------------------------ */
export default function ParentPortal({ sessions, settings, onSettings, onSessions, onExit, onLaunch }) {
  const [tab, setTab] = useState('overview');
  const ages = useMemo(() => [...new Set([...Object.keys(CURRICULA).map(Number), ...sessions.map((s) => s.age)])].sort((a, b) => a - b), [sessions]);
  const [ageFilter, setAgeFilter] = useState('all');
  const [masteryAge, setMasteryAge] = useState(settings.age in CURRICULA ? settings.age : Number(Object.keys(CURRICULA)[0]));
  const launch = (age, mode, topics) => onLaunch(age, mode, topics);

  return (
    <div className="min-h-[100dvh] bg-canvas safe-top safe-bottom">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button type="button" onClick={onExit} className="press h-12 px-4 rounded-2xl bg-white border border-line font-extrabold flex items-center gap-1 card-shadow"><ArrowLeft size={20} /> Student view</button>
          <div>
            <h1 className="text-2xl font-black leading-tight">Parent Portal</h1>
            <p className="text-xs font-bold text-ink-muted">{settings.studentName || 'Your student'} · {sessions.length} sessions saved on this device</p>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-2 mb-3" aria-label="Portal sections">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}
              className={`press shrink-0 min-h-12 px-4 rounded-2xl font-extrabold flex items-center gap-2 ${tab === t.id ? 'bg-ink text-white' : 'bg-white border border-line text-ink-soft'}`}>
              <t.icon size={18} />{t.label}
            </button>
          ))}
        </nav>

        {(tab === 'overview' || tab === 'history') && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Chip on={ageFilter === 'all'} onClick={() => setAgeFilter('all')}>All ages</Chip>
            {ages.map((a) => <Chip key={a} on={ageFilter === a} onClick={() => setAgeFilter(a)}>Age {a} · {AGE_META[a].stage}</Chip>)}
          </div>
        )}
        {tab === 'mastery' && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(CURRICULA).map(Number).map((a) => <Chip key={a} on={masteryAge === a} onClick={() => setMasteryAge(a)}>Age {a} · {getCurriculum(a).title}</Chip>)}
          </div>
        )}

        {tab === 'overview' && <Overview sessions={sessions} ageFilter={ageFilter} onLaunch={launch} />}
        {tab === 'mastery' && <Mastery sessions={sessions} age={masteryAge} onLaunch={launch} />}
        {tab === 'history' && <HistoryTab sessions={sessions} ageFilter={ageFilter} onDelete={(id) => onSessions(sessions.filter((s) => s.id !== id))} />}
        {tab === 'settings' && <SettingsTab settings={settings} sessions={sessions} onSettings={onSettings} onSessions={onSessions} />}
      </div>
    </div>
  );
}
