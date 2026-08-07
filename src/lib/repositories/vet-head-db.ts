import { createAdminClient } from "@/lib/supabase/admin";

export async function getVetHeadTournamentData() {
  const supabase = createAdminClient();

  const [
    tournamentResult,
    playersResult,
    roundsResult,
    groupsResult,
    groupPlayersResult,
  ] = await Promise.all([
    supabase
      .from("tournament")
      .select("*")
      .eq("name", "VET HEAD")
      .eq("year", 2026)
      .single(),

    supabase
      .from("player")
      .select("*")
      .eq("active", true)
      .order("display_name"),

    supabase
      .from("tournament_round")
      .select("*")
      .order("round_number"),

    supabase
      .from("round_group")
      .select("*")
      .order("round_id")
      .order("group_number"),

    supabase
      .from("round_group_player")
      .select("*")
      .order("round_group_id")
      .order("player_order"),
  ]);

  const errors = [
    tournamentResult.error,
    playersResult.error,
    roundsResult.error,
    groupsResult.error,
    groupPlayersResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(
      `Failed to load Vet Head tournament data: ${errors
        .map((error) => error?.message)
        .join(" | ")}`,
    );
  }

  return {
    tournament: tournamentResult.data,
    players: playersResult.data ?? [],
    rounds: roundsResult.data ?? [],
    groups: groupsResult.data ?? [],
    groupPlayers: groupPlayersResult.data ?? [],
  };
}
