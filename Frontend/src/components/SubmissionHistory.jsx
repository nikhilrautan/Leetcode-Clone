import { useState, useEffect } from 'react';
import { CircleAlert, Inbox, Code2, X, Clock, MemoryStick, CheckCircle2 } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        setSubmissions(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'badge-success';
      case 'wrong': return 'badge-error';
      case 'error': return 'badge-warning';
      case 'pending': return 'badge-info';
      default: return 'badge-neutral';
    }
  };

  const formatMemory = (memory) => {
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="loading loading-dots loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="alert alert-soft alert-error my-4">
        <CircleAlert size={18} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div>
      {submissions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-box border border-dashed border-base-300 px-6 py-12 text-center">
          <Inbox size={32} className="text-base-content/40" />
          <div>
            <p className="font-semibold">No submissions yet</p>
            <p className="text-sm text-base-content/60">
              Submit a solution and it will show up here.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-box border border-base-300">
            <table className="table w-full">
              <thead className="bg-base-200">
                <tr>
                  <th>#</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Runtime</th>
                  <th>Memory</th>
                  <th>Test cases</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, index) => (
                  <tr key={sub._id} className="hover:bg-base-200/60">
                    <td className="text-base-content/50">{index + 1}</td>
                    <td className="font-mono text-sm">{sub.language}</td>
                    <td>
                      <span className={`badge badge-soft font-medium ${getStatusColor(sub.status)}`}>
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap font-mono text-sm">{sub.runtime}sec</td>
                    <td className="whitespace-nowrap font-mono text-sm">{formatMemory(sub.memory)}</td>
                    <td className="font-mono text-sm">{sub.testCasesPassed}/{sub.testCasesTotal}</td>
                    <td className="whitespace-nowrap text-sm text-base-content/70">
                      {formatDate(sub.createdAt)}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm gap-1.5"
                        onClick={() => setSelectedSubmission(sub)}
                      >
                        <Code2 size={15} />
                        Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-sm text-base-content/60">
            Showing {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'}
          </p>
        </>
      )}

      {/* Code View Modal */}
      {selectedSubmission && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold">
                Submission details: {selectedSubmission.language}
              </h3>
              <button
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Close"
                onClick={() => setSelectedSubmission(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4">
              <div className="mb-2 flex flex-wrap gap-2">
                <span className={`badge badge-soft font-medium ${getStatusColor(selectedSubmission.status)}`}>
                  {selectedSubmission.status}
                </span>
                <span className="badge badge-outline gap-1">
                  <Clock size={12} />
                  {selectedSubmission.runtime}s
                </span>
                <span className="badge badge-outline gap-1">
                  <MemoryStick size={12} />
                  {formatMemory(selectedSubmission.memory)}
                </span>
                <span className="badge badge-outline gap-1">
                  <CheckCircle2 size={12} />
                  {selectedSubmission.testCasesPassed}/{selectedSubmission.testCasesTotal} passed
                </span>
              </div>

              {selectedSubmission.errorMessage && (
                <div role="alert" className="alert alert-soft alert-error mt-3 text-sm">
                  <CircleAlert size={16} />
                  <span className="whitespace-pre-wrap break-words">
                    {selectedSubmission.errorMessage}
                  </span>
                </div>
              )}
            </div>

            <pre className="max-h-[50vh] overflow-auto rounded-box bg-[#0d1117] p-4 font-mono text-sm leading-relaxed text-gray-100">
              <code>{selectedSubmission.code}</code>
            </pre>

            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedSubmission(null)}>
                Close
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setSelectedSubmission(null)}
          ></div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;