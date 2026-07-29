import { describe, expect, it } from "vitest";
import { calculateFridayMatch, calculateSessionTotals } from "../src/lib/scoring";

const equal = Array(18).fill(4);

describe("Friday scoring engine", () => {
  it("does not apply a second handicap adjustment", () => {
    const luke = { team: "LUKE" as const, scores: [...equal] };
    const sam = { team: "SAM" as const, scores: [...equal] };
    const result = calculateFridayMatch(luke, sam);
    expect(result.lukePoints).toBe(1.5);
    expect(result.samPoints).toBe(1.5);
  });

  it("calculates front, back and overall components", () => {
    const lukeScores = [...equal];
    const samScores = [...equal];
    lukeScores[0] = 3;
    samScores[10] = 3;
    const result = calculateFridayMatch(
      { team: "LUKE", scores: lukeScores },
      { team: "SAM", scores: samScores },
    );
    expect(result.components).toHaveLength(3);
    expect(result.lukePoints + result.samPoints).toBe(3);
  });

  it("sums the locked 2026 Friday match-point fixture to Luke 8 / Sam 10", () => {
    const fixtureMatches = [
      { lukePoints: 1.5, samPoints: 1.5 },
      { lukePoints: 2, samPoints: 1 },
      { lukePoints: 0.5, samPoints: 2.5 },
      { lukePoints: 1.5, samPoints: 1.5 },
      { lukePoints: 2, samPoints: 1 },
      { lukePoints: 0.5, samPoints: 2.5 },
    ].map((match) => ({
      ...match,
      components: [],
      holeWinners: [],
      finalStatus: "",
    }));
    expect(calculateSessionTotals(fixtureMatches)).toEqual({ luke: 8, sam: 10 });
  });
});
