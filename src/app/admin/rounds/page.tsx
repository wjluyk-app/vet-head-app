import Link from "next/link";
import { requireBillAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateVetHeadRound } from "./actions";

export const dynamic = "force-dynamic";

export default async function VetHeadRoundsAdminPage() {
  await requireBillAdmin();

  const supabase = createAdminClient();

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournament")
    .select("id")
    .eq("name", "VET HEAD")
    .eq("year", 2026)
    .single();

  if (tournamentError || !tournament) {
    throw new Error(
      tournamentError?.message ?? "Vet Head tournament not found.",
    );
  }

  const { data: rounds, error: roundsError } = await supabase
    .from("tournament_round")
    .select(
      "id, round_number, name, round_date, tee_time, format, course_tee_id",
    )
    .eq("tournament_id", tournament.id)
    .order("round_number");

  if (roundsError) {
    throw new Error(roundsError.message);
  }

  const { data: courses, error: coursesError } = await supabase
    .from("course_tee")
    .select("id, import_key, course_name, tee_name")
    .eq("tournament_id", tournament.id);

  if (coursesError) {
    throw new Error(coursesError.message);
  }

  const sortedCourses = [...(courses ?? [])].sort((a, b) => {
    const aNumber = Number(
      String(a.import_key ?? "").replace(/^CT/i, ""),
    );
    const bNumber = Number(
      String(b.import_key ?? "").replace(/^CT/i, ""),
    );
    return aNumber - bNumber;
  });

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">VET HEAD ADMIN</div>
        <h1>Rounds</h1>
        <p>
          Manage round names, dates, tee times, formats and course / tee
          assignments.
        </p>
      </section>

      <section className="grid">
        {(rounds ?? []).map((round) => (
          <form
            action={updateVetHeadRound}
            className="card"
            key={round.id}
          >
            <input type="hidden" name="id" value={round.id} />

            <div className="smallLabel">
              ROUND {round.round_number}
            </div>

            <label>
              Round Name
              <input
                className="textInput"
                type="text"
                name="name"
                defaultValue={round.name}
                required
              />
            </label>

            <label>
              Date
              <input
                className="textInput"
                type="date"
                name="round_date"
                defaultValue={round.round_date}
                required
              />
            </label>

            <label>
              Tee Time
              <input
                className="textInput"
                type="time"
                name="tee_time"
                defaultValue={String(round.tee_time).slice(0, 5)}
                required
              />
            </label>

            <label>
              Format
              <select
                className="textInput"
                name="format"
                defaultValue={round.format}
              >
                <option value="individual_net">
                  Individual Net
                </option>
                <option value="four_man_scramble">
                  4-Man Scramble
                </option>
              </select>
            </label>

            <label>
              Course / Tee
              <select
                className="textInput"
                name="course_tee_id"
                defaultValue={round.course_tee_id}
                required
              >
                {sortedCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.import_key ?? ""} — {course.course_name} /{" "}
                    {course.tee_name}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ marginTop: 16 }}>
              <button className="button" type="submit">
                Save Round
              </button>
            </div>
          </form>
        ))}
      </section>

      <div style={{ marginTop: 22 }}>
        <Link className="button" href="/admin">
          Back to Admin
        </Link>
      </div>
    </main>
  );
}
