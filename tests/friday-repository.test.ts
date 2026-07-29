import { describe, expect, it } from "vitest";
import { getFridayMatchFromSeed, getFridayMatchesFromSeed } from "../src/lib/repositories/friday";

describe("Friday repository", () => {
  it("returns six real 2026 Friday matches", () => {
    const matches = getFridayMatchesFromSeed();
    expect(matches).toHaveLength(6);
    expect(matches[0].luke.player1).toBe("B. Stone");
    expect(matches[0].sam.player1).toBe("L. Bush");
  });

  it("returns exactly two complete scorecards per match", () => {
    for (let matchNumber = 1; matchNumber <= 6; matchNumber += 1) {
      const match = getFridayMatchFromSeed(matchNumber);
      expect(match.luke.scores).toHaveLength(18);
      expect(match.sam.scores).toHaveLength(18);
    }
  });
});
