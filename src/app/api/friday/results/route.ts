import { createAdminClient } from "@/lib/supabase/admin";
import { getFridayMatchesFromDatabase } from "@/lib/repositories/friday-db";
import { calculateFridayLiveResults } from "@/lib/friday-results";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const matches = await getFridayMatchesFromDatabase(createAdminClient());
    return Response.json({ ok: true, results: calculateFridayLiveResults(matches) });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Friday results unavailable",
      },
      { status: 500 },
    );
  }
}
