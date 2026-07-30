export const dynamic = "force-dynamic";

import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSaturdayMatchesFromDatabase } from "@/lib/repositories/saturday-db";

export default async function SaturdayMatchesPage() {
  const matches = await getSaturdayMatchesFromDatabase(createAdminClient());

  return (
    <>
      <section className="hero">
        <h1>Saturday Score Entry</h1>
        <p>Betsie Valley · Two-Man Scramble · NET team scores</p>
      </section>
      <section className="grid">
        {matches.map((match) => (
          <article className="card" key={match.matchNumber}>
            <h2>Match {match.matchNumber}</h2>
            <p><strong>{match.teeTime?.slice(0, 5) ?? "TBD"}</strong></p>
            <p>{match.luke.player1} / {match.luke.player2}</p>
            <p>vs.</p>
            <p>{match.sam.player1} / {match.sam.player2}</p>
            <Link className="button" href={`/score/saturday/${match.matchNumber}`}>
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
