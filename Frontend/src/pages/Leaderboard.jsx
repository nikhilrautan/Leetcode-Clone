import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Trophy } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const medal = ['🥇', '🥈', '🥉'];

function Leaderboard() {
  const me = useSelector((s) => s.auth.user);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosClient.get('/user/leaderboard');
        setRows(data);
      } catch (e) {
        setError(e.response?.data?.message || 'Could not load the leaderboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="page-container max-w-3xl py-8">
      <div className="mb-6 text-center">
        <h1 className="flex items-center justify-center gap-2 text-3xl font-bold tracking-tight">
          <Trophy className="text-warning" /> Leaderboard
        </h1>
        <p className="mt-1 text-base-content/60">Ranked by XP: easy 10, medium 20, hard 40.</p>
      </div>

      {error && <div role="alert" className="alert alert-soft alert-error mb-4 text-sm">{error}</div>}
      {loading && <div className="flex justify-center py-10"><span className="loading loading-dots loading-lg text-primary" /></div>}

      {!loading && !error && (
        <section className="surface-card overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th className="w-16">Rank</th>
                <th>Name</th>
                <th className="text-right">Solved</th>
                <th className="text-right">XP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r._id} className={r._id === me?._id ? 'bg-primary/10 font-semibold' : ''}>
                  <td>{medal[i] || i + 1}</td>
                  <td>{r.name}{r._id === me?._id && ' (you)'}</td>
                  <td className="text-right">{r.solved}</td>
                  <td className="text-right">{r.xp}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={4} className="py-8 text-center text-base-content/50">No one has solved a problem yet.</td></tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

export default Leaderboard;