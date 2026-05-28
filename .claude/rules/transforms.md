---
paths:
  - "src/lib/transform/**"
---

# Transform engine rules

Scope: the Canvas-based pixel transform engine.

- Every transform is a **pure function** — `(input: ImageData, opts) => ImageData`.
  No DOM access, no network, no module-level state. This keeps them unit-testable
  (`ImageData` in -> `ImageData` out).
- **Pixel-art-safe.** Set `imageSmoothingEnabled = false` on every context. Any
  scaling is nearest-neighbor only — never blur, antialias, or interpolate.
- **Preserve alpha.** Work in straight (non-premultiplied) alpha; transparent
  pixels stay transparent. Color ops touch RGB only unless the op explicitly
  targets alpha.
- Color math: convert to HSL/HSV for hue/saturation ops; clamp to 0–255; round,
  don't floor, to avoid cumulative drift.
- Output dimensions always equal input dimensions. Resolution scaling is a
  separate explicit step in `packWriter`, not here.
- No op may assume a texture size — code must work at 16/32/64/128.
- Add a Vitest case for every new op (identity input + a known-color input).
