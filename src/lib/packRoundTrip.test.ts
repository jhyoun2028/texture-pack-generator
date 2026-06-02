import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { readPack } from "./packReader";
import { writeOverridePack } from "./packWriter";
import type { GameVersion } from "../types";

const FIXTURE_ENTRIES: Array<[string, Uint8Array]> = [
  ["assets/minecraft/textures/items/diamond_sword.png", new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3])],
  ["assets/minecraft/textures/blocks/stone.png", new Uint8Array([0x89, 0x50, 0x4e, 0x47, 9, 8, 7, 6])],
  ["assets/minecraft/textures/gui/icons.png", new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0xff, 0])],
  // Sidecar file — also preserved.
  ["assets/minecraft/textures/blocks/water_still.png.mcmeta", new TextEncoder().encode('{"animation":{}}')],
  // Junk file — reader should ignore (not under assets/ or wrong ext).
  ["META-INF/MANIFEST.MF", new TextEncoder().encode("Manifest-Version: 1.0\n")],
  ["assets/minecraft/lang/en_us.json", new TextEncoder().encode("{}")],
];

async function buildFixtureFile(): Promise<File> {
  const zip = new JSZip();
  for (const [path, bytes] of FIXTURE_ENTRIES) {
    zip.file(path, bytes);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  return new File([blob], "fake-vanilla.jar", { type: "application/java-archive" });
}

async function unzipOutput(blob: Blob): Promise<Map<string, Uint8Array>> {
  const buf = await blob.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);
  const out = new Map<string, Uint8Array>();
  const tasks: Promise<void>[] = [];
  zip.forEach((path, entry) => {
    if (entry.dir) return;
    tasks.push(
      entry.async("uint8array").then((bytes) => {
        out.set(path, bytes);
      }),
    );
  });
  await Promise.all(tasks);
  return out;
}

describe("pack round-trip (M1)", () => {
  it.each<GameVersion>(["1.8.9", "26.x"])("preserves texture bytes byte-for-byte (%s)", async (version) => {
    const file = await buildFixtureFile();
    const index = await readPack(file);

    // Reader should skip non-texture, non-mcmeta entries and anything outside assets/.
    expect(index.entries.has("META-INF/MANIFEST.MF")).toBe(false);
    expect(index.entries.has("assets/minecraft/lang/en_us.json")).toBe(false);

    // Texture entries preserved exactly.
    expect(index.entries.size).toBe(4);

    const out = await writeOverridePack({ index, version });
    const written = await unzipOutput(out);

    for (const [path, bytes] of FIXTURE_ENTRIES) {
      if (!path.startsWith("assets/") || (!path.endsWith(".png") && !path.endsWith(".mcmeta"))) {
        // Reader filtered this; writer must not have it.
        expect(written.has(path)).toBe(false);
        continue;
      }
      const got = written.get(path);
      expect(got, `missing ${path}`).toBeDefined();
      expect(Array.from(got!)).toEqual(Array.from(bytes));
    }
  });

  it("emits the correct pack.mcmeta for 1.8.9", async () => {
    const file = await buildFixtureFile();
    const index = await readPack(file);
    const out = await writeOverridePack({ index, version: "1.8.9", description: "Test 189" });
    const written = await unzipOutput(out);

    const raw = written.get("pack.mcmeta");
    expect(raw).toBeDefined();
    const mcmeta = JSON.parse(new TextDecoder().decode(raw));
    expect(mcmeta).toEqual({ pack: { pack_format: 1, description: "Test 189" } });
  });

  it("emits the correct pack.mcmeta for 26.x", async () => {
    const file = await buildFixtureFile();
    const index = await readPack(file);
    const out = await writeOverridePack({ index, version: "26.x", description: "Test 26x" });
    const written = await unzipOutput(out);

    const raw = written.get("pack.mcmeta");
    expect(raw).toBeDefined();
    const mcmeta = JSON.parse(new TextDecoder().decode(raw));
    expect(mcmeta.pack.min_format).toBeGreaterThanOrEqual(100);
    expect(mcmeta.pack.max_format).toBe(mcmeta.pack.min_format);
    expect(mcmeta.pack.description).toBe("Test 26x");
    expect(mcmeta.pack.pack_format).toBeUndefined();
  });

  it("includes the Mojang disclaimer as README.txt", async () => {
    const file = await buildFixtureFile();
    const index = await readPack(file);
    const out = await writeOverridePack({ index, version: "1.8.9" });
    const written = await unzipOutput(out);

    const readme = written.get("README.txt");
    expect(readme).toBeDefined();
    const text = new TextDecoder().decode(readme);
    expect(text).toContain("NOT AN OFFICIAL MINECRAFT PRODUCT");
    expect(text).toContain("MOJANG OR MICROSOFT");
  });

  it("respects the `include` allow-list so override-only stays override-only", async () => {
    const file = await buildFixtureFile();
    const index = await readPack(file);

    const keepers = ["assets/minecraft/textures/items/diamond_sword.png"];
    const out = await writeOverridePack({ index, version: "1.8.9", include: keepers });
    const written = await unzipOutput(out);

    expect(written.has(keepers[0]!)).toBe(true);
    expect(written.has("assets/minecraft/textures/blocks/stone.png")).toBe(false);
    expect(written.has("assets/minecraft/textures/gui/icons.png")).toBe(false);
    // mcmeta + README always present
    expect(written.has("pack.mcmeta")).toBe(true);
    expect(written.has("README.txt")).toBe(true);
  });

  it("applies overrides when provided, leaves other paths untouched", async () => {
    const file = await buildFixtureFile();
    const index = await readPack(file);
    const overridden = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const overrides = new Map<string, Uint8Array>([
      ["assets/minecraft/textures/blocks/stone.png", overridden],
    ]);

    const out = await writeOverridePack({ index, version: "1.8.9", overrides });
    const written = await unzipOutput(out);

    expect(Array.from(written.get("assets/minecraft/textures/blocks/stone.png")!)).toEqual(
      Array.from(overridden),
    );
    // Untouched path still byte-equal to the original.
    expect(Array.from(written.get("assets/minecraft/textures/items/diamond_sword.png")!)).toEqual(
      Array.from(FIXTURE_ENTRIES[0]![1]),
    );
  });

  it("rejects archives with no textures under assets/", async () => {
    const zip = new JSZip();
    zip.file("README.md", "hi");
    const blob = await zip.generateAsync({ type: "blob" });
    const file = new File([blob], "empty.zip");
    await expect(readPack(file)).rejects.toThrow(/No textures/);
  });
});
