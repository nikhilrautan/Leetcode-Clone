import { Link } from 'react-router';
import {
  Code2, Sparkles, Workflow, Users, Trophy, PlayCircle, ArrowRight, Check,
} from 'lucide-react';

const features = [
  {
    icon: Code2,
    title: 'Practice real problems',
    text: 'Solve problems by difficulty and topic. Run your code against test cases and submit in JavaScript, C++ and more.',
  },
  {
    icon: Workflow,
    title: 'See your code run',
    text: 'Step through your code line by line and watch variables, the call stack and console output change.',
  },
  {
    icon: Sparkles,
    title: 'AI interview prep',
    text: 'Pick a role, your tech stack and level, and get practice questions with model answers.',
  },
  {
    icon: PlayCircle,
    title: 'Video solutions',
    text: 'Stuck on a problem? Watch the explanation and then try the solution yourself.',
  },
  {
    icon: Users,
    title: 'Learn with others',
    text: 'Share progress in the feed, join groups with friends and set goals together.',
  },
  {
    icon: Trophy,
    title: 'Stay motivated',
    text: 'Earn XP, level up, keep your streak alive and climb the leaderboard.',
  },
];

const steps = [
  ['Create a free account', 'It takes less than a minute.'],
  ['Pick a problem', 'Filter by difficulty and topic, or let us pick one for you.'],
  ['Code, run, submit', 'Test against sample cases, then submit against hidden ones.'],
];

function Landing() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-base-300 bg-base-100/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/welcome" className="flex items-center gap-2 text-xl font-bold">
            <Code2 className="text-primary" size={24} />
            <span className="gradient-text">LeetCode</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Sign up</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="badge badge-soft badge-primary mb-4">Practice. Visualise. Get hired.</span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Get better at coding, <span className="text-primary">one problem at a time</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-base-content/70">
              Solve coding problems, watch your code run step by step, prepare for interviews with AI and learn together with friends.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup" className="btn btn-primary gap-2">
                Get started free <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn btn-outline">I already have an account</Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-base-content/70">
              {['Free to use', 'Multiple languages', 'Instant feedback'].map((t) => (
                <li key={t} className="flex items-center gap-1.5"><Check size={14} className="text-success" /> {t}</li>
              ))}
            </ul>
          </div>

          {/* Code preview */}
          <div className="surface-card overflow-hidden shadow-xl">
            <div className="flex items-center gap-1.5 border-b border-base-300 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-error/70" />
              <span className="h-3 w-3 rounded-full bg-warning/70" />
              <span className="h-3 w-3 rounded-full bg-success/70" />
              <span className="ml-3 text-xs text-base-content/50">twoSum.js</span>
            </div>
            <pre className="overflow-x-auto bg-black/40 p-5 font-mono text-sm leading-6">
{`function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
}`}
            </pre>
            <div className="flex items-center justify-between border-t border-base-300 px-4 py-3 text-sm">
              <span className="flex items-center gap-1.5 text-success"><Check size={14} /> All test cases passed</span>
              <span className="text-base-content/50">Runtime 0.002s</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Everything you need to level up</h2>
          <p className="mt-2 text-base-content/60">Practice, learn and prepare in one place.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="surface-card p-6 transition-colors hover:border-primary/40">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon size={22} />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-base-content/60">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-base-300 bg-base-200/50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">How it works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map(([title, text], i) => (
              <div key={title} className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-content">
                  {i + 1}
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-base-content/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final call to action */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Ready to start?</h2>
        <p className="mt-2 text-base-content/60">Create your account and solve your first problem today.</p>
        <Link to="/signup" className="btn btn-primary mt-6 gap-2">
          Create free account <ArrowRight size={16} />
        </Link>
      </section>

      <footer className="border-t border-base-300 py-6 text-center text-sm text-base-content/50">
        © {new Date().getFullYear()} LeetCode clone. Built for learning.
      </footer>
    </div>
  );
}

export default Landing;