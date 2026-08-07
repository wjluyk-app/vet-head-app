import Link from "next/link";
import { requireBillAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateVetHeadPairingGroup } from "./actions";

export const dynamic = "force-dynamic";

type Player = {
  id: string;
  import_key: string | null;
  display_name: string;
  active: boolean;
};

type Assignment = {
  player_id: string;
  player_order: number;
};

type Group = {
  id: string;
  group_number: number;
  name: string | null;
  round_group_player: Assignment[];
};

type Round = {
  id: string;
  round_number: number;
  name: string;
  round_date: string;
  tee_time: string;
  format: string;
  round_group: Group[];
};

export default async function VetHeadPairingsAdminPage() {
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

  const { data: playersData, error: playersError } = await supabase
    .from("player")
    .select("id, import_key, display_name, active")
    .eq("tournament_id", tournament.id)
    .eq("active", true);

  if (playersError) {
    throw new Error(playersError.message);
  }

  const players = ([...(playersData ?? [])] as Player[]).sort((a, b) => {
    const aNumber = Number(
      String(a.import_key ?? "").replace(/^P/i, ""),
    );

    const bNumber = Number(
      String(b.import_key ?? "").replace(/^P/i, ""),
    );

    return aNumber - bNumber;
  });

  const { data: roundsData, error: roundsError } = await supabase
    .from("tournament_round")
    .select(`
      id,
      round_number,
      name,
      round_date,
      tee_time,
      format,
      round_group (
        id,
        group_number,
        name,
        round_group_player (
          player_id,
          player_order
        )
      )
    `)
    .eq("tournament_id", tournament.id)
    .order("round_number");

  if (roundsError) {
    throw new Error(roundsError.message);
  }

  const rounds = (roundsData ?? []) as Round[];

  for (const round of rounds) {
    round.round_group.sort(
      (a, b) => a.group_number - b.group_number,
    );

    for (const group of round.round_group) {
      group.round_group_player.sort(
        (a, b) => a.player_order - b.player_order,
      );
    }
  }

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">VET HEAD ADMIN</div>
        <h1>Pairings</h1>
        <p>
          Set the predetermined three groups of four for every round.
          Vet Head does not generate pairings automatically.
        </p>
      </section>

      {rounds.map((round) => (
        <section
          className="tournamentBoardSection"
          key={round.id}
          style={{ marginTop: 24 }}
        >
          <div className="boardSectionHeader">
            <div>
              <div className="smallLabel">
                ROUND {round.round_number}
              </div>

              <h2>{round.name}</h2>

              <p>
                {round.round_date} ·{" "}
                {String(round.tee_time).slice(0, 5)} ·{" "}
                {round.format === "four_man_scramble"
                  ? "4-Man Scramble"
                  : "Individual Net"}
              </p>
            </div>
          </div>

          <section className="grid">
            {round.round_group.map((group) => (
              <form
                action={updateVetHeadPairingGroup}
                className="card"
                key={group.id}
              >
                <input
                  type="hidden"
                  name="group_id"
                  value={group.id}
                />

                <div className="smallLabel">
                  {round.format === "four_man_scramble"
                    ? `TEAM ${group.group_number}`
                    : `GROUP ${group.group_number}`}
                </div>

                <h3>
                  {group.name ??
                    (round.format === "four_man_scramble"
                      ? `Team ${group.group_number}`
                      : `Group ${group.group_number}`)}
                </h3>

                {[1, 2, 3, 4].map((order) => {
                  const assignment =
                    group.round_group_player.find(
                      (item) => item.player_order === order,
                    );

                  return (
                    <label key={order}>
                      Player {order}
                      <select
                        className="textInput"
                        name={`player_${order}_id`}
                        defaultValue={assignment?.player_id ?? ""}
                        required
                      >
                        <option value="" disabled>
                          Select player
                        </option>

                        {players.map((player) => (
                          <option key={player.id} value={player.id}>
                            {player.import_key ?? ""} —{" "}
                            {player.display_name}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                })}

                <div style={{ marginTop: 16 }}>
                  <button className="button" type="submit">
                    Save Group
                  </button>
                </div>
              </form>
            ))}
          </section>
        </section>
      ))}

      <div style={{ marginTop: 24 }}>
        <Link className="button" href="/admin">
          Back to Admin
        </Link>
      </div>
    </main>
  );
}
