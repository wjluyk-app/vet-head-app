export interface RankedTeam {
  team: string;
  score: number;
}

export interface PlaceRule {
  place: number;
  amount: number;
}

export interface Award {
  team: string;
  amount: number;
  place: number;
  trace: string;
}

export function rankWithTies(teams: RankedTeam[]): Array<RankedTeam & { place: number }> {
  const sorted = [...teams].sort((a, b) => a.score - b.score || a.team.localeCompare(b.team));
  let priorScore: number | undefined;
  let priorPlace = 0;
  return sorted.map((team, index) => {
    const place = priorScore === team.score ? priorPlace : index + 1;
    priorScore = team.score;
    priorPlace = place;
    return { ...team, place };
  });
}

export function allocatePayouts(
  teams: RankedTeam[],
  rules: PlaceRule[],
): Award[] {
  const ranked = rankWithTies(teams);
  const awards: Award[] = [];

  for (const rule of rules) {
    const tied = ranked.filter((team) => team.place === rule.place);
    if (tied.length === 0) continue;

    const exactShare = rule.amount / tied.length;
    const cents = Math.round(rule.amount * 100);
    const baseCents = Math.floor(cents / tied.length);
    let remaining = cents - baseCents * tied.length;

    tied
      .sort((a, b) => a.team.localeCompare(b.team))
      .forEach((team) => {
        const teamCents = baseCents + (remaining-- > 0 ? 1 : 0);
        awards.push({
          team: team.team,
          amount: teamCents / 100,
          place: rule.place,
          trace: `${rule.amount.toFixed(2)} split across ${tied.length} tied team(s); exact share ${exactShare.toFixed(4)}`,
        });
      });
  }

  return awards;
}

export function reconcileAwards(awards: Award[], expected: number): void {
  const actual = Math.round(
    awards.reduce((total, award) => total + award.amount, 0) * 100,
  ) / 100;
  if (actual !== expected) {
    throw new Error(`Payout reconciliation failed: expected ${expected}, got ${actual}`);
  }
}
