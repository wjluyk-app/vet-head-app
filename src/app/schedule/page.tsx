import Link from "next/link";
import { getVetHeadPublicTournamentData } from "@/lib/repositories/vet-head-public";

export const dynamic = "force-dynamic";

const formatTime = (value: string) => {
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";

  return `${hour % 12 || 12}:${minuteText} ${suffix}`;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));

export default async function VetHeadSchedulePage() {
  const data = await getVetHeadPublicTournamentData();

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">VET HEAD 2026</div>
        <h1>Schedule</h1>
        <p>
          Five rounds over three days · August 13–15, 2026
        </p>
      </section>

      <section className="grid">
        {data.rounds.map((round) => {
          const course = Array.isArray(round.course_tee)
            ? round.course_tee[0]
            : round.course_tee;

          return (
            <article className="card" key={round.id}>
              <div className="smallLabel">
                ROUND {round.round_number}
              </div>

              <h2>{round.name}</h2>

              <div className="kpi">
                {formatTime(String(round.tee_time).slice(0, 5))}
              </div>

              <p>
                <strong>{formatDate(round.round_date)}</strong>
              </p>

              <p>
                {round.format === "four_man_scramble"
                  ? "4-Man Scramble"
                  : "Individual + Best Ball"}
              </p>

              <p>
                {course?.course_name ?? "Course TBD"}
                {course?.tee_name
                  ? ` · ${course.tee_name} Tees`
                  : ""}
              </p>

              {course ? (
                <p>
                  Par {course.par} · Rating {course.course_rating} ·
                  Slope {course.slope_rating}
                </p>
              ) : null}

              <Link className="button" href="/teams">
                View Pairings
              </Link>
            </article>
          );
        })}
      </section>

      <section
        className="card"
        style={{ marginTop: 24 }}
      >
        <div className="smallLabel">TOURNAMENT WEEKEND</div>
        <h2>
          {data.tournament.name} {data.tournament.year}
        </h2>
        <p>Thursday, August 13 through Saturday, August 15, 2026</p>
      </section>

      <div style={{ marginTop: 24 }}>
        <Link className="button" href="/">
          Tournament Hub
        </Link>
      </div>
    </main>
  );
}
