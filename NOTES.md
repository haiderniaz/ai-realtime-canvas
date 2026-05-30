# Implementation notes

## AI tools used

- **Claude Code** wrote the scaffolding, the deterministic fallback parser,
  the validation/clamping, the socket layer, the React Konva pieces, and
  this documentation.
- The runtime **LLM layer** is provider-agnostic; it speaks the
  OpenAI-compatible chat-completions API and is configured via env vars.
  Recommended default: **Groq + `llama-3.3-70b-versatile`** for the JSON
  generation, because Groq's free tier is fast enough for this UX and it
  supports `response_format: { type: "json_object" }` so the model returns
  parseable JSON without prose. OpenAI (`gpt-4o-mini`) works identically.

The system prompt forces JSON-only output; the raw model output is logged
to the server console for verification, then parsed, validated, and
clamped before anything is stored or broadcast.

## What I'd improve with more time

- **Per-user cursors and presence** — show who is dragging what.
- **Undo / redo** — a small command stack on the server.
- **Node deletion + property panel** — right-click to delete, click to
  edit label/fill/size.
- **Rooms / auth** — currently everyone shares one canvas; route by URL
  slug and gate behind a tiny token check.
- **Conflict handling for moves** — currently last-write-wins; with a
  long-haul collaborator, a CRDT (e.g. Yjs) or a vector-clock per node
  would be more robust. Today's simple broadcast is fine for two-tab
  smoke tests.
- **Server tests** — unit tests for `validateAndClamp` and
  `fallbackParse`, plus a tiny supertest/socket.io-client integration
  test for the generate → state → move loop.
- **Richer prompt understanding in the fallback** — e.g. colors,
  diagonal arrangements, mixed shape sets. Today it covers the three
  required samples and a handful of variants.
- **Throttle `node:move` emissions** — currently we fire on every
  `dragMove`. For high node counts or slow links, debouncing/throttling
  to ~30Hz would cut bandwidth without changing perceived smoothness.
- **Sticky LLM model selection from the UI** — a small dropdown rather
  than env-only configuration.
