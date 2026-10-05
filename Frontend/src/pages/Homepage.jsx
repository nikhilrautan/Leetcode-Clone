import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import { logoutUser } from "../store/authSlice";

const difficultyColor = (d) => {
  const level = (d || "").toLowerCase();
  if (level === "easy") return "badge-success";
  if (level === "medium") return "badge-warning";
  return "badge-error";
};

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    difficulty: "all",
    tag: "all",
  });

  useEffect(() => {
    const fetchData = async () => {
      // Adjust these URLs to match your backend routes
      const [allRes, solvedRes] = await Promise.allSettled([
        axiosClient.get("/problem/getAllProblem"),
        axiosClient.get("/problem/problemSolvedByUser"),
      ]);

      if (allRes.status === "fulfilled") {
        setProblems(allRes.value.data);
      } else {
        setError("Could not load problems");
      }
      if (solvedRes.status === "fulfilled") {
        setSolvedProblems(solvedRes.value.data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const isSolved = (id) => solvedProblems.some((sp) => sp._id === id);

  const allTags = [...new Set(problems.map((p) => p.tags).filter(Boolean))];

  const filteredProblems = problems.filter((p) => {
    const difficultyMatch =
      filters.difficulty === "all" ||
      (p.difficulty || "").toLowerCase() === filters.difficulty;
    const tagMatch = filters.tag === "all" || p.tags === filters.tag;
    const statusMatch =
      filters.status === "all" ||
      (filters.status === "solved" ? isSolved(p._id) : !isSolved(p._id));
    return difficultyMatch && tagMatch && statusMatch;
  });

  const updateFilter = (key) => (e) =>
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-md px-4">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl">
            Leetcode
          </Link>
        </div>
        <div className="flex-none gap-2">
          {user?.role === "admin" && (
            <Link to="/admin" className="btn btn-outline btn-sm">
              Admin
            </Link>
          )}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              {user?.firstName}
            </div>
            <ul
              tabIndex={0}
              className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-40 z-10"
            >
              <li>
                <button onClick={() => dispatch(logoutUser())}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-4 max-w-5xl">
        <h2 className="text-2xl font-bold mb-4">Problems</h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            className="select select-bordered"
            value={filters.status}
            onChange={updateFilter("status")}
          >
            <option value="all">All Problems</option>
            <option value="solved">Solved</option>
            <option value="unsolved">Unsolved</option>
          </select>

          <select
            className="select select-bordered"
            value={filters.difficulty}
            onChange={updateFilter("difficulty")}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            className="select select-bordered"
            value={filters.tag}
            onChange={updateFilter("tag")}
          >
            <option value="all">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        {/* Problem list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : filteredProblems.length === 0 ? (
          <p className="text-center opacity-70 py-10">No problems found.</p>
        ) : (
          <div className="grid gap-4">
            {filteredProblems.map((problem) => (
              <div key={problem._id} className="card bg-base-100 shadow-md">
                <div className="card-body flex-row items-center justify-between">
                  <div>
                    <Link
                      to={`/problem/${problem._id}`}
                      className="card-title hover:text-primary"
                    >
                      {problem.title}
                    </Link>
                    <div className="flex gap-2 mt-2">
                      <span className={`badge ${difficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                      {problem.tags && (
                        <span className="badge badge-info">{problem.tags}</span>
                      )}
                    </div>
                  </div>
                  {isSolved(problem._id) && (
                    <span className="badge badge-success badge-outline">
                      ✓ Solved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Homepage;