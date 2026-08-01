import seed from "@/data/2026-workbook-seed.json";
import type { FridayTournamentBoard } from "@/lib/friday-tournament-board";
import type { SaturdayTournamentBoard } from "@/lib/saturday-tournament-board";
import type { SundayTournamentBoard } from "@/lib/sunday-tournament-board";
import type { OverallTournamentBoard } from "@/lib/overall-tournament-board";

export const MVP_POT = 70;

type CaptainTeam = "LUKE" | "SAM";

interface SeedPairing {
  day: "Friday" | "Saturday" | "Sunday Front" | "Sunday Back";
  matchNumber: number;
  lukePlayer1: string;
  lukePlayer2: string | null;
  samPlayer1: string;
  samPlayer2: string | null;
}

export interface PlayerPointTotal {
  player: string;
  team: CaptainTeam;
  points: number;
}

export interface PlayerAwards {
  complete: boolean;
  winningTeam: CaptainTeam | null;
  leaders: PlayerPointTotal[];
  mvpPayoutEach: number;
  playerTotals: PlayerPointTotal[];
}

const pairings = seed.pairings as SeedPairing[];

function addPoints(
  totals: Map<string, PlayerPointTotal>,
  team: CaptainTeam,
  players: Array<string | null>,
  points: number,
) {
  for (const player of players) {
    if (!player) continue;

    const key = `${team}:${player}`;
    const existing = totals.get(key);

    totals.set(key, {
      player,
      team,
      points: (existing?.points ?? 0) + points,
    });
  }
}

function pairingFor(day: SeedPairing["day"], matchNumber: number) {
  const pairing = pairings.find(
    (item) => item.day === day && item.matchNumber === matchNumber,
  );

  if (!pairing) {
    throw new Error(`${day} Match ${matchNumber} pairing was not found.`);
  }

  return pairing;
}

export function calculatePlayerAwards(
  friday: FridayTournamentBoard,
  saturday: SaturdayTournamentBoard,
  sunday: SundayTournamentBoard,
  overall: OverallTournamentBoard,
): PlayerAwards {
  const totals = new Map<string, PlayerPointTotal>();

  for (const match of friday.matchPlay.matches) {
    const pairing = pairingFor("Friday", match.matchNumber);

    addPoints(
      totals,
      "LUKE",
      [pairing.lukePlayer1, pairing.lukePlayer2],
      match.lukePoints,
    );

    addPoints(
      totals,
      "SAM",
      [pairing.samPlayer1, pairing.samPlayer2],
      match.samPoints,
    );
  }

  for (const match of saturday.matchPlay.matches) {
    const pairing = pairingFor("Saturday", match.matchNumber);

    addPoints(
      totals,
      "LUKE",
      [pairing.lukePlayer1, pairing.lukePlayer2],
      match.lukePoints,
    );

    addPoints(
      totals,
      "SAM",
      [pairing.samPlayer1, pairing.samPlayer2],
      match.samPoints,
    );
  }

  for (const match of sunday.pinehurst.matches) {
    const pairing = pairingFor("Sunday Front", match.matchNumber);

    addPoints(
      totals,
      "LUKE",
      [pairing.lukePlayer1, pairing.lukePlayer2],
      match.lukePoints,
    );

    addPoints(
      totals,
      "SAM",
      [pairing.samPlayer1, pairing.samPlayer2],
      match.samPoints,
    );
  }

  for (const match of sunday.singles) {
    const pairing = pairingFor("Sunday Back", match.matchNumber);

    addPoints(
      totals,
      "LUKE",
      [pairing.lukePlayer1],
      match.lukePoints,
    );

    addPoints(
      totals,
      "SAM",
      [pairing.samPlayer1],
      match.samPoints,
    );
  }

  const playerTotals = [...totals.values()].sort(
    (a, b) =>
      b.points - a.points ||
      a.player.localeCompare(b.player),
  );

  const winningTeam =
    overall.complete && overall.winner === "LUKE"
      ? "LUKE"
      : overall.complete && overall.winner === "SAM"
        ? "SAM"
        : null;

  if (!winningTeam) {
    return {
      complete: false,
      winningTeam: null,
      leaders: [],
      mvpPayoutEach: 0,
      playerTotals,
    };
  }

  const eligible = playerTotals.filter(
    (player) => player.team === winningTeam,
  );

  const highest = Math.max(...eligible.map((player) => player.points));

  const leaders = eligible.filter(
    (player) => player.points === highest,
  );

  return {
    complete: true,
    winningTeam,
    leaders,
    mvpPayoutEach: leaders.length ? MVP_POT / leaders.length : 0,
    playerTotals,
  };
}
