import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculateHoleNet,
  calculateHybridGroupTotal,
  calculateRoundGroupPoints,
  calculateVetHeaderStandings,
  calculateVetHeadMvpStandings,
} from "@/lib/vet-head-scoring";

type PlayerRow = {
  id: string;
  display_name: string;
};

type RoundRow = {
  id: string;
  round_number: number;
  name: string;
  round_date: string;
  tee_time: string;
  format: "individual_net" | "four_man_scramble";
};

type GroupRow = {
  id: string;
  round_id: string;
  group_number: number;
  name: string | null;
};

type AssignmentRow = {
  round_group_id: string;
  player_id: string;
  player_order: number;
};

type IndividualScoreRow = {
  round_id: string;
  player_id: string;
  gross_score: number;
  course_handicap: number;
  net_score: number;
};

type IndividualHoleScoreRow = {
  round_id: string;
  player_id: string;
  hole_number: number;
  gross_score: number;
};

type ScrambleScoreRow = {
  round_id: string;
  round_group_id: string;
  gross_score: number;
  team_handicap: number;
  net_score: number;
};

export async function getVetHeadScoreboardData() {
  const supabase = createAdminClient();

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournament")
    .select("id, name, year, start_date, end_date")
    .eq("name", "VET HEAD")
    .eq("year", 2026)
    .single();

  if (tournamentError || !tournament) {
    throw new Error(
      tournamentError?.message ?? "Vet Head tournament not found.",
    );
  }

  const [
    playersResult,
    roundsResult,
    groupsResult,
    assignmentsResult,
    individualScoresResult,
    individualHoleScoresResult,
    scrambleScoresResult,
  ] = await Promise.all([
    supabase
      .from("player")
      .select("id, display_name")
      .eq("tournament_id", tournament.id)
      .eq("active", true)
      .order("display_name"),

    supabase
      .from("tournament_round")
      .select("id, round_number, name, round_date, tee_time, format")
      .eq("tournament_id", tournament.id)
      .order("round_number"),

    supabase
      .from("round_group")
      .select("id, round_id, group_number, name")
      .order("round_id")
      .order("group_number"),

    supabase
      .from("round_group_player")
      .select("round_group_id, player_id, player_order")
      .order("player_order"),

    supabase
      .from("individual_score")
      .select(
        "round_id, player_id, gross_score, course_handicap, net_score",
      ),

    supabase
      .from("individual_hole_score")
      .select(
        "round_id, player_id, hole_number, gross_score",
      ),

    supabase
      .from("scramble_score")
      .select(
        "round_id, round_group_id, gross_score, team_handicap, net_score",
      ),
  ]);

  const errors = [
    playersResult.error,
    roundsResult.error,
    groupsResult.error,
    assignmentsResult.error,
    individualScoresResult.error,
    individualHoleScoresResult.error,
    scrambleScoresResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(
      errors.map((error) => error?.message).join(" | "),
    );
  }

  const players = (playersResult.data ?? []) as PlayerRow[];
  const rounds = (roundsResult.data ?? []) as RoundRow[];
  const allGroups = (groupsResult.data ?? []) as GroupRow[];
  const assignments =
    (assignmentsResult.data ?? []) as AssignmentRow[];
  const individualScores =
    (individualScoresResult.data ?? []) as IndividualScoreRow[];
  const individualHoleScores =
    (individualHoleScoresResult.data ?? []) as IndividualHoleScoreRow[];
  const scrambleScores =
    (scrambleScoresResult.data ?? []) as ScrambleScoreRow[];

  const playerMap = new Map(
    players.map((player) => [player.id, player]),
  );

  const roundIds = new Set(rounds.map((round) => round.id));

  const groups = allGroups.filter((group) =>
    roundIds.has(group.round_id),
  );

  const groupIds = new Set(groups.map((group) => group.id));

  const tournamentAssignments = assignments.filter((assignment) =>
    groupIds.has(assignment.round_group_id),
  );

  const tournamentIndividualScores = individualScores.filter((score) =>
    roundIds.has(score.round_id),
  );

  const tournamentIndividualHoleScores = individualHoleScores.filter(
    (score) => roundIds.has(score.round_id),
  );

  const tournamentScrambleScores = scrambleScores.filter((score) =>
    roundIds.has(score.round_id),
  );

  const cedarRiverStrokeIndexes = [
    7, 11, 3, 13, 1, 17, 9, 15, 5,
    6, 12, 2, 16, 18, 10, 8, 14, 4,
  ];

  const hawksEyeStrokeIndexes = [
    9, 7, 13, 3, 5, 15, 17, 12, 10,
    16, 8, 2, 11, 1, 6, 18, 4, 14,
  ];

  const getIndividualRoundStrokeIndexes = (
    roundNumber: number,
  ) => {
    if (roundNumber === 1 || roundNumber === 2) {
      return cedarRiverStrokeIndexes;
    }

    if (roundNumber === 4) {
      return hawksEyeStrokeIndexes;
    }

    throw new Error(
      `Stroke indexes are not configured for individual round ${roundNumber}.`,
    );
  };

  const roundBoards = rounds.map((round) => {
    const roundGroups = groups
      .filter((group) => group.round_id === round.id)
      .sort((a, b) => a.group_number - b.group_number);

    const groupBoards = roundGroups.map((group) => {
      const groupAssignments = tournamentAssignments
        .filter(
          (assignment) =>
            assignment.round_group_id === group.id,
        )
        .sort((a, b) => a.player_order - b.player_order);

      const groupPlayers = groupAssignments.map((assignment) => ({
        id: assignment.player_id,
        name:
          playerMap.get(assignment.player_id)?.display_name ??
          "Unknown Player",
      }));

      if (round.format === "individual_net") {
        const scores = groupPlayers.map((player) => {
          const score = tournamentIndividualScores.find(
            (item) =>
              item.round_id === round.id &&
              item.player_id === player.id,
          );

          return {
            ...player,
            gross: score?.gross_score ?? null,
            handicap: score?.course_handicap ?? null,
            net: score?.net_score ?? null,
          };
        });

        const strokeIndexes =
          getIndividualRoundStrokeIndexes(
            round.round_number,
          );

        const hybridPlayers = scores.map((player) => {
          const holeScores =
            tournamentIndividualHoleScores
              .filter(
                (holeScore) =>
                  holeScore.round_id === round.id &&
                  holeScore.player_id === player.id,
              )
              .sort(
                (a, b) =>
                  a.hole_number - b.hole_number,
              );

          const courseHandicap =
            player.handicap === null
              ? null
              : Number(player.handicap);

          return {
            ...player,
            courseHandicap,
            holes: holeScores.map((holeScore) => {
              const strokeIndex =
                strokeIndexes[
                  holeScore.hole_number - 1
                ];

              return {
                holeNumber: holeScore.hole_number,
                grossScore: holeScore.gross_score,
                strokeIndex,
                netScore:
                  courseHandicap === null
                    ? null
                    : calculateHoleNet(
                        holeScore.gross_score,
                        courseHandicap,
                        strokeIndex,
                      ),
              };
            }),
          };
        });

        const complete =
          scores.length === 4 &&
          scores.every(
            (score) =>
              score.net !== null &&
              score.handicap !== null,
          ) &&
          hybridPlayers.every(
            (player) =>
              player.courseHandicap !== null &&
              player.holes.length === 18,
          );

        const total = complete
          ? calculateHybridGroupTotal(
              hybridPlayers.map((player) => ({
                courseHandicap: Number(
                  player.courseHandicap,
                ),
                holes: player.holes.map((hole) => ({
                  holeNumber: hole.holeNumber,
                  grossScore: hole.grossScore,
                  strokeIndex: hole.strokeIndex,
                })),
              })),
            ).total
          : null;

        const countingHoleTotals = complete
          ? Array.from({ length: 18 }, (_, index) => {
              const nets = hybridPlayers
                .map(
                  (player) =>
                    player.holes[index]?.netScore,
                )
                .filter(
                  (score): score is number =>
                    score !== null &&
                    score !== undefined,
                )
                .sort((a, b) => a - b);

              const numberToCount =
                index < 9 ? 2 : 3;

              return nets
                .slice(0, numberToCount)
                .reduce(
                  (sum, score) => sum + score,
                  0,
                );
            })
          : [];

        const frontNine =
          countingHoleTotals.length === 18
            ? countingHoleTotals
                .slice(0, 9)
                .reduce(
                  (sum, score) => sum + score,
                  0,
                )
            : null;

        const backNine =
          countingHoleTotals.length === 18
            ? countingHoleTotals
                .slice(9)
                .reduce(
                  (sum, score) => sum + score,
                  0,
                )
            : null;

        return {
          id: group.id,
          groupNumber: group.group_number,
          name: group.name ?? `Group ${group.group_number}`,
          players: hybridPlayers,
          gross: null,
          handicap: null,
          total,
          frontNine,
          backNine,
          countingHoleTotals,
          complete,
          place: null as number | null,
          pointsPerPlayer: null as number | null,
        };
      }

      const score = tournamentScrambleScores.find(
        (item) =>
          item.round_id === round.id &&
          item.round_group_id === group.id,
      );

      return {
        id: group.id,
        groupNumber: group.group_number,
        name: group.name ?? `Team ${group.group_number}`,
        players: groupPlayers.map((player) => ({
          ...player,
          gross: null,
          handicap: null,
          net: null,
          courseHandicap: null,
          holes: [] as Array<{
            holeNumber: number;
            grossScore: number;
            strokeIndex: number;
            netScore: number | null;
          }>,
        })),
        gross: score?.gross_score ?? null,
        handicap: score?.team_handicap ?? null,
        total: score?.net_score ?? null,
        frontNine: null,
        backNine: null,
        countingHoleTotals: [] as number[],
        complete: Boolean(score),
        place: null as number | null,
        pointsPerPlayer: null as number | null,
      };
    });

    const roundComplete =
      groupBoards.length === 3 &&
      groupBoards.every((group) => group.complete);

    if (roundComplete) {
      const results = calculateRoundGroupPoints(
        groupBoards.map((group) => ({
          groupId: group.id,
          total: Number(group.total),
        })),
      );

      for (const group of groupBoards) {
        const result = results.find(
          (item) => item.groupId === group.id,
        );

        if (result) {
          group.place = result.place;
          group.pointsPerPlayer = result.pointsPerPlayer;
        }
      }
    }

    return {
      ...round,
      groups: groupBoards,
      complete: roundComplete,
    };
  });

  const individualRounds = rounds
    .filter((round) => round.format === "individual_net")
    .sort((a, b) => a.round_number - b.round_number);

  const vetHeaderEligible =
    individualRounds.length === 3
      ? players
          .map((player) => {
            const nets = individualRounds.map((round) =>
              tournamentIndividualScores.find(
                (score) =>
                  score.round_id === round.id &&
                  score.player_id === player.id,
              ),
            );

            if (nets.some((score) => !score)) {
              return null;
            }

            return {
              playerId: player.id,
              thursdayNet: Number(nets[0]!.net_score),
              fridayAmNet: Number(nets[1]!.net_score),
              saturdayAmNet: Number(nets[2]!.net_score),
            };
          })
          .filter(
            (
              player,
            ): player is {
              playerId: string;
              thursdayNet: number;
              fridayAmNet: number;
              saturdayAmNet: number;
            } => player !== null,
          )
      : [];

  const vetHeader = calculateVetHeaderStandings(
    vetHeaderEligible,
  ).map((standing) => ({
    ...standing,
    playerName:
      playerMap.get(standing.playerId)?.display_name ??
      "Unknown Player",
  }));

  const playerPointStats = players.map((player) => {
    let totalPoints = 0;
    let firstPlaceFinishes = 0;
    let secondPlaceFinishes = 0;

    for (const round of roundBoards) {
      if (!round.complete) {
        continue;
      }

      const group = round.groups.find((item) =>
        item.players.some(
          (groupPlayer) => groupPlayer.id === player.id,
        ),
      );

      if (!group || group.pointsPerPlayer === null) {
        continue;
      }

      totalPoints += group.pointsPerPlayer;

      if (group.place === 1) {
        firstPlaceFinishes += 1;
      }

      if (group.place === 2) {
        secondPlaceFinishes += 1;
      }
    }

    const vetHeaderStanding = vetHeader.find(
      (standing) => standing.playerId === player.id,
    );

    return {
      playerId: player.id,
      totalPoints,
      firstPlaceFinishes,
      secondPlaceFinishes,
      vetHeaderTotalNet:
        vetHeaderStanding?.totalNet ?? Number.MAX_SAFE_INTEGER,
    };
  });

  const anyRoundComplete = roundBoards.some(
    (round) => round.complete,
  );

  const mvp = anyRoundComplete
    ? calculateVetHeadMvpStandings(playerPointStats).map(
        (standing) => ({
          ...standing,
          playerName:
            playerMap.get(standing.playerId)?.display_name ??
            "Unknown Player",
        }),
      )
    : [];

  return {
    tournament,
    players,
    rounds: roundBoards,
    vetHeader,
    mvp,
    completedRounds: roundBoards.filter(
      (round) => round.complete,
    ).length,
  };
}
