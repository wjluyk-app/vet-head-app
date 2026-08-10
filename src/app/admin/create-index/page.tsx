import Link from "next/link";
import { requireBillAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { saveTournamentIndexAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function CreateTournamentIndexPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    index?: string;
  }>;
}) {
  await requireBillAdmin();

  const query = await searchParams;

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

  const { data: players, error: playersError } = await supabase
    .from("player")
    .select("id, display_name, handicap_index, active")
    .eq("tournament_id", tournament.id)
    .eq("active", true)
    .order("display_name");

  if (playersError) {
    throw new Error(playersError.message);
  }

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">VET HEAD ADMIN</div>
        <h1>Create Tournament Index</h1>
        <p>
          Estimate a tournament index from a player&apos;s normal score
          and the tees they normally play.
        </p>
      </section>

      {query.saved === "1" && query.index ? (
        <section
          className="card"
          style={{ marginTop: 24 }}
        >
          <div className="smallLabel">SAVED</div>
          <h2>Tournament Index {query.index}</h2>
          <p>
            The player&apos;s Handicap Index field has been updated for
            tournament calculations.
          </p>
        </section>
      ) : null}

      <section
        className="tournamentBoardSection"
        style={{ marginTop: 24 }}
      >
        <div className="boardSectionHeader">
          <div>
            <div className="smallLabel">ESTIMATE INDEX</div>
            <h2>Player + Normal Score + Tees</h2>
            <p>
              Enter the published Course Rating, Slope and Par for the
              tees the player normally uses.
            </p>
          </div>
        </div>

        <form
          action={saveTournamentIndexAction}
          className="card"
          style={{ margin: 20 }}
        >
          <label>
            Player
            <select
              className="textInput"
              name="playerId"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select player
              </option>

              {(players ?? []).map((player) => (
                <option
                  key={player.id}
                  value={player.id}
                >
                  {player.display_name}
                  {player.handicap_index === null
                    ? " · No Index"
                    : ` · Current ${player.handicap_index}`}
                </option>
              ))}
            </select>
          </label>

          <label>
            Average Score
            <input
              className="textInput"
              type="number"
              name="averageScore"
              min="50"
              max="180"
              step="0.1"
              placeholder="Example: 92"
              required
            />
          </label>

          <label>
            Course
            <input
              className="textInput"
              type="text"
              name="courseName"
              placeholder="Example: Water's Edge Golf Club"
            />
          </label>

          <label>
            Tees
            <input
              className="textInput"
              type="text"
              name="teeName"
              placeholder="Example: Gold"
            />
          </label>

          <section className="grid" style={{ marginTop: 12 }}>
            <label>
              Course Rating
              <input
                className="textInput"
                type="number"
                name="courseRating"
                min="50"
                max="90"
                step="0.1"
                placeholder="70.5"
                required
              />
            </label>

            <label>
              Slope Rating
              <input
                className="textInput"
                type="number"
                name="slopeRating"
                min="55"
                max="155"
                step="1"
                placeholder="128"
                required
              />
            </label>

            <label>
              Par
              <input
                className="textInput"
                type="number"
                name="par"
                min="54"
                max="80"
                step="1"
                placeholder="71"
                required
              />
            </label>
          </section>

          <div style={{ marginTop: 20 }}>
            <button
              className="button"
              type="submit"
            >
              Calculate & Save Tournament Index
            </button>
          </div>

          <p style={{ marginTop: 16 }}>
            Tournament estimate only. This is not an official USGA
            Handicap Index.
          </p>
        </form>
      </section>

      <div style={{ marginTop: 22 }}>
        <Link className="button" href="/admin">
          Back to Admin
        </Link>
      </div>
    </main>
  );
}
