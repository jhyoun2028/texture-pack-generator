export type GameVersion = "1.8.9" | "26.x";

export type Resolution = 16 | 32 | 64 | 128;

export interface PackEntry {
  path: string;
  bytes: Uint8Array;
}

export interface PackIndex {
  entries: Map<string, Uint8Array>;
  sourceName: string;
}
