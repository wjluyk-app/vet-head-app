export const dynamic = "force-dynamic";
import { requireBillAdmin } from "@/lib/auth/admin";

import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSundayDataFromDatabase } from "@/lib/repositories/sunday-db";

export default async function SundayScoreEntryPage() {
  await requireBillAdmin();
  const sunday = await getSundayDataFromDatabase(createAdminClient());

  return (
    <>
      <section className="hero">
        <h1>Sunday Score Entry</h1>
        <p>Mountain Course · Pinehurst Front Nine · Singles Back Nine</p>
      </section>

      <section className="tournamentBoardSection">
        <div className="boardSectionHeader">
          <div>
            <div className="smallLabel">FRONT NINE</div>
            <h2>Pinehurst Score Entry</h2>
            <p>Enter each team’s NET score for Holes 1–9.</p>
          </div>
        </div>

        <section className="grid">
          {sunday.pinehurst.map((match) => (
            <article className="card" key={match.matchNumber}>
              <h2>Match {match.matchNumber}</h2>
              <p><strong>{match.teeTime?.slice(0, 5) ?? "TBD"}</strong></p>
              <p>{match.luke.player1} / {match.luke.player2}</p>
              <p>vs.</p>
              <p>{match.sam.player1} / {match.sam.player2}</p>
              <Link
                className="button"
                href={`/score/sunday/pinehurst/${match.matchNumber}`}
              >
                Enter Pinehurst scores
              </Link>
            </article>
          ))}
        </section>
      </section>

      <section className="tournamentBoardSection">
        <div className="boardSectionHeader">
          <div>
            <div className="smallLabel">BACK NINE</div>
            <h2>Singles Result Entry</h2>
            <p>Select the winner or record a halved match.</p>
          </div>
        </div>

        <section className="grid">
          {sunday.singles.map((match) => (
            <article className="card" key={match.matchNumber}>
              <h2>Singles Match {match.matchNumber}</h2>
              <p>{match.lukePlayer}</p>
              <p>vs.</p>
              <p>{match.samPlayer}</p>
              <Link
                className="button"
                href={`/score/sunday/singles/${match.matchNumber}`}
              >
                Enter singles result
              </Link>
            </article>
          ))}
        </section>
      </section>
    </>
  );
}
