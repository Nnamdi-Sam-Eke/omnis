import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import html2pdf from "html2pdf.js";
import "highlight.js/styles/github-dark.css";

const InputPreview = () => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const previewRef = useRef(null);

  // Update input and version history
  const handleInputChange = (e) => {
    const value = e.target.value;
    const newHistory = history.slice(0, historyIndex + 1);
    setInput(value);
    setHistory([...newHistory, value]);
    setHistoryIndex(newHistory.length);
  };

  // Export preview as PDF
  const handleExportPDF = () => {
    if (previewRef.current) {
      html2pdf().from(previewRef.current).save("preview.pdf");
    }
  };

  // Copy input markdown to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(input);
  };

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setInput(history[historyIndex - 1]);
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setInput(history[historyIndex + 1]);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const wordCount = input.trim().split(/\s+/).filter(Boolean).length;
  const charCount = input.length;

  return (
    <div className="flex flex-col gap-6 mt-8">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <button onClick={handleUndo} disabled={historyIndex === 0} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
          Undo
        </button>
        <button onClick={handleRedo} disabled={historyIndex === history.length - 1} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
          Redo
        </button>
        <button onClick={handleCopy} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
          Copy Markdown
        </button>
        <button onClick={handleExportPDF} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
          Export to PDF
        </button>
        <span className="ml-auto text-sm text-gray-600 dark:text-gray-400">
          {wordCount} words | {charCount} characters
        </span>
      </div>

      {/* Editor & Preview */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Markdown Input
          </label>
          <textarea
            value={input}
            onChange={handleInputChange}
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white"
            placeholder="Type your markdown here..."
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Preview
          </label>
          <div
            ref={previewRef}
            className="w-full h-64 p-4 overflow-y-auto border border-indigo-500 dark:border-indigo-700 rounded-md bg-indigo-50 dark:bg-gray-900 text-gray-800 dark:text-white prose dark:prose-invert prose-sm max-w-none"
          >
            <ReactMarkdown
              children={input}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize, rehypeHighlight]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputPreview;
