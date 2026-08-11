import Link from "next/link";
import { requireBillAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import RoundPairingEditor from "./RoundPairingEditor";

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
  group_tee_time: string | null;
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

export default async function VetHeadPairingsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
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

  const { data: playersData, error: playersError } = await supabase
    .from("player")
    .select("id, import_key, display_name, active")
    .eq("tournament_id", tournament.id)
    .eq("active", true);

  if (playersError) {
    throw new Error(playersError.message);
  }

  const players = ([...(playersData ?? [])] as Player[]).sort(
    (a, b) => {
      const aNumber = Number(
        String(a.import_key ?? "").replace(/^P/i, ""),
      );

      const bNumber = Number(
        String(b.import_key ?? "").replace(/^P/i, ""),
      );

      return aNumber - bNumber;
    },
  );

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
        group_tee_time,
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

  const savedRound = query.saved
    ? rounds.find((round) => round.id === query.saved)
    : null;

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">VET HEAD ADMIN</div>
        <h1>Pairings</h1>
        <p>
          Set all 12 players for each round. Every player must appear
          exactly once.
        </p>
      </section>

      {savedRound && (
        <article
          className="card"
          style={{ marginTop: 24 }}
        >
          <div className="smallLabel">PAIRINGS SAVED</div>
          <h2>{savedRound.name}</h2>
          <p>
            All 12 player assignments were saved successfully.
          </p>

          <Link className="button" href="/teams">
            View Public Pairings
          </Link>
        </article>
      )}

      {rounds.map((round) => (
        <RoundPairingEditor
          key={round.id}
          round={round}
          players={players}
        />
      ))}

      <div style={{ marginTop: 24 }}>
        <Link className="button" href="/admin">
          Back to Admin
        </Link>
      </div>
    </main>
  );
}
