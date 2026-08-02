import { createAdminClient } from "@/lib/supabase/admin";
import { getFridayMatchesFromDatabase } from "@/lib/repositories/friday-db";
import { getSaturdayMatchesFromDatabase } from "@/lib/repositories/saturday-db";
import { getSundayDataFromDatabase } from "@/lib/repositories/sunday-db";
import { calculateFridayTournamentBoard } from "@/lib/friday-tournament-board";
import { calculateSaturdayTournamentBoard } from "@/lib/saturday-tournament-board";
import { calculateSundayTournamentBoard } from "@/lib/sunday-tournament-board";
import { calculateOverallTournamentBoard } from "@/lib/overall-tournament-board";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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

    return Response.json({
      ok: true,
      board: calculateOverallTournamentBoard(
        friday,
        saturday,
        sunday,
      ),
      friday,
      saturday,
      sunday,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Overall scoreboard unavailable",
      },
      { status: 500 },
    );
  }
}
