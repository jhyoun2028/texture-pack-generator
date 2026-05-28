---
paths:
  - "server/**"
---

# Server / API-proxy rules

Scope: the serverless proxy. Its only job is description -> style-spec JSON.

- The **`ANTHROPIC_API_KEY` lives here only.** Never return it, never log it,
  never put it in error messages or responses. Read it from the environment.
- Expose **one endpoint** (`POST /api/spec`). No other routes. Texture data
  never passes through the server — it stays in the browser.
- **Validate input:** cap description length; reject empty or oversized bodies.
- **Validate output:** parse the model response and check it against the
  style-spec schema (`docs/SPEC.md` §6) before returning. Never forward raw
  model text to the client.
- Model: `claude-sonnet-4-6`. Prompt for JSON only (no prose, no code fences);
  strip fences defensively before parsing.
- Set a sane timeout; return a typed `{ error: string }` on failure — never leak
  stack traces.
