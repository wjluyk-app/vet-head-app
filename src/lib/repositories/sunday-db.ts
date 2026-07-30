import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  LiveFridayMatch,
  LiveHoleScore,
  LiveSundayData,
  LiveSundaySinglesMatch,
} from "@/lib/live-types";

type PairingRow = {
  id: string;
  match_number: number;
  tee_time: string | null;
  session: { course: string; format: string; name: string } | null;
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

export async function getSundayDataFromDatabase(
  supabase: SupabaseClient,
): Promise<LiveSundayData> {
  const tournamentResponse = await supabase
    .from("tournament")
    .select("id")
    .eq("year", 2026)
    .single();

  if (tournamentResponse.error) throw tournamentResponse.error;
  const tournamentId = tournamentResponse.data.id;

  const { data: teams, error: teamError } = await supabase
    .from("team")
    .select("id, short_name")
    .eq("tournament_id", tournamentId);

  if (teamError) throw teamError;

  const teamById = new Map(
    (teams ?? []).map((team) => [team.id, team.short_name]),
  );
  const teamIdByShortName = new Map(
    (teams ?? []).map((team) => [team.short_name, team.id]),
  );

  const { data: participantRows, error: participantError } = await supabase
    .from("pairing_participant")
    .select("pairing_id, team_id, participant_order, player:player_id(display_name)")
    .order("participant_order");

  if (participantError) throw participantError;

  const participants = new Map<string, Map<string, string[]>>();

  for (const row of participantRows ?? []) {
    const teamShortName = teamById.get(row.team_id);
    if (!teamShortName) continue;

    const byTeam =
      participants.get(row.pairing_id) ?? new Map<string, string[]>();
    const names = byTeam.get(teamShortName) ?? [];
    const player = Array.isArray(row.player) ? row.player[0] : row.player;

    names.push(player?.display_name ?? "Unknown");
    byTeam.set(teamShortName, names);
    participants.set(row.pairing_id, byTeam);
  }

  const { data: pinehurstRows, error: pinehurstError } = await supabase
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
    .eq("session.name", "Sunday Pinehurst")
    .order("match_number");

  if (pinehurstError) throw pinehurstError;

  function normalizeScores(
    rows: Array<{
      hole_number: number;
      net_score: number;
      version: number;
      updated_at: string;
    }>,
  ): Array<LiveHoleScore | null> {
    const scores: Array<LiveHoleScore | null> = Array(9).fill(null);

    for (const row of rows) {
      if (row.hole_number < 1 || row.hole_number > 9) continue;

      scores[row.hole_number - 1] = {
        holeNumber: row.hole_number,
        netScore: row.net_score,
        version: row.version,
        updatedAt: row.updated_at,
      };
    }

    return scores;
  }

  const pinehurst: LiveFridayMatch[] = (
    (pinehurstRows ?? []) as unknown as PairingRow[]
  ).map((pairing) => {
    const cards = pairing.scorecard.map((card) => {
      const teamShortName =
        teamById.get(card.team_id ?? "") ?? "Unknown";
      const names =
        participants.get(pairing.id)?.get(teamShortName) ?? [];

      return {
        id: card.id,
        sourceKey: card.source_key,
        teamShortName,
        player1: names[0] ?? "Unknown",
        player2: names[1] ?? "Unknown",
        scores: normalizeScores(card.hole_score ?? []),
      };
    });

    const luke = cards.find(
      (card) => card.teamShortName === "L. Swardo",
    );
    const sam = cards.find(
      (card) => card.teamShortName === "S. Swardo",
    );

    if (!luke || !sam) {
      throw new Error(
        `Missing Pinehurst scorecards for Sunday match ${pairing.match_number}`,
      );
    }

    return {
      pairingId: pairing.id,
      matchNumber: pairing.match_number,
      teeTime: pairing.tee_time,
      course: pairing.session?.course ?? "Mountain Course",
      format: pairing.session?.format ?? "Pinehurst",
      luke,
      sam,
    };
  });

  const { data: singlesRows, error: singlesError } = await supabase
    .from("pairing")
    .select(`
      id,
      match_number,
      pairing_participant(
        team_id,
        participant_order,
        player:player_id(display_name)
      ),
      match_result(
        winner_team_id,
        halved,
        result_text,
        closed_on_hole,
        status
      ),
      session:session_id!inner(name)
    `)
    .eq("session.name", "Sunday Singles")
    .order("match_number");

  if (singlesError) throw singlesError;

  const lukeTeamId = teamIdByShortName.get("L. Swardo");
  const samTeamId = teamIdByShortName.get("S. Swardo");

  if (!lukeTeamId || !samTeamId) {
    throw new Error("Sunday captain teams were not found");
  }

  const singles: LiveSundaySinglesMatch[] = (singlesRows ?? []).map(
    (pairing: any) => {
      const participantList = pairing.pairing_participant ?? [];

      const lukeParticipant = participantList.find(
        (participant: any) => participant.team_id === lukeTeamId,
      );
      const samParticipant = participantList.find(
        (participant: any) => participant.team_id === samTeamId,
      );

      const result = Array.isArray(pairing.match_result)
        ? pairing.match_result[0]
        : pairing.match_result;

      const lukePlayer = Array.isArray(lukeParticipant?.player)
        ? lukeParticipant.player[0]?.display_name
        : lukeParticipant?.player?.display_name;

      const samPlayer = Array.isArray(samParticipant?.player)
        ? samParticipant.player[0]?.display_name
        : samParticipant?.player?.display_name;

      return {
        pairingId: pairing.id,
        matchNumber: pairing.match_number,
        lukeTeamId,
        samTeamId,
        lukePlayer: lukePlayer ?? "Unknown",
        samPlayer: samPlayer ?? "Unknown",
        winnerTeamId: result?.winner_team_id ?? null,
        halved: result?.halved ?? false,
        resultText: result?.result_text ?? null,
        closedOnHole: result?.closed_on_hole ?? null,
        status: result?.status ?? "in_progress",
      };
    },
  );

  return { pinehurst, singles };
}
