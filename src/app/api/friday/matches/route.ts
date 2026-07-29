import { createAdminClient } from "@/lib/supabase/admin";
import { getFridayMatchesFromDatabase } from "@/lib/repositories/friday-db";
import { getFridayMatchesFromSeed } from "@/lib/repositories/friday";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const matches = await getFridayMatchesFromDatabase(supabase);
    if (matches.length === 6) {
      return Response.json({ source: "supabase", matches });
    }
    throw new Error(`Expected 6 Friday matches; found ${matches.length}`);
  } catch (error) {
    return Response.json({
      source: "2026-workbook-seed-fallback",
      warning: error instanceof Error ? error.message : "Database unavailable",
      matches: getFridayMatchesFromSeed(),
    });
  }
}
