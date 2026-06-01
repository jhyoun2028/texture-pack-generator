import JSZip from "jszip";
import type { GameVersion, PackIndex } from "../types";
import { buildPackMcmeta, defaultDescription } from "./versions";

const DISCLAIMER = `NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.

For personal, non-commercial use only. This pack contains only files derived from the
vanilla resource pack you provided. Vanilla Minecraft assets are © Mojang AB and are not
redistributed by the Texture Pack Generator project.

See: https://www.minecraft.net/en-us/usage-guidelines
`;

export interface WritePackOptions {
  index: PackIndex;
  version: GameVersion;
  description?: string;
  // List of paths to include. Defaults to every entry in the index (M1 pass-through).
  // Future milestones will pass a filtered subset of changed paths.
  include?: Iterable<string>;
  // Map of overridden bytes per path. Future milestones populate this from the
  // transform engine; in M1 it's empty, so every included path passes through
  // unchanged from the uploaded pack.
  overrides?: Map<string, Uint8Array>;
}

export async function writeOverridePack(opts: WritePackOptions): Promise<Blob> {
  const { index, version } = opts;
  const description = opts.description ?? defaultDescription(version);
  const overrides = opts.overrides ?? new Map<string, Uint8Array>();
  const includePaths = opts.include ? new Set(opts.include) : new Set(index.entries.keys());

  const zip = new JSZip();

  for (const path of includePaths) {
    const bytes = overrides.get(path) ?? index.entries.get(path);
    if (!bytes) continue;
    zip.file(path, bytes);
  }

  const mcmeta = buildPackMcmeta(version, description);
  zip.file("pack.mcmeta", JSON.stringify(mcmeta, null, 2));
  zip.file("README.txt", DISCLAIMER);

  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

export function suggestFilename(version: GameVersion): string {
  const stamp = new Date().toISOString().slice(0, 10);
  const tag = version === "1.8.9" ? "1.8.9" : "26x";
  return `override-pack-${tag}-${stamp}.zip`;
}
