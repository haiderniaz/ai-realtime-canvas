const SYSTEM_PROMPT = `You generate canvas layouts. You MUST output ONLY a JSON object, no prose, no markdown fences, no code.

The JSON object has exactly one key, "nodes", whose value is an array of node objects.

Each node object is one of:
- circle:    { "type": "circle",    "x": <number>, "y": <number>, "radius": <number>, "label": <string>, "fill": <hex-string> }
- rectangle: { "type": "rectangle", "x": <number>, "y": <number>, "width": <number>, "height": <number>, "label": <string>, "fill": <hex-string> }

Hard constraints (the server will reject violations):
- At most 12 nodes total.
- "label" must be 0 to 2 characters.
- Canvas size is 900 wide by 600 tall. Coordinates must keep shapes fully inside.
- For circles: (x, y) is the CENTER. radius 20-40 is typical.
- For rectangles: (x, y) is the TOP-LEFT corner. width 60-130, height 40-80 is typical.
- Use these colors: center/special node "#3b82f6"; regular circles "#10b981"; rectangles "#f59e0b".
- Lay shapes out to match the user's described arrangement (star, grid, row, etc.) and keep them well spaced.

Return ONLY the JSON object. No explanation. No code fences.`;

export interface LLMResult {
  nodes: unknown;
  rawOutput: string;
}

/**
 * Returns null if no provider/key is configured. Throws on network or parse
 * failure so the orchestrator can fall back.
 */
export async function callLLM(prompt: string): Promise<LLMResult | null> {
  const provider = (process.env.LLM_PROVIDER || "").toLowerCase().trim();
  const key = (process.env.LLM_API_KEY || "").trim();
  if (!provider || !key) return null;

  const model =
    process.env.LLM_MODEL ||
    (provider === "groq" ? "llama-3.3-70b-versatile" : "gpt-4o-mini");

  const url =
    provider === "groq"
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";

  const body = {
    model,
    response_format: { type: "json_object" },
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LLM HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  const data: any = await res.json();
  const raw: string = data?.choices?.[0]?.message?.content ?? "";
  console.log("[llm] raw output:", raw);

  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  const nodes = Array.isArray(parsed) ? parsed : parsed?.nodes;
  if (!Array.isArray(nodes)) {
    throw new Error("LLM output did not contain a nodes array");
  }
  return { nodes, rawOutput: raw };
}
