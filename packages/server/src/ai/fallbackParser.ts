import { randomUUID } from "crypto";
import {
  CanvasNode,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  MAX_NODES,
} from "../types.js";

const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;
const SATELLITE_RADIUS = 28;
const CENTER_RADIUS = 34;
const RING_RADIUS = 180;

const FILL_CENTER = "#3b82f6";
const FILL_SATELLITE = "#10b981";
const FILL_RECT = "#f59e0b";

const LABELS = "ABCDEFGHIJKL";

function rid() {
  return randomUUID();
}

function labelAt(i: number): string {
  return LABELS[i % LABELS.length];
}

/**
 * Deterministic prompt → nodes parser used as fallback when no LLM is
 * configured (or the LLM call fails). Output matches the LLM path's shape.
 */
export function fallbackParse(prompt: string): CanvasNode[] {
  const p = prompt.toLowerCase();

  // Mixed: N rectangles in a row + a circle above
  if (
    /rectangles?.*row/.test(p) &&
    /circle/.test(p)
  ) {
    const rectCount = parseIntOr(p.match(/(\d+)\s*rectangles?/)?.[1], 4);
    return makeRectRowAndCircleAbove(rectCount);
  }

  // RxC grid
  const gridMatch = p.match(/(\d+)\s*x\s*(\d+)/);
  if (gridMatch) {
    const rows = parseIntOr(gridMatch[1], 3);
    const cols = parseIntOr(gridMatch[2], 4);
    return makeGrid(rows, cols);
  }

  // Star / radial
  if (/star/.test(p) || /surrounding/.test(p) || /center\s+node/.test(p)) {
    const around = parseIntOr(
      p.match(/(\d+)\s*surrounding/)?.[1] ??
        p.match(/and\s*(\d+)/)?.[1] ??
        p.match(/(\d+)/)?.[1],
      6,
    );
    return makeStar(around);
  }

  // N rectangles in a row
  if (/rectangles?/.test(p) && /row/.test(p)) {
    const n = parseIntOr(p.match(/(\d+)/)?.[1], 4);
    return makeRectRow(n);
  }

  // N circles in a row
  if (/circles?/.test(p) && /row/.test(p)) {
    const n = parseIntOr(p.match(/(\d+)/)?.[1], 4);
    return makeCircleRow(n);
  }

  // Default: parse a number, lay out as circles in a row
  const n = parseIntOr(p.match(/(\d+)/)?.[1], 3);
  return makeCircleRow(n);
}

function parseIntOr(s: string | undefined, fallback: number): number {
  if (!s) return fallback;
  const n = parseInt(s, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function makeStar(surrounding: number): CanvasNode[] {
  const n = Math.min(Math.max(surrounding, 1), MAX_NODES - 1);
  const nodes: CanvasNode[] = [
    {
      id: rid(),
      type: "circle",
      x: CENTER_X,
      y: CENTER_Y,
      radius: CENTER_RADIUS,
      label: "C",
      fill: FILL_CENTER,
    },
  ];
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    nodes.push({
      id: rid(),
      type: "circle",
      x: CENTER_X + RING_RADIUS * Math.cos(angle),
      y: CENTER_Y + RING_RADIUS * Math.sin(angle),
      radius: SATELLITE_RADIUS,
      label: labelAt(i),
      fill: FILL_SATELLITE,
    });
  }
  return nodes;
}

function makeGrid(rows: number, cols: number): CanvasNode[] {
  const total = Math.min(rows * cols, MAX_NODES);
  const stepX = CANVAS_WIDTH / (cols + 1);
  const stepY = CANVAS_HEIGHT / (rows + 1);
  const nodes: CanvasNode[] = [];
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (idx >= total) break;
      nodes.push({
        id: rid(),
        type: "circle",
        x: stepX * (c + 1),
        y: stepY * (r + 1),
        radius: SATELLITE_RADIUS,
        label: labelAt(idx),
        fill: FILL_SATELLITE,
      });
      idx++;
    }
  }
  return nodes;
}

function makeCircleRow(n: number): CanvasNode[] {
  const count = Math.min(Math.max(n, 1), MAX_NODES);
  const step = CANVAS_WIDTH / (count + 1);
  const nodes: CanvasNode[] = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      id: rid(),
      type: "circle",
      x: step * (i + 1),
      y: CENTER_Y,
      radius: SATELLITE_RADIUS,
      label: labelAt(i),
      fill: FILL_SATELLITE,
    });
  }
  return nodes;
}

function makeRectRow(n: number): CanvasNode[] {
  const count = Math.min(Math.max(n, 1), MAX_NODES);
  const width = 110;
  const height = 70;
  const gap = 20;
  const totalWidth = count * width + (count - 1) * gap;
  const startX = Math.max(0, (CANVAS_WIDTH - totalWidth) / 2);
  const y = CENTER_Y - height / 2;
  const nodes: CanvasNode[] = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      id: rid(),
      type: "rectangle",
      x: startX + i * (width + gap),
      y,
      width,
      height,
      label: labelAt(i),
      fill: FILL_RECT,
    });
  }
  return nodes;
}

function makeRectRowAndCircleAbove(rectCount: number): CanvasNode[] {
  const count = Math.min(Math.max(rectCount, 1), MAX_NODES - 1);
  const width = 110;
  const height = 70;
  const gap = 20;
  const totalWidth = count * width + (count - 1) * gap;
  const startX = Math.max(0, (CANVAS_WIDTH - totalWidth) / 2);
  const rectY = CENTER_Y + 60;
  const nodes: CanvasNode[] = [
    {
      id: rid(),
      type: "circle",
      x: CENTER_X,
      y: CENTER_Y - 100,
      radius: CENTER_RADIUS,
      label: "C",
      fill: FILL_CENTER,
    },
  ];
  for (let i = 0; i < count; i++) {
    nodes.push({
      id: rid(),
      type: "rectangle",
      x: startX + i * (width + gap),
      y: rectY,
      width,
      height,
      label: labelAt(i),
      fill: FILL_RECT,
    });
  }
  return nodes;
}
