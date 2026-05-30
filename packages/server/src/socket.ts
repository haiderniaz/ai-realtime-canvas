import type { Server, Socket } from "socket.io";
import { generateNodes } from "./ai/index.js";
import { getState, setNodes, updateNodePosition } from "./canvasStore.js";
import type { GeneratePayload, NodeMovePayload } from "./types.js";

export function registerSocketHandlers(io: Server): void {
  io.on("connection", (socket: Socket) => {
    console.log(`[socket] connect ${socket.id}`);

    // bring the new client up to current state immediately
    socket.emit("canvas:state", { nodes: getState().nodes });

    socket.on("canvas:generate", async (payload: GeneratePayload) => {
      const prompt = (payload?.prompt || "").trim();
      if (!prompt) return;
      console.log(`[socket] generate: "${prompt}"`);
      try {
        const nodes = await generateNodes(prompt);
        setNodes(nodes);
        io.emit("canvas:generated", { nodes: getState().nodes });
      } catch (err) {
        console.error("[socket] generate failed:", err);
        socket.emit("canvas:error", { message: "Generation failed" });
      }
    });

    socket.on("node:move", (payload: NodeMovePayload) => {
      if (!payload || typeof payload.id !== "string") return;
      const clamped = updateNodePosition(payload.id, payload.x, payload.y);
      if (clamped) {
        // broadcast to others; the mover already has its own optimistic update
        socket.broadcast.emit("node:moved", {
          id: payload.id,
          x: clamped.x,
          y: clamped.y,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`[socket] disconnect ${socket.id}`);
    });
  });
}
