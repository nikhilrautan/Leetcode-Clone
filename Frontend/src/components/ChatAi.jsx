import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axiosClient from "../utils/axiosClient";
import { Send, Copy, Check, Sparkles, User } from "lucide-react";

// Pull plain text out of a (possibly highlighted) React node tree
function extractText(node) {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node?.props?.children) return extractText(node.props.children);
  return "";
}

// Code block with language label and copy button
function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);

  const className = children?.props?.className || "";
  const language = (className.match(/language-(\w+)/) || [])[1] || "code";
  const text = extractText(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-base-300 bg-[#0d1117] text-left">
      <div className="flex items-center justify-between bg-[#161b22] px-3 py-1.5 text-xs text-gray-400">
        <span className="font-mono">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 transition-colors hover:text-white"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-sm leading-relaxed [&_code]:bg-transparent [&_code]:p-0">
        {children}
      </pre>
    </div>
  );
}

// How each markdown element is styled
const markdownComponents = {
  pre: CodeBlock,
  code: ({ className, children, ...props }) =>
    className ? (
      <code className={className} {...props}>
        {children}
      </code>
    ) : (
      <code
        className="rounded bg-base-300 px-1.5 py-0.5 font-mono text-[0.85em]"
        {...props}
      >
        {children}
      </code>
    ),
  h1: (props) => <h1 className="mb-2 mt-4 text-xl font-bold" {...props} />,
  h2: (props) => <h2 className="mb-2 mt-4 text-lg font-bold" {...props} />,
  h3: (props) => <h3 className="mb-1.5 mt-3 text-base font-semibold" {...props} />,
  h4: (props) => <h4 className="mb-1 mt-3 text-sm font-semibold" {...props} />,
  p: (props) => <p className="my-2 leading-relaxed" {...props} />,
  ul: (props) => <ul className="my-2 list-disc space-y-1 pl-6" {...props} />,
  ol: (props) => <ol className="my-2 list-decimal space-y-1 pl-6" {...props} />,
  hr: () => <hr className="my-4 border-base-300" />,
  a: (props) => (
    <a className="link link-primary" target="_blank" rel="noreferrer" {...props} />
  ),
  blockquote: (props) => (
    <blockquote className="my-2 border-l-4 border-base-300 pl-3 italic" {...props} />
  ),
  table: (props) => (
    <div className="my-3 overflow-x-auto">
      <table className="table table-sm" {...props} />
    </div>
  ),
};

const suggestions = [
  "Give me a hint",
  "Explain the approach",
  "What is the time complexity?",
];

function ChatAi({ problem }) {
  const [messages, setMessages] = useState([
    {
      role: "model",
      parts: [{ text: "Hi! Ask me anything about this problem." }],
    },
  ]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const onSubmit = async (data) => {
    if (loading) return;

    // Build the updated list first, so the request includes the new user message
    const userMessage = { role: "user", parts: [{ text: data.message }] };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    reset();
    setLoading(true);

    try {
      const response = await axiosClient.post("/ai/chat", {
        // slice(1) drops the greeting so the conversation starts with a user turn
        messages: updatedMessages.slice(1),
        title: problem?.title,
        description: problem?.description,
        testCases: problem?.visibleTestCases,
        startCode: problem?.startCode,
      });

      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: response.data.message }] },
      ]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: "Error from AI Chatbot" }] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen max-h-[80vh] min-h-[500px] flex-col overflow-hidden rounded-box border border-base-300 bg-base-100">
      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                  isUser
                    ? "bg-base-300 text-base-content/70"
                    : "bg-primary/15 text-primary"
                }`}
              >
                {isUser ? <User size={16} /> : <Sparkles size={16} />}
              </span>

              <div
                className={`min-w-0 max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  isUser
                    ? "rounded-tr-sm bg-primary text-primary-content"
                    : "rounded-tl-sm bg-base-200 text-base-content"
                }`}
              >
                {isUser ? (
                  <span className="whitespace-pre-wrap">{msg.parts[0].text}</span>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={markdownComponents}
                  >
                    {msg.parts[0].text}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          );
        })}

        {/* Quick prompts, shown only before the first question */}
        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-2 pl-11">
            {suggestions.map((text) => (
              <button
                key={text}
                type="button"
                className="btn btn-outline btn-sm rounded-full"
                onClick={() => onSubmit({ message: text })}
              >
                {text}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
              <Sparkles size={16} />
            </span>
            <div className="rounded-2xl rounded-tl-sm bg-base-200 px-4 py-3">
              <span className="loading loading-dots loading-sm text-base-content/60"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="sticky bottom-0 border-t border-base-300 bg-base-100 p-3"
      >
        <div className="flex items-center gap-2">
          <input
            placeholder="Ask me anything about this problem"
            className="input input-bordered flex-1"
            autoComplete="off"
            {...register("message", { required: true, minLength: 2 })}
          />
          <button
            type="submit"
            className="btn btn-primary btn-square"
            aria-label="Send message"
            disabled={!!errors.message || loading}
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatAi;