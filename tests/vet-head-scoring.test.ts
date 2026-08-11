import { describe, expect, it } from "vitest";
import {
  calculateCourseHandicap,
  calculateIndividualNet,
  calculateFourPlayerScrambleHandicap,
  calculateScrambleNet,
} from "@/lib/vet-head-scoring";

describe("Vet Head scoring", () => {
  it("calculates Course Handicap from index, slope, rating, and par", () => {
    expect(calculateCourseHandicap(10, 113, 72, 72)).toBe(10);
    expect(calculateCourseHandicap(8.4, 125, 71.5, 72)).toBe(9);
  });

  it("calculates individual net score", () => {
    expect(calculateIndividualNet(82, 10)).toBe(72);
    expect(calculateIndividualNet(74, 5)).toBe(69);
  });

  it("calculates four-player scramble handicap using 25/20/15/10", () => {
    expect(
      calculateFourPlayerScrambleHandicap([4, 8, 12, 16]),
    ).toBe(6);
  });

  it("sorts scramble handicaps lowest to highest before applying percentages", () => {
    expect(
      calculateFourPlayerScrambleHandicap([16, 4, 12, 8]),
    ).toBe(6);
  });

  it("requires exactly four scramble players", () => {
    expect(() =>
      calculateFourPlayerScrambleHandicap([4, 8, 12]),
    ).toThrow("A four-player scramble requires exactly four handicaps.");
  });

  it("calculates scramble net score", () => {
    expect(calculateScrambleNet(66, 6)).toBe(60);
  });
});

import { calculateRoundGroupPoints } from "@/lib/vet-head-scoring";

describe("Vet Head round points", () => {
  it("awards 8, 6, and 4 points per player by group finish", () => {
    expect(
      calculateRoundGroupPoints([
        { groupId: "A", total: 280 },
        { groupId: "B", total: 276 },
        { groupId: "C", total: 284 },
      ]),
    ).toEqual([
      { groupId: "B", total: 276, place: 1, pointsPerPlayer: 8 },
      { groupId: "A", total: 280, place: 2, pointsPerPlayer: 6 },
      { groupId: "C", total: 284, place: 3, pointsPerPlayer: 4 },
    ]);
  });

  it("splits first and second place points when two groups tie for first", () => {
    expect(
      calculateRoundGroupPoints([
        { groupId: "A", total: 276 },
        { groupId: "B", total: 276 },
        { groupId: "C", total: 284 },
      ]),
    ).toEqual([
      { groupId: "A", total: 276, place: 1, pointsPerPlayer: 7 },
      { groupId: "B", total: 276, place: 1, pointsPerPlayer: 7 },
      { groupId: "C", total: 284, place: 3, pointsPerPlayer: 4 },
    ]);
  });

  it("splits second and third place points when two groups tie for second", () => {
    expect(
      calculateRoundGroupPoints([
        { groupId: "A", total: 274 },
        { groupId: "B", total: 280 },
        { groupId: "C", total: 280 },
      ]),
    ).toEqual([
      { groupId: "A", total: 274, place: 1, pointsPerPlayer: 8 },
      { groupId: "B", total: 280, place: 2, pointsPerPlayer: 5 },
      { groupId: "C", total: 280, place: 2, pointsPerPlayer: 5 },
    ]);
  });

  it("splits all available points equally when all three groups tie", () => {
    expect(
      calculateRoundGroupPoints([
        { groupId: "A", total: 280 },
        { groupId: "B", total: 280 },
        { groupId: "C", total: 280 },
      ]),
    ).toEqual([
      { groupId: "A", total: 280, place: 1, pointsPerPlayer: 6 },
      { groupId: "B", total: 280, place: 1, pointsPerPlayer: 6 },
      { groupId: "C", total: 280, place: 1, pointsPerPlayer: 6 },
    ]);
  });

  it("requires exactly three groups", () => {
    expect(() =>
      calculateRoundGroupPoints([
        { groupId: "A", total: 280 },
        { groupId: "B", total: 282 },
      ]),
    ).toThrow("A Vet Head round requires exactly three groups.");
  });
});

import {
  calculateVetHeaderStandings,
  calculateVetHeadMvpStandings,
} from "@/lib/vet-head-scoring";

describe("Vet Head MVP standings", () => {
  it("ranks players by lowest 54-hole net total", () => {
    expect(
      calculateVetHeaderStandings([
        {
          playerId: "A",
          thursdayNet: 72,
          fridayAmNet: 71,
          saturdayAmNet: 70,
        },
        {
          playerId: "B",
          thursdayNet: 70,
          fridayAmNet: 70,
          saturdayAmNet: 70,
        },
      ]),
    ).toEqual([
      {
        playerId: "B",
        thursdayNet: 70,
        fridayAmNet: 70,
        saturdayAmNet: 70,
        totalNet: 210,
        place: 1,
      },
      {
        playerId: "A",
        thursdayNet: 72,
        fridayAmNet: 71,
        saturdayAmNet: 70,
        totalNet: 213,
        place: 2,
      },
    ]);
  });

  it("keeps Vet Head MVP ties tied", () => {
    const standings = calculateVetHeaderStandings([
      {
        playerId: "A",
        thursdayNet: 69,
        fridayAmNet: 71,
        saturdayAmNet: 70,
      },
      {
        playerId: "B",
        thursdayNet: 70,
        fridayAmNet: 71,
        saturdayAmNet: 69,
      },
      {
        playerId: "C",
        thursdayNet: 71,
        fridayAmNet: 69,
        saturdayAmNet: 70,
      },
    ]);

    expect(
      standings.map((player) => ({
        playerId: player.playerId,
        totalNet: player.totalNet,
        place: player.place,
      })),
    ).toEqual([
      { playerId: "A", totalNet: 210, place: 1 },
      { playerId: "B", totalNet: 210, place: 1 },
      { playerId: "C", totalNet: 210, place: 1 },
    ]);
  });
});

describe("Vet Head Winners standings", () => {
  it("ranks players by highest cumulative points", () => {
    const standings = calculateVetHeadMvpStandings([
      {
        playerId: "A",
        totalPoints: 28,
        firstPlaceFinishes: 2,
        secondPlaceFinishes: 1,
        vetHeaderTotalNet: 210,
      },
      {
        playerId: "B",
        totalPoints: 30,
        firstPlaceFinishes: 1,
        secondPlaceFinishes: 2,
        vetHeaderTotalNet: 208,
      },
    ]);

    expect(standings.map((player) => player.playerId)).toEqual(["B", "A"]);
  });

  it("keeps Vet Head Points ties tied", () => {
    const standings = calculateVetHeadMvpStandings([
      {
        playerId: "A",
        totalPoints: 30,
        firstPlaceFinishes: 2,
        secondPlaceFinishes: 1,
        vetHeaderTotalNet: 214,
      },
      {
        playerId: "B",
        totalPoints: 30,
        firstPlaceFinishes: 3,
        secondPlaceFinishes: 0,
        vetHeaderTotalNet: 216,
      },
      {
        playerId: "C",
        totalPoints: 30,
        firstPlaceFinishes: 2,
        secondPlaceFinishes: 2,
        vetHeaderTotalNet: 218,
      },
      {
        playerId: "D",
        totalPoints: 30,
        firstPlaceFinishes: 2,
        secondPlaceFinishes: 2,
        vetHeaderTotalNet: 212,
      },
    ]);

    expect(
      standings.map((player) => ({
        playerId: player.playerId,
        totalPoints: player.totalPoints,
        place: player.place,
      })),
    ).toEqual([
      { playerId: "A", totalPoints: 30, place: 1 },
      { playerId: "B", totalPoints: 30, place: 1 },
      { playerId: "C", totalPoints: 30, place: 1 },
      { playerId: "D", totalPoints: 30, place: 1 },
    ]);
  });
});


import { calculateUnroundedCourseHandicap } from "@/lib/vet-head-scoring";

describe("Vet Head handicap precision", () => {
  it("preserves unrounded Course Handicap for scramble allowance calculations", () => {
    const handicaps = [
      calculateUnroundedCourseHandicap(4.4, 125, 71.5, 72),
      calculateUnroundedCourseHandicap(8.4, 125, 71.5, 72),
      calculateUnroundedCourseHandicap(12.4, 125, 71.5, 72),
      calculateUnroundedCourseHandicap(16.4, 125, 71.5, 72),
    ];

    expect(handicaps[0]).not.toBe(Math.round(handicaps[0]));

    expect(
      calculateFourPlayerScrambleHandicap(handicaps),
    ).toBe(7);
  });
});


import { calculateHybridGroupTotal } from "@/lib/vet-head-scoring";

describe("Vet Head hybrid Best Ball", () => {
  const players = [
    {
      courseHandicap: 0,
      holes: Array.from({ length: 18 }, (_, index) => ({
        holeNumber: index + 1,
        grossScore: 4,
        strokeIndex: index + 1,
      })),
    },
    {
      courseHandicap: 0,
      holes: Array.from({ length: 18 }, (_, index) => ({
        holeNumber: index + 1,
        grossScore: 5,
        strokeIndex: index + 1,
      })),
    },
    {
      courseHandicap: 0,
      holes: Array.from({ length: 18 }, (_, index) => ({
        holeNumber: index + 1,
        grossScore: 6,
        strokeIndex: index + 1,
      })),
    },
    {
      courseHandicap: 0,
      holes: Array.from({ length: 18 }, (_, index) => ({
        holeNumber: index + 1,
        grossScore: 7,
        strokeIndex: index + 1,
      })),
    },
  ];

  it("counts the 2 best net scores on holes 1-9", () => {
    const result = calculateHybridGroupTotal(players);

    expect(result.frontNine).toBe(81);
  });

  it("counts the 3 best net scores on holes 10-18", () => {
    const result = calculateHybridGroupTotal(players);

    expect(result.backNine).toBe(135);
    expect(result.total).toBe(216);
  });
});
