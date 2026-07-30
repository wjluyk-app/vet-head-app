import type { SupabaseClient } from "@supabase/supabase-js";
import type { LiveFridayMatch, LiveHoleScore } from "@/lib/live-types";

type PairingRow = {
  id: string;
  match_number: number;
  tee_time: string | null;
  session: { course: string; format: string } | null;
  scorecard: Array<{
    id: string;
    source_key: string;
    team_id: string | null;
    hole_score: Array<{
      hole_number: number;
      net_score: number;
      version: number;
      updated_at: string;
    }>;
  }>;
};

export async function getSaturdayMatchesFromDatabase(
  supabase: SupabaseClient,
): Promise<LiveFridayMatch[]> {
  const { data: teams, error: teamError } = await supabase
    .from("team")
    .select("id, short_name")
    .eq("tournament_id", (
      await supabase.from("tournament").select("id").eq("year", 2026).single()
    ).data?.id);

  if (teamError) throw teamError;
  const teamById = new Map((teams ?? []).map((team) => [team.id, team.short_name]));

  const { data: participantRows, error: participantError } = await supabase
    .from("pairing_participant")
    .select("pairing_id, team_id, participant_order, player:player_id(display_name)")
    .order("participant_order");
  if (participantError) throw participantError;

  const participants = new Map<string, Map<string, string[]>>();
  for (const row of participantRows ?? []) {
    const teamShortName = teamById.get(row.team_id);
    if (!teamShortName) continue;
    const byTeam = participants.get(row.pairing_id) ?? new Map<string, string[]>();
    const names = byTeam.get(teamShortName) ?? [];
    const player = Array.isArray(row.player) ? row.player[0] : row.player;
    names.push(player?.display_name ?? "Unknown");
    byTeam.set(teamShortName, names);
    participants.set(row.pairing_id, byTeam);
  }

  const { data, error } = await supabase
    .from("pairing")
    .select(`
      id,
      match_number,
      tee_time,
      session:session_id!inner(course, format, name),
      scorecard(
        id,
        source_key,
        team_id,
        hole_score(hole_number, net_score, version, updated_at)
      )
    `)
    .eq("session.name", "Saturday")
    .order("match_number");

  if (error) throw error;

  function normalizeScores(
    rows: Array<{ hole_number: number; net_score: number; version: number; updated_at: string }>,
  ): Array<LiveHoleScore | null> {
    const scores: Array<LiveHoleScore | null> = Array(18).fill(null);
    for (const row of rows) {
      scores[row.hole_number - 1] = {
        holeNumber: row.hole_number,
        netScore: row.net_score,
        version: row.version,
        updatedAt: row.updated_at,
      };
    }
    return scores;
  }

  return ((data ?? []) as unknown as PairingRow[]).map((pairing) => {
    const cards = pairing.scorecard.map((card) => {
      const teamShortName = teamById.get(card.team_id ?? "") ?? "Unknown";
      const names = participants.get(pairing.id)?.get(teamShortName) ?? [];
      return {
        id: card.id,
        sourceKey: card.source_key,
        teamShortName,
        player1: names[0] ?? "Unknown",
        player2: names[1] ?? "Unknown",
        scores: normalizeScores(card.hole_score ?? []),
      };
    });

    const luke = cards.find((card) => card.teamShortName === "L. Swardo");
    const sam = cards.find((card) => card.teamShortName === "S. Swardo");
    if (!luke || !sam) throw new Error(`Missing scorecards for Saturday match ${pairing.match_number}`);

    return {
      pairingId: pairing.id,
      matchNumber: pairing.match_number,
      teeTime: pairing.tee_time,
      course: pairing.session?.course ?? "Betsie Valley",
      format: pairing.session?.format ?? "18-hole Scramble",
      luke,
      sam,
    };
  });
}
