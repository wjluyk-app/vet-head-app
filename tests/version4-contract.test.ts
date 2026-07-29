import { describe, expect, it } from "vitest";
import seed from "../src/data/2026-workbook-seed.json";

describe("Version 4 database contract", () => {
  it("contains all sessions and pairings needed for the 2026 seed", () => {
    expect(seed.pairings).toHaveLength(30);
    expect(seed.pairings.filter((item) => item.day === "Friday")).toHaveLength(6);
    expect(seed.pairings.filter((item) => item.day === "Saturday")).toHaveLength(6);
    expect(seed.pairings.filter((item) => item.day === "Sunday Front")).toHaveLength(6);
    expect(seed.pairings.filter((item) => item.day === "Sunday Back")).toHaveLength(12);
  });

  it("seeds exactly 216 Friday hole scores", () => {
    const total = seed.friday.scorecards.reduce(
      (sum, card) => sum + card.scores.length,
      0,
    );
    expect(total).toBe(216);
  });
});
