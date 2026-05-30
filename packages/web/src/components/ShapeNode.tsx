import type Konva from "konva";
import { Circle, Group, Rect, Text } from "react-konva";
import { emitMove } from "../lib/socket";
import { useCanvasStore } from "../store/canvasStore";
import { CANVAS_HEIGHT, CANVAS_WIDTH, type CanvasNode } from "../types";

interface Props {
  node: CanvasNode;
}

export function ShapeNode({ node }: Props) {
  const update = useCanvasStore((s) => s.updateNodePosition);

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const { x, y } = e.target.position();
    update(node.id, x, y);
    emitMove(node.id, x, y);
  };

  if (node.type === "circle") {
    return (
      <Group
        x={node.x}
        y={node.y}
        draggable
        onDragMove={handleDragMove}
        dragBoundFunc={(pos) => ({
          x: Math.max(node.radius, Math.min(CANVAS_WIDTH - node.radius, pos.x)),
          y: Math.max(node.radius, Math.min(CANVAS_HEIGHT - node.radius, pos.y)),
        })}
      >
        <Circle
          radius={node.radius}
          fill={node.fill}
          stroke="#2b3327"
          strokeWidth={1.5}
          shadowColor="#2b3327"
          shadowBlur={10}
          shadowOpacity={0.18}
          shadowOffsetY={3}
        />
        <Text
          text={node.label}
          fontSize={Math.max(12, Math.floor(node.radius * 0.7))}
          fontStyle="bold"
          fill="#ffffff"
          width={node.radius * 2}
          height={node.radius * 2}
          offsetX={node.radius}
          offsetY={node.radius}
          align="center"
          verticalAlign="middle"
          listening={false}
        />
      </Group>
    );
  }

  return (
    <Group
      x={node.x}
      y={node.y}
      draggable
      onDragMove={handleDragMove}
      dragBoundFunc={(pos) => ({
        x: Math.max(0, Math.min(CANVAS_WIDTH - node.width, pos.x)),
        y: Math.max(0, Math.min(CANVAS_HEIGHT - node.height, pos.y)),
      })}
    >
      <Rect
        width={node.width}
        height={node.height}
        fill={node.fill}
        stroke="#2b3327"
        strokeWidth={1.5}
        cornerRadius={10}
        shadowColor="#2b3327"
        shadowBlur={10}
        shadowOpacity={0.18}
        shadowOffsetY={3}
      />
      <Text
        text={node.label}
        fontSize={18}
        fontStyle="bold"
        fill="#ffffff"
        width={node.width}
        height={node.height}
        align="center"
        verticalAlign="middle"
        listening={false}
      />
    </Group>
  );
}
