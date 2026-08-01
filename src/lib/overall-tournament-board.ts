import type { FridayTournamentBoard } from "@/lib/friday-tournament-board";
import type { SaturdayTournamentBoard } from "@/lib/saturday-tournament-board";
import type { SundayTournamentBoard } from "@/lib/sunday-tournament-board";

export interface OverallTournamentBoard {
  generatedAt: string;

  fridayLukePoints: number;
  fridaySamPoints: number;

  saturdayLukePoints: number;
  saturdaySamPoints: number;

  sundayLukePoints: number;
  sundaySamPoints: number;

  overallLukePoints: number;
  overallSamPoints: number;

  totalPointsAwarded: number;
  maximumPoints: number;

  winner: "LUKE" | "SAM" | "TIED" | "PENDING";
  complete: boolean;
}

export function calculateOverallTournamentBoard(
  friday: FridayTournamentBoard,
  saturday: SaturdayTournamentBoard,
  sunday: SundayTournamentBoard,
): OverallTournamentBoard {
  const fridayLukePoints = friday.matchPlay.lukePoints;
  const fridaySamPoints = friday.matchPlay.samPoints;

  const saturdayLukePoints = saturday.matchPlay.lukePoints;
  const saturdaySamPoints = saturday.matchPlay.samPoints;

  const sundayLukePoints = sunday.sundayLukePoints;
  const sundaySamPoints = sunday.sundaySamPoints;

  const overallLukePoints =
    fridayLukePoints + saturdayLukePoints + sundayLukePoints;

  const overallSamPoints =
    fridaySamPoints + saturdaySamPoints + sundaySamPoints;

  const totalPointsAwarded = overallLukePoints + overallSamPoints;
  const maximumPoints = 54;

  const complete =
    friday.matchPlay.completedMatches === 6 &&
    saturday.matchPlay.completedMatches === 6 &&
    sunday.completedPinehurstMatches === 6 &&
    sunday.completedSinglesMatches === 12;

  let winner: OverallTournamentBoard["winner"] = "PENDING";

  if (complete) {
    winner =
      overallLukePoints > overallSamPoints
        ? "LUKE"
        : overallSamPoints > overallLukePoints
          ? "SAM"
          : "TIED";
  }

  return {
    generatedAt: new Date().toISOString(),

    fridayLukePoints,
    fridaySamPoints,

    saturdayLukePoints,
    saturdaySamPoints,

    sundayLukePoints,
    sundaySamPoints,

    overallLukePoints,
    overallSamPoints,

    totalPointsAwarded,
    maximumPoints,

    winner,
    complete,
  };
}
