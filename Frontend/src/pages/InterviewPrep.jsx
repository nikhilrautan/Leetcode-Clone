import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, CircleAlert } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const markdownComponents = {
  h1: (props) => <h1 className="mb-2 mt-4 text-xl font-bold" {...props} />,
  h2: (props) => <h2 className="mb-2 mt-4 text-lg font-bold" {...props} />,
  h3: (props) => <h3 className="mb-1.5 mt-3 text-base font-semibold" {...props} />,
  p: (props) => <p className="my-2 leading-relaxed" {...props} />,
  ul: (props) => <ul className="my-2 list-disc space-y-1 pl-6" {...props} />,
  ol: (props) => <ol className="my-2 list-decimal space-y-2 pl-6" {...props} />,
  strong: (props) => <strong className="font-semibold text-primary" {...props} />,
  code: (props) => (
    <code className="rounded bg-base-300 px-1.5 py-0.5 font-mono text-[0.85em]" {...props} />
  ),
  hr: () => <hr className="my-4 border-base-300" />,
};

function InterviewPrep() {
  const [role, setRole] = useState('');
  const [stack, setStack] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);

  const generate = async (e) => {
    e.preventDefault();

    const next = {};
    if (!role.trim()) next.role = 'Enter the role you are targeting';
    if (!stack.trim()) next.stack = 'Enter your tech stack';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    setError(null);
    setResult('');

    const prompt =
      `Act as a technical interviewer. Generate 10 interview questions with short model answers ` +
      `for a ${level.toLowerCase()} level ${role.trim()}. Tech stack: ${stack.trim()}. ` +
      `Format as a numbered list. Put the answer in a short paragraph under each question.`;

    try {
      const { data } = await axiosClient.post('/ai/chat', {
        messages: [{ role: 'user', parts: [{ text: prompt }] }],
        title: 'Interview preparation',
        description: `Interview questions for ${role.trim()}`,
        testCases: [],
        startCode: [],
      });
      setResult(data.message);
    } catch (err) {
      console.error('Interview prep error:', err);
      setError('Could not generate questions. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const showEmpty = !loading && !result && !error;

  return (
    <div className="page-container max-w-6xl py-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <section className="surface-card h-fit p-6 sm:p-8">
          <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Sparkles size={22} className="text-primary" />
            Interview prep <span className="text-primary">studio</span>
          </h1>

          <form onSubmit={generate} className="space-y-5" noValidate>
            <div>
              <label htmlFor="role" className="mb-1.5 block text-sm font-medium">
                Targeted role
              </label>
              <input
                id="role"
                className={`input w-full ${errors.role ? 'input-error' : ''}`}
                placeholder="Frontend developer, data scientist"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              {errors.role && (
                <span className="mt-1 block text-sm text-error">{errors.role}</span>
              )}
            </div>

            <div>
              <label htmlFor="stack" className="mb-1.5 block text-sm font-medium">
                Tech stack
              </label>
              <input
                id="stack"
                className={`input w-full ${errors.stack ? 'input-error' : ''}`}
                placeholder="React, Node.js, Python, AWS"
                value={stack}
                onChange={(e) => setStack(e.target.value)}
              />
              {errors.stack && (
                <span className="mt-1 block text-sm text-error">{errors.stack}</span>
              )}
            </div>

            <div>
              <label htmlFor="level" className="mb-1.5 block text-sm font-medium">
                Experience level
              </label>
              <select
                id="level"
                className="select w-full"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-full gap-2" disabled={loading}>
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <Sparkles size={16} />
              )}
              {loading ? 'Generating...' : 'Generate questions'}
            </button>
          </form>
        </section>

        {/* Result */}
        <section
          className={`surface-card relative min-h-[24rem] overflow-hidden ${
            showEmpty ? 'p-0' : 'p-6 sm:p-8'
          }`}
        >
          {error && (
            <div role="alert" className="alert alert-soft alert-error mb-4 text-sm">
              <CircleAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="flex h-full min-h-[18rem] flex-col items-center justify-center gap-3 text-base-content/60">
              <span className="loading loading-dots loading-lg text-primary"></span>
              <p className="text-sm">Preparing your questions</p>
            </div>
          )}

          {!loading && result && (
            <div className="text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {result}
              </ReactMarkdown>
            </div>
          )}

          {/* Empty state: background illustration, replaced by the answer */}
          {showEmpty && (
            <div className="relative h-full min-h-[24rem]">
              <img
                src="/interview-prep.png"
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-0 w-full p-6 text-center">
                <p className="font-semibold text-white">Ready when you are</p>
                <p className="mt-1 text-sm text-white/70">
                  Fill out the form to generate your practice questions.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default InterviewPrep;