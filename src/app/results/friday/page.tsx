import FridayResultsClient from "@/components/FridayResultsClient";
import { calculateFridayLiveResults } from "@/lib/friday-results";
import { getFridayMatchesFromDatabase } from "@/lib/repositories/friday-db";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function FridayResultsPage() {
  const matches = await getFridayMatchesFromDatabase(createAdminClient());
  const results = calculateFridayLiveResults(matches);

  return (
    <>
      <section className="hero fridayResultsHero">
        <h1>Friday Live Results</h1>
        <p>Mountain Course · 1 Best Ball of 2 · NET team scores</p>
      </section>
      <FridayResultsClient initial={results} />
    </>
  );
}
