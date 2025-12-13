// ==============================
// CLIENT-SIDE GROQ CALL WRAPPER
// ==============================
export async function callGroqChat(messages, options = {}) {
  // Use absolute URL for backend in development; adjust for production
  const backendUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000/api/groq-chat' 
    : '/api/groq-chat';  // Or your production API base

  const response = await fetch(backendUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, options }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend error: ${response.status} - ${errorText}`);
  }

  // Check if response is JSON; handle non-JSON gracefully
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Expected JSON, got: ${text.substring(0, 100)}...`);
  }

  const result = await response.json();
  return result;
}

// ==============================
// GENERATE OMNIS CONTENT
// ==============================
export async function generateOmnisContent(scenarioText) {
  const systemPrompt = `You are Omnis — a calm, predictive, wise digital-twin assistant. 
Return concise analysis in plain text. If asked for lists, return bullet points.`;

  const userPrompt = `Analyze this scenario and provide:
1) A short summary (one paragraph).
2) Key risks (bullet list).
3) 3 actionable next steps (bullet list).
4) Optional quick simulation estimate (1-2 sentences).

--- Scenario:
${scenarioText}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  return await callGroqChat(messages);
}

// ==============================
// EXPAND OMNIS TEXT
// ==============================
export async function expandOmnisText(scenarioText) {
  const initialText = await generateOmnisContent(scenarioText);

  const systemPrompt = `You are Omnis — a wise and insightful assistant.
Take the following text and expand it into a detailed, thorough, and actionable explanation. 
Keep clarity, practical advice, and readability in mind.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: initialText },
  ];

  return await callGroqChat(messages);
}