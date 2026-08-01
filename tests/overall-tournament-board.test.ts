import { describe, expect, it } from "vitest";
import { calculateOverallTournamentBoard } from "../src/lib/overall-tournament-board";

function fridayBoard(luke: number, sam: number, completedMatches = 6) {
  return {
    matchPlay: {
      lukePoints: luke,
      samPoints: sam,
      completedMatches,
    },
  } as any;
}

function saturdayBoard(luke: number, sam: number, completedMatches = 6) {
  return {
    matchPlay: {
      lukePoints: luke,
      samPoints: sam,
      completedMatches,
    },
  } as any;
}

function sundayBoard(
  luke: number,
  sam: number,
  completedPinehurstMatches = 6,
  completedSinglesMatches = 12,
) {
  return {
    sundayLukePoints: luke,
    sundaySamPoints: sam,
    completedPinehurstMatches,
    completedSinglesMatches,
  } as any;
}

describe("Overall tournament board", () => {
  it("combines Friday, Saturday, and Sunday points", () => {
    const board = calculateOverallTournamentBoard(
      fridayBoard(8, 10),
      saturdayBoard(11, 7),
      sundayBoard(9.5, 8.5),
    );

    expect(board.overallLukePoints).toBe(28.5);
    expect(board.overallSamPoints).toBe(25.5);
    expect(board.totalPointsAwarded).toBe(54);
    expect(board.maximumPoints).toBe(54);
  });

  it("declares Team Luke the winner when the tournament is complete", () => {
    const board = calculateOverallTournamentBoard(
      fridayBoard(8, 10),
      saturdayBoard(11, 7),
      sundayBoard(9.5, 8.5),
    );

    expect(board.complete).toBe(true);
    expect(board.winner).toBe("LUKE");
  });

  it("declares Team Sam the winner when the tournament is complete", () => {
    const board = calculateOverallTournamentBoard(
      fridayBoard(6, 12),
      saturdayBoard(8, 10),
      sundayBoard(8, 10),
    );

    expect(board.complete).toBe(true);
    expect(board.winner).toBe("SAM");
  });

  it("supports a tied final score", () => {
    const board = calculateOverallTournamentBoard(
      fridayBoard(9, 9),
      saturdayBoard(9, 9),
      sundayBoard(9, 9),
    );

    expect(board.complete).toBe(true);
    expect(board.winner).toBe("TIED");
  });

  it("does not declare a winner before every match is final", () => {
    const board = calculateOverallTournamentBoard(
      fridayBoard(8, 10),
      saturdayBoard(0, 0, 0),
      sundayBoard(0, 0, 0, 0),
    );

    expect(board.complete).toBe(false);
    expect(board.winner).toBe("PENDING");
    expect(board.overallLukePoints).toBe(8);
    expect(board.overallSamPoints).toBe(10);
  });
});
