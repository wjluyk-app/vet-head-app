import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getFridayMatchesFromDatabase } from "@/lib/repositories/friday-db";
import { calculateFridayLiveResults } from "@/lib/friday-results";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionClient = await createClient();
    const { data: auth } = await sessionClient.auth.getUser();
    if (!auth.user) {
      return Response.json({ ok: false, error: "Authentication required" }, { status: 401 });
    }

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
