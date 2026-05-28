# Texture Pack Generator

Turn a text description into a custom Minecraft **Java** resource pack (PvP or
normal) by editing a vanilla base pack you upload — recoloring, grading, and
applying targeted tweaks to the textures that matter. Supports **1.8.9** and
**26.x**, at 16x/32x/64x/128x.

> NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG
> OR MICROSOFT. For personal, non-commercial use only. See Mojang's
> [Usage Guidelines](https://www.minecraft.net/en-us/usage-guidelines).

## How it works

You upload a vanilla pack (a `.zip` or `.jar` you already own). A short
description is turned into a "style spec," and your textures are transformed
**entirely in your browser**. You get back an **override-only** pack — just the
files that changed — so no original Mojang assets are ever hosted or
redistributed by this project.

## Quick start

```bash
npm install
npm run dev        # local dev server
npm run build      # production build
npm test           # unit tests (transforms)
```

The only server-side piece is a small proxy that calls the Anthropic API for the
description→style-spec step. Set your key in the environment (never commit it):

```bash
ANTHROPIC_API_KEY=sk-...
```

## Docs

- `CLAUDE.md` — context and rules for working in this repo with Claude Code.
- `docs/SPEC.md` — product spec, pipeline, the style-spec JSON contract, and the
  M0–M6 build plan.

## License

Your code: choose one (MIT is a reasonable default) and add a `LICENSE` file.
Vanilla Minecraft assets are © Mojang AB and are **not** included in this
repository — they are supplied by the user at runtime.
