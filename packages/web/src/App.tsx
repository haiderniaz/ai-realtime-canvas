import { CanvasStage } from "./components/CanvasStage";
import { PromptBar } from "./components/PromptBar";
import "./lib/socket"; // import for side-effect: opens the socket connection
import { useCanvasStore } from "./store/canvasStore";

export default function App() {
  const connected = useCanvasStore((s) => s.connected);
  const count = useCanvasStore((s) => s.nodes.length);

  return (
    <div className="app">
      <div className="header">
        <h1>AI Real-Time Canvas</h1>
        <p>Prompt → JSON → render → live sync across tabs</p>
      </div>
      <PromptBar />
      <div className="status">
        <span className={`dot ${connected ? "on" : ""}`} />
        <span>{connected ? "connected" : "disconnected"}</span>
        <span>·</span>
        <span>
          {count} node{count === 1 ? "" : "s"}
        </span>
      </div>
      <CanvasStage />
    </div>
  );
}
