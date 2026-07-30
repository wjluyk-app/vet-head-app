import { describe, expect, it } from "vitest";
import { calculateFridayLiveMatch, calculateFridayLiveResults } from "@/lib/friday-results";
import type { LiveFridayMatch, LiveHoleScore } from "@/lib/live-types";

function score(holeNumber: number, netScore: number): LiveHoleScore {
  return { holeNumber, netScore, version: 1, updatedAt: `2026-08-28T12:${String(holeNumber).padStart(2, "0")}:00Z` };
}

function match(luke: Array<number | null>, sam: Array<number | null>, matchNumber = 1): LiveFridayMatch {
  const card = (team: string, values: Array<number | null>) => ({
    id: `${team}-${matchNumber}`,
    sourceKey: `${team}-${matchNumber}`,
    teamShortName: team,
    player1: `${team} One`,
    player2: `${team} Two`,
    scores: values.map((value, index) => value === null ? null : score(index + 1, value)),
  });
  return {
    pairingId: `pairing-${matchNumber}`,
    matchNumber,
    teeTime: "13:00:00",
    course: "Mountain Course",
    format: "1 Best Ball of 2",
    luke: card("L. Swardo", luke),
    sam: card("S. Swardo", sam),
  };
}

describe("Friday live results", () => {
  it("awards front, back and overall points from completed NET cards", () => {
    const luke = [...Array(9).fill(4), ...Array(9).fill(5)];
    const sam = [...Array(9).fill(5), ...Array(9).fill(4)];
    const result = calculateFridayLiveMatch(match(luke, sam));

    expect(result.components[0].winner).toBe("LUKE");
    expect(result.components[1].winner).toBe("SAM");
    expect(result.components[2].winner).toBe("HALVED");
    expect(result.lukePoints).toBe(1.5);
    expect(result.samPoints).toBe(1.5);
  });

  it("does not award an incomplete segment", () => {
    const luke = [...Array(9).fill(4), ...Array(9).fill(null)];
    const sam = [...Array(9).fill(5), ...Array(9).fill(null)];
    const result = calculateFridayLiveMatch(match(luke, sam));

    expect(result.components[0].winner).toBe("LUKE");
    expect(result.components[1].winner).toBe("PENDING");
    expect(result.components[2].winner).toBe("PENDING");
    expect(result.lukePoints).toBe(1);
    expect(result.complete).toBe(false);
  });

  it("totals all Friday match points", () => {
    const complete = Array(18).fill(4);
    const worse = Array(18).fill(5);
    const results = calculateFridayLiveResults([
      match(complete, worse, 1),
      match(worse, complete, 2),
    ]);

    expect(results.lukePoints).toBe(3);
    expect(results.samPoints).toBe(3);
    expect(results.maximumPoints).toBe(6);
    expect(results.completedMatches).toBe(2);
  });
});
