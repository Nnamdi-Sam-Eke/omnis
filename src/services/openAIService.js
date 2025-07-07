import OpenAI from "openai";

// 🧠 Initialize OpenAI (ensure REACT_APP_OPENAI_API_KEY is set in .env)
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // ⚠️ Only use in secure, controlled environments
});

// 🌀 Streaming chat completion
export const sendToOpenAIStream = async (userInput, conversationHistory, onChunk) => {
  const messages = conversationHistory.map(msg => ({
    role: msg.sender === "creator" ? "user" : "assistant",
    content: msg.text
  }));

  messages.push({
    role: "user",
    content: userInput
  });

  const stream = await openai.chat.completions.create({
    model: "gpt-4", // or "gpt-4o", "gpt-4o-mini"
    messages,
    temperature: 0.7,
    stream: true
  });

  let fullText = "";

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      fullText += delta;
      onChunk(delta, fullText);
    }
  }
};

// ✍️ One-time non-streaming chat completion (e.g., for quick outputs like haiku)
export const generateSingleCompletion = async (prompt) => {
  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini", // fast and cheap
    messages: [
      { role: "user", content: prompt }
    ]
  });

  return result.choices[0]?.message?.content || "";
};
