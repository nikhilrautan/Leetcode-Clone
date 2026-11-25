import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import {
  Flame, Trophy, ArrowRight, Target, Camera, ImagePlus, Trash2, Type, X, Check,
  Plus, Minus, Zap, Rocket, Shield, Skull, Gem, Crown, Lock, Sparkles,
  TrendingUp, CalendarDays, Gauge, ChevronRight,
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const XP = { easy: 10, medium: 20, hard: 40 };
const COLORS = { easy: '#10b981', medium: '#f59e0b', hard: '#f43f5e' };
const DIFFS = ['easy', 'medium', 'hard'];
const RANKS = ['Rookie', 'Apprentice', 'Coder', 'Hacker', 'Architect', 'Legend'];

const AVATARS = [
  { e: '🦊', g: '#ff8a3d,#ff4d6d' },
  { e: '🐼', g: '#9fb4c7,#3b4a5a' },
  { e: '🤖', g: '#00e063,#007a4a' },
  { e: '👾', g: '#b66cff,#4b2bd6' },
  { e: '🧑‍🚀', g: '#00b3ff,#0b3a9c' },
  { e: '🦉', g: '#ffc83d,#b36b00' },
  { e: '🐙', g: '#ff6ec7,#7a2bd6' },
  { e: '🐯', g: '#ffb347,#c2410c' },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

/* ---------------- Count-up hook ---------------- */
function useCountUp(target, ms = 700) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setV(target); return undefined; }
    let raf;
    let start;
    const tick = (t) => {
      if (start === undefined) start = t;
      const p = Math.min(1, (t - start) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

/* ---------------- Donut ---------------- */
// Each difficulty owns an arc sized by how many problems exist.
// The solved part fills that arc, so the ring has structure even at 0 solved.
function Donut({ counts, totals, total, active, onHover }) {
  const r = 54;
  const C = 2 * Math.PI * r;
  const gap = total > 0 ? 3 : 0;
  let start = 0;
  const solved = counts.easy + counts.medium + counts.hard;
  return (
    <svg
      viewBox="0 0 140 140"
      className="h-44 w-44 -rotate-90"
      role="img"
      aria-label={`${solved} of ${total} solved`}
      onMouseLeave={() => onHover(null)}
    >
      <circle cx="70" cy="70" r={r} fill="none" stroke="currentColor" strokeOpacity="0.06" strokeWidth="14" />
      {total > 0 &&
        DIFFS.map((k) => {
          const arc = Math.max(0, (totals[k] / total) * C - gap);
          const fill = totals[k] ? arc * (counts[k] / totals[k]) : 0;
          const off = -start;
          start += (totals[k] / total) * C;
          const dim = active && active !== k;
          const w = active === k ? 18 : 14;
          return (
            <g key={k} onMouseEnter={() => onHover(k)} style={{ opacity: dim ? 0.3 : 1, transition: 'opacity .2s' }}>
              <circle
                cx="70" cy="70" r={r} fill="none" stroke={COLORS[k]} strokeOpacity="0.2"
                strokeWidth={w} strokeDasharray={`${arc} ${C - arc}`} strokeDashoffset={off}
                style={{ transition: 'stroke-width .2s' }}
              />
              <circle
                cx="70" cy="70" r={r} fill="none" stroke={COLORS[k]}
                strokeWidth={w} strokeDasharray={`${fill} ${C - fill}`} strokeDashoffset={off}
                style={{ transition: 'stroke-dasharray .7s ease, stroke-width .2s' }}
              />
            </g>
          );
        })}
    </svg>
  );
}

/* ---------------- Small stat tile ---------------- */
function Stat({ icon: Icon, label, value, suffix = '', text, tone = 'text-primary' }) {
  const n = useCountUp(typeof value === 'number' ? value : 0);
  return (
    <div className="rounded-xl border border-base-300 bg-base-200/40 p-4 transition hover:border-base-content/20">
      <div className="mb-2 flex items-center gap-2 text-sm text-base-content/60">
        <Icon size={15} className={tone} /> {label}
      </div>
      <p className="text-2xl font-bold tabular-nums">{text ?? `${n}${suffix}`}</p>
    </div>
  );
}

/* ---------------- Profile photo ---------------- */
// photo = null | { type: 'image', src } | { type: 'avatar', e, g }
function PhotoContent({ photo, initial, textSize = 'text-5xl' }) {
  if (photo?.type === 'image') {
    return <img src={photo.src} alt="Profile" className="h-full w-full object-cover" />;
  }
  if (photo?.type === 'avatar') {
    return (
      <span
        className={`flex h-full w-full items-center justify-center ${textSize}`}
        style={{ background: `linear-gradient(135deg, ${photo.g})` }}
      >
        {photo.e}
      </span>
    );
  }
  return <span className={`font-bold ${textSize}`}>{initial}</span>;
}

// Crop to a square, apply zoom, shrink to 256px so it stays small to store/upload
function renderSquare(img, zoom, size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const s = Math.max(size / img.naturalWidth, size / img.naturalHeight) * zoom;
  const w = img.naturalWidth * s;
  const h = img.naturalHeight * s;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return c.toDataURL('image/jpeg', 0.85);
}

function PhotoModal({ initial, onClose, onSave }) {
  const [step, setStep] = useState('pick'); // pick | camera | adjust
  const [src, setSrc] = useState('');
  const [zoom, setZoom] = useState(1);
  const [camError, setCamError] = useState('');
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const imgRef = useRef(null);

  const stopCam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };
  useEffect(() => stopCam, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const readFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setSrc(reader.result); setZoom(1); setStep('adjust'); };
    reader.readAsDataURL(file);
  };

  const openCamera = async () => {
    setCamError('');
    setStep('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      requestAnimationFrame(() => { if (videoRef.current) videoRef.current.srcObject = stream; });
    } catch {
      setCamError('Camera is blocked or unavailable. Allow camera access or upload a photo instead.');
    }
  };

  const snap = () => {
    const v = videoRef.current;
    if (!v?.videoWidth) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    stopCam();
    setSrc(c.toDataURL('image/jpeg', 0.9));
    setZoom(1);
    setStep('adjust');
  };

  const saveAdjusted = () => {
    onSave({ type: 'image', src: renderSquare(imgRef.current, zoom) }, 'Profile photo updated');
  };

  const option =
    'flex flex-col items-center gap-2 rounded-2xl border border-base-300 bg-base-200/50 p-4 text-sm font-medium transition hover:-translate-y-1 hover:border-primary';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-label="Update profile photo" className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-base-300 bg-base-100 p-6 shadow-2xl">
        <div className="mb-1 flex items-start justify-between">
          <h3 className="text-xl font-semibold">
            {step === 'pick' ? 'Update profile photo' : step === 'camera' ? 'Take a photo' : 'Adjust your photo'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle" aria-label="Close"><X size={18} /></button>
        </div>

        {step === 'pick' && (
          <>
            <p className="mb-4 text-sm text-base-content/60">Pick how you want to look on the leaderboard.</p>
            <div className="grid grid-cols-2 gap-3">
              <button className={option} onClick={openCamera}><Camera size={26} className="text-primary" />Take photo</button>
              <button className={option} onClick={() => fileRef.current?.click()}><ImagePlus size={26} className="text-primary" />Upload from gallery</button>
              <button className={option} onClick={() => onSave(null, 'Using your initial')}><Type size={26} className="text-primary" />Use my initial</button>
              <button className={`${option} hover:!border-error`} onClick={() => onSave(null, 'Photo removed')}><Trash2 size={26} className="text-error" />Remove photo</button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => readFile(e.target.files?.[0])} />

            <p className="mb-3 mt-5 text-sm text-base-content/60">Or choose an avatar</p>
            <div className="grid grid-cols-4 gap-3">
              {AVATARS.map((a) => (
                <button
                  key={a.e}
                  aria-label={`Avatar ${a.e}`}
                  onClick={() => onSave({ type: 'avatar', e: a.e, g: a.g }, 'Avatar updated')}
                  className="aspect-square rounded-full text-3xl transition hover:rotate-[-6deg] hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${a.g})` }}
                >
                  {a.e}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'camera' && (
          <div className="text-center">
            {camError ? (
              <p className="my-6 text-sm text-error">{camError}</p>
            ) : (
              <div className="mx-auto my-4 h-60 w-60 overflow-hidden rounded-full border-4 border-primary bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
              </div>
            )}
            <div className="flex gap-3">
              <button className="btn flex-1" onClick={() => { stopCam(); setStep('pick'); }}>Back</button>
              {!camError && <button className="btn btn-primary flex-1 gap-2" onClick={snap}><Camera size={16} /> Capture</button>}
            </div>
          </div>
        )}

        {step === 'adjust' && (
          <div className="text-center">
            <p className="mb-2 text-sm text-base-content/60">Zoom until it looks right.</p>
            <div className="mx-auto my-4 h-52 w-52 overflow-hidden rounded-full border-4 border-primary bg-black">
              <img
                ref={imgRef} src={src} alt="Preview"
                className="h-full w-full object-cover"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>
            <input type="range" min="1" max="2.5" step="0.01" value={zoom} onChange={(e) => setZoom(+e.target.value)} className="range range-primary range-xs w-4/5" aria-label="Zoom" />
            <div className="mt-5 flex gap-3">
              <button className="btn flex-1" onClick={() => setStep('pick')}>Back</button>
              <button className="btn btn-primary flex-1 gap-2" onClick={saveAdjusted}><Check size={16} /> Save photo</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function Dashboard() {
  const user = useSelector((s) => s.auth.user);
  const [all, setAll] = useState([]);
  const [solved, setSolved] = useState([]);
  const [activity, setActivity] = useState(Array(7).fill(0));
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false); // lets the chart bars grow in once data is here

  const [hoverDiff, setHoverDiff] = useState(null); // donut + legend highlight
  const [queueFilter, setQueueFilter] = useState('all'); // up-next filter
  const [goal, setGoal] = useState(() => {
    try { return Math.min(10, Math.max(1, +localStorage.getItem('dashDailyGoal') || 2)); } catch { return 2; }
  });

  const photoKey = `profilePhoto:${user?._id || 'me'}`;
  const [photo, setPhoto] = useState(() => {
    try { return JSON.parse(localStorage.getItem(photoKey)) || null; } catch { return null; }
  });
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState('');

  const savePhoto = async (next, msg) => {
    setPhoto(next);
    setModal(false);
    try {
      if (next) localStorage.setItem(photoKey, JSON.stringify(next));
      else localStorage.removeItem(photoKey);
    } catch { /* storage full or blocked */ }
    // Optional: persist on your backend so it follows the user across devices.
    // Change the route to match your API.
    try { await axiosClient.put('/user/profilePhoto', { photo: next }); } catch { /* endpoint optional */ }
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const changeGoal = (delta) => {
    setGoal((g) => {
      const next = Math.min(10, Math.max(1, g + delta));
      try { localStorage.setItem('dashDailyGoal', String(next)); } catch { /* ignore */ }
      return next;
    });
  };

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

  useEffect(() => {
    if (loading) return undefined;
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [loading]);

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
    const unsolved = all.filter((p) => !solvedIds.has(p._id));
    return {
      total, done, xp, unsolved,
      allCount: all.length,
      solvedCount: solved.length,
      level: Math.floor(xp / 100) + 1,
      levelPct: xp % 100,
      next: unsolved[0],
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
      return {
        short: d.toLocaleDateString('en', { weekday: 'short' }),
        long: d.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' }),
      };
    }),
    []
  );

  const week = useMemo(() => {
    const total = activity.reduce((a, b) => a + b, 0);
    const max = Math.max(0, ...activity);
    return {
      total,
      max,
      activeDays: activity.filter((n) => n > 0).length,
      goalHits: activity.filter((n) => n >= goal).length,
      bestIdx: max > 0 ? activity.indexOf(max) : -1,
    };
  }, [activity, goal]);

  const scale = Math.max(week.max, goal, 1) * 1.2;

  const queue = useMemo(
    () => stats.unsolved
      .filter((p) => queueFilter === 'all' || p.difficulty?.toLowerCase() === queueFilter)
      .slice(0, 4),
    [stats.unsolved, queueFilter]
  );

  const completion = stats.allCount ? Math.round((stats.solvedCount / stats.allCount) * 100) : 0;
  const hardest = stats.done.hard ? 'Hard' : stats.done.medium ? 'Medium' : stats.done.easy ? 'Easy' : 'None yet';

  const badges = useMemo(() => [
    { id: 'first', icon: Zap, title: 'First solve', desc: 'Solve your first problem', cur: stats.solvedCount, need: 1 },
    { id: 'three', icon: Rocket, title: 'Warming up', desc: 'Solve 3 problems', cur: stats.solvedCount, need: 3 },
    { id: 'streak', icon: Flame, title: 'On a roll', desc: 'Reach a 3-day streak', cur: streak, need: 3 },
    { id: 'medium', icon: Shield, title: 'Mid-level clear', desc: 'Solve a medium problem', cur: stats.done.medium, need: 1 },
    { id: 'hard', icon: Skull, title: 'Hard mode', desc: 'Solve a hard problem', cur: stats.done.hard, need: 1 },
    { id: 'xp', icon: Gem, title: 'Level 2', desc: 'Earn 100 XP', cur: stats.xp, need: 100 },
    { id: 'grind', icon: Target, title: 'Busy week', desc: 'Make 10 submissions in a week', cur: week.total, need: 10 },
    { id: 'sweep', icon: Crown, title: 'Full board', desc: 'Solve every problem', cur: stats.solvedCount, need: Math.max(stats.allCount, 1), locked: stats.allCount === 0 },
  ].map((b) => ({ ...b, done: !b.locked && b.cur >= b.need })), [stats, streak, week.total]);
  const unlocked = badges.filter((b) => b.done).length;

  const name = user?.firstName || 'Coder';
  const initial = name[0]?.toUpperCase();
  const rank = RANKS[Math.min(stats.level - 1, RANKS.length - 1)];

  const headline = loading
    ? 'Loading your progress...'
    : stats.solvedCount === 0
      ? 'Nothing solved yet. Start with an easy one to get on the board.'
      : stats.solvedCount === stats.allCount && stats.allCount > 0
        ? 'You have cleared every problem. Nice work.'
        : `${stats.solvedCount} down, ${stats.allCount - stats.solvedCount} to go.`;

  // Donut center shows the hovered difficulty, otherwise the overall total
  const centerNum = hoverDiff ? stats.done[hoverDiff] : stats.solvedCount;
  const centerLabel = hoverDiff
    ? `of ${stats.total[hoverDiff]} ${hoverDiff}`
    : `of ${stats.allCount} solved`;

  // Spinning gradient ring; inner content counter-rotates so the photo stays upright
  const spin = { animationDuration: '6s' };
  const spinBack = { animationDuration: '6s', animationDirection: 'reverse' };

  return (
    <div className="page-container max-w-6xl space-y-6 py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Progress overview */}
        <section className="surface-card relative overflow-hidden p-6 sm:p-8 lg:col-span-2">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-base-content/60">{greeting()},</p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{name}</h1>
              <p className="mt-2 max-w-md text-sm text-base-content/60">{headline}</p>
            </div>
            <div className="hidden shrink-0 items-center gap-2 rounded-full border border-base-300 bg-base-200/60 px-3 py-1.5 text-sm font-medium sm:flex">
              <Sparkles size={15} className="text-primary" />
              {rank}
              <span className="text-base-content/50">Lv {stats.level}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
            <div className="relative shrink-0">
              <Donut
                counts={stats.done}
                totals={stats.total}
                total={stats.allCount}
                active={hoverDiff}
                onHover={setHoverDiff}
              />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold tabular-nums">{loading ? '–' : centerNum}</span>
                <span className="text-xs capitalize text-base-content/60">{centerLabel}</span>
              </div>
            </div>

            <div className="w-full space-y-2">
              {DIFFS.map((k) => {
                const pct = stats.total[k] ? (stats.done[k] / stats.total[k]) * 100 : 0;
                const on = hoverDiff === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onMouseEnter={() => setHoverDiff(k)}
                    onMouseLeave={() => setHoverDiff(null)}
                    onFocus={() => setHoverDiff(k)}
                    onBlur={() => setHoverDiff(null)}
                    className={`block w-full rounded-xl px-3 py-2.5 text-left transition ${on ? 'bg-base-200' : 'hover:bg-base-200/60'}`}
                  >
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="flex items-center gap-2 capitalize">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[k] }} />
                        {k}
                      </span>
                      <span className="tabular-nums text-base-content/60">
                        {stats.done[k]} / {stats.total[k]}
                        <span className="ml-2 text-xs text-base-content/40">{Math.round(pct)}%</span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-base-300">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: ready ? `${pct}%` : '0%', background: COLORS[k] }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={Gauge} label="Completion" value={completion} suffix="%" />
            <Stat icon={Zap} label="XP earned" value={stats.xp} tone="text-warning" />
            <Stat icon={CalendarDays} label="Active days" text={`${week.activeDays} / 7`} tone="text-info" />
            <Stat icon={TrendingUp} label="Toughest solved" text={hardest} tone="text-error" />
          </div>
        </section>

        {/* Profile + level */}
        <section className="surface-card flex flex-col items-center p-6 text-center">
          <div
            className="relative mt-1 h-36 w-36 animate-spin rounded-full p-[5px]"
            style={{ ...spin, background: 'conic-gradient(#00e063, #00b3ff, #b66cff, #ffc83d, #00e063)' }}
          >
            <button
              onClick={() => setModal(true)}
              aria-label="Change profile photo"
              className="group absolute inset-[5px] flex animate-spin items-center justify-center overflow-hidden rounded-full bg-base-100"
              style={spinBack}
            >
              <PhotoContent photo={photo} initial={initial} />
              <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                Change photo
              </span>
            </button>
            <button
              onClick={() => setModal(true)}
              aria-label="Edit photo"
              className="absolute -bottom-0.5 -right-0.5 z-10 flex h-10 w-10 animate-spin items-center justify-center rounded-full border-[3px] border-base-100 bg-primary text-primary-content transition hover:scale-110"
              style={spinBack}
            >
              <Camera size={17} />
            </button>
          </div>

          <h2 className="mt-4 text-xl font-semibold">{name}</h2>
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly momentum */}
        <section className="surface-card p-6 sm:p-8 lg:col-span-2">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Weekly momentum</h2>
              <p className="text-sm text-base-content/60">Your submissions, day by day</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full border border-base-300 py-1 pl-3 pr-1 text-sm">
                <span className="text-base-content/60">Daily target</span>
                <button
                  onClick={() => changeGoal(-1)}
                  disabled={goal <= 1}
                  aria-label="Lower daily target"
                  className="btn btn-ghost btn-xs btn-circle"
                ><Minus size={14} /></button>
                <span className="w-4 text-center font-semibold tabular-nums">{goal}</span>
                <button
                  onClick={() => changeGoal(1)}
                  disabled={goal >= 10}
                  aria-label="Raise daily target"
                  className="btn btn-ghost btn-xs btn-circle"
                ><Plus size={14} /></button>
              </div>
              <div className="text-right">
                <p className="flex items-center justify-end gap-1.5 text-sm text-base-content/60"><Target size={14} /> Total this week</p>
                <p className="text-2xl font-bold tabular-nums">{week.total}</p>
              </div>
            </div>
          </div>

          <div className="relative h-48">
            {[0, 1, 2].map((i) => (
              <div key={i} className="absolute left-0 right-0 border-t border-base-content/5" style={{ bottom: `${(i / 2) * 100}%` }} />
            ))}
            <div
              className="absolute left-0 right-0 z-0 border-t border-dashed border-warning/70"
              style={{ bottom: `${(goal / scale) * 100}%`, transition: 'bottom .3s ease' }}
            >
              <span className="absolute -top-5 right-0 text-xs text-warning">Target {goal}</span>
            </div>

            <div className="absolute inset-0 z-10 flex items-end gap-3">
              {activity.map((n, i) => {
                const hit = n > 0 && n >= goal;
                const pct = n ? Math.max(6, (n / scale) * 100) : 3;
                return (
                  <div
                    key={i}
                    className={`group flex h-full flex-1 items-end rounded-lg px-1 ${i === 6 ? 'bg-base-200/50' : ''}`}
                  >
                    <div
                      tabIndex={0}
                      aria-label={`${days[i].long}: ${n} submissions`}
                      className={`relative w-full rounded-t-md outline-none transition-all duration-700 ${
                        hit ? 'bg-primary' : n ? 'bg-primary/50' : 'bg-base-300'
                      } group-hover:brightness-125 focus-visible:brightness-125`}
                      style={{ height: ready ? `${pct}%` : '3%' }}
                    >
                      <span className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-base-300 bg-base-100 px-2 py-1 text-xs opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
                        {days[i].long}: <b>{n}</b>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 flex gap-3">
            {activity.map((n, i) => (
              <div key={i} className="flex-1 text-center">
                <p className={`text-xs ${i === 6 ? 'font-semibold' : 'text-base-content/60'}`}>{i === 6 ? 'Today' : days[i].short}</p>
                <p className="text-xs tabular-nums text-base-content/40">{n}</p>
              </div>
            ))}
          </div>

          <p className="mt-5 rounded-xl bg-base-200/60 px-4 py-3 text-sm text-base-content/70">
            {week.total === 0
              ? 'No submissions this week yet. One solve today starts your streak.'
              : `You hit your target on ${week.goalHits} of 7 days${
                  week.bestIdx >= 0 ? `, and ${days[week.bestIdx].short} was your best day with ${week.max}.` : '.'
                }`}
          </p>
        </section>

        {/* Up next */}
        <section className="surface-card flex flex-col p-6">
          <h2 className="text-xl font-semibold">Up next</h2>
          <p className="mb-4 text-sm text-base-content/60">Unsolved problems, ready when you are</p>

          <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter by difficulty">
            {['all', ...DIFFS].map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={queueFilter === f}
                onClick={() => setQueueFilter(f)}
                className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition ${
                  queueFilter === f
                    ? 'border-primary bg-primary text-primary-content'
                    : 'border-base-300 text-base-content/70 hover:border-base-content/30'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-2">
            {loading &&
              [0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-base-200" />)}

            {!loading && queue.map((p) => {
              const d = p.difficulty?.toLowerCase();
              return (
                <Link
                  key={p._id}
                  to={`/problem/${p._id}`}
                  className="group flex items-center gap-3 rounded-xl border border-base-300 px-4 py-3 transition hover:border-primary hover:bg-base-200/50"
                >
                  <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: COLORS[d] || '#64748b' }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{p.title}</span>
                    <span className="text-xs capitalize text-base-content/50">{d} · +{XP[d] ?? 0} XP</span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-base-content/30 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              );
            })}

            {!loading && queue.length === 0 && (
              <div className="rounded-xl border border-dashed border-base-300 p-6 text-center text-sm text-base-content/60">
                {stats.unsolved.length === 0
                  ? 'You have solved everything. Check the leaderboard or join a group.'
                  : `No unsolved ${queueFilter} problems. Pick another difficulty.`}
              </div>
            )}
          </div>

          <Link to="/" className="mt-4 text-sm font-medium text-primary hover:underline">Browse all problems</Link>
        </section>
      </div>

      {/* Achievements */}
      <section className="surface-card p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Achievements</h2>
            <p className="text-sm text-base-content/60">Unlock them by solving and staying consistent</p>
          </div>
          <p className="text-sm text-base-content/60">
            <span className="text-2xl font-bold text-base-content tabular-nums">{unlocked}</span> / {badges.length} unlocked
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((b) => {
            const Icon = b.icon;
            const pct = Math.min(100, (b.cur / b.need) * 100);
            return (
              <div
                key={b.id}
                title={b.desc}
                className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
                  b.done ? 'border-primary/40 bg-primary/5' : 'border-base-300 bg-base-200/30'
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${b.done ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content/50'}`}>
                    <Icon size={18} />
                  </span>
                  {b.done ? <Check size={16} className="text-primary" /> : <Lock size={14} className="text-base-content/30" />}
                </div>
                <p className={`text-sm font-semibold ${b.done ? '' : 'text-base-content/80'}`}>{b.title}</p>
                <p className="mb-3 text-xs text-base-content/50">{b.desc}</p>
                <div className="h-1.5 overflow-hidden rounded-full bg-base-300">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${b.done ? 'bg-primary' : 'bg-base-content/30'}`}
                    style={{ width: ready && !b.locked ? `${pct}%` : '0%' }}
                  />
                </div>
                <p className="mt-1.5 text-xs tabular-nums text-base-content/40">
                  {b.locked ? 'Waiting for problems' : `${Math.min(b.cur, b.need)} / ${b.need}`}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {modal && <PhotoModal initial={initial} onClose={() => setModal(false)} onSave={savePhoto} />}

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-content shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

export default Dashboard;