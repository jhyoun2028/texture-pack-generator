# SPEC.md — Texture Pack Generator

The detailed reference for the project. `CLAUDE.md` holds the short version and
the hard rules; this file explains the *why* and the *how*. Read the relevant
section before building that area.

## 1. Overview

A web app where a user uploads a vanilla Minecraft resource pack, types a
description ("frosty blue PvP pack with a glowing sword"), and gets back a
customized **override-only** pack to drop into their `resourcepacks` folder. We
transform their uploaded vanilla textures; we do not draw new art.

Targets: Minecraft **Java Edition**, versions **1.8.9** and **26.x**.

## 2. Goals / Non-goals

**Goals (v1)**
- Upload a vanilla `.zip`/`.jar`, recolor/grade it from a text description, download an override pack.
- Support both 1.8.9 and 26.x output formats.
- Curated targeted edits for the textures PvP players actually notice.

**Non-goals (v1)**
- Generating textures from scratch with image models.
- True high-resolution detail (HD is upscale-only in v1 — see §7).
- Bedrock Edition. Selling packs. Hosting any Mojang asset.

## 3. Legal constraints (read before anything user-facing)

Mojang's Usage Guidelines prohibit redistributing their game files or
alterations of them, and prohibit commercial use of their assets. Modified
vanilla resource packs are *tolerated* for non-commercial community use, but
that is not a license. We design around it:

1. The base is **always user-supplied** at runtime — we never host vanilla art.
2. Output is **override-only** (changed files only).
3. **Non-commercial.** Disclaimer in the UI and inside each generated pack.
4. Not legal advice — link users to `minecraft.net/usage-guidelines`.

## 4. User flow

1. Pick target version (1.8.9 or 26.x) and resolution.
2. Upload vanilla `.zip`/`.jar`.
3. Type a description.
4. Preview a few before/after textures.
5. Download the override pack.

## 5. Pipeline

```
description ─▶ [backend: Claude] ─▶ style-spec JSON (validated)
                                          │
uploaded pack ─▶ packReader (unzip+index) │
                                          ▼
                          transform engine (Canvas, per file)
                       global grade  +  targeted ops (PvP textures)
                                          │
                                          ▼
                  packWriter: changed files + pack.mcmeta ─▶ JSZip ─▶ download
```

Everything except the single Claude call happens in the browser.

## 6. Style-spec schema

The contract between the model and the transform engine. The backend prompts
Claude to return ONLY this JSON; `styleSpec.ts` validates it before use.

```jsonc
{
  "theme": "frosty blue",
  "palette": { "primary": "#9fd8ff", "secondary": "#2b6cb0", "accent": "#e6faff" },
  "global": {
    "hueShift": -20,        // degrees, -180..180
    "saturation": 1.1,      // 0..2 (1 = unchanged)
    "brightness": 1.0,      // 0..2
    "contrast": 1.05,       // 0..2
    "colorize": { "color": "#9fd8ff", "strength": 0.25 }  // or null
  },
  "targets": [
    { "match": "sword",     "ops": [ { "type": "outline", "color": "#e6faff" },
                                      { "type": "glow", "color": "#9fd8ff", "strength": 0.6 } ] },
    { "match": "crosshair", "ops": [ { "type": "recolor", "color": "#e6faff" } ] },
    { "match": "water",     "ops": [ { "type": "colorize", "color": "#2b6cb0", "strength": 0.5 } ] }
  ],
  "notes": "short human-readable summary of the intent"
}
```

`match` keys are abstract texture groups (e.g. `sword`, `bow`, `crosshair`,
`hotbar`, `hearts`, `hunger`, `fire`, `water`, `apple`, `golden_apple`). They
resolve to concrete file paths per version inside `versions.ts` — the engine and
the model never deal with raw paths.

## 7. Versions & resolution

| | 1.8.9 | 26.x |
|---|---|---|
| `pack.mcmeta` | `pack_format: 1` | `min_format`/`max_format` (~101) |
| Layout | flat: `textures/blocks/`, `textures/items/` | `block`/`item` singular |
| GUI | single sheets (`gui/icons.png`) | individual `gui/sprites/...` |

Note the GUI difference matters for targeted edits: in 1.8.9, hearts/hunger live
on one `icons.png` sheet, so a `hearts` op edits a *region* of that image; in
26.x they're separate sprite files. `versions.ts` encodes which case applies.

Resolution: 16x is the only real-detail tier. 32/64/128 use nearest-neighbor
upscaling (smoothing OFF). Mark them "upscaled" in the picker.

## 8. Build plan (suggested order for Claude Code)

- **M0 — Scaffold.** Vite + React + TS + Tailwind, ESLint/Prettier, Vitest, app shell.
- **M1 — Pack I/O.** Upload `.zip`/`.jar`, unzip + index textures, write an
  *unchanged* override pack with correct `pack.mcmeta` for each version, confirm
  it loads in-game. (Round-trip first, before any editing.)
- **M2 — Transform engine.** Pure `ImageData` ops (hue, saturation, brightness,
  contrast, colorize, outline, glow, recolor). Apply a global grade to all
  textures. Before/after preview. Pixel-art-safe.
- **M3 — Style spec.** Serverless Anthropic proxy → validated JSON. Wire the
  description box → spec → global grade.
- **M4 — Targeted edits.** Implement the curated `targets` ops and per-version
  `match`→path resolution for the PvP texture set.
- **M5 — Tiers + polish.** Resolution upscaling, disclaimer, in-pack README,
  download, error handling for malformed uploads.
- **M6 (v2).** AI super-resolution for >16x; normal (non-PvP) presets;
  shareable spec links.

## 9. PvP target texture set

Priority list for §M4: sword, bow (+ pulling_0/1/2 frames), crosshair, hotbar /
widgets, hearts + hunger + armor icons, fire (low-fire), water (still/flow),
apple + golden apple, particles, hit/damage indicators.

## 10. Open questions

- Hosting target for the serverless proxy (Vercel / Netlify / Cloudflare)?
- 26.x sprite atlas handling — confirm which GUI elements are atlased vs individual in the current release.
- Pass through animated-texture `.mcmeta` files unchanged (yes, by default).
- OptiFine / CIT custom-item support — defer to v2.
