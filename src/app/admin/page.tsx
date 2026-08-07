import Link from "next/link";
import { requireBillAdmin } from "@/lib/auth/admin";
import { getVetHeadTournamentData } from "@/lib/repositories/vet-head-db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireBillAdmin();

  const data = await getVetHeadTournamentData();

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">VET HEAD 2026</div>
        <h1>Administrator Dashboard</h1>
        <p>
          Tournament setup, scoring access, validation and publishing.
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <h3>Players</h3>
          <div className="kpi">{data.players.length} / 12</div>
          <p>Names and Handicap Indexes.</p>
          <Link className="button" href="/admin/players">
            Manage players
          </Link>
        </article>

        <article className="card">
          <h3>Rounds</h3>
          <div className="kpi">{data.rounds.length} / 5</div>
          <p>Dates, formats, courses and tee times.</p>
          <Link className="button" href="/admin/rounds">
            Manage rounds
          </Link>
        </article>

        <article className="card">
          <h3>Pairings</h3>
          <div className="kpi">{data.groups.length} / 15</div>
          <p>Three groups of four for every round.</p>
          <Link className="button" href="/admin/pairings">
            Manage pairings
          </Link>
        </article>

        <article className="card">
          <h3>Score Entry</h3>
          <p>Enter or correct final gross scores.</p>
          <Link className="button" href="/score">
            Open score entry
          </Link>
        </article>

        <article className="card">
          <h3>Score Entry Users</h3>
          <p>Authorize limited scorekeepers without Admin access.</p>
          <Link className="button" href="/admin/score-entry-users">
            Manage scorekeepers
          </Link>
        </article>

        <article className="card">
          <h3>Results & Publishing</h3>
          <p>Validate standings before results are published.</p>
          <Link className="button" href="/scoreboard">
            Review scoreboard
          </Link>
        </article>
      </section>
    </main>
  );
}
