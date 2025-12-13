// index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const { VertexAI } = require("@google-cloud/vertexai");

const vertexAI = new VertexAI({
  project: "the-digital-twin-app-3e2b1",
  location: "us-central1",
});

const model = vertexAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

// Utility: extract text safely
function extractText(result) {
  try {
    return (
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No text generated"
    );
  } catch (e) {
    return "⚠️ Error parsing response";
  }
}

// === 1. Generate Omnis Content ===
exports.generateOmnisContent = functions.https.onCall(async (data, context) => {
  try {
    const userPrompt = data.prompt;
    if (!userPrompt || typeof userPrompt !== "string") {
      return { success: false, error: "Invalid or missing prompt" };
    }

    const result = await model.generateContent(userPrompt);
    const generatedText = extractText(result);

    return { success: true, prediction: generatedText };
  } catch (error) {
    console.error("Error generating content:", error);
    return {
      success: false,
      error: error.message || "Failed to generate content",
    };
  }
});

// === 2. Summarize Omnis Content ===
exports.summarizeOmnisContent = functions.https.onCall(async (data, context) => {
  try {
    const userText = data.text;
    const customPrompt = data.summaryPrompt;

    if (!userText || typeof userText !== "string") {
      return { success: false, error: "Invalid or missing text" };
    }

    // Respect custom prompt if provided
    const prompt = customPrompt
      ? `${customPrompt}\n\n${userText}`
      : `Summarize the following text: ${userText}`;

    const result = await model.generateContent(prompt);
    const summary = extractText(result);

    return { success: true, prediction: summary };
  } catch (error) {
    console.error("Error summarizing content:", error);
    return {
      success: false,
      error: error.message || "Failed to summarize content",
    };
  }
});

// === 3. Expand Omnis Content ===
exports.expandOmnisContent = functions.https.onCall(async (data, context) => {
  try {
    const userText = data.text;
    const customPrompt = data.expansionPrompt;

    if (!userText || typeof userText !== "string") {
      return { success: false, error: "Invalid or missing text" };
    }

    // Respect custom prompt if provided
    const prompt = customPrompt
      ? `${customPrompt}\n\n${userText}`
      : `Expand the following text with more detail: ${userText}`;

    const result = await model.generateContent(prompt);
    const expanded = extractText(result);

    return { success: true, prediction: expanded };
  } catch (error) {
    console.error("Error expanding content:", error);
    return {
      success: false,
      error: error.message || "Failed to expand content",
    };
  }
});
