# CLAUDE.md

Project context for Claude Code. Keep this file lean — the full product +
technical spec lives in `docs/SPEC.md`. Read that before starting a new area.

## What this is

A browser app that turns a text description into a Minecraft **Java** resource
pack (PvP or normal) by **editing a vanilla base that the user uploads** — not by
generating textures from scratch. It targets two game versions: **1.8.9** (the
legacy PvP version) and **26.x** (current; Minecraft moved to a `year.drop.hotfix`
scheme in 2026, latest stable is 26.1.2).

## Non-negotiable rules

These exist for legal reasons (Mojang's Usage Guidelines) and for product
correctness. Do not violate them, and flag any task that would require it:

- **Never commit, bundle, or host Mojang / vanilla assets.** The base pack is
  always supplied by the user at runtime — they upload their own `.zip` or `.jar`
  (which they own). The repo and server stay clean of Mojang art.
- **Output is override-only.** A generated pack contains ONLY the files we
  actually changed. Minecraft falls back to vanilla for everything else, so we
  never redistribute unmodified assets and packs stay small.
- **All texture transformation runs client-side** (browser Canvas). The only
  network call is the description→style-spec request to our own backend proxy.
- **The Anthropic API key lives server-side only.** Never expose it to the
  client or commit it.
- **Always ship the disclaimer.** UI footer + a `README.txt` inside every
  generated pack: `NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR
  ASSOCIATED WITH MOJANG OR MICROSOFT.` Non-commercial only.
- **Preserve paths exactly.** When writing an override, keep the uploaded file's
  path and name byte-for-byte so Minecraft resolves it correctly.

## Stack

- **Vite + React + TypeScript** (strict mode), **Tailwind** for UI.
- **JSZip** — read the uploaded `.jar`/`.zip` and write the output pack.
- **HTML5 Canvas / `ImageData`** — all pixel operations. Disable image
  smoothing; pixel art must scale with nearest-neighbor only.
- **Backend:** a single serverless route (`server/api/spec.ts`) that proxies the
  Anthropic API (`@anthropic-ai/sdk`, model `claude-sonnet-4-6`) for the
  description→style-spec step. Nothing else needs a server.

## Layout

```
CLAUDE.md
README.md
docs/SPEC.md
index.html
package.json
src/
  App.tsx
  components/        UI: Uploader, PromptBox, VersionPicker, ResolutionPicker, Preview, DownloadButton
  lib/
    packReader.ts    unzip uploaded jar/zip, index texture entries
    styleSpec.ts     call backend, validate the returned style-spec JSON
    transform/       pure ImageData ops: hue, saturation, brightness, contrast, colorize, overlay
    targets/         curated per-texture edits (sword, crosshair, hotbar, hearts, fire, water...)
    packWriter.ts    assemble override-only pack + pack.mcmeta, zip it
    versions.ts      THE ONLY place version-specific logic lives (see below)
  types.ts
server/api/spec.ts   Anthropic proxy (key stays here)
.claude/rules/       optional path-scoped rules
```

## Commands (once scaffolded)

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm test` — Vitest. Transforms are pure `ImageData -> ImageData`; unit-test them.
- `npm run lint` — ESLint + Prettier

## Version handling

All version-specific knowledge lives in `src/lib/versions.ts` — nowhere else.

- **1.8.9:** `pack.mcmeta` is `{"pack":{"pack_format":1,"description":"..."}}`.
  Legacy flat layout (`textures/blocks/`, `textures/items/`, GUI packed into
  sheets like `gui/icons.png`).
- **26.x:** `pack.mcmeta` uses `min_format`/`max_format` (values in the 100s;
  26.1 = `101.1`). Modern layout (`block`/`item` singular, GUI split into
  individual sprites under `gui/sprites/...`, JSON item models).

Because the base is user-uploaded, the real texture paths come from *their* pack.
`versions.ts` only owns: which `pack.mcmeta` format to emit, and the curated
target-texture lists per layout.

## Resolution tiers

16 / 32 / 64 / 128 in the UI. Editing vanilla means **16x is the only tier with
real detail.** 32/64/128 are nearest-neighbor upscales (same art, bigger pixels)
unless an AI super-resolution pass is added — that's out of scope for v1. Label
upscaled tiers honestly in the UI.

## Conventions

- Functional components + hooks. No class components.
- Keep transform functions pure and side-effect-free for testability.
- Never generate art from scratch — every output texture derives from an
  uploaded source file.
- Validate the style-spec JSON from the model against a schema before using it
  (see `docs/SPEC.md`); never trust raw model output to drive Canvas ops.
