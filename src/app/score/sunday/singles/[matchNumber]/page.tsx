export const dynamic = "force-dynamic";

import SundaySinglesResultClient from "@/components/SundaySinglesResultClient";
import { getSundayDataFromDatabase } from "@/lib/repositories/sunday-db";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function SundaySinglesMatchPage({
  params,
}: {
  params: Promise<{ matchNumber: string }>;
}) {
  const matchNumber = Number((await params).matchNumber);
  const sunday = await getSundayDataFromDatabase(createAdminClient());
  const match = sunday.singles.find(
    (item) => item.matchNumber === matchNumber,
  );

  if (!match) {
    throw new Error("Sunday singles match was not found.");
  }

  return (
    <>
      <section className="hero">
        <h1>Sunday Singles Match {match.matchNumber}</h1>
        <p>{match.lukePlayer} vs. {match.samPlayer} · Holes 10–18</p>
      </section>

      <SundaySinglesResultClient match={match} />
    </>
  );
}
