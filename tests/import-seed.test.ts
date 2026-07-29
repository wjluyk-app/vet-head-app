import { describe, expect, it } from "vitest";
import seed from "../src/data/2026-workbook-seed.json";

describe("2026 workbook seed", () => {
  it("contains the complete player field", () => {
    expect(seed.players).toHaveLength(24);
    expect(new Set(seed.players.map((player) => player.sourcePlayerId)).size).toBe(24);
    expect(seed.players.filter((player) => player.captain)).toHaveLength(2);
  });

  it("contains six Friday pairings and twelve Friday scorecards", () => {
    expect(seed.pairings.filter((pairing) => pairing.day === "Friday")).toHaveLength(6);
    expect(seed.friday.scorecards).toHaveLength(12);
    seed.friday.scorecards.forEach((card) => expect(card.scores).toHaveLength(18));
  });

  it("preserves locked Friday workbook totals", () => {
    const totals = seed.friday.scorecards.reduce(
      (result, card) => {
        result[card.teamShortName] = (result[card.teamShortName] ?? 0) + (card.points ?? 0);
        return result;
      },
      {} as Record<string, number>,
    );
    expect(totals).toEqual({ "L. Swardo": 8, "S. Swardo": 10 });
    expect(seed.friday.expectedFieldPayoutTotal).toBe(450);
    expect(seed.friday.expectedSkinsTotal).toBe(200);
    expect(seed.friday.expectedMoneyTotal).toBe(650);
  });
});
