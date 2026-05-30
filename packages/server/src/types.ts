// Data contract. Keep in sync with packages/web/src/types.ts.

export type ShapeType = "circle" | "rectangle";

export interface BaseNode {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  label: string;
  fill: string;
}

export interface CircleNode extends BaseNode {
  type: "circle";
  radius: number;
}

export interface RectNode extends BaseNode {
  type: "rectangle";
  width: number;
  height: number;
}

export type CanvasNode = CircleNode | RectNode;

export interface CanvasState {
  nodes: CanvasNode[];
}

export interface GeneratePayload {
  prompt: string;
}
export interface GeneratedPayload {
  nodes: CanvasNode[];
}
export interface NodeMovePayload {
  id: string;
  x: number;
  y: number;
}
export interface NodeMovedPayload {
  id: string;
  x: number;
  y: number;
}

export const CANVAS_WIDTH = 900;
export const CANVAS_HEIGHT = 600;

export const MAX_NODES = 12;
export const MIN_RADIUS = 10;
export const MAX_RADIUS = 60;
export const MIN_RECT_SIDE = 20;
export const MAX_RECT_SIDE = 200;
