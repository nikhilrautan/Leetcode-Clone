import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Users, Copy, Check, CircleAlert, Plus, LogIn } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

function Group() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const load = async () => {
    try {
      const { data } = await axiosClient.get('/group');
      setGroups(Array.isArray(data) ? data : data.groups || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name.trim()) return;
    setError('');
    try {
      await axiosClient.post('/group', { name });
      setName('');
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not create the group');
    }
  };

  const join = async () => {
    if (!code.trim()) return;
    setError('');
    try {
      await axiosClient.post('/group/join', { inviteCode: code });
      setCode('');
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not join the group');
    }
  };

  const copyCode = async (c) => {
    try {
      await navigator.clipboard.writeText(c);
      setCopied(c);
      setTimeout(() => setCopied(''), 1500);
    } catch { /* clipboard blocked */ }
  };

  return (
    <div className="page-container max-w-3xl space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Groups</h1>
        <p className="mt-1 text-sm text-base-content/60">
          Practise with friends or classmates. Create a group, share its invite code and compare progress on a leaderboard.
        </p>
      </div>

      {error && (
        <div role="alert" className="alert alert-soft alert-error text-sm">
          <CircleAlert size={16} /> <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="surface-card space-y-3 p-4">
          <h2 className="flex items-center gap-2 font-semibold"><Plus size={16} className="text-primary" /> Create a group</h2>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Group name"
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && create()}
            />
            <button className="btn btn-primary" onClick={create} disabled={!name.trim()}>Create</button>
          </div>
        </div>

        <div className="surface-card space-y-3 p-4">
          <h2 className="flex items-center gap-2 font-semibold"><LogIn size={16} className="text-primary" /> Join with a code</h2>
          <div className="flex gap-2">
            <input
              className="input flex-1 uppercase"
              placeholder="Invite code"
              value={code}
              maxLength={6}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && join()}
            />
            <button className="btn btn-primary" onClick={join} disabled={!code.trim()}>Join</button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-8"><span className="loading loading-dots loading-lg text-primary" /></div>
      )}

      {!loading && !groups.length && (
        <div className="surface-card flex flex-col items-center gap-2 py-12 text-center">
          <Users size={36} className="text-base-content/40" />
          <p className="font-semibold">You are not in any group yet</p>
          <p className="max-w-sm text-sm text-base-content/60">
            Create one above and send the invite code to your friends, or enter a code someone shared with you.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {groups.map((g) => (
          <div key={g._id} className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
            <Link to={`/group/${g._id}`} className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-semibold hover:text-primary">
                {g.name}
                {g.isOwner && <span className="badge badge-soft badge-primary badge-sm">Owner</span>}
              </p>
              <p className="text-sm text-base-content/60">
                {g.memberCount ?? g.members?.length ?? 0} members
              </p>
            </Link>

            <div className="flex items-center gap-2">
              <button
                className="btn btn-sm btn-outline gap-1.5 font-mono"
                onClick={() => copyCode(g.inviteCode)}
                aria-label="Copy invite code"
              >
                {copied === g.inviteCode ? <Check size={14} /> : <Copy size={14} />} {g.inviteCode}
              </button>
              <Link to={`/group/${g._id}`} className="btn btn-sm btn-primary">Open</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Group;