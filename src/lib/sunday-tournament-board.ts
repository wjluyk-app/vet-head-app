import type {
  LiveFridayMatch,
  LiveSundayData,
  LiveSundaySinglesMatch,
} from "@/lib/live-types";

export interface SundayPinehurstMatch {
  pairingId: string;
  matchNumber: number;
  teeTime: string | null;
  lukePlayers: string;
  samPlayers: string;
  holesComplete: number;
  complete: boolean;
  lukeScore: number | null;
  samScore: number | null;
  lukePoints: number;
  samPoints: number;
  status: string;
  lastUpdatedAt: string | null;
}

export interface SundayPinehurstResults {
  lukePoints: number;
  samPoints: number;
  completedMatches: number;
  matches: SundayPinehurstMatch[];
}

export interface SundaySinglesBoardMatch {
  pairingId: string;
  matchNumber: number;
  lukePlayer: string;
  samPlayer: string;
  winner: "LUKE" | "SAM" | "HALVED" | "PENDING";
  lukePoints: number;
  samPoints: number;
  resultText: string | null;
  closedOnHole: number | null;
  status: string;
}

export interface SundayTournamentBoard {
  generatedAt: string;
  pinehurst: SundayPinehurstResults;
  singles: SundaySinglesBoardMatch[];
  pinehurstLukePoints: number;
  pinehurstSamPoints: number;
  singlesLukePoints: number;
  singlesSamPoints: number;
  sundayLukePoints: number;
  sundaySamPoints: number;
  completedPinehurstMatches: number;
  completedSinglesMatches: number;
}

function cardTotal(
  match: LiveFridayMatch,
  team: "luke" | "sam",
): number | null {
  const scores = match[team].scores.slice(0, 9);

  if (!scores.every(Boolean)) return null;

  return scores.reduce(
    (sum, score) => sum + (score?.netScore ?? 0),
    0,
  );
}

function latestUpdate(match: LiveFridayMatch): string | null {
  return [...match.luke.scores, ...match.sam.scores]
    .filter(Boolean)
    .map((score) => score!.updatedAt)
    .sort()
    .at(-1) ?? null;
}

function calculatePinehurstMatch(
  match: LiveFridayMatch,
): SundayPinehurstMatch {
  const lukeScores = match.luke.scores.slice(0, 9);
  const samScores = match.sam.scores.slice(0, 9);

  const holesComplete = lukeScores.filter(
    (score, index) => score !== null && samScores[index] !== null,
  ).length;

  const lukeScore = cardTotal(match, "luke");
  const samScore = cardTotal(match, "sam");
  const complete = lukeScore !== null && samScore !== null;

  let lukePoints = 0;
  let samPoints = 0;
  let status = `Pending · ${holesComplete}/9`;

  if (complete) {
    if (lukeScore < samScore) {
      lukePoints = 1;
      status = `Luke ${lukeScore} · Sam ${samScore}`;
    } else if (samScore < lukeScore) {
      samPoints = 1;
      status = `Luke ${lukeScore} · Sam ${samScore}`;
    } else {
      lukePoints = 0.5;
      samPoints = 0.5;
      status = `Halved at ${lukeScore}`;
    }
  }

  return {
    pairingId: match.pairingId,
    matchNumber: match.matchNumber,
    teeTime: match.teeTime,
    lukePlayers: `${match.luke.player1} / ${match.luke.player2}`,
    samPlayers: `${match.sam.player1} / ${match.sam.player2}`,
    holesComplete,
    complete,
    lukeScore,
    samScore,
    lukePoints,
    samPoints,
    status,
    lastUpdatedAt: latestUpdate(match),
  };
}

function calculateSinglesMatch(
  match: LiveSundaySinglesMatch,
): SundaySinglesBoardMatch {
  let winner: SundaySinglesBoardMatch["winner"] = "PENDING";
  let lukePoints = 0;
  let samPoints = 0;

  if (match.halved) {
    winner = "HALVED";
    lukePoints = 0.5;
    samPoints = 0.5;
  } else if (match.winnerTeamId === match.lukeTeamId) {
    winner = "LUKE";
    lukePoints = 1;
  } else if (match.winnerTeamId === match.samTeamId) {
    winner = "SAM";
    samPoints = 1;
  }

  return {
    pairingId: match.pairingId,
    matchNumber: match.matchNumber,
    lukePlayer: match.lukePlayer,
    samPlayer: match.samPlayer,
    winner,
    lukePoints,
    samPoints,
    resultText: match.resultText,
    closedOnHole: match.closedOnHole,
    status: match.status,
  };
}

export function calculateSundayTournamentBoard(
  data: LiveSundayData,
): SundayTournamentBoard {
  const pinehurstMatches = data.pinehurst.map(
    calculatePinehurstMatch,
  );

  const pinehurstLukePoints = pinehurstMatches.reduce(
    (sum, match) => sum + match.lukePoints,
    0,
  );
  const pinehurstSamPoints = pinehurstMatches.reduce(
    (sum, match) => sum + match.samPoints,
    0,
  );

  const completedPinehurstMatches = pinehurstMatches.filter(
    (match) => match.complete,
  ).length;

  const pinehurst: SundayPinehurstResults = {
    lukePoints: pinehurstLukePoints,
    samPoints: pinehurstSamPoints,
    completedMatches: completedPinehurstMatches,
    matches: pinehurstMatches,
  };

  const singles = data.singles.map(calculateSinglesMatch);

  const singlesLukePoints = singles.reduce(
    (sum, match) => sum + match.lukePoints,
    0,
  );
  const singlesSamPoints = singles.reduce(
    (sum, match) => sum + match.samPoints,
    0,
  );

  const completedSinglesMatches = singles.filter(
    (match) => match.winner !== "PENDING",
  ).length;

  return {
    generatedAt: new Date().toISOString(),
    pinehurst,
    singles,
    pinehurstLukePoints,
    pinehurstSamPoints,
    singlesLukePoints,
    singlesSamPoints,
    sundayLukePoints: pinehurstLukePoints + singlesLukePoints,
    sundaySamPoints: pinehurstSamPoints + singlesSamPoints,
    completedPinehurstMatches,
    completedSinglesMatches,
  };
}
