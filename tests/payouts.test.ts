import { describe, expect, it } from "vitest";
import { allocatePayouts, reconcileAwards } from "../src/lib/payouts";

describe("payout engine", () => {
  it("allocates residual cents deterministically", () => {
    const awards = allocatePayouts(
      [
        { team: "Alpha", score: 35 },
        { team: "Bravo", score: 35 },
        { team: "Charlie", score: 35 },
      ],
      [{ place: 1, amount: 50 }],
    );
    expect(awards.map((award) => award.amount)).toEqual([16.67, 16.67, 16.66]);
    reconcileAwards(awards, 50);
  });
});
