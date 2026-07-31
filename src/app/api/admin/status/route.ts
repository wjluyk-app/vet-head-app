import { createAdminClient } from "@/lib/supabase/admin";
import { getBillAdminUser } from "@/lib/auth/admin";

export async function GET() {
  const adminUser = await getBillAdminUser();

  if (!adminUser) {
    return Response.json(
      { ok: false, error: "Administrator access required" },
      { status: 403 },
    );
  }

  const supabase = createAdminClient();

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournament")
    .select("id")
    .eq("year", 2026)
    .single();

  if (tournamentError || !tournament) {
    return Response.json(
      {
        ok: false,
        error: tournamentError?.message ?? "Tournament not found",
      },
      { status: 500 },
    );
  }

  const { data: sessions, error: sessionsError } = await supabase
    .from("session")
    .select("id, name, status")
    .eq("tournament_id", tournament.id)
    .order("name");

  if (sessionsError || !sessions) {
    return Response.json(
      {
        ok: false,
        error: sessionsError?.message ?? "Sessions unavailable",
      },
      { status: 500 },
    );
  }

  const { count: playerCount } = await supabase
    .from("tournament_player")
    .select("*", { count: "exact", head: true })
    .eq("tournament_id", tournament.id);

  const { count: conflictCount } = await supabase
    .from("score_sync_conflict")
    .select("*", { count: "exact", head: true })
    .eq("status", "open");

  const sessionStatus = await Promise.all(
    sessions.map(async (session) => {
      const [pairings, scorecards, scores, results] = await Promise.all([
        supabase
          .from("pairing")
          .select("*", { count: "exact", head: true })
          .eq("session_id", session.id),

        supabase
          .from("scorecard")
          .select("*, pairing!inner(session_id)", {
            count: "exact",
            head: true,
          })
          .eq("pairing.session_id", session.id),

        supabase
          .from("hole_score")
          .select("*, scorecard!inner(pairing!inner(session_id))", {
            count: "exact",
            head: true,
          })
          .eq("scorecard.pairing.session_id", session.id),

        supabase
          .from("match_result")
          .select("*, pairing!inner(session_id)", {
            count: "exact",
            head: true,
          })
          .eq("pairing.session_id", session.id),
      ]);

      const expectedScores =
        session.name === "Friday" || session.name === "Saturday"
          ? 216
          : session.name === "Sunday Pinehurst"
            ? 108
            : 0;

      const expectedResults =
        session.name === "Sunday Singles" ? 12 : 0;

      return {
        id: session.id,
        name: session.name,
        status: session.status,
        pairings: pairings.count ?? 0,
        scorecards: scorecards.count ?? 0,
        holeScores: scores.count ?? 0,
        expectedScores,
        results: results.count ?? 0,
        expectedResults,
      };
    }),
  );

  const { data: recentActivity } = await supabase
    .from("audit_record")
    .select(
      "id, entity_id, old_value, new_value, reason, created_at",
    )
    .eq("entity_type", "session")
    .eq("field_name", "status")
    .order("created_at", { ascending: false })
    .limit(8);

  const sessionNames = new Map(
    sessions.map((session) => [session.id, session.name]),
  );

  return Response.json({
    ok: true,
    players: playerCount ?? 0,
    openConflicts: conflictCount ?? 0,
    sessions: sessionStatus,
    recentActivity: (recentActivity ?? []).map((entry) => ({
      id: entry.id,
      sessionName:
        sessionNames.get(entry.entity_id ?? "") ?? "Unknown session",
      oldStatus: entry.old_value,
      newStatus: entry.new_value,
      reason: entry.reason,
      createdAt: entry.created_at,
    })),
  });
}
