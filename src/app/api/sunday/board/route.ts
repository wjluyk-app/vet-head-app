import { createAdminClient } from "@/lib/supabase/admin";
import { getSundayDataFromDatabase } from "@/lib/repositories/sunday-db";
import { calculateSundayTournamentBoard } from "@/lib/sunday-tournament-board";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sundayData = await getSundayDataFromDatabase(createAdminClient());

    return Response.json({
      ok: true,
      board: calculateSundayTournamentBoard(sundayData),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Sunday board unavailable",
      },
      { status: 500 },
    );
  }
}
