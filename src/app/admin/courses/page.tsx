import Link from "next/link";
import { requireBillAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateVetHeadCourse } from "./actions";

export const dynamic = "force-dynamic";

export default async function VetHeadCoursesAdminPage() {
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

  const { data: courses, error: coursesError } = await supabase
    .from("course_tee")
    .select(
      "id, import_key, course_name, tee_name, course_rating, slope_rating, par",
    )
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
        <h1>Courses / Tees</h1>
        <p>
          Manage course names, tees, Course Rating, Slope and Par for
          each tournament round.
        </p>
      </section>

      <section className="grid">
        {sortedCourses.map((course) => (
          <form
            action={updateVetHeadCourse}
            className="card"
            key={course.id}
          >
            <input type="hidden" name="id" value={course.id} />

            <div className="smallLabel">
              {course.import_key ?? "COURSE"}
            </div>

            <label>
              Course Name
              <input
                className="textInput"
                type="text"
                name="course_name"
                defaultValue={course.course_name}
                required
              />
            </label>

            <label>
              Tee Name
              <input
                className="textInput"
                type="text"
                name="tee_name"
                defaultValue={course.tee_name}
                required
              />
            </label>

            <label>
              Course Rating
              <input
                className="textInput"
                type="number"
                name="course_rating"
                step="0.1"
                defaultValue={course.course_rating}
                required
              />
            </label>

            <label>
              Slope
              <input
                className="textInput"
                type="number"
                name="slope_rating"
                step="1"
                defaultValue={course.slope_rating}
                required
              />
            </label>

            <label>
              Par
              <input
                className="textInput"
                type="number"
                name="par"
                step="1"
                defaultValue={course.par}
                required
              />
            </label>

            <div style={{ marginTop: 16 }}>
              <button className="button" type="submit">
                Save Course / Tee
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
