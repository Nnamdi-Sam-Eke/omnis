// omnis-actions.js
import { functions, auth } from "../firebase.js";
import { httpsCallable } from "firebase/functions";

// Helper to ensure user is authenticated
async function ensureAuth() {
  if (!auth.currentUser) {
    throw new Error("User not authenticated");
  }
}

// --- State to store last generated content ---
let lastGeneratedContent = "";
let lastUserPrompt = "";

/**
 * Generate content using Omnis Cloud Function
 */
export async function generateOmnisContent(userPrompt, setContent) {
  if (!userPrompt) {
    alert("Please enter a prompt!");
    return;
  }

  setContent("Generating content...");

  try {
    await ensureAuth();

    const callGenerateContent = httpsCallable(functions, "generateOmnisContent");
    const result = await callGenerateContent({ prompt: userPrompt });

    if (result.data.success) {
      lastGeneratedContent = result.data.generatedContent;
      lastUserPrompt = userPrompt;

      setContent(lastGeneratedContent);
    } else {
      setContent("Error generating content: " + result.data.message);
    }
  } catch (error) {
    console.error("Error calling generateOmnisContent:", error);
    setContent("Failed to generate content. Please try again.");
  }
}

/**
 * Summarize content using Omnis Cloud Function
 */
export async function summarizeOmnisContent(setSummary) {
  if (!lastGeneratedContent || !lastUserPrompt) {
    alert("Please generate content first before summarizing.");
    return;
  }

  setSummary("Summarizing content...");

  try {
    await ensureAuth();

    const callSummarizeContent = httpsCallable(functions, "summarizeOmnisContent");

    const omniSummaryPrompt = `You are an analytical assistant for the Omnis app, summarizing life choice simulations. Your task is to provide a single, vivid, concise, and professional summary (max 2 sentences) of the following scenario and its potential outcome, highlighting the core essence of the simulated future.`;

    const contentForSummarization = `Original User's Life Choice: ${lastUserPrompt}\nSimulated Outcome Description: ${lastGeneratedContent}`;

    const result = await callSummarizeContent({
      content: contentForSummarization,
      summaryPrompt: omniSummaryPrompt
    });

    if (result.data.success) {
      setSummary(result.data.summarizedContent);
    } else {
      setSummary("Error summarizing content: " + result.data.message);
    }
  } catch (error) {
    console.error("Error calling summarizeOmnisContent:", error);
    setSummary("Failed to summarize content. Please try again.");
  }
}

/**
 * Expand/Explain content in-depth using Omnis Cloud Function
 * @param {function} setExpandedContent - Callback to update dedicated output component
 * @param {string} expansionPrompt - Optional custom instruction to guide explanation
 */
export async function expandOmnisText(setExpandedContent, expansionPrompt) {
  if (!lastGeneratedContent) {
    alert("Please generate content first before expanding.");
    return;
  }

  setExpandedContent("Expanding content...");

  try {
    await ensureAuth();

    const callExpandContent = httpsCallable(functions, "expandOmnisText");

    const fullExpansionPrompt =
      expansionPrompt || "Please expand and explain the following life choice simulation in detail, highlighting potential outcomes, nuances, and implications:";

    const result = await callExpandContent({
      text: lastGeneratedContent,
      expansionPrompt: fullExpansionPrompt
    });

    if (result.data.success) {
      setExpandedContent(result.data.expandedContent);
    } else {
      setExpandedContent("Error expanding content: " + result.data.message);
    }
  } catch (error) {
    console.error("Error calling expandOmnisText:", error);
    setExpandedContent("Failed to expand content. Please try again.");
  }
}
