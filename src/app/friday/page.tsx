import Link from "next/link";
import { getVetHeadPublicTournamentData } from "@/lib/repositories/vet-head-public";

export const dynamic = "force-dynamic";

export default async function FridayPage() {
  const data = await getVetHeadPublicTournamentData();
  const morning = data.rounds.find((item) => item.round_number === 2);
  const afternoon = data.rounds.find((item) => item.round_number === 3);

  if (!morning || !afternoon) {
    throw new Error("Vet Head Friday rounds were not found.");
  }

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">FRIDAY · ROUNDS 2 & 3</div>
        <h1>Friday</h1>
        <p>Individual Net in the morning · 4-Man Scramble in the afternoon</p>
      </section>

      <section className="grid">
        <article className="card">
          <div className="smallLabel">
            ROUND 2 · {morning.tee_time}
          </div>
          <h2>Friday Morning Individual Net</h2>
          <p>
            Each player posts one final 18-hole gross score. The app
            calculates Course Handicap and final net.
          </p>
          <p>
            Group finish is determined by the combined net scores of
            the four players.
          </p>
        </article>

        <article className="card">
          <div className="smallLabel">
            ROUND 3 · {afternoon.tee_time}
          </div>
          <h2>Friday Afternoon 4-Man Scramble</h2>
          <p>
            One final 18-hole gross team score is entered for each
            four-player team.
          </p>
          <p>
            Team handicap uses 25% / 20% / 15% / 10% of the four
            Course Handicaps, lowest to highest.
          </p>
        </article>

        <article className="card">
          <div className="smallLabel">VET HEAD POINTS · EACH ROUND</div>
          <h2>8 · 6 · 4</h2>
          <p>
            Every player on the 1st-place group receives 8 points,
            2nd receives 6 and 3rd receives 4. Ties split the
            applicable point pools.
          </p>
        </article>
      </section>

      <section className="grid" style={{ marginTop: 24 }}>
        <Link className="card" href="/teams">
          <h3>Friday Pairings</h3>
          <p>Morning groups and afternoon scramble teams.</p>
        </Link>

        <Link className="card" href="/scoreboard">
          <h3>Scoreboard</h3>
          <p>Round results, Vet Head Points and Vet Head MVP standings.</p>
        </Link>

        <Link className="card" href="/prize-money">
          <h3>Payouts</h3>
          <p>Friday individual and scramble prize structure.</p>
        </Link>
      </section>
    </main>
  );
}
