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

  const morningCourse = Array.isArray(morning.course_tee)
    ? morning.course_tee[0]
    : morning.course_tee;

  const afternoonCourse = Array.isArray(afternoon.course_tee)
    ? afternoon.course_tee[0]
    : afternoon.course_tee;

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">FRIDAY · ROUNDS 2 & 3</div>
        <h1>Friday</h1>
        <p>Individual Net in the morning · 4-Man Scramble in the afternoon</p>
      </section>

      <section className="grid">
        <article className="card">
          <div className="smallLabel">ROUND 2 · {morning.tee_time}</div>
          <h2>Morning Individual Net</h2>
          <p>
            {morningCourse?.course_name ?? "Course TBD"}
            {morningCourse?.tee_name ? ` · ${morningCourse.tee_name} Tees` : ""}
          </p>
        </article>

        <article className="card">
          <div className="smallLabel">ROUND 3 · {afternoon.tee_time}</div>
          <h2>Afternoon 4-Man Scramble</h2>
          <p>
            {afternoonCourse?.course_name ?? "Course TBD"}
            {afternoonCourse?.tee_name
              ? ` · ${afternoonCourse.tee_name} Tees`
              : ""}
          </p>
        </article>
      </section>

      <section className="grid" style={{ marginTop: 24 }}>
        <Link className="card" href="/teams">
          <div className="smallLabel">FRIDAY</div>
          <h3>Pairings</h3>
          <p>Morning groups and afternoon scramble teams.</p>
        </Link>

        <Link className="card" href="/scoreboard">
          <div className="smallLabel">LIVE TOURNAMENT</div>
          <h3>Scoreboard</h3>
          <p>Round results, Vet Head Points and Vet Head MVP.</p>
        </Link>

        <Link className="card" href="/prize-money">
          <div className="smallLabel">PAYOUTS</div>
          <h3>Prize Money</h3>
          <p>Friday individual and scramble payouts.</p>
        </Link>
      </section>
    </main>
  );
}
