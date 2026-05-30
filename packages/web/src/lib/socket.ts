import { io, Socket } from "socket.io-client";
import { useCanvasStore } from "../store/canvasStore";
import type { GeneratedPayload, NodeMovedPayload } from "../types";

const URL = (import.meta.env.VITE_SERVER_URL as string) || "http://localhost:4000";

export const socket: Socket = io(URL, { autoConnect: true });

socket.on("connect", () => {
  useCanvasStore.getState().setConnected(true);
});

socket.on("disconnect", () => {
  useCanvasStore.getState().setConnected(false);
});

socket.on("canvas:state", (payload: GeneratedPayload) => {
  useCanvasStore.getState().setNodes(payload.nodes);
});

socket.on("canvas:generated", (payload: GeneratedPayload) => {
  useCanvasStore.getState().setNodes(payload.nodes);
});

socket.on("node:moved", (payload: NodeMovedPayload) => {
  useCanvasStore.getState().updateNodePosition(payload.id, payload.x, payload.y);
});

socket.on("canvas:error", (err: { message: string }) => {
  console.error("[server error]", err.message);
  useCanvasStore.getState().setGenerating(false);
});

export function emitGenerate(prompt: string): void {
  useCanvasStore.getState().setGenerating(true);
  socket.emit("canvas:generate", { prompt });
}

export function emitMove(id: string, x: number, y: number): void {
  socket.emit("node:move", { id, x, y });
}
