import Link from "next/link";
import { requireBillAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateVetHeadPayout } from "./actions";

export const dynamic = "force-dynamic";

export default async function VetHeadPayoutsAdminPage() {
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

  const { data: payouts, error: payoutsError } = await supabase
    .from("prize_payout")
    .select(`
      id,
      import_key,
      competition,
      round_id,
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

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">VET HEAD ADMIN</div>
        <h1>Payouts</h1>
        <p>
          Manage the Vet Head prize structure. The full payout pool
          must reconcile to $1,200.
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <h3>Configured Payouts</h3>
          <div className="kpi">{(payouts ?? []).length}</div>
        </article>

        <article className="card">
          <h3>Total Prize Pool</h3>
          <div className="kpi">${total.toFixed(0)}</div>
          <p>{total === 1200 ? "Reconciled" : "Must equal $1,200"}</p>
        </article>
      </section>

      {(payouts ?? []).length === 0 ? (
        <section className="card" style={{ marginTop: 22 }}>
          <h2>No payout rows imported yet</h2>
          <p>
            Complete and import the Vet Head master workbook to load
            the approved $1,200 payout structure.
          </p>

          <Link className="button" href="/admin/import">
            Open Workbook Import
          </Link>
        </section>
      ) : (
        <section className="grid">
          {(payouts ?? []).map((payout) => (
            <form
              action={updateVetHeadPayout}
              className="card"
              key={payout.id}
            >
              <input type="hidden" name="id" value={payout.id} />

              <div className="smallLabel">
                {payout.import_key}
              </div>

              <label>
                Competition
                <input
                  className="textInput"
                  type="text"
                  name="competition"
                  defaultValue={payout.competition}
                  required
                />
              </label>

              <label>
                Place
                <input
                  className="textInput"
                  type="text"
                  name="place"
                  defaultValue={payout.place}
                  required
                />
              </label>

              <label>
                Recipient Type
                <input
                  className="textInput"
                  type="text"
                  name="recipient_type"
                  defaultValue={payout.recipient_type}
                  required
                />
              </label>

              <label>
                Amount Per Recipient
                <input
                  className="textInput"
                  type="number"
                  name="amount_per_recipient"
                  step="0.01"
                  defaultValue={payout.amount_per_recipient}
                  required
                />
              </label>

              <label>
                Recipients
                <input
                  className="textInput"
                  type="number"
                  name="recipients"
                  step="1"
                  min="1"
                  defaultValue={payout.recipients}
                  required
                />
              </label>

              <label>
                Total Payout
                <input
                  className="textInput"
                  type="number"
                  name="total_payout"
                  step="0.01"
                  defaultValue={payout.total_payout}
                  required
                />
              </label>

              <div style={{ marginTop: 16 }}>
                <button className="button" type="submit">
                  Save Payout
                </button>
              </div>
            </form>
          ))}
        </section>
      )}

      <div style={{ marginTop: 22 }}>
        <Link className="button" href="/admin">
          Back to Admin
        </Link>
      </div>
    </main>
  );
}
