import { useEffect, useMemo, useState } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle,
  Copy, Check, Wand2, StepBack, StepForward, RotateCcw,
  Eye, Layers, Terminal, Code2, CircleAlert,
} from 'lucide-react';


const SAMPLE_JS = `function addTwoNumbers(a, b) {
  let result = 0;
  console.log("Starting addition...");

  for (let i = 0; i < 3; i++) {
    result += i;
    console.log("Loop iteration:", i, "Result so far:", result);
  }

  result = a + b;
  console.log("Final result:", result);
  return result;
}

// Test the function
addTwoNumbers(10, 20);`;

const SAMPLE_CPP = `#include <iostream>
using namespace std;

int addTwoNumbers(int a, int b) {
  int result = 0;
  for (int i = 0; i < 3; i++) {
    result += i;
  }
  return a + b;
}

int main() {
  cout << addTwoNumbers(10, 20);
  return 0;
}`;

const MAX_STEPS = 3000;

const fmt = (v) => {
  try {
    if (typeof v === 'string') return JSON.stringify(v);
    if (typeof v === 'object' && v !== null) return JSON.stringify(v).slice(0, 200);
    return String(v);
  } catch {
    return '[object]';
  }
};

// JS tracer: parse with acorn, insert a hook before every statement, run in the browser
function collectNames(node, set) {
  if (!node || typeof node.type !== 'string') return;
  if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier') set.add(node.id.name);
  if (node.type === 'FunctionDeclaration') {
    if (node.id) set.add(node.id.name);
    return;
  }
  if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') return;
  for (const k in node) {
    const c = node[k];
    if (Array.isArray(c)) c.forEach((x) => collectNames(x, set));
    else if (c && typeof c.type === 'string') collectNames(c, set);
  }
}

function instrument(code) {
  const ast = parse(code, { ecmaVersion: 2022, locations: true });
  const inserts = [];
  const snap = (chain) => {
    const names = [...new Set(chain.flatMap((s) => [...s]))];
    return `[${names.map((n) => `[${JSON.stringify(n)},()=>${n}]`).join(',')}]`;
  };

  const walk = (node, chain) => {
    if (!node || typeof node.type !== 'string') return;
    let c = chain;
    if (/^(FunctionDeclaration|FunctionExpression|ArrowFunctionExpression)$/.test(node.type)) {
      const own = new Set();
      node.params.forEach((p) => {
        if (p.type === 'Identifier') own.add(p.name);
        else if (p.type === 'AssignmentPattern' && p.left.type === 'Identifier') own.add(p.left.name);
      });
      collectNames(node.body, own);
      c = [...chain, own];
      if (node.body.type === 'BlockStatement') {
        const name = node.id?.name || 'anonymous';
        inserts.push({ pos: node.body.start + 1, text: `__enter(${JSON.stringify(name)});try{` });
        inserts.push({ pos: node.body.end - 1, text: '}finally{__exit();}' });
      }
    }
    if (node.type === 'BlockStatement' || node.type === 'Program') {
      node.body.forEach((s) =>
        inserts.push({ pos: s.start, text: `__t(${s.loc.start.line},${snap(c)});` })
      );
    }
    for (const k in node) {
      const ch = node[k];
      if (Array.isArray(ch)) ch.forEach((x) => walk(x, c));
      else if (ch && typeof ch.type === 'string') walk(ch, c);
    }
  };

  const root = new Set();
  collectNames(ast, root);
  walk(ast, [root]);

  inserts.sort((a, b) => a.pos - b.pos);
  let out = '';
  let last = 0;
  for (const ins of inserts) {
    out += code.slice(last, ins.pos) + ins.text;
    last = ins.pos;
  }
  return out + code.slice(last);
}

function traceJS(code) {
  const steps = [];
  const logs = [];
  const stack = ['global'];
  let error = null;

  const __t = (line, getters) => {
    if (steps.length >= MAX_STEPS)
      throw new Error(`Stopped after ${MAX_STEPS} steps (possible infinite loop).`);
    const vars = [];
    for (const [name, get] of getters) {
      try {
        const v = get();
        if (typeof v !== 'function') vars.push([name, fmt(v)]);
      } catch {
        /* not initialised yet */
      }
    }
    steps.push({ line, vars, stack: [...stack], logCount: logs.length });
  };
  const fakeConsole = {
    log: (...a) => logs.push(a.map((x) => (typeof x === 'string' ? x : fmt(x))).join(' ')),
  };

  try {
    const src = instrument(code);
    new Function('__t', '__enter', '__exit', 'console', src)(
      __t,
      (n) => stack.push(n),
      () => stack.pop(),
      fakeConsole
    );
  } catch (e) {
    error = e.message;
  }
  return { steps, logs, error };
}

function CodeVisualiser() {
  const [lang, setLang] = useState('javascript');
  const [codes, setCodes] = useState({ javascript: SAMPLE_JS, cpp: SAMPLE_CPP });
  const [trace, setTrace] = useState(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(40);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');

  const code = codes[lang];
  const steps = trace?.steps || [];
  const step = steps[idx];
  const lines = code.split('\n');
  const running = !!trace && steps.length > 0;

  useEffect(() => {
    if (!playing) return;
    if (idx >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setIdx((i) => i + 1), 1000 - speed * 9);
    return () => clearTimeout(t);
  }, [playing, idx, steps.length, speed]);

  const visibleLogs = useMemo(
    () => (trace && step ? trace.logs.slice(0, step.logCount) : []),
    [trace, step]
  );

  const reset = () => {
    setTrace(null);
    setIdx(0);
    setPlaying(false);
    setNotice('');
  };

  const parseAndSetup = () => {
    setNotice('');
    setPlaying(false);
    if (lang === 'cpp') {
      setNotice('C++ cannot run in the browser. It needs a backend that compiles and traces the code.');
      return;
    }
    setTrace(traceJS(code));
    setIdx(0);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Multi-language DSA code visualiser</h2>
        <p className="mt-1 text-base-content/60">
          Write DSA code in JavaScript or C++ and see the execution flow
        </p>
      </div>

      <div className="mb-6 flex justify-center">
        <div className="join">
          {[
            ['javascript', 'JavaScript'],
            ['cpp', 'C++'],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => {
                setLang(k);
                reset();
              }}
              className={`btn join-item ${lang === k ? 'btn-primary' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <section className="surface-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-base-300 px-4 py-3">
            <span className="flex items-center gap-2 font-semibold">
              <Code2 size={16} className="text-primary" />
              {lang === 'javascript' ? 'JavaScript' : 'C++'} editor
            </span>
            <div className="flex gap-2">
              <button className="btn btn-sm gap-1" onClick={copy}>
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
              </button>
              <button className="btn btn-sm btn-primary gap-1" onClick={parseAndSetup}>
                <Wand2 size={14} /> Parse &amp; setup
              </button>
            </div>
          </div>

          <div className="flex max-h-[34rem] overflow-auto bg-black/40 font-mono text-sm leading-6">
            <div className="select-none py-3 pl-3 pr-3 text-right text-base-content/40">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            {running ? (
              <pre className="flex-1 py-3 pr-4">
                {lines.map((l, i) => (
                  <div key={i} className={step?.line === i + 1 ? 'bg-primary/20 text-primary' : ''}>
                    {l || ' '}
                  </div>
                ))}
              </pre>
            ) : (
              <textarea
                aria-label="Code editor"
                spellCheck={false}
                wrap="off"
                value={code}
                onChange={(e) => setCodes({ ...codes, [lang]: e.target.value })}
                style={{ height: `${lines.length * 1.5 + 1.5}rem` }}
                className="flex-1 resize-none overflow-hidden whitespace-pre bg-transparent py-3 pr-4 outline-none"
              />
            )}
          </div>
        </section>

        <div className="space-y-6">
          {/* Controls */}
          <section className="surface-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Execution controls</h3>
              <button className="btn btn-sm btn-ghost gap-1" onClick={reset} aria-label="Reset">
                <RotateCcw size={14} /> Reset
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-sm gap-1"
                disabled={!running || idx === 0}
                onClick={() => setIdx((i) => i - 1)}
              >
                <StepBack size={14} /> Step back
              </button>
              <button
                className="btn btn-sm btn-primary"
                disabled={!running}
                onClick={() =>
                  idx >= steps.length - 1 ? (setIdx(0), setPlaying(true)) : setPlaying(!playing)
                }
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button
                className="btn btn-sm gap-1"
                disabled={!running || idx >= steps.length - 1}
                onClick={() => setIdx((i) => i + 1)}
              >
                Step forward <StepForward size={14} />
              </button>
            </div>
            <label className="mt-4 flex items-center gap-3 text-sm">
              Speed
              <input
                type="range"
                min="1"
                max="100"
                value={speed}
                onChange={(e) => setSpeed(+e.target.value)}
                className="range range-xs range-secondary flex-1"
              />
            </label>
            <p className="mt-3 text-sm text-base-content/60">
              Step {running ? idx + 1 : 0} of {steps.length}
            </p>
          </section>

          {notice && (
            <div role="alert" className="alert alert-soft alert-warning text-sm">
              <CircleAlert size={16} /> <span>{notice}</span>
            </div>
          )}
          {trace?.error && (
            <div role="alert" className="alert alert-soft alert-error text-sm">
              <CircleAlert size={16} /> <span>{trace.error}</span>
            </div>
          )}

          {/* Variables */}
          <section className="surface-card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <Eye size={16} className="text-info" /> Variables &amp; state
            </h3>
            {step && step.vars.length ? (
              <div className="grid grid-cols-2 gap-2">
                {step.vars.map(([n, v]) => (
                  <div key={n} className="rounded-lg border border-base-300 px-3 py-2 font-mono text-sm">
                    <span className="text-base-content/60">{n}</span> ={' '}
                    <span className="text-primary">{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-base-content/50">
                Variables appear here after you parse and step through the code.
              </p>
            )}
          </section>

          {/* Call stack + console */}
          <div className="grid gap-6 sm:grid-cols-2">
            <section className="surface-card p-5">
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Layers size={16} className="text-warning" /> Call stack
              </h3>
              {step ? (
                <div className="space-y-1">
                  {[...step.stack].reverse().map((f, i) => (
                    <div key={i} className="rounded-lg border border-base-300 px-3 py-1.5 font-mono text-sm">
                      {f}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-base-content/50">Empty</p>
              )}
            </section>
            <section className="surface-card p-5">
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Terminal size={16} className="text-success" /> Console
              </h3>
              {visibleLogs.length ? (
                <div className="max-h-40 space-y-0.5 overflow-auto font-mono text-xs">
                  {visibleLogs.map((l, i) => (
                    <div key={i}>{l}</div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-base-content/50">No output yet</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   PAGE: tabs to switch between the two visualisers
   ===================================================================== */

function AlgoVisualiser() {
  const [tab, setTab] = useState('code');

  return (
    <div className="page-container max-w-7xl py-8">
      <div className="mb-8 flex justify-center">
        <div role="tablist" className="tabs tabs-box">
          <button
            role="tab"
            className={`tab ${tab === 'code' ? 'tab-active' : ''}`}
            onClick={() => setTab('code')}
          >
            Code visualiser
          </button>
          <button
            role="tab"
            className={`tab ${tab === 'sorting' ? 'tab-active' : ''}`}
            onClick={() => setTab('sorting')}
          >
            Sorting
          </button>
        </div>
      </div>

      {tab === 'code' ? (
        <CodeVisualiser />
      ) : (
        <div className="mx-auto max-w-5xl">
          <SortingVisualiser />
        </div>
      )}
    </div>
  );
}

export default AlgoVisualiser;