import type { GameVersion } from "../types";

// 26.1 = 101.1 per spec; we pin to the integer 101 for both bounds in v1.
const FORMAT_26X = 101;

type Mcmeta189 = { pack: { pack_format: 1; description: string } };
type Mcmeta26x = {
  pack: { min_format: number; max_format: number; description: string };
};

export type PackMcmeta = Mcmeta189 | Mcmeta26x;

export function buildPackMcmeta(version: GameVersion, description: string): PackMcmeta {
  switch (version) {
    case "1.8.9":
      return { pack: { pack_format: 1, description } };
    case "26.x":
      return {
        pack: { min_format: FORMAT_26X, max_format: FORMAT_26X, description },
      };
  }
}

export function defaultDescription(version: GameVersion): string {
  return `Generated override pack (Java ${version})`;
}
