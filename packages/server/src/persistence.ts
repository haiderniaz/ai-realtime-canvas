import fs from "fs";
import path from "path";
import { CanvasNode } from "./types.js";

const FILE = path.resolve(process.cwd(), "canvas.json");

export function loadCanvas(): CanvasNode[] | null {
  try {
    if (!fs.existsSync(FILE)) return null;
    const raw = fs.readFileSync(FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.nodes)) return parsed.nodes as CanvasNode[];
    return null;
  } catch (err) {
    console.warn("[persistence] failed to load:", (err as Error).message);
    return null;
  }
}

let writeTimer: NodeJS.Timeout | null = null;

export function saveCanvasDebounced(nodes: CanvasNode[]): void {
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    try {
      fs.writeFileSync(FILE, JSON.stringify({ nodes }, null, 2), "utf-8");
    } catch (err) {
      console.warn("[persistence] failed to save:", (err as Error).message);
    }
  }, 250);
}
