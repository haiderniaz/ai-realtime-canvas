import { Layer, Line, Rect, Stage } from "react-konva";
import { useCanvasStore } from "../store/canvasStore";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../types";
import { ShapeNode } from "./ShapeNode";

const CREAM = "#f6efd8";
const GRID_MINOR = "rgba(43, 51, 39, 0.07)";
const GRID_MAJOR = "rgba(43, 51, 39, 0.13)";
const GRID_STEP = 40;
const MAJOR_EVERY = 4;

function buildGrid() {
  const lines: { points: number[]; stroke: string; strokeWidth: number }[] = [];
  for (let i = 1, x = GRID_STEP; x < CANVAS_WIDTH; x += GRID_STEP, i++) {
    const major = i % MAJOR_EVERY === 0;
    lines.push({
      points: [x, 0, x, CANVAS_HEIGHT],
      stroke: major ? GRID_MAJOR : GRID_MINOR,
      strokeWidth: 1,
    });
  }
  for (let i = 1, y = GRID_STEP; y < CANVAS_HEIGHT; y += GRID_STEP, i++) {
    const major = i % MAJOR_EVERY === 0;
    lines.push({
      points: [0, y, CANVAS_WIDTH, y],
      stroke: major ? GRID_MAJOR : GRID_MINOR,
      strokeWidth: 1,
    });
  }
  return lines;
}

const GRID = buildGrid();

export function CanvasStage() {
  const nodes = useCanvasStore((s) => s.nodes);
  return (
    <div className="canvas-wrap">
      <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
        <Layer listening={false}>
          <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill={CREAM} />
          {GRID.map((g, i) => (
            <Line
              key={i}
              points={g.points}
              stroke={g.stroke}
              strokeWidth={g.strokeWidth}
              listening={false}
            />
          ))}
        </Layer>
        <Layer>
          {nodes.map((n) => (
            <ShapeNode key={n.id} node={n} />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
