import { createClient } from "@supabase/supabase-js";

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are missing.");
  const supabase = createClient(url, key);

  const { data: tournament, error } = await supabase
    .from("tournament").select("id").eq("year", 2026).single();
  if (error) throw error;

  const checks = await Promise.all([
    supabase.from("tournament_player").select("*", { count: "exact", head: true }).eq("tournament_id", tournament.id),
    supabase.from("session").select("*", { count: "exact", head: true }).eq("tournament_id", tournament.id),
    supabase.from("pairing").select("*, session!inner(tournament_id)", { count: "exact", head: true }).eq("session.tournament_id", tournament.id),
    supabase.from("scorecard").select("*, pairing!inner(session!inner(tournament_id))", { count: "exact", head: true }).eq("pairing.session.tournament_id", tournament.id),
    supabase.from("hole_score").select("*, scorecard!inner(pairing!inner(session!inner(tournament_id)))", { count: "exact", head: true }).eq("scorecard.pairing.session.tournament_id", tournament.id),
  ]);

  const [players, sessions, pairings, scorecards, scores] = checks;
  for (const check of checks) if (check.error) throw check.error;

  console.log(JSON.stringify({
    players: players.count,
    sessions: sessions.count,
    pairings: pairings.count,
    scorecards: scorecards.count,
    holeScores: scores.count,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
