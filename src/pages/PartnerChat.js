import { useEffect, useRef, useState } from "react";
import { Paperclip, Mic, ImageIcon, SendHorizonal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import favicon from '../images/favicon.png';
import { FiTrash2, FiEdit, FiCopy, FiMessageSquare } from "react-icons/fi";
// import { sendToGemini } from "../services/geminiService"; // Import Gemini service
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from '../AuthContext';
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
    // First, scroll the element into view
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    
    // Then, adjust the scroll position (just in case, e.g., for certain edge cases)
    messagesEndRef.current.scrollTo({
      top: messagesEndRef.current.scrollHeight,
      behavior: "smooth",
    });
  }
}, [messages]);

  // Fetch user profile picture from Firestore
  // useEffect(() => {
    
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

    const msg = {
      id: nextId.current++,
      sender: "creator",
      text: input,
      status: "pending",
      read: false,
    };
    setMessages((prev) => [...prev, msg]);
    setInput("");
    setTypingStatus("omnis");

    setTimeout(() => {
      setMessages((prev) =>
        prev.map(m => m.id === msg.id ? { ...m, status: "sent" } : m)
      );
      const botReply = {
        id: nextId.current++,
        sender: "omnis",
        text: "Thanks for your message! I'm processing it...",
        status: "sent",
        read: true,
      };
      setMessages((prev) => [...prev, botReply]);
      setTypingStatus("user");
      setTimeout(() => {
        setTypingStatus("");
      }, 8000);
    }, 3000);
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



  return (
    <div className="flex flex-col h-full dark:bg-[#0b0f19] bg-gray-50">
      {/* Assistant Header */}
      <div className="bg-white dark:bg-[#1e2a3b] shadow-md rounded-lg p-2">
        <div className="text-xl font-semibold py-2 text-gray-800 dark:text-white">Assistant</div>
        <p className="text-sm text-green-600 dark:text-green-300">Converse with Omnis</p>
      </div>
      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-screen px-4 m-2 lg:m-6" ref={messagesEndRef}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`relative flex mb-4 ${msg.sender === "creator" ? "justify-end" : "justify-start"}`}
              onClick={() => setSelectedMessageId(prev => (prev === msg.id ? null : msg.id))}
            >
              {msg.sender === "creator" && (
                <img
                  src={profilePicture || favicon}
                  alt="User"
                  className="w-10 h-10 rounded-full absolute -right-4 -top-2 z-0 opacity-100"
                />
              )}
              {msg.sender === "omnis" && (
                <img
                  src={favicon}
                  alt="Omnis avatar"
                  className="w-10 h-10 rounded-full absolute -left-4 -top-2 z-0 opacity-100"
                />
              )}

              {/* Message Bubble */}
              <div
                className={`relative z-10 max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl shadow-2xl transform hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out  break-words whitespace-pre-wrap
                                    ${msg.sender === "creator"
                    ? "bg-gradient-to-br from-blue-500 to-green-500 text-white rounded-br-none mr-6"
                    : "dark:bg-indigo-800 dark:text-indigo-100 bg-gray-200 text-gray-800 rounded-bl-none ml-6"
                  }`}
              >

                {msg.text && !msg.fileType && (
                  <div className="prose dark:prose-invert prose-sm max-w-full">
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-2" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mb-2" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-lg font-medium mb-1" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                        code: ({ node, inline, className, children, ...props }) => {
                          if (inline) {
                            return <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded" {...props}>{children}</code>;
                          }
                          return (
                            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
                              <code {...props}>{children}</code>
                            </pre>
                          );
                        },
                        a: ({ node, ...props }) => (
                          <a className="text-blue-500 underline" target="_blank" rel="noopener noreferrer" {...props} />
                        ),
                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-4 border-gray-400 pl-4 italic text-gray-600 dark:text-gray-300" {...props} />
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                )}

                {msg.fileType === "image" && (
                  <img src={msg.text} alt={msg.fileName} className="w-48 h-48 object-cover rounded-lg" />
                )}
                {msg.fileType === "audio" && (
                  <audio controls className="w-full">
                    <source src={msg.text} type="audio/mpeg" />
                  </audio>
                )}
                {msg.fileType === "application" && (
                  <a href={msg.text} target="_blank" rel="noopener noreferrer" className="text-blue-200 underline">
                    {msg.fileName}
                  </a>
                )}

                {msg.sender === "creator" && msg.status === "pending" && (
                  <span className="text-xs italic mt-1">…</span>
                )}
                {msg.sender === "creator" && msg.status === "sent" && (
                  <span className="text-xs mt-1">✔</span>
                )}
              </div>

              {/* Message Actions */}
              {selectedMessageId === msg.id && (
                <div className="flex items-end mt-2 space-x-2 text-sm">
                  <FiTrash2
                    className="w-4 h-4 text-red-500 hover:text-red-700 cursor-pointer"
                    title="Delete"
                    onClick={() => handleAction('trash', msg)}
                  />
                  <FiEdit
                    className="w-4 h-4 text-blue-500 hover:text-blue-700 cursor-pointer"
                    title="Edit"
                    onClick={() => handleAction('edit', msg)}
                  />
                  <FiCopy
                    className="w-4 h-4 text-green-500 hover:text-green-700 cursor-pointer"
                    title="Copy"
                    onClick={() => handleAction('copy', msg)}
                  />
                  <FiMessageSquare
                    className="w-4 h-4 text-indigo-500 hover:text-indigo-700 cursor-pointer"
                    title="Reply"
                    onClick={() => handleAction('reply', msg)}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {typingStatus === "user" && (
          <div className="flex justify-end items-center space-x-2 text-sm text-gray-400 pr-2 animate-pulse dark:text-gray-300">
            <span className="text-base">You are typing</span>
            <span className="animate-bounce">.</span>
            <span className="animate-bounce delay-150">.</span>
            <span className="animate-bounce delay-300">.</span>
          </div>
        )}
        {typingStatus === "omnis" && (
          <div className="flex items-center space-x-2 text-sm text-gray-400 pl-2 animate-pulse dark:text-gray-300">
            <span className="text-base">Omnis is typing</span>
            <span className="animate-bounce">.</span>
            <span className="animate-bounce delay-150">.</span>
            <span className="animate-bounce delay-300">.</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Section */}
      <div className="bg-gray-50 dark:bg-[#0b0f19] sticky px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col border-blue-700 relative">
          <div className="relative">
            <textarea
              rows={1}
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
              className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-[#1f2937] dark:text-white dark:placeholder-gray-400 px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-400 focus:outline-none max-h-40 overflow-y-auto"
              style={{
                maxHeight: '160px',
                minHeight: '48px',
                overflowY: 'auto',
              }}
              aria-label="Type your message"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300">
              <SendHorizonal
                className="w-5 h-5 text-blue-600 hover:text-blue-800 cursor-pointer"
                title="Send"
                onClick={handleSend}
                aria-label="Send message"
              />
            </div>
          </div>

          {/* Upload Icons */}
          <div className="flex items-center gap-4 mt-2 px-1">
            <Paperclip
              className="w-5 h-5 text-gray-500 dark:text-gray-300 hover:text-blue-500 cursor-pointer"
              title="Attach file"
              onClick={() => document.getElementById("fileInput")?.click()}
            />
            <ImageIcon
              className="w-5 h-5 text-gray-500 dark:text-gray-300 hover:text-green-500 cursor-pointer"
              title="Send image"
            />
            <Mic
              className="w-5 h-5 text-gray-500 dark:text-gray-300 hover:text-red-500 cursor-pointer"
              title="Record audio"
            />
            <div ref={messagesEndRef} />
          </div>
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
  );
}
