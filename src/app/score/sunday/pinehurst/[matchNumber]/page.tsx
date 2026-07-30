export const dynamic = "force-dynamic";

import SundayPinehurstScorecardClient from "@/components/SundayPinehurstScorecardClient";
import { getSundayDataFromDatabase } from "@/lib/repositories/sunday-db";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function SundayPinehurstMatchPage({
  params,
}: {
  params: Promise<{ matchNumber: string }>;
}) {
  const matchNumber = Number((await params).matchNumber);
  const sunday = await getSundayDataFromDatabase(createAdminClient());
  const match = sunday.pinehurst.find(
    (item) => item.matchNumber === matchNumber,
  );

  if (!match) {
    throw new Error("Sunday Pinehurst match was not found.");
  }

  return (
    <>
      <section className="hero">
        <h1>Sunday Pinehurst Match {match.matchNumber}</h1>
        <p>
          {match.course} · {match.teeTime?.slice(0, 5) ?? "TBD"} · Holes 1–9
        </p>
      </section>

      <SundayPinehurstScorecardClient match={match} />
    </>
  );
}
