import { describe, expect, it } from "vitest";
import type {
  LiveFridayMatch,
  LiveHoleScore,
  LiveSundayData,
  LiveSundaySinglesMatch,
} from "../src/lib/live-types";
import { calculateSundayTournamentBoard } from "../src/lib/sunday-tournament-board";

function score(holeNumber: number, netScore: number): LiveHoleScore {
  return {
    holeNumber,
    netScore,
    version: 1,
    updatedAt: "2026-08-30T15:00:00Z",
  };
}

function pinehurstMatch(
  matchNumber: number,
  lukeScores: Array<number | null>,
  samScores: Array<number | null>,
): LiveFridayMatch {
  const card = (
    id: string,
    teamShortName: "L. Swardo" | "S. Swardo",
    scores: Array<number | null>,
  ) => ({
    id,
    sourceKey: id,
    teamShortName,
    player1: `${id} One`,
    player2: `${id} Two`,
    scores: scores.map((value, index) =>
      value === null ? null : score(index + 1, value),
    ),
  });

  return {
    pairingId: `pinehurst-${matchNumber}`,
    matchNumber,
    teeTime: null,
    course: "Mountain Course",
    format: "Pinehurst",
    sessionStatus: "open",
    luke: card(
      `pinehurst-${matchNumber}-luke`,
      "L. Swardo",
      lukeScores,
    ),
    sam: card(
      `pinehurst-${matchNumber}-sam`,
      "S. Swardo",
      samScores,
    ),
  };
}

function singlesMatch(
  matchNumber: number,
  result: "LUKE" | "SAM" | "HALVED" | "PENDING",
): LiveSundaySinglesMatch {
  const lukeTeamId = `luke-team-${matchNumber}`;
  const samTeamId = `sam-team-${matchNumber}`;

  return {
    pairingId: `singles-${matchNumber}`,
    matchNumber,
    lukeTeamId,
    samTeamId,
    lukePlayer: `Luke Player ${matchNumber}`,
    samPlayer: `Sam Player ${matchNumber}`,
    winnerTeamId:
      result === "LUKE"
        ? lukeTeamId
        : result === "SAM"
          ? samTeamId
          : null,
    halved: result === "HALVED",
    resultText: null,
    closedOnHole: null,
    status: result === "PENDING" ? "in_progress" : "final",
    sessionStatus: "open",
  };
}

describe("Sunday tournament board", () => {
  it("awards Pinehurst wins and halved matches correctly", () => {
    const data: LiveSundayData = {
      pinehurst: [
        pinehurstMatch(1, Array(9).fill(4), Array(9).fill(5)),
        pinehurstMatch(2, Array(9).fill(5), Array(9).fill(4)),
        pinehurstMatch(3, Array(9).fill(4), Array(9).fill(4)),
      ],
      singles: [],
    };

    const board = calculateSundayTournamentBoard(data);

    expect(board.pinehurstLukePoints).toBe(1.5);
    expect(board.pinehurstSamPoints).toBe(1.5);
    expect(board.completedPinehurstMatches).toBe(3);
  });

  it("does not award an incomplete Pinehurst match", () => {
    const luke = Array<number | null>(9).fill(4);
    const sam = Array<number | null>(9).fill(4);
    sam[8] = null;

    const board = calculateSundayTournamentBoard({
      pinehurst: [pinehurstMatch(1, luke, sam)],
      singles: [],
    });

    expect(board.completedPinehurstMatches).toBe(0);
    expect(board.pinehurstLukePoints).toBe(0);
    expect(board.pinehurstSamPoints).toBe(0);
  });

  it("awards Singles wins and halved matches correctly", () => {
    const board = calculateSundayTournamentBoard({
      pinehurst: [],
      singles: [
        singlesMatch(1, "LUKE"),
        singlesMatch(2, "SAM"),
        singlesMatch(3, "HALVED"),
        singlesMatch(4, "PENDING"),
      ],
    });

    expect(board.singlesLukePoints).toBe(1.5);
    expect(board.singlesSamPoints).toBe(1.5);
    expect(board.completedSinglesMatches).toBe(3);
  });

  it("combines Pinehurst and Singles into Sunday totals", () => {
    const board = calculateSundayTournamentBoard({
      pinehurst: [
        pinehurstMatch(1, Array(9).fill(4), Array(9).fill(5)),
        pinehurstMatch(2, Array(9).fill(4), Array(9).fill(4)),
      ],
      singles: [
        singlesMatch(1, "SAM"),
        singlesMatch(2, "LUKE"),
        singlesMatch(3, "HALVED"),
      ],
    });

    expect(board.sundayLukePoints).toBe(3);
    expect(board.sundaySamPoints).toBe(2);
  });
  it("distributes the $150 Pinehurst field pot after all six matches finish", () => {
    const data: LiveSundayData = {
      pinehurst: [
        pinehurstMatch(1, Array(9).fill(3), Array(9).fill(4)),
        pinehurstMatch(2, Array(9).fill(5), Array(9).fill(6)),
        pinehurstMatch(3, Array(9).fill(7), Array(9).fill(8)),
        pinehurstMatch(4, Array(9).fill(9), Array(9).fill(10)),
        pinehurstMatch(5, Array(9).fill(11), Array(9).fill(12)),
        pinehurstMatch(6, Array(9).fill(13), Array(9).fill(14)),
      ],
      singles: [],
    };

    const board = calculateSundayTournamentBoard(data);

    expect(board.pinehurstFieldComplete).toBe(true);
    expect(board.pinehurstFieldDistributed).toBe(150);
    expect(board.pinehurst.matches[0].lukeFieldRank).toBe(1);
    expect(board.pinehurst.matches[0].lukeFieldPayout).toBe(100);
    expect(board.pinehurst.matches[0].samFieldRank).toBe(2);
    expect(board.pinehurst.matches[0].samFieldPayout).toBe(50);
  });

  it("withholds Pinehurst field payouts until all six matches finish", () => {
    const incomplete = Array<number | null>(9).fill(4);
    incomplete[8] = null;

    const board = calculateSundayTournamentBoard({
      pinehurst: [
        pinehurstMatch(1, Array(9).fill(3), Array(9).fill(4)),
        pinehurstMatch(2, Array(9).fill(5), Array(9).fill(6)),
        pinehurstMatch(3, Array(9).fill(7), Array(9).fill(8)),
        pinehurstMatch(4, Array(9).fill(9), Array(9).fill(10)),
        pinehurstMatch(5, Array(9).fill(11), Array(9).fill(12)),
        pinehurstMatch(6, Array(9).fill(13), incomplete),
      ],
      singles: [],
    });

    expect(board.pinehurstFieldComplete).toBe(false);
    expect(board.pinehurstFieldDistributed).toBe(0);
  });

});
