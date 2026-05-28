---
paths:
  - "src/components/**"
---

# UI / component rules

Scope: React components.

- Functional components + hooks only. No class components.
- **No business logic in components.** Unzipping, transforms, spec calls, and
  packaging live in `src/lib/**`; components call into lib and render.
- The **Mojang disclaimer must always render** in the footer (see `README.md`).
  Don't remove, hide, or shorten it past recognizability.
- The resolution picker must label 32/64/128 as **"upscaled"** — 16x is the only
  real-detail tier.
- Accessible by default: labelled inputs, keyboard-operable controls, visible
  focus states, alt text on preview images.
- Show explicit states for: no file yet, parsing, generating, error, done.
  A malformed or unexpected upload must never crash the app.
- Tailwind for styling; keep class lists readable (group by layout / color / state).
