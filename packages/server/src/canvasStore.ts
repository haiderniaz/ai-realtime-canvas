import { randomUUID } from "crypto";
import {
  CanvasNode,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  MAX_NODES,
  MAX_RADIUS,
  MAX_RECT_SIDE,
  MIN_RADIUS,
  MIN_RECT_SIDE,
} from "./types.js";

interface State {
  nodes: CanvasNode[];
}

let state: State = { nodes: [] };
const listeners = new Set<() => void>();

export function getState(): State {
  return state;
}

export function setNodes(nodes: CanvasNode[]): void {
  state = { nodes: validateAndClamp(nodes) };
  emit();
}

export function updateNodePosition(
  id: string,
  x: number,
  y: number,
): { x: number; y: number } | null {
  const node = state.nodes.find((n) => n.id === id);
  if (!node) return null;
  const clamped = clampPosition(node, x, y);
  node.x = clamped.x;
  node.y = clamped.y;
  emit();
  return clamped;
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function emit() {
  listeners.forEach((fn) => fn());
}

/**
 * Strict, defensive normalization. Anything we don't trust gets dropped or
 * clamped. The LLM and the network are both untrusted inputs.
 */
export function validateAndClamp(input: unknown): CanvasNode[] {
  if (!Array.isArray(input)) return [];
  const out: CanvasNode[] = [];
  for (const raw of input) {
    const v = normalizeNode(raw);
    if (v) out.push(v);
    if (out.length >= MAX_NODES) break;
  }
  return out;
}

function normalizeNode(raw: any): CanvasNode | null {
  if (!raw || typeof raw !== "object") return null;
  if (raw.type !== "circle" && raw.type !== "rectangle") return null;

  const id =
    typeof raw.id === "string" && raw.id.length > 0 ? raw.id : randomUUID();
  const label =
    typeof raw.label === "string" ? raw.label.slice(0, 2) : "";
  const fill = validHex(raw.fill)
    ? raw.fill
    : raw.type === "circle"
    ? "#10b981"
    : "#f59e0b";

  if (raw.type === "circle") {
    const radius = clamp(num(raw.radius, 24), MIN_RADIUS, MAX_RADIUS);
    const x = clamp(num(raw.x, CANVAS_WIDTH / 2), radius, CANVAS_WIDTH - radius);
    const y = clamp(num(raw.y, CANVAS_HEIGHT / 2), radius, CANVAS_HEIGHT - radius);
    return { id, type: "circle", x, y, radius, label, fill };
  }

  const width = clamp(num(raw.width, 80), MIN_RECT_SIDE, MAX_RECT_SIDE);
  const height = clamp(num(raw.height, 50), MIN_RECT_SIDE, MAX_RECT_SIDE);
  const x = clamp(num(raw.x, 0), 0, CANVAS_WIDTH - width);
  const y = clamp(num(raw.y, 0), 0, CANVAS_HEIGHT - height);
  return { id, type: "rectangle", x, y, width, height, label, fill };
}

function clampPosition(node: CanvasNode, x: number, y: number) {
  if (node.type === "circle") {
    return {
      x: clamp(x, node.radius, CANVAS_WIDTH - node.radius),
      y: clamp(y, node.radius, CANVAS_HEIGHT - node.radius),
    };
  }
  return {
    x: clamp(x, 0, CANVAS_WIDTH - node.width),
    y: clamp(y, 0, CANVAS_HEIGHT - node.height),
  };
}

function clamp(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function validHex(v: unknown): v is string {
  return typeof v === "string" && /^#[0-9a-fA-F]{3,8}$/.test(v);
}
