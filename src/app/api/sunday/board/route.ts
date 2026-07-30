import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getSundayDataFromDatabase } from "@/lib/repositories/sunday-db";
import { calculateSundayTournamentBoard } from "@/lib/sunday-tournament-board";

export const dynamic = "force-dynamic";

export async function GET() {
  const client = await createClient();
  const { data } = await client.auth.getUser();

  if (!data.user) {
    return Response.json(
      { ok: false, error: "Authentication required" },
      { status: 401 },
    );
  }

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
