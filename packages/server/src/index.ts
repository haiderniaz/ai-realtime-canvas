import "dotenv/config";
import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { getState, setNodes, subscribe } from "./canvasStore.js";
import { loadCanvas, saveCanvasDebounced } from "./persistence.js";
import { registerSocketHandlers } from "./socket.js";

const PORT = parseInt(process.env.PORT || "4000", 10);
const WEB_ORIGIN = process.env.WEB_ORIGIN || "http://localhost:5173";

const app = express();
app.use(cors({ origin: WEB_ORIGIN }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, nodes: getState().nodes.length });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: WEB_ORIGIN, methods: ["GET", "POST"] },
});

// restore from disk (bonus)
const persisted = loadCanvas();
if (persisted && persisted.length > 0) {
  setNodes(persisted);
  console.log(`[server] restored ${persisted.length} nodes from canvas.json`);
}

// persist on every state mutation (debounced)
subscribe(() => saveCanvasDebounced(getState().nodes));

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
  console.log(
    `[server] LLM provider: ${process.env.LLM_PROVIDER || "(none — using fallback)"}`,
  );
  console.log(`[server] web origin (CORS): ${WEB_ORIGIN}`);
});
