import type { LiveFridayMatch, LiveHoleScore } from "@/lib/live-types";

export type FridayComponentName = "front" | "back" | "overall";
export type FridayWinner = "LUKE" | "SAM" | "HALVED" | "PENDING";

export interface FridayComponentResult {
  component: FridayComponentName;
  label: string;
  lukeScore: number | null;
  samScore: number | null;
  holesComplete: number;
  holesRequired: number;
  complete: boolean;
  winner: FridayWinner;
  lukePoints: number;
  samPoints: number;
}

export interface FridayLiveMatchResult {
  pairingId: string;
  matchNumber: number;
  teeTime: string | null;
  lukePlayers: string;
  samPlayers: string;
  holesComplete: number;
  complete: boolean;
  components: FridayComponentResult[];
  lukePoints: number;
  samPoints: number;
  status: string;
  lastUpdatedAt: string | null;
}

export interface FridayLiveResults {
  generatedAt: string;
  lukePoints: number;
  samPoints: number;
  totalPointsAwarded: number;
  maximumPoints: number;
  completedMatches: number;
  matches: FridayLiveMatchResult[];
}

function sliceScores(
  scores: Array<LiveHoleScore | null>,
  start: number,
  end: number,
): Array<LiveHoleScore | null> {
  return scores.slice(start, end);
}

function component(
  name: FridayComponentName,
  label: string,
  lukeScores: Array<LiveHoleScore | null>,
  samScores: Array<LiveHoleScore | null>,
): FridayComponentResult {
  const holesRequired = lukeScores.length;
  const paired = lukeScores.map((luke, index) => ({ luke, sam: samScores[index] }));
  const completePairs = paired.filter(({ luke, sam }) => luke !== null && sam !== null);
  const complete = completePairs.length === holesRequired;

  if (!complete) {
    return {
      component: name,
      label,
      lukeScore: null,
      samScore: null,
      holesComplete: completePairs.length,
      holesRequired,
      complete: false,
      winner: "PENDING",
      lukePoints: 0,
      samPoints: 0,
    };
  }

  const lukeScore = completePairs.reduce((sum, item) => sum + item.luke!.netScore, 0);
  const samScore = completePairs.reduce((sum, item) => sum + item.sam!.netScore, 0);

  if (lukeScore < samScore) {
    return {
      component: name,
      label,
      lukeScore,
      samScore,
      holesComplete: holesRequired,
      holesRequired,
      complete: true,
      winner: "LUKE",
      lukePoints: 1,
      samPoints: 0,
    };
  }

  if (samScore < lukeScore) {
    return {
      component: name,
      label,
      lukeScore,
      samScore,
      holesComplete: holesRequired,
      holesRequired,
      complete: true,
      winner: "SAM",
      lukePoints: 0,
      samPoints: 1,
    };
  }

  return {
    component: name,
    label,
    lukeScore,
    samScore,
    holesComplete: holesRequired,
    holesRequired,
    complete: true,
    winner: "HALVED",
    lukePoints: 0.5,
    samPoints: 0.5,
  };
}

function latestTimestamp(match: LiveFridayMatch): string | null {
  const timestamps = [...match.luke.scores, ...match.sam.scores]
    .filter((score): score is LiveHoleScore => score !== null)
    .map((score) => score.updatedAt)
    .sort();
  return timestamps.at(-1) ?? null;
}

export function calculateFridayLiveMatch(match: LiveFridayMatch): FridayLiveMatchResult {
  const front = component(
    "front",
    "Front 9",
    sliceScores(match.luke.scores, 0, 9),
    sliceScores(match.sam.scores, 0, 9),
  );
  const back = component(
    "back",
    "Back 9",
    sliceScores(match.luke.scores, 9, 18),
    sliceScores(match.sam.scores, 9, 18),
  );
  const overall = component("overall", "Overall", match.luke.scores, match.sam.scores);
  const components = [front, back, overall];
  const lukePoints = components.reduce((sum, item) => sum + item.lukePoints, 0);
  const samPoints = components.reduce((sum, item) => sum + item.samPoints, 0);
  const complete = overall.complete;
  const holesComplete = Math.min(
    match.luke.scores.filter(Boolean).length,
    match.sam.scores.filter(Boolean).length,
  );

  let status = `${holesComplete}/18 holes entered`;
  if (complete) {
    status = lukePoints === samPoints
      ? `Halved ${lukePoints}-${samPoints}`
      : lukePoints > samPoints
        ? `Luke wins ${lukePoints}-${samPoints}`
        : `Sam wins ${samPoints}-${lukePoints}`;
  } else if (lukePoints || samPoints) {
    status = `Luke ${lukePoints} · Sam ${samPoints} (${holesComplete}/18)`;
  }

  return {
    pairingId: match.pairingId,
    matchNumber: match.matchNumber,
    teeTime: match.teeTime,
    lukePlayers: `${match.luke.player1} / ${match.luke.player2}`,
    samPlayers: `${match.sam.player1} / ${match.sam.player2}`,
    holesComplete,
    complete,
    components,
    lukePoints,
    samPoints,
    status,
    lastUpdatedAt: latestTimestamp(match),
  };
}

export function calculateFridayLiveResults(matches: LiveFridayMatch[]): FridayLiveResults {
  const results = matches.map(calculateFridayLiveMatch);
  const lukePoints = results.reduce((sum, match) => sum + match.lukePoints, 0);
  const samPoints = results.reduce((sum, match) => sum + match.samPoints, 0);

  return {
    generatedAt: new Date().toISOString(),
    lukePoints,
    samPoints,
    totalPointsAwarded: lukePoints + samPoints,
    maximumPoints: matches.length * 3,
    completedMatches: results.filter((match) => match.complete).length,
    matches: results,
  };
}
