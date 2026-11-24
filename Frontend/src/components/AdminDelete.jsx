import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { ArrowLeft, Trash2, CircleAlert, TriangleAlert, X, Inbox, RefreshCw } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

// Pull a readable message out of an axios error
const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data?.message) return data.message;
  return fallback;
};

const getDifficultyBadge = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'hard': return 'badge-error';
    default: return 'badge-neutral';
  }
};

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchFailed, setFetchFailed] = useState(false);

  // Confirm dialog state
  const [problemToDelete, setProblemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      setFetchFailed(false);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchFailed(true);
      setError(getErrorMessage(err, 'Failed to fetch problems'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeleting(true);
      setError(null);
      await axiosClient.delete(`/problem/delete/${id}`);
      setProblems((prev) => prev.filter((problem) => problem._id !== id));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete problem'));
      console.error(err);
    } finally {
      setDeleting(false);
      setProblemToDelete(null);
    }
  };

  const getTags = (problem) =>
    Array.isArray(problem.tags) ? problem.tags : problem.tags ? [problem.tags] : [];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-200">
        <span className="loading loading-dots loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="page-container py-8">
        <NavLink to="/admin" className="btn btn-ghost btn-sm mb-6 gap-1.5">
          <ArrowLeft size={16} />
          Back to admin
        </NavLink>

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Delete problems</h1>
          <p className="mt-1 text-base-content/60">
            Deleting a problem removes it from the platform for everyone.
          </p>
        </div>

        {error && (
          <div role="alert" className="alert alert-soft alert-error mb-6">
            <CircleAlert size={18} />
            <span className="flex-1">{error}</span>
            <button
              className="btn btn-ghost btn-xs btn-circle"
              aria-label="Dismiss"
              onClick={() => setError(null)}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {problems.length === 0 ? (
          <div className="surface-card flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Inbox size={36} className="text-base-content/40" />
            <p className="font-semibold">
              {fetchFailed ? 'Could not load problems' : 'No problems to delete'}
            </p>
            {fetchFailed && (
              <button className="btn btn-outline btn-sm gap-1.5" onClick={fetchProblems}>
                <RefreshCw size={15} />
                Retry
              </button>
            )}
          </div>
        ) : (
          <div className="surface-card overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-base-200">
                <tr>
                  <th className="w-1/12">#</th>
                  <th className="w-4/12">Title</th>
                  <th className="w-2/12">Difficulty</th>
                  <th className="w-3/12">Tags</th>
                  <th className="w-2/12 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem, index) => (
                  <tr key={problem._id} className="hover:bg-base-200/60">
                    <th className="font-normal text-base-content/50">{index + 1}</th>
                    <td className="font-medium">{problem.title}</td>
                    <td>
                      <span
                        className={`badge badge-soft font-medium capitalize ${getDifficultyBadge(
                          problem.difficulty
                        )}`}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {getTags(problem).map((tag) => (
                          <span key={tag} className="badge badge-soft badge-info">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => setProblemToDelete(problem)}
                        className="btn btn-ghost btn-sm gap-1.5 text-error hover:bg-error/10"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      {problemToDelete && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex items-start gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-error/15 text-error">
                <TriangleAlert size={20} />
              </span>
              <div>
                <h3 className="text-lg font-bold">Delete this problem?</h3>
                <p className="mt-1 text-sm text-base-content/70">
                  "{problemToDelete.title}" will be permanently removed. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setProblemToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-error gap-2"
                onClick={() => handleDelete(problemToDelete._id)}
                disabled={deleting}
              >
                {deleting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Trash2 size={15} />
                )}
                Delete problem
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => !deleting && setProblemToDelete(null)}
          ></div>
        </div>
      )}
    </div>
  );
};

export default AdminDelete;