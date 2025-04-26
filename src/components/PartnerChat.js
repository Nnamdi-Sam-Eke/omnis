import { useState, useEffect } from "react";
import { FiSend } from "react-icons/fi";

export default function PartnerChat() {
  const [messages, setMessages] = useState([
    { sender: "Omnis", text: "Hello, Creator. How can I assist you today?" }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const updatedMessages = [...messages, { sender: "You", text: newMessage }];
    setMessages(updatedMessages);
    setNewMessage("");
    setIsTyping(true);

    // Simulate Omnis typing and responding
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: "Omnis", text: "Got it! Let me process that for you." }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    const chatContainer = document.getElementById("chat-scroll");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Partner Chat</h1>
        <p className="text-muted-foreground text-sm">Converse with Omnis</p>
      </div>

      {/* Chat Area */}
      <div id="chat-scroll" className="flex-1 overflow-y-auto mb-4 space-y-4 bg-muted p-4 rounded-2xl">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "You" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                msg.sender === "You"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background border"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-xs px-4 py-2 rounded-2xl bg-background border text-sm italic text-muted-foreground flex items-center gap-1">
                <span>Omnis is typing</span>
                <span className="typing-dots">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </span>
              </div>
            </div>
          )}
          
    
      </div>

      {/* Message Input */}
      <div className="flex items-center border rounded-2xl p-2">
        <input
          type="text"
          className="flex-1 px-4 py-2 outline-none bg-transparent"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className="p-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
          onClick={handleSend}
        >
          <FiSend className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
