import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import {
  FileText,
  BookOpen,
  Lightbulb,
  History,
  Sparkles,
  Play,
  Send,
  Terminal,
  CheckCircle2,
  XCircle,
  Code2,
  Clock,
  MemoryStick,
} from 'lucide-react';
import axiosClient from "../utils/axiosClient"
import SubmissionHistory from "../components/SubmissionHistory"
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

const leftTabs = [
  { id: 'description', label: 'Description', icon: FileText },
  { id: 'editorial', label: 'Editorial', icon: BookOpen },
  { id: 'solutions', label: 'Solutions', icon: Lightbulb },
  { id: 'submissions', label: 'Submissions', icon: History },
  { id: 'chatAI', label: 'ChatAI', icon: Sparkles },
];

const rightTabs = [
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'testcase', label: 'Testcase', icon: Terminal },
  { id: 'result', label: 'Result', icon: CheckCircle2 },
];

// Pull a readable message out of an axios error (instead of a generic string)
const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data?.message) return data.message;
  if (data?.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
  if (error?.response?.status) return `Request failed with status ${error.response.status}`;
  return error?.message || 'Something went wrong. Please try again.';
};

// Backend may send examples under different names; support the common ones
const getExamples = (problem) =>
  problem?.visibleTestCases ??
  problem?.visibleTestcases ??
  problem?.examples ??
  [];

// Small presentational helper for one test case row
const TestCaseCard = ({ tc, index, passed }) => (
  <div className="rounded-box border border-base-300 bg-base-100 p-3">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-sm font-medium">Case {index + 1}</span>
      <span
        className={`badge badge-soft badge-sm gap-1 ${passed ? 'badge-success' : 'badge-error'}`}
      >
        {passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
        {passed ? 'Passed' : 'Failed'}
      </span>
    </div>
    <div className="space-y-1.5 font-mono text-xs">
      <div className="rounded bg-base-200 px-2 py-1.5">
        <span className="text-base-content/50">Input </span>
        <span className="whitespace-pre-wrap break-all">{tc.stdin}</span>
      </div>
      <div className="rounded bg-base-200 px-2 py-1.5">
        <span className="text-base-content/50">Expected </span>
        <span className="whitespace-pre-wrap break-all">{tc.expected_output}</span>
      </div>
      <div className="rounded bg-base-200 px-2 py-1.5">
        <span className="text-base-content/50">Output </span>
        <span className="whitespace-pre-wrap break-all">{tc.stdout}</span>
      </div>
    </div>
  </div>
);

const StatTile = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-box border border-base-300 bg-base-100 px-4 py-3">
    <Icon size={18} className="text-base-content/50" />
    <div>
      <div className="text-xs text-base-content/60">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  </div>
);

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let { problemId } = useParams();

  // UI-only: follow the theme set by the app layout (for the Monaco editor)
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'codedark'
  );

  useEffect(() => {
    const observer = new MutationObserver(() =>
      setTheme(document.documentElement.getAttribute('data-theme') || 'codedark')
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);

        // Debug: check what the backend actually returns for examples
        console.log('Problem data:', response.data);
        console.log('Examples found:', getExamples(response.data));

        const initialCode = response.data.startCode?.find(
          sc => sc.language?.toLowerCase() === langMap[selectedLanguage].toLowerCase()
        )?.initialCode || '';

        setProblem(response.data);
        setCode(initialCode);
        setLoading(false);
      } catch (error) {
        console.error(
          'Error fetching problem:',
          error.response?.status,
          error.response?.data || error.message
        );
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Update code when language changes
  useEffect(() => {
    if (problem) {
      const initialCode =
        problem.startCode?.find(
          (sc) => sc.language?.toLowerCase() === langMap[selectedLanguage]?.toLowerCase()
        )?.initialCode || '';

      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);

    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

      console.log('Run response:', response.data);
      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab('testcase');

    } catch (error) {
      console.error(
        'Error running code:',
        error.response?.status,
        error.response?.data || error.message
      );
      setRunResult({
        success: false,
        error: getErrorMessage(error)
      });

      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);

    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });

      console.log('Submit response:', response.data);
      setSubmitResult(response.data);
      setLoading(false);
      setActiveRightTab('result');

    } catch (error) {
      console.error(
        'Error submitting code:',
        error.response?.status,
        error.response?.data || error.message
      );
      // Show the failure in the Result tab instead of failing silently
      setSubmitResult({
        accepted: false,
        error: getErrorMessage(error),
        passedTestCases: 0,
        totalTestCases: 0
      });
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'hard': return 'badge-error';
      default: return 'badge-neutral';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-200">
        <span className="loading loading-dots loading-lg text-primary"></span>
      </div>
    );
  }

  const examples = getExamples(problem);
  const tags = Array.isArray(problem?.tags) ? problem.tags : problem?.tags ? [problem.tags] : [];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-base-200">

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-2 lg:flex-row">
        {/* Left Panel */}
        <section className="surface-card flex min-h-[28rem] min-w-0 flex-1 flex-col overflow-hidden lg:min-h-0 lg:w-1/2">
          {/* Left Tabs */}
          <div className="tabs tabs-border shrink-0 overflow-x-auto border-b border-base-300 bg-base-200/60 px-2">
            {leftTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`tab gap-2 whitespace-nowrap ${activeLeftTab === id ? 'tab-active' : ''}`}
                onClick={() => setActiveLeftTab(id)}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* Left Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {problem && (
              <>
                {activeLeftTab === 'description' && (
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">{problem.title}</h1>
                    <div className="mb-6 mt-3 flex flex-wrap items-center gap-2">
                      <span className={`badge badge-soft font-medium ${getDifficultyBadge(problem.difficulty)}`}>
                        {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                      </span>
                      {tags.map((tag) => (
                        <span key={tag} className="badge badge-soft badge-info">{tag}</span>
                      ))}
                    </div>

                    <div className="max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-base-content/90">
                      {problem.description}
                    </div>

                    <div className="mt-8">
                      <h3 className="mb-4 text-lg font-semibold">Examples</h3>
                      <div className="space-y-4">
                        {examples.length === 0 ? (
                          <div className="rounded-box border border-dashed border-base-300 p-6 text-center text-sm text-base-content/60">
                            No examples have been added for this problem yet.
                          </div>
                        ) : (
                          examples.map((example, index) => (
                            <div key={index} className="rounded-box border border-base-300 bg-base-200 p-4">
                              <h4 className="mb-3 text-sm font-semibold text-warning">Example {index + 1}</h4>
                              <div className="space-y-2 font-mono text-sm">
                                <div>
                                  <span className="text-base-content/50">Input: </span>
                                  <span className="whitespace-pre-wrap">{example.input}</span>
                                </div>
                                <div>
                                  <span className="text-base-content/50">Output: </span>
                                  <span className="whitespace-pre-wrap">{example.output}</span>
                                </div>
                                {example.explanation && (
                                  <div>
                                    <span className="text-base-content/50">Explanation: </span>
                                    {example.explanation}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeLeftTab === 'editorial' && (
                  <div>
                    <h2 className="mb-4 text-xl font-bold">Editorial</h2>
                    <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration} />
                  </div>
                )}

                {activeLeftTab === 'solutions' && (
                  <div>
                    <h2 className="mb-4 text-xl font-bold">Solutions</h2>
                    <div className="space-y-6">
                      {problem.referenceSolution?.map((solution, index) => (
                        <div key={index} className="overflow-hidden rounded-box border border-base-300">
                          <div className="border-b border-base-300 bg-base-200 px-4 py-2">
                            <h3 className="text-sm font-semibold">{problem?.title} - {solution?.language}</h3>
                          </div>
                          <div className="p-4">
                            <pre className="overflow-x-auto rounded bg-base-300 p-4 font-mono text-sm">
                              <code>{solution?.completeCode}</code>
                            </pre>
                          </div>
                        </div>
                      )) || <p className="text-base-content/60">Solutions will be available after you solve the problem.</p>}
                    </div>
                  </div>
                )}

                {activeLeftTab === 'submissions' && (
                  <div>
                    <h2 className="mb-4 text-xl font-bold">My Submissions</h2>
                    <SubmissionHistory problemId={problemId} />
                  </div>
                )}

                {activeLeftTab === 'chatAI' && (
                  <div>
                    <h2 className="mb-4 text-xl font-bold">Chat with AI</h2>
                    <ChatAi problem={problem}></ChatAi>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Right Panel */}
        <section className="surface-card flex min-h-[32rem] min-w-0 flex-1 flex-col overflow-hidden lg:min-h-0 lg:w-1/2">
          {/* Right Tabs */}
          <div className="tabs tabs-border shrink-0 border-b border-base-300 bg-base-200/60 px-2">
            {rightTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`tab gap-2 ${activeRightTab === id ? 'tab-active' : ''}`}
                onClick={() => setActiveRightTab(id)}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* Right Content */}
          <div className="flex min-h-0 flex-1 flex-col">
            {activeRightTab === 'code' && (
              <div className="flex min-h-0 flex-1 flex-col">
                {/* Language Selector */}
                <div className="flex items-center justify-between border-b border-base-300 px-4 py-2">
                  <div className="flex gap-2">
                    {['javascript', 'java', 'cpp'].map((lang) => (
                      <button
                        key={lang}
                        className={`btn btn-sm rounded-full ${selectedLanguage === lang ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => handleLanguageChange(lang)}
                      >
                        {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monaco Editor */}
                <div className="min-h-64 flex-1">
                  <Editor
                    height="100%"
                    language={getLanguageForMonaco(selectedLanguage)}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    beforeMount={(monaco) =>
                      monaco.editor.defineTheme('smart-dark', {
                        base: 'vs-dark',
                        inherit: true,
                        rules: [],
                        colors: { 'editor.background': '#0a0b0d' },
                      })
                    }
                    theme={theme === 'codedark' ? 'smart-dark' : 'light'}
                    options={{
                      fontSize: 14,
                      fontFamily: "'JetBrains Mono', monospace",
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      glyphMargin: false,
                      folding: true,
                      lineDecorationsWidth: 10,
                      lineNumbersMinChars: 3,
                      renderLineHighlight: 'line',
                      selectOnLineNumbers: true,
                      roundedSelection: false,
                      readOnly: false,
                      cursorStyle: 'line',
                      mouseWheelZoom: true,
                      padding: { top: 12 },
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between border-t border-base-300 bg-base-200/60 px-4 py-3">
                  <button
                    className="btn btn-ghost btn-sm gap-2"
                    onClick={() => setActiveRightTab('testcase')}
                  >
                    <Terminal size={15} />
                    Console
                  </button>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-outline btn-sm gap-2"
                      onClick={handleRun}
                      disabled={loading}
                    >
                      {loading ? <span className="loading loading-spinner loading-xs" /> : <Play size={15} />}
                      Run
                    </button>
                    <button
                      className="btn btn-primary btn-sm gap-2"
                      onClick={handleSubmitCode}
                      disabled={loading}
                    >
                      {loading ? <span className="loading loading-spinner loading-xs" /> : <Send size={15} />}
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeRightTab === 'testcase' && (
              <div className="flex-1 overflow-y-auto p-4">
                <h3 className="mb-4 font-semibold">Test Results</h3>
                {runResult ? (
                  <div className="space-y-4">
                    {runResult.success ? (
                      <div className="flex items-center gap-2 text-lg font-semibold text-success">
                        <CheckCircle2 size={22} />
                        All test cases passed
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-lg font-semibold text-error">
                        <XCircle size={22} className="mt-0.5 shrink-0" />
                        <span className="whitespace-pre-wrap break-words">
                          {runResult.error || 'Some test cases failed'}
                        </span>
                      </div>
                    )}

                    {runResult.success && (
                      <div className="grid grid-cols-2 gap-3">
                        <StatTile icon={Clock} label="Runtime" value={runResult.runtime + " sec"} />
                        <StatTile icon={MemoryStick} label="Memory" value={runResult.memory + " KB"} />
                      </div>
                    )}

                    <div className="space-y-3">
                      {(runResult.testCases ?? []).map((tc, i) => (
                        <TestCaseCard
                          key={i}
                          tc={tc}
                          index={i}
                          passed={runResult.success ? true : tc.status_id == 3}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-box border border-dashed border-base-300 p-6 text-center text-sm text-base-content/60">
                    Click "Run" to test your code with the example test cases.
                  </div>
                )}
              </div>
            )}

            {activeRightTab === 'result' && (
              <div className="flex-1 overflow-y-auto p-4">
                <h3 className="mb-4 font-semibold">Submission Result</h3>
                {submitResult ? (
                  <div className="space-y-4">
                    {submitResult.accepted ? (
                      <div className="flex items-center gap-2 text-xl font-bold text-success">
                        <CheckCircle2 size={24} />
                        Accepted
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-xl font-bold text-error">
                        <XCircle size={24} className="mt-0.5 shrink-0" />
                        <span className="whitespace-pre-wrap break-words">
                          {submitResult.error || 'Submission failed'}
                        </span>
                      </div>
                    )}

                    <div className="rounded-box border border-base-300 bg-base-100 px-4 py-3">
                      <div className="mb-2 flex items-baseline justify-between text-sm">
                        <span className="font-medium">Test cases passed</span>
                        <span className="text-base-content/60">
                          {submitResult.passedTestCases ?? 0}/{submitResult.totalTestCases ?? 0}
                        </span>
                      </div>
                      <progress
                        className={`progress w-full ${submitResult.accepted ? 'progress-success' : 'progress-error'}`}
                        value={submitResult.passedTestCases ?? 0}
                        max={submitResult.totalTestCases || 1}
                      ></progress>
                    </div>

                    {submitResult.accepted && (
                      <div className="grid grid-cols-2 gap-3">
                        <StatTile icon={Clock} label="Runtime" value={submitResult.runtime + " sec"} />
                        <StatTile icon={MemoryStick} label="Memory" value={submitResult.memory + " KB"} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-box border border-dashed border-base-300 p-6 text-center text-sm text-base-content/60">
                    Click "Submit" to submit your solution for evaluation.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProblemPage;