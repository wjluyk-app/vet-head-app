import Link from "next/link";
import { getVetHeadScoreboardData } from "@/lib/repositories/vet-head-scoreboard";

export const dynamic = "force-dynamic";

const points = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

export default async function FinalResultsPage() {
  const board = await getVetHeadScoreboardData();
  const tournamentComplete = board.completedRounds === 5;

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">VET HEAD 2026</div>
        <h1>Final Results</h1>
        <p>
          {tournamentComplete
            ? "The five-round tournament is complete."
            : `${board.completedRounds} of 5 rounds complete. Final results are still pending.`}
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <div className="smallLabel">VET HEAD WINNERS</div>
          <div className="kpi">
            {tournamentComplete && board.mvp.length
              ? board.mvp[0].playerName
              : "Pending"}
          </div>
          <p>
            {tournamentComplete && board.mvp.length
              ? `${points(board.mvp[0].totalPoints)} points`
              : "Determined after all five rounds"}
          </p>
        </article>

        <article className="card">
          <div className="smallLabel">VET HEAD MVP</div>
          <div className="kpi">
            {board.vetHeader.length
              ? board.vetHeader[0].playerName
              : "Pending"}
          </div>
          <p>
            {board.vetHeader.length
              ? `${board.vetHeader[0].totalNet} net · 54 holes`
              : "Determined after all three individual rounds"}
          </p>
        </article>

        <article className="card">
          <div className="smallLabel">ROUNDS COMPLETE</div>
          <div className="kpi">{board.completedRounds} / 5</div>
          <p>
            Results become permanent when the tournament is complete.
          </p>
        </article>
      </section>

      <section
        className="tournamentBoardSection"
        style={{ marginTop: 24 }}
      >
        <div className="boardSectionHeader">
          <div>
            <div className="smallLabel">MVP</div>
            <h2>Vet Head Winners Standings</h2>
          </div>
        </div>

        {board.mvp.length === 0 ? (
          <article className="card">
            <p>No completed rounds yet.</p>
          </article>
        ) : (
          <section className="grid">
            {board.mvp.map((standing) => (
              <article className="card" key={standing.playerId}>
                <div className="smallLabel">
                  PLACE {standing.place}
                </div>
                <h3>{standing.playerName}</h3>
                <div className="kpi">
                  {points(standing.totalPoints)}
                </div>
                <p>
                  {standing.firstPlaceFinishes} first-place finishes ·{" "}
                  {standing.secondPlaceFinishes} second-place finishes
                </p>
              </article>
            ))}
          </section>
        )}
      </section>

      <section
        className="tournamentBoardSection"
        style={{ marginTop: 24 }}
      >
        <div className="boardSectionHeader">
          <div>
            <div className="smallLabel">54-HOLE INDIVIDUAL</div>
            <h2>Vet Head MVP Standings</h2>
          </div>
        </div>

        {board.vetHeader.length === 0 ? (
          <article className="card">
            <p>
              Standings will appear after all three individual rounds
              are complete for each player.
            </p>
          </article>
        ) : (
          <section className="grid">
            {board.vetHeader.map((standing) => (
              <article className="card" key={standing.playerId}>
                <div className="smallLabel">
                  PLACE {standing.place}
                </div>
                <h3>{standing.playerName}</h3>
                <div className="kpi">{standing.totalNet}</div>
                <p>
                  Thu {standing.thursdayNet} · Fri{" "}
                  {standing.fridayAmNet} · Sat{" "}
                  {standing.saturdayAmNet}
                </p>
              </article>
            ))}
          </section>
        )}
      </section>

      <section
        className="tournamentBoardSection"
        style={{ marginTop: 24 }}
      >
        <div className="boardSectionHeader">
          <div>
            <div className="smallLabel">ROUND RESULTS</div>
            <h2>Five-Round Record</h2>
          </div>
        </div>

        <section className="grid">
          {board.rounds.map((round) => {
            const winner = round.groups.find(
              (group) => group.place === 1,
            );

            return (
              <article className="card" key={round.id}>
                <div className="smallLabel">
                  ROUND {round.round_number}
                </div>
                <h3>{round.name}</h3>
                <p>
                  {round.complete && winner
                    ? `${winner.name} · ${winner.total} net`
                    : "Pending"}
                </p>
              </article>
            );
          })}
        </section>
      </section>

      <section className="grid" style={{ marginTop: 24 }}>
        <Link className="card" href="/scoreboard">
          <h3>Scoreboard</h3>
          <p>Full round-by-round standings.</p>
        </Link>

        <Link className="card" href="/payout-results">
          <h3>Payout Results</h3>
          <p>See the prize money awarded from the final scoring results.</p>
        </Link>
      </section>
    </main>
  );
}
