import { describe, expect, it } from "vitest";
import type { LiveFridayMatch, LiveHoleScore } from "../src/lib/live-types";
import { calculateSaturdayTournamentBoard } from "../src/lib/saturday-tournament-board";

function score(holeNumber: number, netScore: number): LiveHoleScore {
  return {
    holeNumber,
    netScore,
    version: 1,
    updatedAt: "2026-08-29T16:00:00Z",
  };
}

function card(
  id: string,
  teamShortName: "L. Swardo" | "S. Swardo",
  values: number[],
) {
  return {
    id,
    sourceKey: id,
    teamShortName,
    player1: `${id} One`,
    player2: `${id} Two`,
    scores: values.map((value, index) => score(index + 1, value)),
  };
}

function matches(): LiveFridayMatch[] {
  return Array.from({ length: 6 }, (_, index) => {
    const matchNumber = index + 1;

    const lukeFront = index === 0 ? 4 : index === 1 ? 5 : 6;
    const lukeBack = index === 0 ? 4 : index === 1 ? 5 : 6;
    const samFront = index === 0 ? 5 : index === 1 ? 4 : 6;
    const samBack = index === 0 ? 5 : index === 1 ? 4 : 6;

    return {
      pairingId: `pairing-${matchNumber}`,
      matchNumber,
      teeTime: null,
      course: "Betsie Valley",
      format: "18-hole Scramble",
      sessionStatus: "open",
      luke: card(
        `saturday-${matchNumber}-luke`,
        "L. Swardo",
        [...Array(9).fill(lukeFront), ...Array(9).fill(lukeBack)],
      ),
      sam: card(
        `saturday-${matchNumber}-sam`,
        "S. Swardo",
        [...Array(9).fill(samFront), ...Array(9).fill(samBack)],
      ),
    };
  });
}

describe("Saturday tournament board", () => {
  it("reconciles the full $450 field pot", () => {
    const board = calculateSaturdayTournamentBoard(matches());

    expect(board.fieldComplete).toBe(true);
    expect(board.fieldDistributed).toBe(450);
    expect(board.moneyDistributed).toBe(450);
    expect(board.moneyAvailable).toBe(450);
  });

  it("awards front, back, and overall match points", () => {
    const board = calculateSaturdayTournamentBoard(matches());

    expect(board.matchPlay.maximumPoints).toBe(18);
    expect(board.matchPlay.completedMatches).toBe(6);
    expect(board.matchPlay.totalPointsAwarded).toBe(18);
  });

  it("pays first and second place for each segment", () => {
    const board = calculateSaturdayTournamentBoard(matches());

    const lukeOne = board.teams.find(
      (team) => team.scorecardId === "saturday-1-luke",
    );
    const samTwo = board.teams.find(
      (team) => team.scorecardId === "saturday-2-sam",
    );

    expect(lukeOne?.fieldPayout).toBe(225);
    expect(samTwo?.fieldPayout).toBe(225);
  });

  it("uses competition ranking when first place is tied", () => {
    const x = matches();

    x[0].luke.scores = x[0].luke.scores.map((item) => ({
      ...item!,
      netScore: 4,
    }));
    x[0].sam.scores = x[0].sam.scores.map((item) => ({
      ...item!,
      netScore: 4,
    }));
    x[1].luke.scores = x[1].luke.scores.map((item) => ({
      ...item!,
      netScore: 5,
    }));

    const board = calculateSaturdayTournamentBoard(x);

    expect(
      board.teams.find(
        (team) => team.scorecardId === "saturday-1-luke",
      )?.frontRank,
    ).toBe(1);
    expect(
      board.teams.find(
        (team) => team.scorecardId === "saturday-1-sam",
      )?.frontRank,
    ).toBe(1);
    expect(
      board.teams.find(
        (team) => team.scorecardId === "saturday-2-luke",
      )?.frontRank,
    ).toBe(4);
  });

  it("holds all payouts until the field is complete", () => {
    const x = matches();
    x[0].luke.scores[0] = null;

    const board = calculateSaturdayTournamentBoard(x);

    expect(board.fieldComplete).toBe(false);
    expect(board.fieldDistributed).toBe(0);
    expect(board.teams.every((team) => team.fieldPayout === 0)).toBe(true);
  });
});
