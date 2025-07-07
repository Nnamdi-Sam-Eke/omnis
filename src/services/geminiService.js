// services/geminiService.js

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";

const USE_VERTEX = process.env.USE_VERTEX === "true"; // Use ENV to switch mode

// ---- Configs ---- //
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash";
const VERTEX_PROJECT = "the-digital-twin-app-3e2b1";
const VERTEX_LOCATION = "global";

// ---- Init ---- //
let genAI = null;
let vertexAI = null;

if (USE_VERTEX) {
  vertexAI = new GoogleGenAI({
    vertexai: true,
    project: VERTEX_PROJECT,
    location: VERTEX_LOCATION,
  });
} else {
  if (!API_KEY) {
    console.error("REACT_APP_GEMINI_API_KEY is not set in environment variables");
  }
  genAI = new GoogleGenerativeAI(API_KEY);
}
console.log(USE_VERTEX)


// ---- Shared Config ---- //
const generationConfig = {
  maxOutputTokens: 65535,
  temperature: 1,
  topP: 1,
  seed: 0,
  safetySettings: [
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "OFF" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "OFF" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "OFF" },
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "OFF" },
  ],
  tools: [],
};

// ---- Unified Prompt Builder ---- //
const buildPrompt = (message, conversationHistory) => {
  let prompt = "You are Omnis, a helpful and friendly AI assistant. Respond in a conversational and helpful manner.\n\n";
  
  if (conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-10);
    prompt += "Conversation history:\n";
    recentHistory.forEach(msg => {
      const role = msg.sender === "omnis" ? "Assistant" : "User";
      prompt += `${role}: ${msg.text}\n`;
    });
    prompt += "\n";
  }

  prompt += `User: ${message}\nAssistant:`;
  return prompt;
};

// ---- Text Response ---- //
export const sendToGemini = async (message, conversationHistory = []) => {
  try {
    const prompt = buildPrompt(message, conversationHistory);

    if (USE_VERTEX) {
      const req = {
        model: MODEL_NAME,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: generationConfig,
      };

      const result = await vertexAI.models.generateContent(req);
      const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return { success: true, text: text.trim(), error: null };
    } else {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return { success: true, text: text.trim(), error: null };
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    let errorMessage = "Sorry, I'm having trouble connecting right now. Please try again.";
    if (error.message.includes("API key")) {
      errorMessage = "API configuration error. Please check your settings.";
    } else if (error.message.includes("quota") || error.message.includes("limit")) {
      errorMessage = "I'm currently at capacity. Please try again in a moment.";
    } else if (error.message.includes("network") || error.message.includes("fetch")) {
      errorMessage = "Network error. Please check your connection.";
    }

    return { success: false, text: errorMessage, error: error.message };
  }
};

// ---- Streaming Response ---- //
export const sendToGeminiStream = async (message, conversationHistory = [], onChunk) => {
  try {
    const prompt = buildPrompt(message, conversationHistory);
    let fullText = "";

    if (USE_VERTEX) {
      const req = {
        model: MODEL_NAME,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: generationConfig,
      };

      const streamingResp = await vertexAI.models.generateContentStream(req);

      for await (const chunk of streamingResp) {
        const chunkText = chunk.text || JSON.stringify(chunk);
        fullText += chunkText;
        if (onChunk) onChunk(chunkText, fullText);
      }

    } else {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        if (onChunk) onChunk(chunkText, fullText);
      }
    }

    return { success: true, text: fullText.trim(), error: null };

  } catch (error) {
    console.error("Error in streaming Gemini API:", error);
    return {
      success: false,
      text: "Sorry, I'm having trouble connecting right now. Please try again.",
      error: error.message
    };
  }
};