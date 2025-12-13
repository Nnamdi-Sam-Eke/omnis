// src/services/qwenClient.js
// Centralized client for calling Qwen on Groq.
// Supports SDK (optional) or fetch fallback.
// Requires: process.env.REACT_APP_GROQ_API_KEY and optionally process.env.REACT_APP_GROQ_BASE_URL

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || process.env.GROQ_API_KEY;
const GROQ_BASE_URL =
  process.env.REACT_APP_GROQ_BASE_URL || process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";

if (!GROQ_API_KEY) {
  console.warn(
    "[qwenClient] GROQ_API_KEY not set. Calls will fail until you set the environment variable."
  );
}

/**
 * callQwen - simple wrapper to create a chat completion.
 * @param {Object} opts
 * @param {string} opts.model - e.g. "qwen3-32b"
 * @param {Array<{role:string, content:string}>} opts.messages
 * @param {number} [opts.max_tokens]
 */
export async function callQwen({ model = "qwen3-32b", messages = [], max_tokens = 512 }) {
  // Optional SDK branch
  try {
    if (typeof window !== "undefined" && window.GroqSDK) {
      return await window.GroqSDK.chat.completions.create({ model, messages, max_tokens });
    }
  } catch (e) {
    // fallback to fetch
  }

  // Fetch fallback
  const payload = { model, messages, max_tokens };

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Groq API error: ${res.status} ${res.statusText} - ${text}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();

  // Standardize return
  try {
    const first = data?.choices?.[0];
    if (!first) return { raw: data };
    const message = first?.message?.content ?? first?.text ?? "";
    return { text: typeof message === "string" ? message : JSON.stringify(message), raw: data };
  } catch (e) {
    return { text: JSON.stringify(data), raw: data };
  }
}