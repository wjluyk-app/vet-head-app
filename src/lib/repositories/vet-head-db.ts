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

import {
  calculateCourseHandicap,
  calculateFourPlayerScrambleHandicap,
  calculateIndividualNet,
  calculateScrambleNet,
  calculateUnroundedCourseHandicap,
} from "@/lib/vet-head-scoring";

export async function upsertVetHeadIndividualScore(params: {
  roundId: string;
  playerId: string;
  grossScore: number;
  handicapIndex: number;
  slopeRating: number;
  courseRating: number;
  par: number;
}) {
  const supabase = createAdminClient();

  const courseHandicap = calculateCourseHandicap(
    params.handicapIndex,
    params.slopeRating,
    params.courseRating,
    params.par,
  );

  const netScore = calculateIndividualNet(
    params.grossScore,
    courseHandicap,
  );

  const { data, error } = await supabase
    .from("individual_score")
    .upsert(
      {
        round_id: params.roundId,
        player_id: params.playerId,
        gross_score: params.grossScore,
        course_handicap: courseHandicap,
        net_score: netScore,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "round_id,player_id",
      },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to save individual score: ${error.message}`);
  }

  return data;
}

export async function upsertVetHeadScrambleScore(params: {
  roundId: string;
  roundGroupId: string;
  grossScore: number;
  players: Array<{
    handicapIndex: number;
    slopeRating: number;
    courseRating: number;
    par: number;
  }>;
}) {
  const supabase = createAdminClient();

  if (params.players.length !== 4) {
    throw new Error("A Vet Head scramble team requires exactly four players.");
  }

  const unroundedCourseHandicaps = params.players.map((player) =>
    calculateUnroundedCourseHandicap(
      player.handicapIndex,
      player.slopeRating,
      player.courseRating,
      player.par,
    ),
  );

  const teamHandicap = calculateFourPlayerScrambleHandicap(
    unroundedCourseHandicaps,
  );

  const netScore = calculateScrambleNet(
    params.grossScore,
    teamHandicap,
  );

  const { data, error } = await supabase
    .from("scramble_score")
    .upsert(
      {
        round_id: params.roundId,
        round_group_id: params.roundGroupId,
        gross_score: params.grossScore,
        team_handicap: teamHandicap,
        net_score: netScore,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "round_id,round_group_id",
      },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to save scramble score: ${error.message}`);
  }

  return data;
}

export async function getVetHeadRoundEntryData(roundId: string) {
  const supabase = createAdminClient();

  const { data: round, error: roundError } = await supabase
    .from("tournament_round")
    .select(`
      *,
      course_tee (
        id,
        course_name,
        tee_name,
        par,
        course_rating,
        slope_rating
      )
    `)
    .eq("id", roundId)
    .single();

  if (roundError || !round) {
    throw new Error(
      `Failed to load Vet Head round: ${roundError?.message ?? "Round not found"}`,
    );
  }

  const { data: groups, error: groupsError } = await supabase
    .from("round_group")
    .select("*")
    .eq("round_id", roundId)
    .order("group_number");

  if (groupsError) {
    throw new Error(`Failed to load Vet Head groups: ${groupsError.message}`);
  }

  const groupIds = (groups ?? []).map((group) => group.id);

  const { data: assignments, error: assignmentsError } = await supabase
    .from("round_group_player")
    .select(`
      *,
      player (
        id,
        display_name,
        handicap_index,
        active
      )
    `)
    .in("round_group_id", groupIds)
    .order("player_order");

  if (assignmentsError) {
    throw new Error(
      `Failed to load Vet Head group assignments: ${assignmentsError.message}`,
    );
  }

  const [
    individualScoresResult,
    scrambleScoresResult,
  ] = await Promise.all([
    supabase
      .from("individual_score")
      .select("*")
      .eq("round_id", roundId),

    supabase
      .from("scramble_score")
      .select("*")
      .eq("round_id", roundId),
  ]);

  if (individualScoresResult.error) {
    throw new Error(
      `Failed to load individual scores: ${individualScoresResult.error.message}`,
    );
  }

  if (scrambleScoresResult.error) {
    throw new Error(
      `Failed to load scramble scores: ${scrambleScoresResult.error.message}`,
    );
  }

  return {
    round,
    groups: groups ?? [],
    assignments: assignments ?? [],
    individualScores: individualScoresResult.data ?? [],
    scrambleScores: scrambleScoresResult.data ?? [],
  };
}
