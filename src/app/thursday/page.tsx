import Link from "next/link";
import { getVetHeadPublicTournamentData } from "@/lib/repositories/vet-head-public";

export const dynamic = "force-dynamic";

const formatTime = (value: string) => {
  const [hourText, minuteText] = String(value).slice(0, 5).split(":");
  const hour = Number(hourText);
  return `${hour % 12 || 12}:${minuteText} ${hour >= 12 ? "PM" : "AM"}`;
};

export default async function ThursdayPage() {
  const data = await getVetHeadPublicTournamentData();
  const round = data.rounds.find((item) => item.round_number === 1);

  if (!round) {
    throw new Error("Vet Head Round 1 was not found.");
  }

  const course = Array.isArray(round.course_tee)
    ? round.course_tee[0]
    : round.course_tee;

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">THURSDAY · ROUND 1</div>
        <h1>Individual Net</h1>
        <p>August 13, 2026 · {formatTime(round.tee_time)}</p>
      </section>

      <section className="grid">
        <article className="card">
          <div className="smallLabel">ROUND 1 · {formatTime(round.tee_time)}</div>
          <h2>18-Hole Individual Net</h2>
          <p>
            {course?.course_name ?? "Course TBD"}
            {course?.tee_name ? ` · ${course.tee_name} Tees` : ""}
          </p>
          {course ? (
            <p>
              Par {course.par} · Rating {course.course_rating} · Slope{" "}
              {course.slope_rating}
            </p>
          ) : null}
        </article>
      </section>

      <section className="grid" style={{ marginTop: 24 }}>
        <Link className="card" href="/teams">
          <div className="smallLabel">ROUND 1</div>
          <h3>Pairings</h3>
          <p>See all three Thursday groups.</p>
        </Link>

        <Link className="card" href="/scoreboard">
          <div className="smallLabel">LIVE TOURNAMENT</div>
          <h3>Scoreboard</h3>
          <p>Round results, Vet Head Points and Vet Head MVP.</p>
        </Link>

        <Link className="card" href="/prize-money">
          <div className="smallLabel">PAYOUTS</div>
          <h3>Prize Money</h3>
          <p>Thursday individual payout structure.</p>
        </Link>
      </section>
    </main>
  );
}
