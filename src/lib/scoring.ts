import type {
  ComponentResult,
  FridayMatchResult,
  MatchPointRules,
  TeamScorecard,
} from "./types";

export const DEFAULT_FRIDAY_POINT_RULES: MatchPointRules = {
  frontWinner: 1,
  frontTieEach: 0.5,
  backWinner: 1,
  backTieEach: 0.5,
  overallWinner: 1,
  overallTieEach: 0.5,
};

function assertValidCard(card: TeamScorecard): void {
  if (card.scores.length !== 18) {
    throw new Error(`${card.team} scorecard must contain exactly 18 scores.`);
  }
  card.scores.forEach((score, index) => {
    if (!Number.isInteger(score) || score < 1 || score > 20) {
      throw new Error(`Invalid NET score at hole ${index + 1}: ${score}`);
    }
  });
}

function compare(
  component: ComponentResult["component"],
  lukeScore: number,
  samScore: number,
  winnerPoints: number,
  tiePointsEach: number,
): ComponentResult {
  if (lukeScore < samScore) {
    return {
      component,
      lukePoints: winnerPoints,
      samPoints: 0,
      lukeScore,
      samScore,
      winner: "LUKE",
    };
  }
  if (samScore < lukeScore) {
    return {
      component,
      lukePoints: 0,
      samPoints: winnerPoints,
      lukeScore,
      samScore,
      winner: "SAM",
    };
  }
  return {
    component,
    lukePoints: tiePointsEach,
    samPoints: tiePointsEach,
    lukeScore,
    samScore,
    winner: "HALVED",
  };
}

export function calculateFridayMatch(
  luke: TeamScorecard,
  sam: TeamScorecard,
  rules: MatchPointRules = DEFAULT_FRIDAY_POINT_RULES,
): FridayMatchResult {
  assertValidCard(luke);
  assertValidCard(sam);

  // Scores are already NET. This engine compares them directly.
  // It deliberately contains no handicap-subtraction step.
  const holeWinners = luke.scores.map((score, index) => {
    const opponent = sam.scores[index];
    if (score < opponent) return "LUKE" as const;
    if (opponent < score) return "SAM" as const;
    return "HALVED" as const;
  });

  const sum = (scores: number[], start: number, end: number) =>
    scores.slice(start, end).reduce((total, score) => total + score, 0);

  const lukeFront = sum(luke.scores, 0, 9);
  const samFront = sum(sam.scores, 0, 9);
  const lukeBack = sum(luke.scores, 9, 18);
  const samBack = sum(sam.scores, 9, 18);
  const lukeTotal = lukeFront + lukeBack;
  const samTotal = samFront + samBack;

  const components = [
    compare("front", lukeFront, samFront, rules.frontWinner, rules.frontTieEach),
    compare("back", lukeBack, samBack, rules.backWinner, rules.backTieEach),
    compare(
      "overall",
      lukeTotal,
      samTotal,
      rules.overallWinner,
      rules.overallTieEach,
    ),
  ];

  const lukePoints = components.reduce((total, item) => total + item.lukePoints, 0);
  const samPoints = components.reduce((total, item) => total + item.samPoints, 0);

  const finalStatus =
    lukePoints === samPoints
      ? "Halved"
      : lukePoints > samPoints
        ? `Luke ${lukePoints}-${samPoints}`
        : `Sam ${samPoints}-${lukePoints}`;

  return { components, lukePoints, samPoints, holeWinners, finalStatus };
}

export function calculateSessionTotals(
  matches: FridayMatchResult[],
): { luke: number; sam: number } {
  return matches.reduce(
    (totals, match) => ({
      luke: totals.luke + match.lukePoints,
      sam: totals.sam + match.samPoints,
    }),
    { luke: 0, sam: 0 },
  );
}
