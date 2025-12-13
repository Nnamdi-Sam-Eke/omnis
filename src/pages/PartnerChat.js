import { useEffect, useRef, useState } from "react";
import React from "react";
import { Paperclip, Mic, ImageIcon, SendHorizonal, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import favicon from '../images/favicon.png';
import { FiTrash2, FiEdit, FiCopy, FiMessageSquare } from "react-icons/fi";
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { useAuth } from '../AuthContext';
import ReactMarkdown from 'react-markdown';
import { callQwen } from "../services/qwenClient";

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <AlertCircle className="w-5 h-5" />
  };

  const colors = {
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${colors[type]}`}
    >
      {icons[type]}
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
};

// Audio Recorder Component
const AudioRecorder = ({ onSave, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onSave(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current?.stream?.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
    onCancel();
  };

  useEffect(() => {
    startRecording();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={cancelRecording}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Recording Audio</h3>
          <p className="text-3xl font-mono font-bold text-slate-600 dark:text-slate-300 mb-6">
            {formatDuration(duration)}
          </p>
          <div className="flex gap-3">
            <button
              onClick={cancelRecording}
              className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={stopRecording}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function PartnerChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingStatus, setTypingStatus] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [toast, setToast] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stickyDate, setStickyDate] = useState(null);
  const [stickyDateOpacity, setStickyDateOpacity] = useState(0);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const dateRefs = useRef({});
  const { user } = useAuth();
  const conversationId = `${user?.uid}_omnis`;
  const userTypingTimer = useRef(null);
  const omnisThinkingTimer = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingStatus]);

  // Handle sticky date on scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerTop = container.getBoundingClientRect().top;
      
      let currentVisibleDate = null;
      let closestDividerDistance = Infinity;
      let closestDividerInView = false;

      Object.entries(dateRefs.current).forEach(([date, ref]) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const distanceFromTop = rect.top - containerTop - 80;
          
          // Check if date divider is visible in viewport (close to top)
          if (distanceFromTop >= -50 && distanceFromTop <= 200) {
            if (Math.abs(distanceFromTop) < Math.abs(closestDividerDistance)) {
              closestDividerDistance = distanceFromTop;
              currentVisibleDate = date;
              // If divider is very close to or past the top, mark it as in view
              if (distanceFromTop <= 100) {
                closestDividerInView = true;
              }
            }
          }
        }
      });

      // Completely hide when divider is in view
      if (closestDividerInView && closestDividerDistance <= 100) {
        setStickyDateOpacity(0);
        setStickyDate(null);
      } else if (currentVisibleDate && closestDividerDistance > 100) {
        setStickyDate(currentVisibleDate);
        // Only show when scrolled past the divider
        const opacity = Math.min(0.95, Math.max(0, (closestDividerDistance - 100) / 100));
        setStickyDateOpacity(opacity);
      } else {
        setStickyDateOpacity(0);
        setStickyDate(null);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages]);

  // Fetch user profile picture
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setProfilePicture(userSnap.data().profilePicture || null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [user]);

  // Real-time message listener
  useEffect(() => {
    if (!user) return;

    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    }, (error) => {
      console.error("Error listening to messages:", error);
      showToast("Failed to load messages", "error");
    });

    return () => unsubscribe();
  }, [user, conversationId]);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const uploadFile = async (file) => {
    try {
      setIsUploading(true);
      const fileRef = ref(storage, `chat-files/${conversationId}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
      showToast("Failed to upload file", "error");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async () => {
  if (!input.trim() || !user) return;

  const userMessageData = {
    sender: "creator",
    text: input,
    status: "pending",
    timestamp: new Date(),
    read: false
  };

  try {
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const userMsgRef = await addDoc(messagesRef, userMessageData);

    setInput("");
    setTypingStatus("omnis");

    // Mark as sent after a tiny delay
    setTimeout(async () => {
      await updateDoc(doc(db, "conversations", conversationId, "messages", userMsgRef.id), {
        status: "sent"
      });
    }, 500);

    try {
      // Prepare AI messages
      const messages = [
        { role: "system", content: "You are Omnis: calm, predictive, wise, emotionally intelligent." },
        { role: "user", content: input }
      ];

      // Qwen call
      const qwenResp = await callQwen({
        model: "qwen-3-23b",
        messages,
        max_tokens: 800
      });

      const aiResponse =
        qwenResp?.text?.trim() ||
        "I'm here to help! How can I assist you?";

      // Save Omnis response to Firestore
      await addDoc(messagesRef, {
        sender: "omnis",
        text: aiResponse,
        status: "sent",
        timestamp: new Date(),
        read: true
      });

    } catch (aiError) {
      console.error("AI Error (Groq Qwen):", aiError);

      await addDoc(collection(db, "conversations", conversationId, "messages"), {
        sender: "omnis",
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        status: "sent",
        timestamp: new Date(),
        read: true
      });
    }

    setTypingStatus("");

  } catch (error) {
    console.error("Send error:", error);
    showToast("Failed to send message", "error");
    setTypingStatus("");
  }
};

  const handleFileUpload = async (file) => {
  if (!file) return;

  setIsUploading(true);
  try {
    // Determine file type
    const fileType = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("audio/")
      ? "audio"
      : "application";

    // Upload to Firebase Storage
    const fileRef = ref(storage, `chat-files/${conversationId}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);

    // Save message in Firestore
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    await addDoc(messagesRef, {
      sender: "creator",
      text: downloadURL,
      fileName: file.name,
      fileType: fileType,
      status: "sent",
      timestamp: new Date(),
      read: false,
    });

    showToast(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded`, "success");
  } catch (error) {
    console.error("File upload error:", error);
    showToast("Failed to upload file", "error");
  } finally {
    setIsUploading(false);
  }
};



  const handleAudioSave = async (audioBlob) => {
    setIsRecording(false);
    const audioFile = new File([audioBlob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });
    await handleFileUpload(audioFile);
  };

  const handleAction = async (action, msg) => {
    try {
      const msgRef = doc(db, "conversations", conversationId, "messages", msg.id);

      if (action === "trash") {
        await deleteDoc(msgRef);
        showToast("Message deleted", "success");
      }
      
      if (action === 'edit') {
        const newText = prompt("Edit your message:", msg.text);
        if (newText != null && newText.trim()) {
          await updateDoc(msgRef, { text: newText, edited: true });
          showToast("Message updated", "success");
        }
      }
      
      if (action === 'copy') {
        await navigator.clipboard.writeText(msg.text || msg.fileName);
        showToast("Copied to clipboard", "success");
      }
      
      if (action === 'reply') {
        setInput(`@${msg.sender}: ${msg.text.slice(0, 50)}${msg.text.length > 50 ? '...' : ''}\n\n`);
      }
      
      setSelectedMessageId(null);
    } catch (error) {
      console.error("Error performing action:", error);
      showToast("Action failed", "error");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {isRecording && (
        <AudioRecorder
          onSave={handleAudioSave}
          onCancel={() => setIsRecording(false)}
        />
      )}

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

      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 relative"
      >
        {stickyDate && stickyDateOpacity > 0 && (
          <div 
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 transition-opacity duration-200"
            style={{ opacity: stickyDateOpacity }}
          >
            <div className="px-4 py-1.5 bg-slate-200/95 dark:bg-slate-700/95 backdrop-blur-md rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-lg border border-slate-300/50 dark:border-slate-600/50">
              {stickyDate}
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const currentMsgDate = new Date(msg.timestamp?.toDate?.() || msg.timestamp).toDateString();
              const prevMsgDate = index > 0 
                ? new Date(messages[index - 1].timestamp?.toDate?.() || messages[index - 1].timestamp).toDateString() 
                : null;
              const showDivider = currentMsgDate !== prevMsgDate;
              
              const today = new Date().toDateString();
              const yesterday = new Date(Date.now() - 86400000).toDateString();
              
              let dateLabel = currentMsgDate;
              if (currentMsgDate === today) {
                dateLabel = "Today";
              } else if (currentMsgDate === yesterday) {
                dateLabel = "Yesterday";
              } else {
                const date = new Date(msg.timestamp?.toDate?.() || msg.timestamp);
                dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              }

              return (
                <React.Fragment key={msg.id}>
                  {showDivider && (
                    <motion.div
                      ref={(el) => (dateRefs.current[dateLabel] = el)}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center my-6 gap-3"
                    >
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-slate-300 dark:via-slate-600 dark:to-slate-600 max-w-[200px]"></div>
                      
                      <div className="px-4 py-1.5 bg-slate-200/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm border border-slate-300/50 dark:border-slate-600/50 flex-shrink-0">
                        {dateLabel}
                      </div>
                      
                      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-300 to-slate-300 dark:via-slate-600 dark:to-slate-600 max-w-[200px]"></div>
                    </motion.div>
                  )}
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start gap-4 group ${
                      msg.sender === "creator" ? "flex-row-reverse" : ""
                    }`}
                    onClick={() => setSelectedMessageId(prev => (prev === msg.id ? null : msg.id))}
                  >
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

                <div className={`flex-1 max-w-2xl ${msg.sender === "creator" ? "text-right" : ""}`}>
                  <div
                    className={`inline-block px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                      msg.sender === "creator"
                        ? "bg-blue-500 text-white rounded-tr-sm"
                        : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-600"
                    }`}
                  >
                    {msg.text && !msg.fileType && (
                      <div className={`prose prose-sm max-w-none break-words ${
                        msg.sender === "creator" 
                          ? "prose-invert" 
                          : "dark:prose-invert"
                      }`}>
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-base font-semibold mb-2" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-sm font-medium mb-1" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0 break-words" {...props} />,
                            code: ({ node, inline, className, children, ...props }) => {
                              if (inline) {
                                return (
                                  <code 
                                    className={`px-1.5 py-0.5 rounded text-xs font-mono break-all ${
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
                                className={`underline hover:no-underline break-all ${
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
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                        {msg.edited && (
                          <span className="text-xs opacity-70 italic ml-2">(edited)</span>
                        )}
                      </div>
                    )}

                    {msg.fileType === "image" && (
                      <img src={msg.text} alt={msg.fileName} className="max-w-xs h-auto rounded-lg" />
                    )}
                    {msg.fileType === "audio" && (
                      <audio controls className="max-w-xs">
                        <source src={msg.text} type="audio/webm" />
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

                  {msg.sender === "creator" && (
                    <div className="flex items-center justify-end gap-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {msg.status === "pending" && (
                        <span className="animate-pulse">Sending...</span>
                      )}
                      {msg.status === "sent" && <span>✓</span>}
                    </div>
                  )}

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
                        {msg.sender === "creator" && (
                          <FiEdit
                            className="w-4 h-4 text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 cursor-pointer transition-colors"
                            title="Edit"
                            onClick={() => handleAction('edit', msg)}
                          />
                        )}
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
            </React.Fragment>
              );
            })}
          </AnimatePresence>

          <AnimatePresence>
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
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex-shrink-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-700/50 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {isUploading && (
            <div className="mb-2 text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Uploading file...
            </div>
          )}
          
          <div className="relative">
            <div className="bg-white dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-sm focus-within:shadow-md focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-all duration-200">
              <div className="flex items-end gap-3 p-3">
                <div className="flex items-center gap-2 pb-2">
                  <button
                    onClick={() => document.getElementById("fileInput")?.click()}
                    disabled={isUploading}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                    title="Attach file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => document.getElementById("imageInput")?.click()}
                    disabled={isUploading}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                    title="Send image"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsRecording(true)}
                    disabled={isUploading}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    title="Record audio"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      if (!typingStatus) {
                        setTypingStatus("user");
                        if (userTypingTimer.current) clearTimeout(userTypingTimer.current);
                        userTypingTimer.current = setTimeout(() => {
                          setTypingStatus("");
                        }, 7000);
                      }
                    }}
                    onFocus={() => {
                      setTypingStatus("user");
                      if (userTypingTimer.current) clearTimeout(userTypingTimer.current);
                      userTypingTimer.current = setTimeout(() => {
                        setTypingStatus("");
                      }, 7000);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
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

                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isUploading}
                  className="flex-shrink-0 p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  title="Send message"
                >
                  <SendHorizonal className="w-5 h-5" />
                </button>
              </div>
            </div>

            <input
              id="fileInput"
              type="file"
              accept=".pdf,.doc,.docx,.txt,.zip"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />

            <input
              id="imageInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </div>
        </div>
      </div>
    </div>
  );
}