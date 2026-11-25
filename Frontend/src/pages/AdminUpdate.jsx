import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { ArrowLeft, Pencil, CircleAlert, Inbox } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const getDifficultyBadge = (d) => {
  switch (d?.toLowerCase()) {
    case 'easy': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'hard': return 'badge-error';
    default: return 'badge-neutral';
  }
};

export default function AdminUpdate() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to fetch problems');
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
          <h1 className="text-3xl font-bold tracking-tight">Update problems</h1>
          <p className="mt-1 text-base-content/60">Pick a problem to edit its details, test cases and code.</p>
        </div>

        {error && (
          <div role="alert" className="alert alert-soft alert-error mb-6">
            <CircleAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        {problems.length === 0 ? (
          <div className="surface-card flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Inbox size={36} className="text-base-content/40" />
            <p className="font-semibold">No problems to update</p>
          </div>
        ) : (
          <div className="surface-card overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-base-200">
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Tags</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p, i) => (
                  <tr key={p._id} className="hover:bg-base-200/60">
                    <th className="font-normal text-base-content/50">{i + 1}</th>
                    <td className="font-medium">{p.title}</td>
                    <td>
                      <span className={`badge badge-soft font-medium capitalize ${getDifficultyBadge(p.difficulty)}`}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(p.tags) ? p.tags : [p.tags]).filter(Boolean).map((t) => (
                          <span key={t} className="badge badge-soft badge-info">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="text-right">
                      <NavLink to={`/admin/update/${p._id}`} className="btn btn-ghost btn-sm gap-1.5 text-warning">
                        <Pencil size={15} />
                        Edit
                      </NavLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}