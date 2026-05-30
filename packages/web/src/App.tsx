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
        <span className="eyebrow">
          <span className="pulse" />
          Live · Multiplayer Canvas
        </span>
        <h1>
          Sketch ideas <em>with words.</em>
        </h1>
        <p>
          Describe a layout in plain language — watch it appear, drag it around,
          and stay in sync across every open tab.
        </p>
      </div>

      <PromptBar />

      <div className="status">
        <span className={`dot ${connected ? "on" : ""}`} />
        <span>{connected ? "connected" : "disconnected"}</span>
        <span className="sep">·</span>
        <span>
          {count} node{count === 1 ? "" : "s"}
        </span>
      </div>

      <CanvasStage />

      <div className="caption">Prompt → JSON → render → realtime sync</div>
    </div>
  );
}
