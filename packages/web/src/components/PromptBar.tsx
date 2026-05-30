import { useState } from "react";
import { emitGenerate } from "../lib/socket";
import { useCanvasStore } from "../store/canvasStore";

const SAMPLES = [
  "Create a star layout with 1 center node and 6 surrounding nodes",
  "Create a 3x4 grid of circles labeled A-L",
  "Create 4 rectangles in a row and 1 circle above center",
];

export function PromptBar() {
  const [prompt, setPrompt] = useState("");
  const generating = useCanvasStore((s) => s.generating);

  const submit = (value?: string) => {
    const p = (value ?? prompt).trim();
    if (!p) return;
    emitGenerate(p);
  };

  return (
    <>
      <div className="prompt-bar">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Describe a layout — e.g. 'a star with 6 surrounding nodes'"
        />
        <button onClick={() => submit()} disabled={!prompt.trim() || generating}>
          {generating ? "Generating…" : "Generate"}
        </button>
      </div>
      <div className="samples">
        {SAMPLES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setPrompt(s);
              submit(s);
            }}
            disabled={generating}
          >
            {s}
          </button>
        ))}
      </div>
    </>
  );
}
