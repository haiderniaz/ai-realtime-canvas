import { validateAndClamp } from "../canvasStore.js";
import { CanvasNode } from "../types.js";
import { fallbackParse } from "./fallbackParser.js";
import { callLLM } from "./llmProvider.js";

export async function generateNodes(prompt: string): Promise<CanvasNode[]> {
  try {
    const result = await callLLM(prompt);
    if (result) {
      const validated = validateAndClamp(result.nodes);
      if (validated.length > 0) {
        console.log(`[ai] LLM produced ${validated.length} valid nodes`);
        return validated;
      }
      console.warn("[ai] LLM produced 0 valid nodes; falling back");
    }
  } catch (err) {
    console.warn("[ai] LLM call failed; falling back:", (err as Error).message);
  }
  const nodes = fallbackParse(prompt);
  return validateAndClamp(nodes);
}
