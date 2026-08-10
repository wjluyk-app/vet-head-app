import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const money = (value: number) =>
  `$${value.toFixed(value % 1 === 0 ? 0 : 2)}`;

export default async function VetHeadPayoutsPage() {
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

  const { data: payouts, error: payoutsError } = await supabase
    .from("prize_payout")
    .select(`
      id,
      import_key,
      competition,
      place,
      recipient_type,
      amount_per_recipient,
      recipients,
      total_payout
    `)
    .eq("tournament_id", tournament.id)
    .order("import_key");

  if (payoutsError) {
    throw new Error(payoutsError.message);
  }

  const total = (payouts ?? []).reduce(
    (sum, payout) => sum + Number(payout.total_payout),
    0,
  );

  const grouped = new Map<
    string,
    NonNullable<typeof payouts>
  >();

  for (const payout of payouts ?? []) {
    const existing = grouped.get(payout.competition) ?? [];
    existing.push(payout);
    grouped.set(payout.competition, existing);
  }

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">VET HEAD 2026</div>
        <h1>Payouts Preview</h1>
        <p>
          What is at stake throughout Vet Head 2026.
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <h3>Total Prize Pool</h3>
          <div className="kpi">{money(total)}</div>
        </article>

        <article className="card">
          <h3>Payout Categories</h3>
          <div className="kpi">{grouped.size}</div>
        </article>
      </section>

      {(payouts ?? []).length === 0 ? (
        <section className="card" style={{ marginTop: 22 }}>
          <h2>Payout structure not loaded yet</h2>
          <p>
            The official payout structure will appear here after the
            completed Vet Head workbook is imported.
          </p>
        </section>
      ) : (
        Array.from(grouped.entries()).map(
          ([competition, competitionPayouts]) => (
            <section
              className="tournamentBoardSection"
              key={competition}
              style={{ marginTop: 22 }}
            >
              <div className="boardSectionHeader">
                <div>
                  <div className="smallLabel">PRIZE MONEY</div>
                  <h2>{competition}</h2>
                </div>
              </div>

              <section className="grid">
                {competitionPayouts.map((payout) => (
                  <article className="card" key={payout.id}>
                    <div className="smallLabel">
                      {payout.place}
                    </div>

                    <div className="kpi">
                      {money(Number(payout.total_payout))}
                    </div>

                    <p>
                      {payout.recipients}{" "}
                      {payout.recipients === 1
                        ? "recipient"
                        : "recipients"}{" "}
                      · {money(Number(payout.amount_per_recipient))} each
                    </p>

                    <p>{payout.recipient_type}</p>
                  </article>
                ))}
              </section>
            </section>
          ),
        )
      )}

      <section className="grid" style={{ marginTop: 22 }}>
        <Link className="card" href="/payout-results">
          <h3>Payout Results</h3>
          <p>See who won each payout from the official scoring results.</p>
        </Link>

        <Link className="card" href="/">
          <h3>Tournament Hub</h3>
          <p>Return to the Vet Head home page.</p>
        </Link>
      </section>
    </main>
  );
}
