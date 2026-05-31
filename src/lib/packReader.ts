import JSZip from "jszip";
import type { PackIndex } from "../types";

const TEXTURE_EXTENSIONS = [".png"];
const SIDECAR_EXTENSIONS = [".mcmeta"];

function isInteresting(path: string): boolean {
  if (!path.startsWith("assets/")) return false;
  const lower = path.toLowerCase();
  return (
    TEXTURE_EXTENSIONS.some((ext) => lower.endsWith(ext)) ||
    SIDECAR_EXTENSIONS.some((ext) => lower.endsWith(ext))
  );
}

export async function readPack(file: File): Promise<PackIndex> {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);

  const entries = new Map<string, Uint8Array>();
  const tasks: Promise<void>[] = [];

  zip.forEach((relativePath, entry) => {
    if (entry.dir) return;
    if (!isInteresting(relativePath)) return;
    tasks.push(
      entry.async("uint8array").then((bytes) => {
        entries.set(relativePath, bytes);
      }),
    );
  });

  await Promise.all(tasks);

  if (entries.size === 0) {
    throw new Error(
      "No textures found under assets/. Is this a vanilla resource pack or client jar?",
    );
  }

  return { entries, sourceName: file.name };
}
