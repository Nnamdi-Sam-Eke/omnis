// services/geminiService.js
// import axios from 'axios';

const GEMINI_API_URL = "http://127.0.0.1:5000/api/gemini"; // Ensure this is the correct API URL

/**
 * Send a query to the Gemini API.
 * @param {string} prompt - The user input prompt as a string.
 * @returns {Promise<object>} - The response from Gemini API.
 */
export const sendToGemini = async (input) => 
 {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),  // Sending an object with 'input' key
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    return { error: "Failed to communicate with Gemini." };
  }
};