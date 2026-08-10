import Link from "next/link";
import { getVetHeadPublicTournamentData } from "@/lib/repositories/vet-head-public";

export const dynamic = "force-dynamic";

export default async function SaturdayPage() {
  const data = await getVetHeadPublicTournamentData();
  const morning = data.rounds.find((item) => item.round_number === 4);
  const afternoon = data.rounds.find((item) => item.round_number === 5);

  if (!morning || !afternoon) {
    throw new Error("Vet Head Saturday rounds were not found.");
  }

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">SATURDAY · ROUNDS 4 & 5</div>
        <h1>Saturday</h1>
        <p>
          Individual Net in the morning · Final 4-Man Scramble in the
          afternoon
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <div className="smallLabel">
            ROUND 4 · {morning.tee_time}
          </div>
          <h2>Saturday Morning Individual Net</h2>
          <p>
            The third and final individual round completes the
            54-hole Vet Head MVP championship.
          </p>
        </article>

        <article className="card">
          <div className="smallLabel">
            ROUND 5 · {afternoon.tee_time}
          </div>
          <h2>Saturday Afternoon 4-Man Scramble</h2>
          <p>
            The fifth and final Vet Head round. Final team net
            determines the last 8 / 6 / 4 Vet Head Points allocation.
          </p>
        </article>

        <article className="card">
          <div className="smallLabel">CHAMPIONSHIPS</div>
          <h2>Vet Head MVP + Vet Head Points</h2>
          <p>
            Saturday morning completes the Vet Head MVP. Saturday
            afternoon completes the five-round Vet Head Points race.
          </p>
        </article>
      </section>

      <section className="grid" style={{ marginTop: 24 }}>
        <Link className="card" href="/teams">
          <h3>Saturday Pairings</h3>
          <p>Morning groups and afternoon scramble teams.</p>
        </Link>

        <Link className="card" href="/scoreboard">
          <h3>Scoreboard</h3>
          <p>Final standings and championship results.</p>
        </Link>

        <Link className="card" href="/final-results">
          <h3>Final Results</h3>
          <p>Vet Head Points and Vet Head MVP champions.</p>
        </Link>
      </section>
    </main>
  );
}
