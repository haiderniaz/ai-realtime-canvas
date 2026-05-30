# AI Real-Time Canvas

A mini collaborative canvas (think tiny Figma/Miro). Type a natural-language
prompt, the backend turns it into **strict JSON describing shapes**, the
frontend renders those shapes with React Konva, you can **drag them**, and
**every change syncs live across all open tabs over Socket.IO**.

```
prompt → server (LLM or deterministic fallback)
       → validated JSON nodes
       → broadcast over socket
       → React Konva renders / drag updates → broadcast back
```

The app runs with **zero configuration** — leaving the LLM key blank uses a
deterministic fallback parser that handles the required sample prompts
(star, grid, row + center). Add a Groq or OpenAI key to switch the JSON
generation to a real LLM; no other code changes needed.

---

## Prerequisites

- Node.js **18.17+** (developed on Node 24).
- npm 9+.

## Install

From the repo root:

```bash
npm run install:all
```

This installs root tooling (`concurrently`), the server, and the web app.

## Configure (optional)

Copy the example env into `packages/server/.env`:

```bash
cp .env.example packages/server/.env
```

Fields:

| var            | default              | meaning                                          |
| -------------- | -------------------- | ------------------------------------------------ |
| `LLM_PROVIDER` | _(empty)_            | `groq` \| `openai` \| empty = use fallback only  |
| `LLM_API_KEY`  | _(empty)_            | API key for the provider above                   |
| `LLM_MODEL`    | provider default     | optional override (e.g. `llama-3.3-70b-versatile`) |
| `PORT`         | `4000`               | server port                                      |
| `WEB_ORIGIN`   | `http://localhost:5173` | CORS / socket origin for the web client       |

**Leave `LLM_API_KEY` blank and the deterministic fallback is used.** The app
still satisfies every requirement in this mode.

## Run

```bash
npm run dev
```

This starts both services in one terminal:

- **server** → http://localhost:4000  (Socket.IO + health endpoint)
- **web**    → http://localhost:5173

You can also run them separately:

```bash
npm run dev:server
npm run dev:web
```

## Try it

1. Open http://localhost:5173.
2. Click a sample prompt chip or type your own.
3. **Open a second tab** at the same URL. Generate in tab A → tab B shows
   the same layout instantly. Drag a node in either tab → both move in sync.
4. Refresh either tab → the canvas is restored (`canvas:state` on connect).
5. (Bonus) Stop and restart the server → `canvas.json` is reloaded so the
   layout survives.

### Sample prompts

- `Create a star layout with 1 center node and 6 surrounding nodes`
- `Create a 3x4 grid of circles labeled A-L`
- `Create 4 rectangles in a row and 1 circle above center`

---

## Architecture

### Data contract

Both packages share the same shape definitions
(`packages/server/src/types.ts` and `packages/web/src/types.ts`):

```ts
type ShapeType = "circle" | "rectangle";

interface CircleNode { id: string; type: "circle";    x: number; y: number; radius: number; label: string; fill: string; }
interface RectNode   { id: string; type: "rectangle"; x: number; y: number; width: number; height: number; label: string; fill: string; }

type CanvasNode = CircleNode | RectNode;
```

Canvas is fixed at **900 × 600**.

### Socket events

| event               | direction                    | payload                          | behavior                                                                              |
| ------------------- | ---------------------------- | -------------------------------- | ------------------------------------------------------------------------------------- |
| `canvas:state`      | server → newly connected     | `{ nodes }`                      | Sync the new client to the current authoritative state on connect.                    |
| `canvas:generate`   | client → server              | `{ prompt }`                     | Server runs AI/fallback → validates/clamps → **replaces** the stored nodes.           |
| `canvas:generated`  | server → **all** clients     | `{ nodes }`                      | Broadcast the new node set to everyone (including the originator).                    |
| `node:move`         | client → server              | `{ id, x, y }`                   | Server clamps and writes the new position into authoritative state.                   |
| `node:moved`        | server → **other** clients   | `{ id, x, y }`                   | Broadcast to everyone _except_ the mover so the dragger doesn't fight its own update. |
| `canvas:error`      | server → originator          | `{ message }`                    | Sent if generation fails unrecoverably.                                               |

### AI layer

`packages/server/src/ai/index.ts` is the orchestrator:

1. If `LLM_PROVIDER` and `LLM_API_KEY` are set, call the LLM via the
   OpenAI-compatible chat completions endpoint with `response_format:
   json_object` and a strict system prompt.
2. On any failure (no key, network error, unparseable output, validation
   produces zero nodes), fall back to the deterministic parser.
3. **Always** pass the result through `validateAndClamp()` before storing.

The deterministic parser handles star/grid/row prompts (and the
"rectangles in a row + circle above" composite) with simple geometry.

### Server-authoritative constraints

The backend never trusts the LLM or the client:

- Shape types must be `circle` or `rectangle` — anything else is dropped.
- At most **12 nodes** — the array is truncated.
- Labels are `slice(0, 2)`.
- Radii clamped to **10–60**, rectangle sides clamped to **20–200**.
- Positions are clamped on both generate **and** every move so shapes can
  never escape the canvas. The web client mirrors this with a Konva
  `dragBoundFunc` for instant local clamping.

---

## Repo layout

```
ai-realtime-canvas/
├── package.json                 # workspace scripts (concurrently)
├── .env.example                 # documents LLM env vars
├── packages/
│   ├── server/
│   │   └── src/
│   │       ├── index.ts         # express + socket.io bootstrap
│   │       ├── socket.ts        # socket event handlers
│   │       ├── canvasStore.ts   # authoritative state + validate/clamp
│   │       ├── persistence.ts   # canvas.json load/save (debounced)
│   │       ├── types.ts         # data contract (mirrored in web)
│   │       └── ai/
│   │           ├── index.ts        # generateNodes orchestrator
│   │           ├── llmProvider.ts  # Groq/OpenAI JSON-mode call
│   │           └── fallbackParser.ts # star/grid/row geometry
│   └── web/
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── lib/socket.ts            # socket.io-client singleton
│           ├── store/canvasStore.ts     # zustand store
│           ├── components/
│           │   ├── PromptBar.tsx
│           │   ├── CanvasStage.tsx
│           │   └── ShapeNode.tsx        # draggable circle/rect group
│           └── types.ts                 # data contract (mirrored in server)
```

See `NOTES.md` for the AI tool used and the "with more time" list.
