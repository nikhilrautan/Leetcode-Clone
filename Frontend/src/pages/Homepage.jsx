import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
  Code2,
  Search,
  CheckCircle2,
  Circle,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Sun,
  Moon,
  SearchX,
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../store/authSlice';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all',
  });

  // UI-only state (no backend involved)
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'codedark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
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

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]); // Clear solved problems on logout
  };

  const isSolved = (problem) => solvedProblems.some((sp) => sp._id === problem._id);

  const filteredProblems = problems.filter((problem) => {
    const difficultyMatch =
      filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch = filters.status === 'all' || isSolved(problem);
    const searchMatch =
      search.trim() === '' ||
      problem.title?.toLowerCase().includes(search.trim().toLowerCase());
    return difficultyMatch && tagMatch && statusMatch && searchMatch;
  });

  const solvedCount = solvedProblems.length;
  const totalCount = problems.length;
  const progress = totalCount ? Math.round((solvedCount / totalCount) * 100) : 0;

  const filtersActive =
    filters.difficulty !== 'all' ||
    filters.tag !== 'all' ||
    filters.status !== 'all' ||
    search.trim() !== '';

  const clearFilters = () => {
    setFilters({ difficulty: 'all', tag: 'all', status: 'all' });
    setSearch('');
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-30 border-b border-base-300 bg-base-100/80 backdrop-blur">
        <div className="page-container navbar min-h-16 px-0">
          <div className="flex-1">
            <NavLink to="/" className="flex items-center gap-2 text-xl font-bold">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-content">
                <Code2 size={20} />
              </span>
              <span className="gradient-text">LeetCode</span>
            </NavLink>
          </div>

          <div className="flex flex-none items-center gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-circle"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'codedark' ? 'codelight' : 'codedark')}
            >
              {theme === 'codedark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {user?.firstName?.charAt(0)?.toUpperCase()}
                </span>
                <span className="hidden sm:inline">{user?.firstName}</span>
                <ChevronDown size={16} className="opacity-60" />
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content z-10 mt-3 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
              >
                {user?.role == 'admin' && (
                  <li>
                    <NavLink to="/admin">
                      <ShieldCheck size={16} /> Admin
                    </NavLink>
                  </li>
                )}
                <li>
                  <button onClick={handleLogout}>
                    <LogOut size={16} /> Log out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="page-container py-8">
        {/* Header + progress */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Problems</h1>
            <p className="mt-1 text-base-content/60">
              Pick a problem, write your solution, and track what you have solved.
            </p>
          </div>

          <div className="surface-card w-full px-4 py-3 sm:w-72">
            <div className="mb-2 flex items-baseline justify-between text-sm">
              <span className="font-medium">Your progress</span>
              <span className="text-base-content/60">
                {solvedCount} / {totalCount} solved
              </span>
            </div>
            <progress
              className="progress progress-primary w-full"
              value={progress}
              max="100"
            ></progress>
          </div>
        </div>

        {/* Filters */}
        <div className="surface-card mb-6 flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
          <label className="input input-bordered flex w-full items-center gap-2 lg:max-w-xs">
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
              className="select select-bordered"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Problems</option>
              <option value="solved">Solved Problems</option>
            </select>

            <select
              className="select select-bordered"
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              className="select select-bordered"
              value={filters.tag}
              onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
            >
              <option value="all">All Tags</option>
              <option value="array">Array</option>
              <option value="linkedList">Linked List</option>
              <option value="graph">Graph</option>
              <option value="dp">DP</option>
            </select>

            {filtersActive && (
              <button className="btn btn-ghost" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Problems List */}
        {filteredProblems.length === 0 ? (
          <div className="surface-card flex flex-col items-center gap-3 px-6 py-16 text-center">
            <SearchX size={36} className="text-base-content/40" />
            <div>
              <p className="font-semibold">No problems found</p>
              <p className="text-sm text-base-content/60">
                {problems.length === 0
                  ? 'Problems will appear here once they are added.'
                  : 'Try a different search or clear the filters.'}
              </p>
            </div>
            {filtersActive && (
              <button className="btn btn-primary btn-sm" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="surface-card divide-y divide-base-300 overflow-hidden">
            {filteredProblems.map((problem) => {
              const solved = isSolved(problem);
              return (
                <NavLink
                  key={problem._id}
                  to={`/problem/${problem._id}`}
                  className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-base-200 sm:px-6"
                >
                  {solved ? (
                    <CheckCircle2 size={20} className="shrink-0 text-success" />
                  ) : (
                    <Circle size={20} className="shrink-0 text-base-content/25" />
                  )}

                  <span className="min-w-0 flex-1 truncate font-medium group-hover:text-primary">
                    {problem.title}
                  </span>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="badge badge-soft badge-info hidden sm:inline-flex">
                      {problem.tags}
                    </span>
                    <span
                      className={`badge badge-soft font-medium capitalize ${getDifficultyBadgeColor(
                        problem.difficulty
                      )}`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'badge-success';
    case 'medium':
      return 'badge-warning';
    case 'hard':
      return 'badge-error';
    default:
      return 'badge-neutral';
  }
};

export default Homepage;