import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';

export default function Group() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await axiosClient.get('/group');
      setGroups(Array.isArray(data) ? data : data.groups || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load groups');
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    try {
      await axiosClient.post('/group', { name });
      setName('');
      load();
    } catch (e) { setError(e.response?.data?.message || 'Create failed'); }
  };

  const join = async () => {
    try {
      await axiosClient.post('/group/join', { inviteCode: code });
      setCode('');
      load();
    } catch (e) { setError(e.response?.data?.message || 'Join failed'); }
  };

  const leave = async (id) => {
    await axiosClient.post(`/group/${id}/leave`);
    load();
  };

  const input = 'flex-1 bg-black border border-white/10 rounded-lg px-3 py-2 text-white';
  const btn = 'bg-green-500 text-black font-medium px-4 py-2 rounded-lg';

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Groups</h1>
      {error && <p className="text-red-400">{error}</p>}

      <div className="flex gap-2">
        <input className={input} value={name} onChange={e => setName(e.target.value)} placeholder="New group name" />
        <button className={btn} onClick={create}>Create</button>
      </div>
      <div className="flex gap-2">
        <input className={input} value={code} onChange={e => setCode(e.target.value)} placeholder="Invite code" />
        <button className={btn} onClick={join}>Join</button>
      </div>

      {groups.map(g => (
        <div key={g._id} className="rounded-xl border border-white/10 bg-[#0a0c10] p-4 flex justify-between items-center">
          <div>
            <p className="text-white font-semibold">{g.name}</p>
            <p className="text-sm text-gray-400">
              {g.members?.length || 0} members · code: {g.inviteCode}
            </p>
          </div>
          <button onClick={() => leave(g._id)} className="text-sm text-red-400">Leave</button>
        </div>
      ))}
    </div>
  );
}