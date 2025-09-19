// script.js
import { generateOmnisContent, summarizeOmnisContent, expandOmnisText } from './omnis-actions.js';

// Get references to your UI elements
const promptInput = document.getElementById('promptInput');
const generateButton = document.getElementById('generateButton');
const generatedOutputDisplay = document.getElementById('generatedOutputDisplay');
const summarizeButton = document.getElementById('summarizeButton');
const summaryOutputDisplay = document.getElementById('summaryOutputDisplay');
const expandButton = document.getElementById('expandButton'); // Optional new button for expansion
const expandedOutputDisplay = document.getElementById('expandedOutputDisplay'); // Dedicated component

// --- Content Generation ---
generateButton.addEventListener('click', async () => {
  const userPrompt = promptInput.value.trim();
  await generateOmnisContent(userPrompt, (content) => {
    generatedOutputDisplay.textContent = content;
  });
});

// --- Summarization ---
summarizeButton.addEventListener('click', async () => {
  await summarizeOmnisContent((summary) => {
    summaryOutputDisplay.textContent = summary;
  });
});

// --- Expansion / Explain ---
if (expandButton && expandedOutputDisplay) {
  expandButton.addEventListener('click', async () => {
    await expandOmnisText((expanded) => {
      expandedOutputDisplay.textContent = expanded;
    });
  });
}
