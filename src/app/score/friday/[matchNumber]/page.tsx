export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { getFridayMatchesFromDatabase } from "@/lib/repositories/friday-db";
import FridayScorecardClient from "@/components/FridayScorecardClient";

export default async function FridayMatchPage({
  params,
}: {
  params: Promise<{ matchNumber: string }>;
}) {
  const matchNumber = Number((await params).matchNumber);
  const matches = await getFridayMatchesFromDatabase(createAdminClient());
  const match = matches.find((item) => item.matchNumber === matchNumber);
  if (!match) throw new Error("Friday match was not found.");

  return (
    <>
      <section className="hero">
        <h1>Friday Match {match.matchNumber}</h1>
        <p>{match.course} · {match.teeTime?.slice(0, 5) ?? "TBD"}</p>
      </section>
      <FridayScorecardClient match={match} />
    </>
  );
}
