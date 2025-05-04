import { useEffect, useRef, useState } from "react";
import { Paperclip, Mic, ImageIcon, SendHorizonal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import favicon from '../images/favicon.png';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { FiTrash2, FiEdit, FiCopy, FiMessageSquare } from "react-icons/fi";
import { sendToGemini } from "../services/geminiService"; // Import Gemini service
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from '../AuthContext';  // Or wherever your auth is handled


export default function PartnerChat() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "omnis", text: "Hi, I'm Omnis. How can I assist you today?", status: "sent", read: true },
  ]);
  const [input, setInput] = useState("");
  const [typingStatus, setTypingStatus] = useState(""); // "user" or "omnis"
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const scrollRef = useRef(null);
  let nextId = useRef(2);
  const [profilePicture, setProfilePicture] = useState(null);
  const { user } = useAuth();

  

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
  

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setInput(prevInput => prevInput + emoji.native);  // Append selected emoji to the input
  };

  // Toggle emoji picker visibility
  const toggleEmojiPicker = () => {
    setIsEmojiPickerVisible(!isEmojiPickerVisible);
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    const isNearBottom =
      scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 100;

    if (isNearBottom) {
      scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: "smooth" });
    }
  }, [messages, typingStatus]);

  // Optimistic send + typing differentiator + read receipts
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
    setTypingStatus("omnis"); // Set Omnis typing immediately
  
    // Simulate server confirm & bot reply after a small delay
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
  
      // After bot reply, immediately show user's typing indicator
      setTypingStatus("user"); // This line will trigger the user's typing indicator
  
      // Clear typing status after a small interval, to simulate typing end
      setTimeout(() => {
        setTypingStatus("");
      }, 10000); // This clears the user's typing indicator after 1 second or any preferred time
    }, 3000); // Omnis reply delay
  };
  

  // File upload
  const handleFileUpload = (file) => {
    if (!file) return;
    const fileType = file.type.split("/")[0];

    // Early return if unsupported file type
    if (!["image", "audio", "application"].includes(fileType)) {
      alert("Unsupported file type");
      return;
    }
    
  };
  // Message actions
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

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingStatus]);

  return (
    <div className="flex flex-col dark:bg-[#0b0f19] h-[calc(100vh-4rem)] px-4 py-4 bg-gray-50">
      <div className="mb-2">
        <h2 className="text-2xl font-semibold dark:text-white">Partner Chat</h2>
        <p className="text-sm text-green-500 dark:text-green-400">Converse with Omnis</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-white rounded-xl shadow-sm relative dark:bg-[#1f2937]">
        {/* Avatar Section */}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`relative flex ${msg.sender === "creator" ? "justify-end" : "justify-start"}`}
              onMouseEnter={() => setSelectedMessageId(msg.id)}
              onMouseLeave={() => setSelectedMessageId(null)}
            >
              {/* Avatar behind the message bubble for creator */}
              {msg.sender === "creator" && (
                <img
                src={profilePicture || favicon}

                  alt="User"
                  className="w-8 h-8 rounded-full  absolute -right-4 -top-2 z-0 opacity-100"
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
                className={`relative z-10 max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl shadow-2xl transform hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out
                  ${msg.sender === "creator"
                    ? "bg-gradient-to-br from-blue-500 to-green-500 text-white rounded-br-none mr-6"
                    : "dark:bg-indigo-800 dark:text-indigo-100 bg-gray-200 text-gray-800 rounded-bl-none ml-6"
                  }`}
              >
                {msg.text && !msg.fileType && <span>{msg.text}</span>}

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


      <div className="mt-4 sm:w-full md:w-full lg:w-1/2 xl:w-1/2 mx-auto sticky bottom-0 z-10 flex flex-col gap-2">
        {/* Text Input + Send Button */}
        <div className="flex items-center border-blue-700 relative">
          <textarea
            rows={1}
            type="text"
            placeholder="Type your message..."
            className="w-full resize-none rounded-xl border-gray-300 py-2 pl-10 pr-14 shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-blue-400 
                       dark:border-gray-600 dark:bg-[#1f2937] dark:text-white dark:placeholder-white"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();    // send on Enter, shift+Enter inserts newline
              }
            }}
            onBlur={() => setTypingStatus("")}
            onFocus={() => setTypingStatus("user")}    
          />
          <button
            className="text-xl cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300"
            onClick={toggleEmojiPicker}
            title="Add emoji" >
            😀
          </button>

          {isEmojiPickerVisible && (
            <div className="absolute bottom-16 right-0">
              <Picker data={data} onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300">
            <SendHorizonal
              className="w-5 h-5 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
              title="Send"
              onClick={handleSend}
            />
          </div>
        </div>

        {/* Media Upload Icons */}
        <div className="flex gap-4 items-center px-2">
          <Paperclip
            className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white cursor-pointer"
            title="Attach file"
            onClick={() => document.getElementById("fileInput").click()}
          />
          <Mic
            className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white cursor-pointer"
            title="Record audio"
          />
          <ImageIcon
            className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white cursor-pointer"
            title="Send image"
          />
        </div>

        {/* Hidden File Input */}
        <input
          id="fileInput"
          type="file"
          accept="image/*,audio/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files[0])}
        />
      </div>

     
    
    </div>
  );
}
