import { Layer, Rect, Stage } from "react-konva";
import { useCanvasStore } from "../store/canvasStore";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../types";
import { ShapeNode } from "./ShapeNode";

export function CanvasStage() {
  const nodes = useCanvasStore((s) => s.nodes);
  return (
    <div className="canvas-wrap">
      <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
        <Layer>
          <Rect
            x={0}
            y={0}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            fill="#0b1220"
            listening={false}
          />
          {nodes.map((n) => (
            <ShapeNode key={n.id} node={n} />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
