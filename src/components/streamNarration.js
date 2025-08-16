// utils/streamNarration.js

export async function streamNarration(result, onChunk) {
  const response = await fetch("http://localhost:8000/narrate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  });

  if (!response.ok || !response.body) {
    throw new Error("Failed to get narration");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let partial = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    partial += chunk;

    const lines = partial.split("\n");
    for (let i = 0; i < lines.length - 1; i++) {
      try {
        const line = lines[i].replace(/^data:\s*/, "");
        const json = JSON.parse(line);
        onChunk(json.response);
      } catch (e) {
        // Ignore parse errors
      }
    }

    partial = lines[lines.length - 1];
  }
}
