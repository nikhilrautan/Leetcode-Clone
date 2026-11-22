import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import { Flame, Trophy, ArrowRight, Target } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const XP = { easy: 10, medium: 20, hard: 40 };
const COLORS = { easy: '#10b981', medium: '#f59e0b', hard: '#f43f5e' };

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

function Donut({ counts, total }) {
  const r = 54;
  const C = 2 * Math.PI * r;
  let offset = 0;
  const solved = counts.easy + counts.medium + counts.hard;
  return (
    <svg viewBox="0 0 140 140" className="h-44 w-44 -rotate-90" role="img" aria-label={`${solved} of ${total} solved`}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="14" />
      {total > 0 &&
        ['easy', 'medium', 'hard'].map((k) => {
          const len = (counts[k] / total) * C;
          const el = (
            <circle
              key={k}
              cx="70" cy="70" r={r} fill="none"
              stroke={COLORS[k]} strokeWidth="14" strokeLinecap="butt"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
    </svg>
  );
}

function Dashboard() {
  const user = useSelector((s) => s.auth.user);
  const [all, setAll] = useState([]);
  const [solved, setSolved] = useState([]);
  const [activity, setActivity] = useState(Array(7).fill(0));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [a, s] = await Promise.all([
          axiosClient.get('/problem/getAllProblem'),
          axiosClient.get('/problem/problemSolvedByUser'),
        ]);
        setAll(a.data || []);
        setSolved(s.data || []);
      } catch (e) {
        console.error('Dashboard load failed', e);
      } finally {
        setLoading(false);
      }
      try {
        const { data } = await axiosClient.get('/submission/activity');
        if (Array.isArray(data) && data.length === 7) setActivity(data);
      } catch { /* endpoint optional */ }
    })();
  }, []);

  const stats = useMemo(() => {
    const total = { easy: 0, medium: 0, hard: 0 };
    const done = { easy: 0, medium: 0, hard: 0 };
    all.forEach((p) => {
      const d = p.difficulty?.toLowerCase();
      if (total[d] !== undefined) total[d]++;
    });
    solved.forEach((p) => {
      const d = p.difficulty?.toLowerCase();
      if (done[d] !== undefined) done[d]++;
    });
    const xp = done.easy * XP.easy + done.medium * XP.medium + done.hard * XP.hard;
    const solvedIds = new Set(solved.map((p) => p._id));
    return {
      total, done, xp,
      allCount: all.length,
      solvedCount: solved.length,
      level: Math.floor(xp / 100) + 1,
      levelPct: xp % 100,
      next: all.find((p) => !solvedIds.has(p._id)),
    };
  }, [all, solved]);

  const streak = useMemo(() => {
    let n = 0;
    for (let i = 6; i >= 0 && activity[i] > 0; i--) n++;
    return n;
  }, [activity]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en', { weekday: 'short' });
    }),
    []
  );
  const maxAct = Math.max(1, ...activity);
  const name = user?.firstName || 'Coder';

  return (
    <div className="page-container max-w-6xl space-y-6 py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hero */}
        <section className="surface-card relative overflow-hidden p-6 sm:p-8 lg:col-span-2">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <p className="text-sm text-base-content/60">{greeting()},</p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">{name}</h1>

          <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
            <div className="relative shrink-0">
              <Donut counts={stats.done} total={stats.allCount} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{loading ? '–' : stats.solvedCount}</span>
                <span className="text-xs text-base-content/60">of {stats.allCount} solved</span>
              </div>
            </div>

            <div className="w-full space-y-4">
              {['easy', 'medium', 'hard'].map((k) => (
                <div key={k}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="flex items-center gap-2 capitalize">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[k] }} />
                      {k}
                    </span>
                    <span className="text-base-content/60">{stats.done[k]} / {stats.total[k]}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-base-300">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stats.total[k] ? (stats.done[k] / stats.total[k]) * 100 : 0}%`,
                        background: COLORS[k],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Profile + level */}
        <section className="surface-card flex flex-col items-center p-6 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary text-4xl font-bold">
            {name[0]?.toUpperCase()}
          </div>
          <h2 className="mt-3 text-xl font-semibold">{name}</h2>
          <p className="text-sm text-base-content/60">{user?.emailId || user?.email}</p>

          <div className="mt-5 w-full rounded-xl border border-base-300 p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-semibold"><Trophy size={15} className="text-warning" /> Level {stats.level}</span>
              <span className="text-base-content/60">{stats.xp} XP</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-base-300">
              <div className="h-full rounded-full bg-warning transition-all duration-500" style={{ width: `${stats.levelPct}%` }} />
            </div>
            <p className="mt-2 text-xs text-base-content/60">{100 - stats.levelPct} XP to level {stats.level + 1}</p>
          </div>

          <div className="mt-3 flex w-full items-center justify-between rounded-xl border border-base-300 px-4 py-3 text-sm">
            <span className="flex items-center gap-1.5"><Flame size={15} className="text-error" /> Streak</span>
            <span className="font-semibold">{streak} {streak === 1 ? 'day' : 'days'}</span>
          </div>

          <Link
            to={stats.next ? `/problem/${stats.next._id}` : '/'}
            className="btn btn-primary mt-5 w-full gap-2"
          >
            {stats.next ? <>Next: {stats.next.title}</> : 'Browse problems'} <ArrowRight size={16} />
          </Link>
        </section>
      </div>

      {/* Activity */}
      <section className="surface-card p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Last 7 days</h2>
            <p className="text-sm text-base-content/60">Submissions per day</p>
          </div>
          <div className="text-right">
            <p className="flex items-center justify-end gap-1.5 text-sm text-base-content/60"><Target size={14} /> This week</p>
            <p className="text-2xl font-bold">{activity.reduce((a, b) => a + b, 0)}</p>
          </div>
        </div>

        <div className="flex h-48 items-end gap-3">
          {activity.map((n, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-xs text-base-content/60">{n}</span>
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${n ? 'bg-primary' : 'bg-base-300'}`}
                style={{ height: `${n ? Math.max(8, (n / maxAct) * 100) : 4}%` }}
              />
              <span className={`text-xs ${i === 6 ? 'font-semibold' : 'text-base-content/60'}`}>{days[i]}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;