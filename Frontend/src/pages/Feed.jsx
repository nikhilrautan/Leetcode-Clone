import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await axiosClient.get('/feed');
      setPosts(Array.isArray(data) ? data : data.posts || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createPost = async () => {
    if (!content.trim()) return;
    try {
      await axiosClient.post('/post', { content });
      setContent('');
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not post');
    }
  };

  const like = async (id) => {
    await axiosClient.post(`/post/${id}/like`);
    load();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Feed</h1>

      <div className="rounded-xl border border-white/10 bg-[#0a0c10] p-4 space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
          placeholder="Share your progress..."
          className="w-full bg-transparent text-white outline-none resize-none"
          rows={3}
        />
        <button onClick={createPost}
          className="bg-green-500 text-black font-medium px-4 py-2 rounded-lg">
          Post
        </button>
      </div>

      {error && <p className="text-red-400">{error}</p>}
      {loading && <p className="text-gray-400">Loading...</p>}

      {posts.map((p) => (
        <div key={p._id} className="rounded-xl border border-white/10 bg-[#0a0c10] p-4">
          <p className="text-sm text-gray-400">{p.userId?.firstName || 'User'}</p>
          <p className="text-white mt-1">{p.content}</p>
          <button onClick={() => like(p._id)} className="mt-3 text-sm text-green-400">
            ♥ {p.likes?.length || 0}
          </button>
        </div>
      ))}
    </div>
  );
}