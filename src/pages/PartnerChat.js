import { useEffect, useRef, useState } from "react";
import { Paperclip, Mic, ImageIcon, SendHorizonal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import favicon from '../images/favicon.png';
import { FiTrash2, FiEdit, FiCopy, FiMessageSquare } from "react-icons/fi";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from '../AuthContext';
import { sendToOpenAIStream } from "../services/openAIService"; // ✅ CORRECTED IMPORT
import ReactMarkdown from 'react-markdown';

export default function PartnerChat() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "omnis", text: "Hi, I'm Omnis. How can I assist you today?", status: "sent", read: true },
  ]);
  const [input, setInput] = useState("");
  const [typingStatus, setTypingStatus] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const scrollRef = useRef(null);
  let nextId = useRef(2);
  const [profilePicture, setProfilePicture] = useState(null);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      messagesEndRef.current.scrollTo({
        top: messagesEndRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    fetchUserProfilePicture();
  }, [user]);

  const fetchUserProfilePicture = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setProfilePicture(userData.profilePicture || null);
      }
    } catch (error) {
      console.error("Error fetching profile picture:", error.message);
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop <= container.clientHeight + 100;

    if (isNearBottom) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage = {
    id: nextId.current++,
    sender: "creator",
    text: input,
    status: "pending",
    read: false,
  };

  setMessages((prev) => [...prev, userMessage]);
  setInput("");
  setTypingStatus("omnis");

  setTimeout(() => {
    setMessages((prev) =>
      prev.map((m) => m.id === userMessage.id ? { ...m, status: "sent" } : m)
    );
  }, 500);

  // Mock reply (optional)
  const botReply = {
    id: nextId.current++,
    sender: "omnis",
    text: "Thanks for your message. AI replies are currently disabled.",
    status: "sent",
    read: true,
  };

  setTimeout(() => {
    setMessages((prev) => [...prev, botReply]);
    setTypingStatus("");
  }, 800);
};


  const handleFileUpload = (file) => {
    if (!file) return;

    const fileType = file.type.split("/")[0];
    const newMsg = {
      id: nextId.current++,
      sender: "creator",
      text: URL.createObjectURL(file),
      fileType,
      fileName: file.name,
      status: "sent",
      read: false,
    };

    setMessages((prev) => [...prev, newMsg]);
  };

  const handleAction = (action, msg) => {
    if (action === "trash") {
      setMessages(prev => prev.filter(m => m.id !== msg.id));
    }
    if (action === 'edit') {
      const newText = prompt("Edit your message:", msg.text);
      if (newText != null) {
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, text: newText, status: "sent" } : m));
      }
    }
    if (action === 'copy') {
      navigator.clipboard.writeText(msg.text || msg.fileName);
    }
    if (action === 'reply') {
      setInput(`@${msg.sender}: `);
    }
    setSelectedMessageId(null);
  };

  return   (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <img src={favicon} alt="Omnis" className="w-6 h-6 rounded-full" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800 dark:text-white">Omnis Assistant</h1>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Online and ready to help
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-6" ref={messagesEndRef}>
          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start gap-4 group ${
                    msg.sender === "creator" ? "flex-row-reverse" : ""
                  }`}
                  onClick={() => setSelectedMessageId(prev => (prev === msg.id ? null : msg.id))}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {msg.sender === "creator" ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-blue-200 dark:ring-blue-800">
                        <img
                          src={profilePicture || favicon}
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <img src={favicon} alt="Omnis" className="w-5 h-5 rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 max-w-2xl ${msg.sender === "creator" ? "text-right" : ""}`}>
                    <div
                      className={`inline-block px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                        msg.sender === "creator"
                          ? "bg-blue-500 text-white rounded-tr-sm"
                          : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-600"
                      }`}
                    >
                      {msg.text && !msg.fileType && (
                        <div className={`prose prose-sm max-w-none ${
                          msg.sender === "creator" 
                            ? "prose-invert" 
                            : "dark:prose-invert"
                        }`}>
                          <ReactMarkdown
                            components={{
                              h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2" {...props} />,
                              h2: ({ node, ...props }) => <h2 className="text-base font-semibold mb-2" {...props} />,
                              h3: ({ node, ...props }) => <h3 className="text-sm font-medium mb-1" {...props} />,
                              p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                              code: ({ node, inline, className, children, ...props }) => {
                                if (inline) {
                                  return (
                                    <code 
                                      className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                                        msg.sender === "creator" 
                                          ? "bg-blue-400/30 text-blue-100" 
                                          : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                      }`} 
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  );
                                }
                                return (
                                  <pre className={`p-3 rounded-lg overflow-x-auto text-xs ${
                                    msg.sender === "creator" 
                                      ? "bg-blue-400/20 text-blue-100" 
                                      : "bg-slate-100 dark:bg-slate-800"
                                  }`}>
                                    <code {...props}>{children}</code>
                                  </pre>
                                );
                              },
                              a: ({ node, ...props }) => (
                                <a 
                                  className={`underline hover:no-underline ${
                                    msg.sender === "creator" 
                                      ? "text-blue-200 hover:text-blue-100" 
                                      : "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                  }`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  {...props} 
                                />
                              ),
                              ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                              blockquote: ({ node, ...props }) => (
                                <blockquote 
                                  className={`border-l-4 pl-4 italic ${
                                    msg.sender === "creator" 
                                      ? "border-blue-300 text-blue-100" 
                                      : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400"
                                  }`} 
                                  {...props} 
                                />
                              ),
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      )}

                      {msg.fileType === "image" && (
                        <img src={msg.text} alt={msg.fileName} className="max-w-xs h-auto rounded-lg" />
                      )}
                      {msg.fileType === "audio" && (
                        <audio controls className="max-w-xs">
                          <source src={msg.text} type="audio/mpeg" />
                        </audio>
                      )}
                      {msg.fileType === "application" && (
                        <a 
                          href={msg.text} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`underline hover:no-underline ${
                            msg.sender === "creator" 
                              ? "text-blue-200 hover:text-blue-100" 
                              : "text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {msg.fileName}
                        </a>
                      )}
                    </div>

                    {/* Message Status */}
                    {msg.sender === "creator" && (
                      <div className="flex items-center justify-end gap-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {msg.status === "pending" && (
                          <span className="animate-pulse">Sending...</span>
                        )}
                        {msg.status === "sent" && (
                          <span className="flex items-center gap-1">
                            <span>✓</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Message Actions */}
                    {selectedMessageId === msg.id && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`flex items-center gap-2 mt-2 ${
                          msg.sender === "creator" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-full px-3 py-1 shadow-lg border border-slate-200 dark:border-slate-600">
                          <FiCopy
                            className="w-4 h-4 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                            title="Copy"
                            onClick={() => handleAction('copy', msg)}
                          />
                          <FiEdit
                            className="w-4 h-4 text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 cursor-pointer transition-colors"
                            title="Edit"
                            onClick={() => handleAction('edit', msg)}
                          />
                          <FiMessageSquare
                            className="w-4 h-4 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors"
                            title="Reply"
                            onClick={() => handleAction('reply', msg)}
                          />
                          <FiTrash2
                            className="w-4 h-4 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors"
                            title="Delete"
                            onClick={() => handleAction('trash', msg)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicators */}
            {typingStatus === "user" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-end gap-4"
              >
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span>You are typing</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}

            {typingStatus === "omnis" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <img src={favicon} alt="Omnis" className="w-5 h-5 rounded-full" />
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span>Omnis is typing</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Section */}
      <div className="flex-shrink-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-700/50 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Main Input Container */}
            <div className="bg-white dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-sm focus-within:shadow-md focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-all duration-200">
              <div className="flex items-end gap-3 p-3">
                {/* File Upload Icons */}
                <div className="flex items-center gap-2 pb-2">
                  <button
                    onClick={() => document.getElementById("fileInput")?.click()}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Attach file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    title="Send image"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Record audio"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>

                {/* Text Input */}
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    onFocus={() => setTypingStatus("user")}
                    onBlur={() => setTypingStatus("")}
                    placeholder="Message Omnis..."
                    className="w-full resize-none bg-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none py-2 px-3 max-h-32 min-h-[2.5rem] leading-6"
                    rows={1}
                    style={{
                      resize: 'none',
                      overflow: 'hidden',
                      minHeight: '2.5rem',
                      maxHeight: '8rem',
                    }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="flex-shrink-0 p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  title="Send message"
                >
                  <SendHorizonal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              id="fileInput"
              type="file"
              accept="image/*,audio/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </div>
        </div>
      </div>
    </div>
  );
}