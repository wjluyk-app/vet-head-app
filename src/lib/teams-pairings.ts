import seed from "@/data/2026-workbook-seed.json";

export type PairingDay = "Friday" | "Saturday" | "Sunday Front" | "Sunday Back";

export interface TeamPlayer {
  sourcePlayerId: string;
  teamShortName: string;
  displayName: string;
  firstName: string;
  lastName: string;
  eventAge: number;
  handicapIndex: number;
  fridayPlayingHandicap: number;
  betsieHandicap: number;
  mountainTee: string;
  betsieTee: string;
  eventTeeGroup: string;
  housingUnit: string;
  captain: boolean;
}

export interface TeamRoster {
  name: string;
  shortName: string;
  captainDisplayName: string;
  pairingAdvantage: boolean;
  players: TeamPlayer[];
}

export interface TournamentPairing {
  day: PairingDay;
  date: string;
  course: string;
  format: string;
  matchNumber: number;
  throwsFirst: string | null;
  teeTime: string | null;
  lukePlayer1: string;
  lukePlayer2: string | null;
  lukeHandicapReference: string | number | null;
  samPlayer1: string;
  samPlayer2: string | null;
  samHandicapReference: string | number | null;
  handicapDifference: number | string | null;
  strokesTo: string | null;
  status: string;
  counterMatchup: string | null;
}

export interface TeamsPairingsData {
  teams: TeamRoster[];
  pairings: Record<PairingDay, TournamentPairing[]>;
}

const dayOrder: PairingDay[] = ["Friday", "Saturday", "Sunday Front", "Sunday Back"];

export function getTeamsPairingsData(): TeamsPairingsData {
  const players = seed.players as TeamPlayer[];
  const teams: TeamRoster[] = seed.teams.map((team) => ({
    ...team,
    players: players
      .filter((player) => player.teamShortName === team.shortName)
      .sort((a, b) => {
        if (a.captain !== b.captain) return a.captain ? -1 : 1;
        return a.lastName.localeCompare(b.lastName);
      }),
  }));

  const pairings = Object.fromEntries(
    dayOrder.map((day) => [
      day,
      (seed.pairings as TournamentPairing[])
        .filter((pairing) => pairing.day === day)
        .sort((a, b) => a.matchNumber - b.matchNumber),
    ]),
  ) as Record<PairingDay, TournamentPairing[]>;

  return { teams, pairings };
}
