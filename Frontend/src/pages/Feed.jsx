import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Heart, Trash2, CircleAlert } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
};

function Feed() {
  const me = useSelector((s) => s.auth.user);
  const isAdmin = me?.role === 'admin';

  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await axiosClient.get('/feed');
      setPosts(Array.isArray(data) ? data : data.posts || []);
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load the feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createPost = async () => {
    if (!content.trim() || posting) return;
    setPosting(true);
    try {
      await axiosClient.post('/post', { content: content.trim() });
      setContent('');
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not post');
    } finally {
      setPosting(false);
    }
  };

  const like = async (id) => {
    try {
      await axiosClient.post(`/post/${id}/like`);
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not like the post');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await axiosClient.delete(`/post/${id}`);
      setPosts((list) => list.filter((p) => p._id !== id));
    } catch (e) {
      setError(e.response?.data?.message || 'Could not delete the post');
    }
  };

  return (
    <div className="page-container max-w-2xl space-y-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Feed</h1>

      <div className="surface-card space-y-3 p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Share your progress..."
          className="w-full resize-none bg-transparent outline-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-base-content/50">{content.length}/500</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={createPost}
            disabled={!content.trim() || posting}
          >
            {posting ? <span className="loading loading-spinner loading-xs" /> : 'Post'}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="alert alert-soft alert-error text-sm">
          <CircleAlert size={16} /> <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-10">
          <span className="loading loading-dots loading-lg text-primary" />
        </div>
      )}

      {!loading && !posts.length && !error && (
        <p className="py-10 text-center text-base-content/50">No posts yet. Be the first to share.</p>
      )}

      {posts.map((p) => {
        const author = p.userId?.firstName || 'Unknown user';
        const mine = p.userId?._id === me?._id;
        const liked = p.likes?.includes(me?._id);

        return (
          <article key={p._id} className="surface-card p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary">
                {author[0]?.toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-semibold">{author}</span>
                    {mine && <span className="badge badge-soft badge-primary badge-sm ml-2">You</span>}
                    <span className="ml-2 text-xs text-base-content/50">{timeAgo(p.createdAt)}</span>
                  </div>

                  {(mine || isAdmin) && (
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => remove(p._id)}
                      aria-label="Delete post"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <p className="mt-1 whitespace-pre-wrap break-words">{p.content}</p>

                <button
                  onClick={() => like(p._id)}
                  className={`mt-3 flex items-center gap-1.5 text-sm ${liked ? 'text-error' : 'text-base-content/60'}`}
                  aria-label="Like post"
                >
                  <Heart size={15} fill={liked ? 'currentColor' : 'none'} /> {p.likes?.length || 0}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default Feed;