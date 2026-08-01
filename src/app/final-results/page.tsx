import OverallTournamentBoardClient from "@/components/OverallTournamentBoardClient";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFridayMatchesFromDatabase } from "@/lib/repositories/friday-db";
import { getSaturdayMatchesFromDatabase } from "@/lib/repositories/saturday-db";
import { getSundayDataFromDatabase } from "@/lib/repositories/sunday-db";
import { calculateFridayTournamentBoard } from "@/lib/friday-tournament-board";
import { calculateSaturdayTournamentBoard } from "@/lib/saturday-tournament-board";
import { calculateSundayTournamentBoard } from "@/lib/sunday-tournament-board";
import { calculateOverallTournamentBoard } from "@/lib/overall-tournament-board";

export const dynamic = "force-dynamic";

export default async function FinalResultsPage() {
  const supabase = createAdminClient();

  const [fridayMatches, saturdayMatches, sundayData] =
    await Promise.all([
      getFridayMatchesFromDatabase(supabase),
      getSaturdayMatchesFromDatabase(supabase),
      getSundayDataFromDatabase(supabase),
    ]);

  const friday = calculateFridayTournamentBoard(fridayMatches);
  const saturday = calculateSaturdayTournamentBoard(saturdayMatches);
  const sunday = calculateSundayTournamentBoard(sundayData);

  const overall = calculateOverallTournamentBoard(
    friday,
    saturday,
    sunday,
  );

  const championshipMessage = overall.complete
    ? overall.winner === "LUKE"
      ? "Team Luke are the 2026 Cubby Cup Champions."
      : overall.winner === "SAM"
        ? "Team Sam are the 2026 Cubby Cup Champions."
        : "The 2026 Cubby Cup finished tied."
    : "Final results will be declared after all 54 points are awarded.";

  return (
    <>
      <section className="hero fridayResultsHero">
        <div className="smallLabel">PERMANENT RECORD</div>
        <h1>Final Results</h1>
        <p>{championshipMessage}</p>
      </section>

      <OverallTournamentBoardClient initial={overall} />
    </>
  );
}
