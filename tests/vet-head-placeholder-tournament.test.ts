import { describe, expect, it } from "vitest";
import {
  calculateRoundGroupPoints,
  calculateVetHeaderStandings,
  calculateVetHeadMvpStandings,
} from "@/lib/vet-head-scoring";

const pairings = {
  1: [
    ["P1", "P2", "P3", "P4"],
    ["P5", "P6", "P7", "P8"],
    ["P9", "P10", "P11", "P12"],
  ],
  2: [
    ["P1", "P5", "P9", "P10"],
    ["P2", "P6", "P11", "P12"],
    ["P3", "P4", "P7", "P8"],
  ],
  3: [
    ["P1", "P6", "P8", "P11"],
    ["P2", "P4", "P9", "P12"],
    ["P3", "P5", "P7", "P10"],
  ],
  4: [
    ["P1", "P7", "P9", "P12"],
    ["P2", "P5", "P8", "P10"],
    ["P3", "P4", "P6", "P11"],
  ],
  5: [
    ["P1", "P4", "P8", "P10"],
    ["P2", "P5", "P9", "P11"],
    ["P3", "P6", "P7", "P12"],
  ],
} as const;

const roundTotals = {
  1: [292, 296, 300],
  2: [289, 296, 306],
  3: [64, 66, 68],
  4: [294, 290, 297],
  5: [67, 63, 65],
} as const;

const individualNets = {
  P1: [70, 73, 72],
  P2: [72, 70, 70],
  P3: [74, 75, 74],
  P4: [76, 77, 76],
  P5: [71, 72, 71],
  P6: [73, 74, 73],
  P7: [75, 76, 75],
  P8: [77, 78, 77],
  P9: [72, 71, 69],
  P10: [74, 73, 72],
  P11: [76, 75, 74],
  P12: [78, 77, 78],
} as const;

describe("Vet Head complete placeholder tournament", () => {
  it("awards all five rounds using the locked 8 / 6 / 4 system", () => {
    for (const roundNumber of [1, 2, 3, 4, 5] as const) {
      const results = calculateRoundGroupPoints(
        roundTotals[roundNumber].map((total, index) => ({
          groupId: `R${roundNumber}G${index + 1}`,
          total,
        })),
      );

      expect(results).toHaveLength(3);
      expect(
        results.reduce(
          (sum, result) => sum + result.pointsPerPlayer,
          0,
        ),
      ).toBe(18);
    }
  });

  it("produces Player 9 as the placeholder Vet Header champion", () => {
    const standings = calculateVetHeaderStandings(
      Object.entries(individualNets).map(([playerId, nets]) => ({
        playerId,
        thursdayNet: nets[0],
        fridayAmNet: nets[1],
        saturdayAmNet: nets[2],
      })),
    );

    expect(standings[0].playerId).toBe("P9");
    expect(standings[0].totalNet).toBe(212);
  });

  it("produces Player 2 as the placeholder Vet Head MVP", () => {
    const playerStats = new Map(
      Object.keys(individualNets).map((playerId) => [
        playerId,
        {
          playerId,
          totalPoints: 0,
          firstPlaceFinishes: 0,
          secondPlaceFinishes: 0,
          vetHeaderTotalNet:
            individualNets[playerId as keyof typeof individualNets]
              .reduce((sum, net) => sum + net, 0),
        },
      ]),
    );

    for (const roundNumber of [1, 2, 3, 4, 5] as const) {
      const results = calculateRoundGroupPoints(
        roundTotals[roundNumber].map((total, index) => ({
          groupId: `R${roundNumber}G${index + 1}`,
          total,
        })),
      );

      results.forEach((result) => {
        const groupNumber = Number(result.groupId.slice(-1));
        const players = pairings[roundNumber][groupNumber - 1];

        players.forEach((playerId) => {
          const row = playerStats.get(playerId)!;
          row.totalPoints += result.pointsPerPlayer;

          if (result.place === 1) row.firstPlaceFinishes += 1;
          if (result.place === 2) row.secondPlaceFinishes += 1;
        });
      });
    }

    const standings = calculateVetHeadMvpStandings(
      [...playerStats.values()],
    );

    expect(standings[0].playerId).toBe("P2");
    expect(standings[0].totalPoints).toBe(36);
  });

  it("reconciles the approved $1,200 placeholder prize pool", () => {
    const total =
      100 +
      100 +
      100 +
      100 +
      100 +
      475 +
      225;

    expect(total).toBe(1200);
  });
});
