import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import { Flame, Trophy, ArrowRight, Target, Camera, ImagePlus, Trash2, Type, X, Check } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const XP = { easy: 10, medium: 20, hard: 40 };
const COLORS = { easy: '#10b981', medium: '#f59e0b', hard: '#f43f5e' };

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

/* ---------------- Donut ---------------- */
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
  const initial = name[0]?.toUpperCase();

  // Spinning gradient ring; inner content counter-rotates so the photo stays upright
  const spin = { animationDuration: '6s' };
  const spinBack = { animationDuration: '6s', animationDirection: 'reverse' };

  return (
    <div className="page-container max-w-6xl space-y-6 py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hero */}
        <section className="surface-card relative overflow-hidden p-6 sm:p-8 lg:col-span-2">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <span className="pointer-events-none absolute right-6 top-4 origin-[70%_80%] animate-[wave_2.2s_ease-in-out_3] text-6xl sm:text-7xl" aria-hidden="true">👋</span>
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