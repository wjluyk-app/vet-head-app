import { createAdminClient } from "@/lib/supabase/admin";
import { getSaturdayMatchesFromDatabase } from "@/lib/repositories/saturday-db";
import { calculateSaturdayTournamentBoard } from "@/lib/saturday-tournament-board";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const matches = await getSaturdayMatchesFromDatabase(createAdminClient());
    return Response.json({
      ok: true,
      board: calculateSaturdayTournamentBoard(matches),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Board unavailable",
      },
      { status: 500 },
    );
  }
}
