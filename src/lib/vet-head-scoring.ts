export function calculateUnroundedCourseHandicap(
  handicapIndex: number,
  slopeRating: number,
  courseRating: number,
  par: number,
): number {
  return handicapIndex * (slopeRating / 113) + (courseRating - par);
}

export function calculateCourseHandicap(
  handicapIndex: number,
  slopeRating: number,
  courseRating: number,
  par: number,
): number {
  return Math.round(
    calculateUnroundedCourseHandicap(
      handicapIndex,
      slopeRating,
      courseRating,
      par,
    ),
  );
}

export function calculateIndividualNet(
  grossScore: number,
  courseHandicap: number,
): number {
  return grossScore - courseHandicap;
}

export function calculateFourPlayerScrambleHandicap(
  courseHandicaps: number[],
): number {
  if (courseHandicaps.length !== 4) {
    throw new Error("A four-player scramble requires exactly four handicaps.");
  }

  const sorted = [...courseHandicaps].sort((a, b) => a - b);

  const teamHandicap =
    sorted[0] * 0.25 +
    sorted[1] * 0.20 +
    sorted[2] * 0.15 +
    sorted[3] * 0.10;

  return Math.round(teamHandicap);
}

export function calculateScrambleNet(
  grossScore: number,
  teamHandicap: number,
): number {
  return grossScore - teamHandicap;
}

export type VetHeadGroupResult = {
  groupId: string;
  total: number;
  place: number;
  pointsPerPlayer: number;
};

export function calculateRoundGroupPoints(
  groups: Array<{ groupId: string; total: number }>,
): VetHeadGroupResult[] {
  if (groups.length !== 3) {
    throw new Error("A Vet Head round requires exactly three groups.");
  }

  const sorted = [...groups].sort((a, b) => a.total - b.total);
  const placePoints = [8, 6, 4];

  const results: VetHeadGroupResult[] = [];

  let index = 0;

  while (index < sorted.length) {
    const tiedTotal = sorted[index].total;
    let end = index;

    while (
      end + 1 < sorted.length &&
      sorted[end + 1].total === tiedTotal
    ) {
      end += 1;
    }

    const tiedCount = end - index + 1;

    const pointsPool = placePoints
      .slice(index, end + 1)
      .reduce((sum, points) => sum + points, 0);

    const splitPoints = pointsPool / tiedCount;
    const place = index + 1;

    for (let i = index; i <= end; i += 1) {
      results.push({
        groupId: sorted[i].groupId,
        total: sorted[i].total,
        place,
        pointsPerPlayer: splitPoints,
      });
    }

    index = end + 1;
  }

  return results;
}

export type VetHeaderStandingInput = {
  playerId: string;
  thursdayNet: number;
  fridayAmNet: number;
  saturdayAmNet: number;
};

export type VetHeaderStanding = VetHeaderStandingInput & {
  totalNet: number;
  place: number;
};

export function calculateVetHeaderStandings(
  players: VetHeaderStandingInput[],
): VetHeaderStanding[] {
  return players
    .map((player) => ({
      ...player,
      totalNet:
        player.thursdayNet +
        player.fridayAmNet +
        player.saturdayAmNet,
    }))
    .sort((a, b) => {
      if (a.totalNet !== b.totalNet) {
        return a.totalNet - b.totalNet;
      }

      if (a.saturdayAmNet !== b.saturdayAmNet) {
        return a.saturdayAmNet - b.saturdayAmNet;
      }

      if (a.fridayAmNet !== b.fridayAmNet) {
        return a.fridayAmNet - b.fridayAmNet;
      }

      return a.thursdayNet - b.thursdayNet;
    })
    .map((player, index) => ({
      ...player,
      place: index + 1,
    }));
}

export type VetHeadMvpStandingInput = {
  playerId: string;
  totalPoints: number;
  firstPlaceFinishes: number;
  secondPlaceFinishes: number;
  vetHeaderTotalNet: number;
};

export type VetHeadMvpStanding = VetHeadMvpStandingInput & {
  place: number;
};

export function calculateVetHeadMvpStandings(
  players: VetHeadMvpStandingInput[],
): VetHeadMvpStanding[] {
  return [...players]
    .sort((a, b) => {
      if (a.totalPoints !== b.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }

      if (a.firstPlaceFinishes !== b.firstPlaceFinishes) {
        return b.firstPlaceFinishes - a.firstPlaceFinishes;
      }

      if (a.secondPlaceFinishes !== b.secondPlaceFinishes) {
        return b.secondPlaceFinishes - a.secondPlaceFinishes;
      }

      return a.vetHeaderTotalNet - b.vetHeaderTotalNet;
    })
    .map((player, index) => ({
      ...player,
      place: index + 1,
    }));
}
