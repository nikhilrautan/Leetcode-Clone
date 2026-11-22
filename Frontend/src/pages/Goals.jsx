import { useEffect, useState } from 'react';
import { Plus, Trash2, Check, Target } from 'lucide-react';

const STORAGE_KEY = 'goals';

const loadGoals = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

function Goals() {
  const [goals, setGoals] = useState(loadGoals);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    } catch (err) {
      console.error('Could not save goals:', err);
    }
  }, [goals]);

  const addGoal = (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) {
      setError('Enter a goal first');
      return;
    }
    setGoals([{ id: Date.now(), text: value, done: false }, ...goals]);
    setText('');
    setError('');
  };

  const toggleGoal = (id) =>
    setGoals(goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));

  const removeGoal = (id) => setGoals(goals.filter((g) => g.id !== id));

  const doneCount = goals.filter((g) => g.done).length;
  const percent = goals.length ? Math.round((doneCount / goals.length) * 100) : 0;

  const visible = goals.filter((g) =>
    filter === 'all' ? true : filter === 'done' ? g.done : !g.done
  );

  return (
    <div className="page-container max-w-3xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
        <p className="mt-1 text-base-content/60">
          Set targets like "Solve 3 array problems" and tick them off. Goals are saved in this browser only.
        </p>
      </div>

      <section className="surface-card mb-6 p-5">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-medium">Progress</span>
          <span className="text-base-content/60">
            {doneCount} of {goals.length} done ({percent}%)
          </span>
        </div>
        <progress
          className="progress progress-primary w-full"
          value={doneCount}
          max={goals.length || 1}
        ></progress>
      </section>

      <form onSubmit={addGoal} className="mb-6">
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Solve 3 array problems this week"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError('');
            }}
          />
          <button type="submit" className="btn btn-primary gap-1.5">
            <Plus size={16} /> Add goal
          </button>
        </div>
        {error && <span className="mt-1 block text-sm text-error">{error}</span>}
      </form>

      <div className="tabs tabs-border mb-3">
        {[
          ['all', 'All'],
          ['active', 'Active'],
          ['done', 'Done'],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`tab ${filter === key ? 'tab-active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="surface-card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <Target size={34} className="text-base-content/40" />
          <p className="font-semibold">
            {goals.length === 0 ? 'Set your first goal' : 'Nothing here'}
          </p>
          <p className="text-sm text-base-content/60">
            {goals.length === 0
              ? 'Small, specific goals are easier to finish.'
              : 'Try another tab.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((goal) => (
            <li
              key={goal.id}
              className="surface-card flex items-center gap-3 px-4 py-3"
            >
              <button
                type="button"
                aria-label={goal.done ? 'Mark as not done' : 'Mark as done'}
                onClick={() => toggleGoal(goal.id)}
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors ${
                  goal.done
                    ? 'border-primary bg-primary text-primary-content'
                    : 'border-base-content/30 hover:border-primary'
                }`}
              >
                {goal.done && <Check size={14} />}
              </button>
              <span
                className={`flex-1 ${
                  goal.done ? 'text-base-content/50 line-through' : ''
                }`}
              >
                {goal.text}
              </span>
              <button
                type="button"
                aria-label="Delete goal"
                onClick={() => removeGoal(goal.id)}
                className="btn btn-ghost btn-xs btn-circle text-error"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Goals;