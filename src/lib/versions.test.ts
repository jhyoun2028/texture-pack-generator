import { describe, expect, it } from "vitest";
import { buildPackMcmeta } from "./versions";

describe("buildPackMcmeta", () => {
  it("emits pack_format=1 for 1.8.9", () => {
    const mcmeta = buildPackMcmeta("1.8.9", "Test");
    expect(mcmeta).toEqual({ pack: { pack_format: 1, description: "Test" } });
  });

  it("emits min_format/max_format for 26.x in the 100s", () => {
    const mcmeta = buildPackMcmeta("26.x", "Test");
    expect(mcmeta).toEqual({
      pack: { min_format: 101, max_format: 101, description: "Test" },
    });
    if (!("min_format" in mcmeta.pack)) throw new Error("type narrowing failed");
    expect(mcmeta.pack.min_format).toBeGreaterThanOrEqual(100);
  });

  it("never emits both shapes simultaneously", () => {
    const m189 = buildPackMcmeta("1.8.9", "x");
    const m26 = buildPackMcmeta("26.x", "x");
    expect("pack_format" in m189.pack).toBe(true);
    expect("min_format" in m189.pack).toBe(false);
    expect("pack_format" in m26.pack).toBe(false);
    expect("min_format" in m26.pack).toBe(true);
  });
});
