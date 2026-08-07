import { createAdminClient } from "@/lib/supabase/admin";

export async function getVetHeadPublicTournamentData() {
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
    roundsResult,
    groupsResult,
    assignmentsResult,
    playersResult,
  ] = await Promise.all([
    supabase
      .from("tournament_round")
      .select(`
        id,
        round_number,
        name,
        round_date,
        tee_time,
        format,
        course_tee (
          id,
          course_name,
          tee_name,
          par,
          course_rating,
          slope_rating
        )
      `)
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
      .from("player")
      .select("id, display_name, handicap_index, active")
      .eq("tournament_id", tournament.id)
      .eq("active", true)
      .order("display_name"),
  ]);

  const errors = [
    roundsResult.error,
    groupsResult.error,
    assignmentsResult.error,
    playersResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(
      errors.map((error) => error?.message).join(" | "),
    );
  }

  const rounds = roundsResult.data ?? [];
  const roundIds = new Set(rounds.map((round) => round.id));

  const groups = (groupsResult.data ?? []).filter((group) =>
    roundIds.has(group.round_id),
  );

  const groupIds = new Set(groups.map((group) => group.id));

  const assignments = (assignmentsResult.data ?? []).filter(
    (assignment) => groupIds.has(assignment.round_group_id),
  );

  const players = playersResult.data ?? [];

  const playerMap = new Map(
    players.map((player) => [player.id, player]),
  );

  const roundData = rounds.map((round) => {
    const roundGroups = groups
      .filter((group) => group.round_id === round.id)
      .sort((a, b) => a.group_number - b.group_number)
      .map((group) => {
        const groupPlayers = assignments
          .filter(
            (assignment) =>
              assignment.round_group_id === group.id,
          )
          .sort((a, b) => a.player_order - b.player_order)
          .map((assignment) => {
            const player = playerMap.get(assignment.player_id);

            return {
              id: assignment.player_id,
              name: player?.display_name ?? "Player TBD",
              handicapIndex: player?.handicap_index ?? null,
              order: assignment.player_order,
            };
          });

        return {
          ...group,
          players: groupPlayers,
        };
      });

    return {
      ...round,
      groups: roundGroups,
    };
  });

  return {
    tournament,
    players,
    rounds: roundData,
  };
}
