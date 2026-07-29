export const dynamic = "force-dynamic";

import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFridayMatchesFromDatabase } from "@/lib/repositories/friday-db";

export default async function FridayMatchesPage() {
  const matches = await getFridayMatchesFromDatabase(createAdminClient());

  return (
    <>
      <section className="hero">
        <h1>Friday Score Entry</h1>
        <p>Mountain Course · 1 Best Ball of 2 · NET team scores</p>
      </section>
      <section className="grid">
        {matches.map((match) => (
          <article className="card" key={match.matchNumber}>
            <h2>Match {match.matchNumber}</h2>
            <p><strong>{match.teeTime?.slice(0, 5) ?? "TBD"}</strong></p>
            <p>{match.luke.player1} / {match.luke.player2}</p>
            <p>vs.</p>
            <p>{match.sam.player1} / {match.sam.player2}</p>
            <Link className="button" href={`/score/friday/${match.matchNumber}`}>
              Enter scores
            </Link>
          </article>
        ))}
      </section>
      <div className="notice">
        All scores on this screen are read from the Supabase tournament database.
      </div>
    </>
  );
}
