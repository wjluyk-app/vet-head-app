import Link from "next/link";
import { getVetHeadPublicTournamentData } from "@/lib/repositories/vet-head-public";
import { calculateCourseHandicap } from "@/lib/vet-head-scoring";

export const dynamic = "force-dynamic";

type CourseTee = {
  course_name: string;
  par: number;
  course_rating: number;
  slope_rating: number;
};

const getCourseTee = (value: unknown): CourseTee | null => {
  if (Array.isArray(value)) {
    return (value[0] as CourseTee | undefined) ?? null;
  }

  if (value && typeof value === "object") {
    return value as CourseTee;
  }

  return null;
};

export default async function VetHeadPlayersPage() {
  const data = await getVetHeadPublicTournamentData();

  const players = [...data.players].sort(
    (a, b) =>
      Number(a.handicap_index ?? 999) -
        Number(b.handicap_index ?? 999) ||
      a.display_name.localeCompare(b.display_name),
  );

  const courseMap = new Map<string, CourseTee>();

  for (const round of data.rounds) {
    const course = getCourseTee(round.course_tee);

    if (course && !courseMap.has(course.course_name)) {
      courseMap.set(course.course_name, course);
    }
  }

  const cedarRiver = courseMap.get("Cedar River");
  const hawksEye = courseMap.get("Hawk's Eye");
  const legend = courseMap.get("The Legend");

  const courseHandicap = (
    handicapIndex: number | null,
    course: CourseTee | undefined,
  ) => {
    if (handicapIndex === null || !course) return null;

    return calculateCourseHandicap(
      Number(handicapIndex),
      Number(course.slope_rating),
      Number(course.course_rating),
      Number(course.par),
    );
  };

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">VET HEAD 2026</div>
        <h1>Players</h1>
        <p>USGA Handicap Index and Course Handicap for each course.</p>
      </section>

      <section
        className="tournamentBoardSection"
        style={{ marginTop: 24 }}
      >
        <div className="boardSectionHeader">
          <div>
            <div className="smallLabel">PLAYERS</div>
            <h2>Handicap Index &amp; Course Handicaps</h2>
            <p>Sorted from lowest USGA Handicap Index to highest.</p>
          </div>
        </div>

        <div className="vetPlayerHandicapList">
          {players.map((player) => {
            const cedar = courseHandicap(
              player.handicap_index,
              cedarRiver,
            );

            const hawk = courseHandicap(
              player.handicap_index,
              hawksEye,
            );

            const legendCh = courseHandicap(
              player.handicap_index,
              legend,
            );

            return (
              <article
                className="vetPlayerHandicapRow"
                key={player.id}
              >
                <div className="vetPlayerHandicapName">
                  <strong>{player.display_name}</strong>
                  <span>
                    USGA Index{" "}
                    <strong>
                      {player.handicap_index ?? "—"}
                    </strong>
                  </span>
                </div>

                <div className="vetPlayerCourseHandicaps">
                  <span>
                    Cedar River CH <strong>{cedar ?? "—"}</strong>
                  </span>

                  <span>
                    Hawk&apos;s Eye CH <strong>{hawk ?? "—"}</strong>
                  </span>

                  <span>
                    The Legend CH <strong>{legendCh ?? "—"}</strong>
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        <p
          style={{
            padding: "12px 20px 18px",
            margin: 0,
            fontSize: 12,
          }}
        >
          CH = Course Handicap
        </p>
      </section>

      <div style={{ marginTop: 24 }}>
        <Link className="button" href="/">
          Tournament Hub
        </Link>
      </div>
    </main>
  );
}
