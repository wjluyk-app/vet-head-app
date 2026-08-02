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

export default async function ScoreboardPage() {
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

  return (
    <>
      <section className="hero fridayResultsHero mobileScoreboardHero">
        <h1>Live Scoreboard</h1>
        <p>Team Luke vs. Team Sam · Match-by-match scoring</p>
      </section>

      <OverallTournamentBoardClient
        initial={overall}
        initialFriday={friday}
        initialSaturday={saturday}
        initialSunday={sunday}
      />
    </>
  );
}
