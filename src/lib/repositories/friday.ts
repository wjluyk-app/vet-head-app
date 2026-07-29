import seed from "../../data/2026-workbook-seed.json";

export interface FridayTeamCard {
  matchNumber: number;
  teamShortName: string;
  player1: string;
  player2: string;
  scores: number[];
  out: number;
  in: number;
  total: number;
  points: number;
}

export interface FridayMatchView {
  matchNumber: number;
  teeTime: string | null;
  course: string;
  format: string;
  luke: FridayTeamCard;
  sam: FridayTeamCard;
}

export function getFridayMatchesFromSeed(): FridayMatchView[] {
  const fridayPairings = seed.pairings.filter((pairing) => pairing.day === "Friday");

  return fridayPairings.map((pairing) => {
    const cards = seed.friday.scorecards.filter(
      (card) => card.matchNumber === pairing.matchNumber,
    );
    const luke = cards.find((card) => card.teamShortName === "L. Swardo");
    const sam = cards.find((card) => card.teamShortName === "S. Swardo");

    if (!luke || !sam) {
      throw new Error(`Missing Friday scorecards for match ${pairing.matchNumber}.`);
    }

    return {
      matchNumber: pairing.matchNumber,
      teeTime: pairing.teeTime,
      course: pairing.course,
      format: pairing.format,
      luke,
      sam,
    };
  });
}

export function getFridayMatchFromSeed(matchNumber: number): FridayMatchView {
  const match = getFridayMatchesFromSeed().find(
    (item) => item.matchNumber === matchNumber,
  );
  if (!match) throw new Error(`Friday match ${matchNumber} was not found.`);
  return match;
}
