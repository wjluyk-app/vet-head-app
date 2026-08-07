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
          <div className="smallLabel">VET HEAD WINNERS</div>
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
            <h2>Vet Head Winners Standings</h2>
            <p>
              8 points for 1st · 6 for 2nd · 4 for 3rd in each round
            </p>
          </div>
        </div>

        {board.mvp.length === 0 ? (
          <article className="card">
            <p>
              MVP standings will begin after the first round is
              complete.
            </p>
          </article>
        ) : (
          <div className="card" style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 10 }}>
                    Pos
                  </th>
                  <th style={{ textAlign: "left", padding: 10 }}>
                    Player
                  </th>
                  <th style={{ textAlign: "right", padding: 10 }}>
                    Points
                  </th>
                  <th style={{ textAlign: "right", padding: 10 }}>
                    1sts
                  </th>
                  <th style={{ textAlign: "right", padding: 10 }}>
                    2nds
                  </th>
                </tr>
              </thead>

              <tbody>
                {board.mvp.map((standing) => (
                  <tr key={standing.playerId}>
                    <td style={{ padding: 10 }}>
                      {standing.place}
                    </td>
                    <td style={{ padding: 10 }}>
                      <strong>{standing.playerName}</strong>
                    </td>
                    <td
                      style={{
                        padding: 10,
                        textAlign: "right",
                      }}
                    >
                      {standing.totalPoints}
                    </td>
                    <td
                      style={{
                        padding: 10,
                        textAlign: "right",
                      }}
                    >
                      {standing.firstPlaceFinishes}
                    </td>
                    <td
                      style={{
                        padding: 10,
                        textAlign: "right",
                      }}
                    >
                      {standing.secondPlaceFinishes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <div className="card" style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 10 }}>
                    Pos
                  </th>
                  <th style={{ textAlign: "left", padding: 10 }}>
                    Player
                  </th>
                  <th style={{ textAlign: "right", padding: 10 }}>
                    Thu
                  </th>
                  <th style={{ textAlign: "right", padding: 10 }}>
                    Fri AM
                  </th>
                  <th style={{ textAlign: "right", padding: 10 }}>
                    Sat AM
                  </th>
                  <th style={{ textAlign: "right", padding: 10 }}>
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {board.vetHeader.map((standing) => (
                  <tr key={standing.playerId}>
                    <td style={{ padding: 10 }}>
                      {standing.place}
                    </td>
                    <td style={{ padding: 10 }}>
                      <strong>{standing.playerName}</strong>
                    </td>
                    <td
                      style={{
                        padding: 10,
                        textAlign: "right",
                      }}
                    >
                      {standing.thursdayNet}
                    </td>
                    <td
                      style={{
                        padding: 10,
                        textAlign: "right",
                      }}
                    >
                      {standing.fridayAmNet}
                    </td>
                    <td
                      style={{
                        padding: 10,
                        textAlign: "right",
                      }}
                    >
                      {standing.saturdayAmNet}
                    </td>
                    <td
                      style={{
                        padding: 10,
                        textAlign: "right",
                      }}
                    >
                      <strong>{standing.totalNet}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

                <h3>{group.name}</h3>

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
                  MVP Points: {points(group.pointsPerPlayer)}
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
