import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();
  const { data: tournament, error } = await supabase.from("tournament")
    .select("id").eq("year", 2026).single();
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  const { data: friday } = await supabase.from("session")
    .select("id, status").eq("tournament_id", tournament.id).eq("name", "Friday").single();
  if (!friday) return Response.json({ ok: false, error: "Friday session missing" }, { status: 500 });

  const [players, pairings, scorecards, scores, conflicts] = await Promise.all([
    supabase.from("tournament_player").select("*", { count: "exact", head: true }).eq("tournament_id", tournament.id),
    supabase.from("pairing").select("*", { count: "exact", head: true }).eq("session_id", friday.id),
    supabase.from("scorecard").select("*, pairing!inner(session_id)", { count: "exact", head: true }).eq("pairing.session_id", friday.id),
    supabase.from("hole_score").select("*, scorecard!inner(pairing!inner(session_id))", { count: "exact", head: true }).eq("scorecard.pairing.session_id", friday.id),
    supabase.from("score_sync_conflict").select("*", { count: "exact", head: true }).eq("status", "open"),
  ]);

  return Response.json({
    ok: true,
    fridayStatus: friday.status,
    players: players.count,
    pairings: pairings.count,
    scorecards: scorecards.count,
    holeScores: scores.count,
    expectedHoleScores: 216,
    openConflicts: conflicts.count,
    ready: players.count === 24 && pairings.count === 6 && scorecards.count === 12 && scores.count === 216,
  });
}
