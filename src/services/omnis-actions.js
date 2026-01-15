// ==============================
// CLIENT-SIDE GROQ CALL WRAPPER
// ==============================
export async function callGroqChat(messages, options = {}) {
  const backendUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/api/groq-chat'
    : '/api/groq-chat';

  const response = await fetch(backendUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, options }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend error: ${response.status} - ${errorText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Expected JSON, got: ${text.substring(0, 100)}...`);
  }

  const result = await response.json();
  
  // Extract the actual text content from the API response
  // Adjust this based on your actual backend response structure
  let content = result.choices?.[0]?.message?.content || // OpenAI/Groq format
                result.content || // Simple format
                result.text || 
                result.message ||
                result;
  
  // Handle if content is an array (some APIs return [{type: 'text', text: '...'}])
  if (Array.isArray(content)) {
    content = content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n');
  }
  
  // Remove <think> tags if present
  if (typeof content === 'string') {
    content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  }

  return content;
}

// ==============================
// FORMAT OMNIS OUTPUT WITH LAYERS & TABLES
// ==============================
export function formatOmnisOutput(rawText) {
  if (!rawText) return "";

  // Split by lines
  const lines = rawText.split("\n");

  let html = "";
  let currentLayer = null;
  let inTable = false;
  let tableRows = [];

  const flushTable = () => {
    if (!tableRows.length) return "";
    let tableHtml = '<table class="omnis-table">';
    tableRows.forEach((row, idx) => {
      const cols = row.split("|").map(c => c.trim()).filter(c => c !== "");
      tableHtml += "<tr>";
      cols.forEach((col, ci) => {
        tableHtml += idx === 0
          ? `<th>${col}</th>`  // first row = header
          : `<td>${col}</td>`;
      });
      tableHtml += "</tr>";
    });
    tableRows = [];
    tableHtml += "</table>";
    return tableHtml;
  };

  lines.forEach((line, idx) => {
    line = line.trim();

    if (!line) return; // skip empty lines

    // Detect layer headers
    const layerMatch = line.match(/^(🟢|📘|📊).+/);
    if (layerMatch) {
      // Close previous layer div if exists
      if (currentLayer) {
        html += "</div>";
      }
      const layerId = `layer-${idx}`;
      currentLayer = layerId;
      // Summary layer expanded by default, others collapsed
      const expanded = line.startsWith("🟢") ? "block" : "none";
      html += `
      <div class="omnis-layer">
        <div class="omnis-layer-header" onclick="toggleLayer('${layerId}')">
          ${line} ▼
        </div>
        <div id="${layerId}" class="omnis-layer-content" style="display:${expanded}">
      `;
      return;
    }

    // Detect table row
    if (line.startsWith("|")) {
      inTable = true;
      tableRows.push(line);
      return;
    } else if (inTable) {
      // flush table before processing non-table line
      html += flushTable();
      inTable = false;
    }

    // Detect headings marked with **Heading**
    const headingMatch = line.match(/^\*\*(.+?)\*\*$/);
    if (headingMatch) {
      html += `<div class="omnis-heading">${headingMatch[1]}</div>`;
      return;
    }

    // Detect bullets (- or *)
    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      html += `<div class="omnis-bullet">• ${bulletMatch[1]}</div>`;
      return;
    }

    // Otherwise, regular paragraph
    html += `<div class="omnis-paragraph">${line}</div>`;
  });

  // flush any remaining table
  html += flushTable();

  // close last layer if open
  if (currentLayer) html += "</div>";

  return html;
}

// ==============================
// TOGGLE FUNCTION FOR COLLAPSIBLE LAYERS
// ==============================
export function toggleLayer(layerId) {
  const content = document.getElementById(layerId);
  if (!content) return;
  const header = content.previousElementSibling;
  if (content.style.display === "none") {
    content.style.display = "block";
    if (header.textContent.endsWith("▼")) header.textContent = header.textContent.replace("▼","▲");
  } else {
    content.style.display = "none";
    if (header.textContent.endsWith("▲")) header.textContent = header.textContent.replace("▲","▼");
  }
}


// ==============================
// GENERATE OMNIS CONTENT (STEP 1) - CONCISE VERSION
// ==============================
export async function generateOmnisContent(scenarioText) {
  const systemPrompt = `
You are Omnis – a digital-twin reasoning engine.

You provide CONCISE, structured overviews of decision scenarios.
Keep everything brief and scannable. Users can request deeper analysis separately.

Your role is to:
- Identify key decision points quickly
- Sketch 2–3 plausible future paths (brief summaries only)
- Flag major trade-offs
- Keep it SHORT - this is the preview, not the full analysis

Important constraints:
- Maximum 2-3 sentences per section
- No deep explanations yet
- Focus on WHAT, not WHY (the why comes later)
- Be punchy and clear

Tone & style:
- Crisp, direct, minimal
- Use strong verbs
- No fluff or repetition
`;

  const userPrompt = `
Analyze this scenario with a BRIEF overview. Keep everything concise.

Required structure:

**Current State**
1-2 sentences max. What's the core situation and main pressure point?

**Decision Forks**
List 2–3 realistic choices (one line each, no explanations).

**Future Paths**
For EACH fork, provide ONLY:
- One-line summary of where this path leads
- Main upside (5-8 words)
- Main downside (5-8 words)

**Key Trade-Off**
1-2 sentences. What's the central tension across all paths?

**Next Step**
One concrete action to take in the next 48 hours.

Scenario:
${scenarioText}

IMPORTANT: Keep this BRIEF. Detailed causal analysis comes later. Each section should be scannable in 5 seconds.
`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  return await callGroqChat(messages);
}


// ==============================
// EXPAND OMNIS TEXT (STEP 2) - DEEP DIVE VERSION
// ==============================
export async function expandOmnisText(previousOutput) {
  const systemPrompt = `
You are Omnis – a decision intelligence engine.

Your task is to expand a brief scenario overview into a layered analysis:

1️⃣ Summary Layer – quick scan (2–3 sentences per section)
2️⃣ Context Layer – causal and emotional context (4–6 sentences)
3️⃣ Optional Deep Layer – full causal depth, tactical steps, red flags (only if user clicks "Expand More")

Key rules:
- Keep output readable and scannable.
- Use bullet points for clarity.
- Avoid long paragraphs; break text into digestible chunks.
- Neutral tone: no prescriptive commands, no hard percentages (use qualitative descriptors like Low/Medium/High risk).
- Explicitly highlight alignment with core values (faith, purpose, well-being, autonomy).
- Use headings for each section and indicate which layer each part belongs to.

Tone:
- Thoughtful, reverent, advisory
- Supportive, not controlling
- Encourage clarity and reflection
`;

  const userPrompt = `
Original brief overview:

${previousOutput}

---

Transform this into a **layered analysis** with the following structure:

**Summary Layer** (default view)
- Current State: 2–3 sentences highlighting core pressures
- Decision Forks: 2–3 choices, 1 line each
- Future Paths: 1 line per path (summary + main upside + main downside)
- Key Trade-Off: 1–2 sentences
- Next Step: 1 concrete action for next 48 hours

**Context Layer** (click to expand)
- Expand Current State: 4–6 sentences, including hidden constraints and emotional factors
- Decision Forks: 1–2 sentences logic per choice
- Future Paths: explain triggers, assumptions, and fragility (qualitative, not numeric)
- Trade-Off Analysis: deeper explanation of central tension and value alignment

**Deep Layer** (optional, full insight)
- Full causal depth per path
- Timeline breakdown (0–30, 30–90, 90–365 days)
- Hidden factors: psychological, second-order, overlooked aspects
- Path reversibility (Easy/Moderate/Hard/Irreversible)
- Risk vs. Reward matrix (qualitative)
- Tactical 7–14 day next steps
- Red Flags

Guidelines:
- Present each layer progressively; users can stop at any layer.
- Keep all text **scannable with bullet points and headings**.
- Avoid overwhelming the user at first glance.
- Highlight **purpose alignment** where relevant (faith, autonomy, well-being, stewardship).
- Use qualitative descriptors rather than precise percentages or forecasts.
`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  return await callGroqChat(messages);
}
