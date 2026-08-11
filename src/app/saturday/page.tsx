import Link from "next/link";
import { getVetHeadPublicTournamentData } from "@/lib/repositories/vet-head-public";

export const dynamic = "force-dynamic";

const formatTime = (value: string) => {
  const [hourText, minuteText] = String(value).slice(0, 5).split(":");
  const hour = Number(hourText);
  return `${hour % 12 || 12}:${minuteText} ${hour >= 12 ? "PM" : "AM"}`;
};

export default async function SaturdayPage() {
  const data = await getVetHeadPublicTournamentData();
  const morning = data.rounds.find((item) => item.round_number === 4);
  const afternoon = data.rounds.find((item) => item.round_number === 5);

  if (!morning || !afternoon) {
    throw new Error("Vet Head Saturday rounds were not found.");
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
        <div className="smallLabel">SATURDAY · ROUNDS 4 & 5</div>
        <h1>Saturday</h1>
        <p>Individual + Best Ball in the morning · Final 4-Man Scramble in the afternoon</p>
      </section>

      <section className="grid">
        <article className="card">
          <div className="smallLabel">ROUND 4 · {formatTime(morning.tee_time)}</div>
          <h2>Morning Individual + Best Ball</h2>
          <p>
            {morningCourse?.course_name ?? "Course TBD"}
            {morningCourse?.tee_name ? ` · ${morningCourse.tee_name} Tees` : ""}
          </p>
          <p>Final round of the 54-hole Vet Head MVP championship.</p>
        </article>

        <article className="card">
          <div className="smallLabel">ROUND 5 · {formatTime(afternoon.tee_time)}</div>
          <h2>Afternoon 4-Man Scramble</h2>
          <p>
            {afternoonCourse?.course_name ?? "Course TBD"}
            {afternoonCourse?.tee_name
              ? ` · ${afternoonCourse.tee_name} Tees`
              : ""}
          </p>
          <p>Final round of the five-round Vet Head Points competition.</p>
        </article>
      </section>

      <section className="grid" style={{ marginTop: 24 }}>
        <Link className="card" href="/teams">
          <div className="smallLabel">SATURDAY</div>
          <h3>Pairings</h3>
          <p>Morning groups and afternoon scramble teams.</p>
        </Link>

        <Link className="card" href="/scoreboard">
          <div className="smallLabel">LIVE TOURNAMENT</div>
          <h3>Scoreboard</h3>
          <p>Round results and championship standings.</p>
        </Link>

        <Link className="card" href="/final-results">
          <div className="smallLabel">TOURNAMENT COMPLETE</div>
          <h3>Final Results</h3>
          <p>Vet Head Points and Vet Head MVP champions.</p>
        </Link>
      </section>
    </main>
  );
}
