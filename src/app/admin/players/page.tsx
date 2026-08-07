import Link from "next/link";
import { requireBillAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateVetHeadPlayer } from "./actions";

export const dynamic = "force-dynamic";

export default async function VetHeadPlayersAdminPage() {
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

  const { data: players, error: playersError } = await supabase
    .from("player")
    .select("id, import_key, display_name, handicap_index, active")
    .eq("tournament_id", tournament.id)
    .order("import_key");

  if (playersError) {
    throw new Error(playersError.message);
  }

  const sortedPlayers = [...(players ?? [])].sort((a, b) => {
    const aNumber = Number(String(a.import_key ?? "").replace(/^P/i, ""));
    const bNumber = Number(String(b.import_key ?? "").replace(/^P/i, ""));
    return aNumber - bNumber;
  });

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">VET HEAD ADMIN</div>
        <h1>Players</h1>
        <p>
          Manage player names, Handicap Indexes and active status.
        </p>
      </section>

      <section className="grid">
        {sortedPlayers.map((player) => (
          <form
            action={updateVetHeadPlayer}
            className="card"
            key={player.id}
          >
            <input type="hidden" name="id" value={player.id} />

            <div className="smallLabel">
              {player.import_key ?? "PLAYER"}
            </div>

            <label>
              Player Name
              <input
                className="textInput"
                type="text"
                name="display_name"
                defaultValue={player.display_name}
                required
              />
            </label>

            <label>
              Handicap Index
              <input
                className="textInput"
                type="number"
                name="handicap_index"
                step="0.1"
                defaultValue={player.handicap_index}
                required
              />
            </label>

            <label>
              Active
              <select
                className="textInput"
                name="active"
                defaultValue={player.active ? "true" : "false"}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>

            <div style={{ marginTop: 16 }}>
              <button className="button" type="submit">
                Save Player
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
