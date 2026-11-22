import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { ArrowLeft, Copy, Check, Trophy, CircleAlert } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const medal = ['🥇', '🥈', '🥉'];

function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const me = useSelector((s) => s.auth.user);

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosClient.get(`/group/${id}`);
        setGroup(data);
      } catch (e) {
        setError(e.response?.data?.message || 'Could not load this group');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(group.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard blocked */ }
  };

  const leave = async () => {
    if (!window.confirm('Leave this group?')) return;
    try {
      await axiosClient.post(`/group/${id}/leave`);
      navigate('/group');
    } catch (e) {
      setError(e.response?.data?.message || 'Could not leave the group');
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this group for everyone? This cannot be undone.')) return;
    try {
      await axiosClient.delete(`/group/${id}`);
      navigate('/group');
    } catch (e) {
      setError(e.response?.data?.message || 'Could not delete the group');
    }
  };

  return (
    <div className="page-container max-w-3xl space-y-6 py-8">
      <Link to="/group" className="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-primary">
        <ArrowLeft size={14} /> All groups
      </Link>

      {error && (
        <div role="alert" className="alert alert-soft alert-error text-sm">
          <CircleAlert size={16} /> <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-10"><span className="loading loading-dots loading-lg text-primary" /></div>
      )}

      {group && (
        <>
          <div className="surface-card flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
              {group.description && <p className="mt-1 text-sm text-base-content/60">{group.description}</p>}
              <p className="mt-1 text-sm text-base-content/60">{group.members.length} members</p>
            </div>
            <div className="text-right">
              <p className="mb-1 text-xs text-base-content/50">Invite code</p>
              <button className="btn btn-outline gap-2 font-mono" onClick={copyCode}>
                {copied ? <Check size={14} /> : <Copy size={14} />} {group.inviteCode}
              </button>
            </div>
          </div>

          <section className="surface-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-base-300 px-5 py-3 font-semibold">
              <Trophy size={16} className="text-warning" /> Group leaderboard
            </div>
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
                {group.members.map((m, i) => (
                  <tr key={m._id} className={m._id === me?._id ? 'bg-primary/10 font-semibold' : ''}>
                    <td>{medal[i] || i + 1}</td>
                    <td>
                      {m.name}
                      {m._id === me?._id && ' (you)'}
                      {m.isOwner && <span className="badge badge-soft badge-primary badge-sm ml-2">Owner</span>}
                    </td>
                    <td className="text-right">{m.solved}</td>
                    <td className="text-right">{m.xp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="flex justify-end">
            {group.isOwner ? (
              <button className="btn btn-outline btn-error btn-sm" onClick={remove}>Delete group</button>
            ) : (
              <button className="btn btn-outline btn-sm" onClick={leave}>Leave group</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default GroupDetail;