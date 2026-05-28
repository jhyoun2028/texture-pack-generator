---
paths:
  - "src/lib/versions.ts"
---

# Version rules

Scope: the ONLY file allowed to know version-specific facts. If you're about to
write `if (version === '1.8.9')` anywhere else, move it here instead.

`versions.ts` owns exactly two things:

1. **`pack.mcmeta` format** per version:
   - 1.8.9 -> `{ "pack": { "pack_format": 1, "description": "..." } }`
   - 26.x  -> `{ "pack": { "min_format": N, "max_format": N, "description": "..." } }`
     (N in the 100s; 26.1 = `101.1`)
2. **`match` -> file-path resolution** for the targeted-edit groups.

Subtle trap — GUI textures differ by layout:

| group | 1.8.9 | 26.x |
|---|---|---|
| hearts / hunger / armor icons | a **region** of `gui/icons.png` | individual sprites under `gui/sprites/...` |
| hotbar / widgets | regions of `gui/widgets.png` | `gui/sprites/hud/...` |

A `match` may therefore resolve to a whole file OR a (file + rect) region. The
return type must express both; targeted ops receive the resolved region, never a
raw path.

Because the base pack is user-uploaded, validate resolved paths against what's
actually in their pack, and skip a `match` gracefully when its file is absent.
