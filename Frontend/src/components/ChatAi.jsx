import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axiosClient from "../utils/axiosClient";
import { Send, Copy, Check } from "lucide-react";

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
    <div className="my-3 rounded-lg overflow-hidden border border-base-300 bg-[#0d1117] text-left">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] text-xs text-gray-400">
        <span>{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-sm leading-relaxed [&_code]:bg-transparent [&_code]:p-0">
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
        className="px-1.5 py-0.5 rounded bg-base-300 text-[0.85em] font-mono"
        {...props}
      >
        {children}
      </code>
    ),
  h1: (props) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
  h2: (props) => <h2 className="text-lg font-bold mt-4 mb-2" {...props} />,
  h3: (props) => <h3 className="text-base font-semibold mt-3 mb-1.5" {...props} />,
  h4: (props) => <h4 className="text-sm font-semibold mt-3 mb-1" {...props} />,
  p: (props) => <p className="my-2 leading-relaxed" {...props} />,
  ul: (props) => <ul className="list-disc pl-6 my-2 space-y-1" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 my-2 space-y-1" {...props} />,
  hr: () => <hr className="my-4 border-base-300" />,
  a: (props) => (
    <a className="link link-primary" target="_blank" rel="noreferrer" {...props} />
  ),
  blockquote: (props) => (
    <blockquote className="border-l-4 border-base-300 pl-3 my-2 italic" {...props} />
  ),
  table: (props) => (
    <div className="overflow-x-auto my-3">
      <table className="table table-sm" {...props} />
    </div>
  ),
};

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
    <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-bubble bg-base-200 text-base-content max-w-full">
              {msg.role === "user" ? (
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
        ))}

        {loading && (
          <div className="chat chat-start">
            <div className="chat-bubble bg-base-200 text-base-content">
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="sticky bottom-0 p-4 bg-base-100 border-t"
      >
        <div className="flex items-center">
          <input
            placeholder="Ask me anything"
            className="input input-bordered flex-1"
            {...register("message", { required: true, minLength: 2 })}
          />
          <button
            type="submit"
            className="btn btn-ghost ml-2"
            disabled={!!errors.message || loading}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatAi;