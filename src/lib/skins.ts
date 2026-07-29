export interface SkinTeamScore {
  team: string;
  scores: number[];
  pars: number[];
}

export interface SkinWinner {
  hole: number;
  team: string;
  netScore: number;
  validated: boolean;
}

export function calculateFridaySkins(cards: SkinTeamScore[]): SkinWinner[] {
  cards.forEach((card) => {
    if (card.scores.length !== 18 || card.pars.length !== 18) {
      throw new Error(`${card.team} must contain 18 scores and 18 pars.`);
    }
  });

  const winners: SkinWinner[] = [];
  for (let index = 0; index < 18; index += 1) {
    const low = Math.min(...cards.map((card) => card.scores[index]));
    const lowCards = cards.filter((card) => card.scores[index] === low);

    // Tied lows do not pay.
    if (lowCards.length !== 1) continue;

    const card = lowCards[0];
    const validated =
      index === 17 || card.scores[index + 1] <= card.pars[index + 1];

    if (validated) {
      winners.push({
        hole: index + 1,
        team: card.team,
        netScore: low,
        validated: true,
      });
    }
  }

  return winners;
}
