import Link from "next/link";
import { getVetHeadPublicTournamentData } from "@/lib/repositories/vet-head-public";

export const dynamic = "force-dynamic";

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
        <p>August 13, 2026 · 8:00 AM</p>
      </section>

      <section className="grid">
        <article className="card">
          <div className="smallLabel">FORMAT</div>
          <h2>18-Hole Individual Net</h2>
          <p>
            Final gross score is entered for each player. Course
            Handicap is calculated automatically and subtracted to
            determine net score.
          </p>
        </article>

        <article className="card">
          <div className="smallLabel">COURSE</div>
          <h2>{course?.course_name ?? "Course TBD"}</h2>
          <p>
            {course?.tee_name
              ? `${course.tee_name} Tees`
              : "Tournament tees"}
          </p>
          {course ? (
            <p>
              Par {course.par} · Rating {course.course_rating} ·
              Slope {course.slope_rating}
            </p>
          ) : null}
        </article>

        <article className="card">
          <div className="smallLabel">MVP POINTS</div>
          <h2>8 · 6 · 4</h2>
          <p>
            Each four-player group total is the sum of its four net
            scores. Every player in the group receives the group&apos;s
            finish points.
          </p>
        </article>
      </section>

      <section className="grid" style={{ marginTop: 24 }}>
        <Link className="card" href="/teams">
          <div className="smallLabel">ROUND 1</div>
          <h3>View Pairings</h3>
          <p>See all three Thursday groups.</p>
        </Link>

        <Link className="card" href="/scoreboard">
          <div className="smallLabel">RESULTS</div>
          <h3>Scoreboard</h3>
          <p>Round standings and MVP points.</p>
        </Link>

        <Link className="card" href="/prize-money">
          <div className="smallLabel">MONEY</div>
          <h3>Payouts</h3>
          <p>Thursday individual prize structure.</p>
        </Link>
      </section>
    </main>
  );
}
