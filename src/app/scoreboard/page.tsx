import Link from "next/link";
import { getVetHeadScoreboardData } from "@/lib/repositories/vet-head-scoreboard";

export const dynamic = "force-dynamic";

const ordinal = (place: number | null) => {
  if (place === null) return "Pending";
  if (place === 1) return "1st";
  if (place === 2) return "2nd";
  if (place === 3) return "3rd";
  return `${place}th`;
};

const points = (value: number | null) => {
  if (value === null) return "—";
  return Number.isInteger(value)
    ? `${value} pts`
    : `${value.toFixed(1)} pts`;
};

export default async function ScoreboardPage() {
  const board = await getVetHeadScoreboardData();

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">VET HEAD 2026</div>
        <h1>Scoreboard</h1>
        <p>
          Five-round tournament standings · August 13–15, 2026
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <div className="smallLabel">TOURNAMENT PROGRESS</div>
          <div className="kpi">
            {board.completedRounds} / 5
          </div>
          <p>Rounds complete</p>
        </article>

        <article className="card">
          <div className="smallLabel">VET HEAD POINTS</div>
          <div className="kpi">
            {board.mvp.length > 0
              ? board.mvp[0].playerName
              : "Pending"}
          </div>
          <p>
            {board.mvp.length > 0
              ? `${points(board.mvp[0].totalPoints)}`
              : "No completed rounds yet"}
          </p>
        </article>

        <article className="card">
          <div className="smallLabel">VET HEAD MVP</div>
          <div className="kpi">
            {board.vetHeader.length > 0
              ? board.vetHeader[0].playerName
              : "Pending"}
          </div>
          <p>
            {board.vetHeader.length > 0
              ? `${board.vetHeader[0].totalNet} net`
              : "54-hole individual championship"}
          </p>
        </article>
      </section>

      <section
        className="tournamentBoardSection"
        style={{ marginTop: 24 }}
      >
        <div className="boardSectionHeader">
          <div>
            <div className="smallLabel">OVERALL</div>
            <h2>Vet Head Points Standings</h2>
            <p>
              8 points for 1st · 6 for 2nd · 4 for 3rd in each round
            </p>
            <p>
              Final ties remain tied. Prize money for occupied places is
              pooled and split evenly.
            </p>
          </div>
        </div>

        {board.mvp.length === 0 ? (
      <article className="card">
        <p>
          Vet Head Points standings will begin after the first round is complete.
        </p>
      </article>
    ) : (
      <>
        <div className="card vetWinnersDesktop">
          <table className="vetWinnersTable">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Player</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {board.mvp.map((standing) => (
                <tr key={standing.playerId}>
                  <td>{standing.place}</td>
                  <td><strong>{standing.playerName}</strong></td>
                  <td>{standing.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="vetWinnersMobile">
          {board.mvp.map((standing) => (
            <article className="vetWinnerMobileRow" key={standing.playerId}>
              <div className="vetWinnerPosition">{standing.place}</div>
              <div className="vetWinnerPlayer">
                <strong>{standing.playerName}</strong>
                <span>
                  <b>{standing.totalPoints} pts</b>
                </span>
              </div>
            </article>
          ))}
        </div>
      </>
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
            <p>
              Thursday + Friday AM + Saturday AM individual net
            </p>
            <p>
              Ties remain tied. Prize money for occupied places is pooled
              and split evenly.
            </p>
          </div>
        </div>

        {board.vetHeader.length === 0 ? (
          <article className="card">
            <p>
              Vet Head MVP standings will appear when players have
              completed all three individual rounds.
            </p>
          </article>
        ) : (
          <>
            <div className="card vetWinnersDesktop">
              <table className="vetWinnersTable">
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Player</th>
                    <th>Thu</th>
                    <th>Fri AM</th>
                    <th>Sat AM</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {board.vetHeader.map((standing) => (
                    <tr key={standing.playerId}>
                      <td>{standing.place}</td>
                      <td>
                        <strong>{standing.playerName}</strong>
                      </td>
                      <td>{standing.thursdayNet}</td>
                      <td>{standing.fridayAmNet}</td>
                      <td>{standing.saturdayAmNet}</td>
                      <td>
                        <strong>{standing.totalNet}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="vetWinnersMobile">
              {board.vetHeader.map((standing) => (
                <article
                  className="vetWinnerMobileRow"
                  key={standing.playerId}
                >
                  <div className="vetWinnerPosition">
                    {standing.place}
                  </div>

                  <div className="vetWinnerPlayer">
                    <strong>{standing.playerName}</strong>

                    <span>
                      <b>{standing.totalNet} total</b>
                      {" · "}
                      Thu {standing.thursdayNet}
                      {" · "}
                      Fri {standing.fridayAmNet}
                      {" · "}
                      Sat {standing.saturdayAmNet}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

      </section>

      {board.rounds.map((round) => (
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
                {round.format === "four_man_scramble"
                  ? "4-Man Scramble"
                  : "Individual Net"}{" "}
                · {round.complete ? "Final" : "Pending"}
              </p>
            </div>
          </div>

          <section className="grid">
            {round.groups.map((group) => (
              <article className="card" key={group.id}>
                <div className="smallLabel">
                  {round.format === "four_man_scramble"
                    ? `TEAM ${group.groupNumber}`
                    : `GROUP ${group.groupNumber}`}
                </div>

                <h3></h3>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <strong>{ordinal(group.place)}</strong>
                  <strong>
                    {group.total === null
                      ? "Pending"
                      : `${group.total} net`}
                  </strong>
                </div>

                {group.players.map((player) => (
                  <div
                    key={player.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "7px 0",
                      borderTop: "1px solid rgba(0,0,0,.08)",
                    }}
                  >
                    <span>{player.name}</span>

                    {round.format === "individual_net" ? (
                      <span>
                        {player.net === null
                          ? "—"
                          : `${player.net} net`}
                      </span>
                    ) : null}
                  </div>
                ))}

                {round.format === "four_man_scramble" &&
                group.gross !== null ? (
                  <p>
                    Gross {group.gross} · Team handicap{" "}
                    {group.handicap}
                  </p>
                ) : null}

                <p>
                  Points: {points(group.pointsPerPlayer)}
                </p>
              </article>
            ))}
          </section>
        </section>
      ))}

      <div style={{ marginTop: 24 }}>
        <Link className="button" href="/">
          Tournament Hub
        </Link>
      </div>
    </main>
  );
}
