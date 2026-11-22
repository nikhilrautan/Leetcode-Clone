import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { Search, CheckCircle2, SearchX, Shuffle } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const tagDot = {
  array: 'bg-warning',
  linkedList: 'bg-info',
  graph: 'bg-secondary',
  dp: 'bg-accent',
};

const tagLabel = {
  array: 'Array',
  linkedList: 'Linked List',
  graph: 'Graph',
  dp: 'DP',
};

const difficultyRank = { easy: 1, medium: 2, hard: 3 };

const getDifficultyText = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'text-success';
    case 'medium':
      return 'text-warning';
    case 'hard':
      return 'text-error';
    default:
      return 'text-base-content/60';
  }
};

function Homepage() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all',
  });
  const [sort, setSort] = useState('default');

  // UI-only: title search (filters in the browser, sends nothing to the backend)
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const solvedIds = useMemo(
    () => new Set(solvedProblems.map((sp) => sp._id)),
    [solvedProblems]
  );
  const isSolved = (problem) => solvedIds.has(problem._id);

  const filteredProblems = useMemo(() => {
    const list = problems.filter((problem) => {
      const difficultyMatch =
        filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
      const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
      const statusMatch =
        filters.status === 'all' ||
        (filters.status === 'solved' && solvedIds.has(problem._id)) ||
        (filters.status === 'unsolved' && !solvedIds.has(problem._id));
      const searchMatch =
        search.trim() === '' ||
        problem.title?.toLowerCase().includes(search.trim().toLowerCase());
      return difficultyMatch && tagMatch && statusMatch && searchMatch;
    });

    if (sort === 'easiest') {
      list.sort((a, b) => (difficultyRank[a.difficulty] || 0) - (difficultyRank[b.difficulty] || 0));
    } else if (sort === 'hardest') {
      list.sort((a, b) => (difficultyRank[b.difficulty] || 0) - (difficultyRank[a.difficulty] || 0));
    } else if (sort === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    return list;
  }, [problems, filters, search, sort, solvedIds]);

  const filtersActive =
    filters.difficulty !== 'all' ||
    filters.tag !== 'all' ||
    filters.status !== 'all' ||
    sort !== 'default' ||
    search.trim() !== '';

  const clearFilters = () => {
    setFilters({ difficulty: 'all', tag: 'all', status: 'all' });
    setSort('default');
    setSearch('');
  };

  // Jump to a random problem you have not solved yet
  const pickRandom = () => {
    const pool = problems.filter((p) => !solvedIds.has(p._id));
    const list = pool.length ? pool : problems;
    if (!list.length) return;
    navigate(`/problem/${list[Math.floor(Math.random() * list.length)]._id}`);
  };

  const solvedPct = problems.length
    ? Math.round((solvedProblems.length / problems.length) * 100)
    : 0;

  return (
    <div className="page-container max-w-6xl py-8">
      <div className="surface-card p-6 sm:p-8">
        <div className="mb-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Problems</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-base-content/60">
                {solvedProblems.length} / {problems.length} solved
              </span>
              <button
                className="btn btn-sm btn-outline gap-1.5"
                onClick={pickRandom}
                disabled={!problems.length}
              >
                <Shuffle size={14} /> Pick random
              </button>
            </div>
          </div>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-base-300"
            role="progressbar"
            aria-valuenow={solvedPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${solvedPct}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="input w-full items-center gap-2 lg:max-w-xs">
            <Search size={16} className="opacity-60" />
            <input
              type="text"
              className="grow"
              placeholder="Search by title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <select
              className="select w-auto"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Problems</option>
              <option value="solved">Solved</option>
              <option value="unsolved">Unsolved</option>
            </select>

            <select
              className="select w-auto"
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              className="select w-auto"
              value={filters.tag}
              onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
            >
              <option value="all">All Tags</option>
              <option value="array">Array</option>
              <option value="linkedList">Linked List</option>
              <option value="graph">Graph</option>
              <option value="dp">DP</option>
            </select>

            <select
              className="select w-auto"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort problems"
            >
              <option value="default">Default order</option>
              <option value="easiest">Easiest first</option>
              <option value="hardest">Hardest first</option>
              <option value="title">Title A to Z</option>
            </select>

            {filtersActive && (
              <button className="btn btn-ghost" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Problems list */}
        {loading ? (
          <div className="flex justify-center py-14">
            <span className="loading loading-dots loading-lg text-primary" />
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <SearchX size={36} className="text-base-content/40" />
            <div>
              <p className="font-semibold">No problems found</p>
              <p className="text-sm text-base-content/60">
                {problems.length === 0
                  ? 'Problems will appear here once they are added.'
                  : 'Try a different search or clear the filters.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProblems.map((problem) => (
              <NavLink
                key={problem._id}
                to={`/problem/${problem._id}`}
                className="group flex items-center gap-4 rounded-xl border border-base-300 bg-base-200/60 px-4 py-4 transition-colors hover:border-primary/40 hover:bg-base-200"
              >
                {isSolved(problem) ? (
                  <CheckCircle2 size={16} className="shrink-0 text-success" />
                ) : (
                  <span
                    className={`h-3 w-3 shrink-0 rounded-full ${
                      tagDot[problem.tags] || 'bg-base-content/30'
                    }`}
                  />
                )}

                <span className="min-w-0 flex-1 truncate font-medium group-hover:text-primary">
                  {problem.title}
                </span>

                <span className="hidden text-xs text-base-content/50 sm:inline">
                  {tagLabel[problem.tags] || problem.tags}
                </span>

                <span
                  className={`w-16 text-right text-sm font-semibold capitalize ${getDifficultyText(
                    problem.difficulty
                  )}`}
                >
                  {problem.difficulty}
                </span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Homepage;