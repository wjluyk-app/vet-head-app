export const dynamic = "force-dynamic";
import { requireBillAdmin } from "@/lib/auth/admin";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSaturdayMatchesFromDatabase } from "@/lib/repositories/saturday-db";
import SaturdayScorecardClient from "@/components/SaturdayScorecardClient";

export default async function SaturdayMatchPage({
  params,
}: {
  params: Promise<{ matchNumber: string }>;
}) {
  await requireBillAdmin();
  const matchNumber = Number((await params).matchNumber);
  const matches = await getSaturdayMatchesFromDatabase(createAdminClient());
  const match = matches.find((item) => item.matchNumber === matchNumber);
  if (!match) throw new Error("Saturday match was not found.");

  return (
    <>
      <section className="hero">
        <h1>Saturday Match {match.matchNumber}</h1>
        <p>{match.course} · {match.teeTime?.slice(0, 5) ?? "TBD"}</p>
      </section>
      <SaturdayScorecardClient match={match} />
    </>
  );
}
