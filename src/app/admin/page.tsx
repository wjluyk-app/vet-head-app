import Link from "next/link";
import { requireBillAdmin } from "@/lib/auth/admin";
import {
  getVetHeadRoundEntryData,
  getVetHeadTournamentData,
} from "@/lib/repositories/vet-head-db";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireBillAdmin();

  const data = await getVetHeadTournamentData();

  const roundEntryData = await Promise.all(
    data.rounds.map((round) => getVetHeadRoundEntryData(round.id)),
  );

  const individualScoreCount = roundEntryData.reduce(
    (total, round) => total + round.individualScores.length,
    0,
  );

  const scrambleScoreCount = roundEntryData.reduce(
    (total, round) => total + round.scrambleScores.length,
    0,
  );

  const supabase = createAdminClient();

  const { data: payouts, error: payoutsError } = await supabase
    .from("prize_payout")
    .select("total_payout")
    .eq("tournament_id", data.tournament.id);

  if (payoutsError) {
    throw new Error(`Failed to load payout status: ${payoutsError.message}`);
  }

  const payoutRows = payouts ?? [];

  const payoutTotal = payoutRows.reduce(
    (sum, payout) => sum + Number(payout.total_payout),
    0,
  );

  const playersComplete = data.players.length === 12;
  const roundsComplete = data.rounds.length === 5;
  const groupsComplete = data.groups.length === 15;

  const payoutsComplete =
    payoutRows.length === 17 && payoutTotal === 1200;

  const setupComplete =
    playersComplete &&
    roundsComplete &&
    groupsComplete &&
    payoutsComplete;

  const scoresStarted =
    individualScoreCount > 0 || scrambleScoreCount > 0;

  const scoresComplete =
    individualScoreCount === 36 &&
    scrambleScoreCount === 6;

  const tournamentStatus = scoresComplete
    ? "COMPLETE"
    : scoresStarted
      ? "IN PROGRESS"
      : setupComplete
        ? "READY"
        : "SETUP NEEDED";

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">VET HEAD 2026</div>
        <h1>Administrator Dashboard</h1>
        <p>
          Tournament status, setup, score entry and publishing.
        </p>
      </section>

      <section
        className="tournamentBoardSection"
        style={{ marginTop: 24 }}
      >
        <div className="boardSectionHeader">
          <div>
            <div className="smallLabel">TOURNAMENT STATUS</div>
            <h2>{tournamentStatus}</h2>
          </div>

          <Link className="button" href="/score">
            Open Score Entry
          </Link>
        </div>

        <section className="grid">
          <article className="card">
            <div className="smallLabel">PLAYERS</div>
            <div className="kpi">{data.players.length} / 12</div>
            <p>{playersComplete ? "Complete" : "Needs attention"}</p>
          </article>

          <article className="card">
            <div className="smallLabel">ROUNDS</div>
            <div className="kpi">{data.rounds.length} / 5</div>
            <p>{roundsComplete ? "Complete" : "Needs attention"}</p>
          </article>

          <article className="card">
            <div className="smallLabel">PAIRINGS</div>
            <div className="kpi">{data.groups.length} / 15</div>
            <p>{groupsComplete ? "Complete" : "Needs attention"}</p>
          </article>

          <article className="card">
            <div className="smallLabel">INDIVIDUAL SCORES</div>
            <div className="kpi">{individualScoreCount} / 36</div>
            <p>
              {individualScoreCount === 36
                ? "Complete"
                : "Three individual rounds"}
            </p>
          </article>

          <article className="card">
            <div className="smallLabel">SCRAMBLE SCORES</div>
            <div className="kpi">{scrambleScoreCount} / 6</div>
            <p>
              {scrambleScoreCount === 6
                ? "Complete"
                : "Two scramble rounds"}
            </p>
          </article>

          <article className="card">
            <div className="smallLabel">PAYOUTS</div>
            <div className="kpi">
              {payoutRows.length} / 17
            </div>
            <p>
              ${payoutTotal.toFixed(0)} / $1,200
              {" · "}
              {payoutsComplete ? "Reconciled" : "Needs attention"}
            </p>
          </article>
        </section>
      </section>

      <section className="grid" style={{ marginTop: 24 }}>
        <article className="card">
          <h3>Players</h3>
          <p>Names and Handicap Indexes.</p>
          <Link className="button" href="/admin/players">
            Manage players
          </Link>
        </article>

        <article className="card">
          <h3>Courses / Tees</h3>
          <p>Course names, tees, Rating, Slope and Par.</p>
          <Link className="button" href="/admin/courses">
            Manage courses / tees
          </Link>
        </article>

        <article className="card">
          <h3>Rounds</h3>
          <p>Dates, formats, course assignments and tee times.</p>
          <Link className="button" href="/admin/rounds">
            Manage rounds
          </Link>
        </article>

        <article className="card">
          <h3>Pairings</h3>
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
          <h3>Payouts</h3>
          <p>Manage the official $1,200 prize structure.</p>
          <Link className="button" href="/admin/payouts">
            Manage payouts
          </Link>
        </article>

        <article className="card">
          <h3>Results & Publishing</h3>
          <p>Validate standings before results are published.</p>
          <Link className="button" href="/scoreboard">
            Review scoreboard
          </Link>
        </article>

        <article className="card">
          <h3>Import Tournament Workbook</h3>
          <p>
            Upload and validate the Vet Head master workbook before
            importing data.
          </p>
          <Link className="button" href="/admin/import">
            Open workbook import
          </Link>
        </article>
      </section>
    </main>
  );
}
