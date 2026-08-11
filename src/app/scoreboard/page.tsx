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
                  : "Individual + Best Ball"}{" "}
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
                      : round.format === "individual_net"
                        ? `${group.total} Best Ball`
                        : `${group.total} net`}
                  </strong>
                </div>

                {round.format === "individual_net" ? (
                  <>
                    <p style={{ fontWeight: 700, marginBottom: 8 }}>
                      Best Ball Results · Front 9: 2 Best of 4 · Back 9: 3 Best of 4
                    </p>

                    <details style={{ marginBottom: 14 }}>
                      <summary
                        style={{
                          cursor: "pointer",
                          fontWeight: 700,
                          padding: "8px 0",
                        }}
                      >
                        View Best Ball Scorecard
                      </summary>

                      <div style={{ marginTop: 12 }}>
                        <p
                          style={{
                            margin: "0 0 10px",
                            fontSize: 12,
                          }}
                        >
                          Highlighted net scores are the scores
                          counting toward the group Best Ball.
                        </p>

                        <div className="smallLabel">
                          FRONT 9 · 2 BEST OF 4
                        </div>

                        <div
                          style={{
                            overflowX: "auto",
                            marginTop: 6,
                          }}
                        >
                          <table
                            style={{
                              borderCollapse: "collapse",
                              width: "max-content",
                              minWidth: "100%",
                              fontSize: 13,
                            }}
                          >
                            <thead>
                              <tr>
                                <th
                                  style={{
                                    textAlign: "left",
                                    padding: 6,
                                    position: "sticky",
                                    left: 0,
                                    background: "white",
                                    zIndex: 2,
                                  }}
                                >
                                  Player
                                </th>

                                {Array.from(
                                  { length: 9 },
                                  (_, index) => (
                                    <th
                                      key={index}
                                      style={{
                                        textAlign: "center",
                                        padding: 6,
                                      }}
                                    >
                                      {index + 1}
                                    </th>
                                  ),
                                )}

                                <th style={{ padding: 6 }}>
                                  OUT
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {group.players.map((player) => (
                                <tr key={player.id}>
                                  <td
                                    style={{
                                      padding: 6,
                                      fontWeight: 700,
                                      whiteSpace: "nowrap",
                                      position: "sticky",
                                      left: 0,
                                      background: "white",
                                      zIndex: 1,
                                      borderTop:
                                        "1px solid rgba(0,0,0,.08)",
                                    }}
                                  >
                                    {player.name}
                                  </td>

                                  {player.holes
                                    .slice(0, 9)
                                    .map((hole) => {
                                      const countedPlayerIds =
                                        group.players
                                          .map(
                                            (
                                              candidate,
                                              candidateIndex,
                                            ) => ({
                                              id: candidate.id,
                                              order:
                                                candidateIndex,
                                              net:
                                                candidate.holes[
                                                  hole.holeNumber -
                                                    1
                                                ]?.netScore ??
                                                null,
                                            }),
                                          )
                                          .filter(
                                            (
                                              candidate,
                                            ): candidate is {
                                              id: string;
                                              order: number;
                                              net: number;
                                            } =>
                                              candidate.net !==
                                              null,
                                          )
                                          .sort(
                                            (a, b) =>
                                              a.net - b.net ||
                                              a.order - b.order,
                                          )
                                          .slice(0, 2)
                                          .map(
                                            (candidate) =>
                                              candidate.id,
                                          );

                                      const counted =
                                        countedPlayerIds.includes(
                                          player.id,
                                        );

                                      return (
                                        <td
                                          key={hole.holeNumber}
                                          style={{
                                            padding: 6,
                                            textAlign: "center",
                                            fontWeight: counted
                                              ? 900
                                              : 400,
                                            background: counted
                                              ? "var(--cream)"
                                              : undefined,
                                            borderTop:
                                              "1px solid rgba(0,0,0,.08)",
                                          }}
                                          title={
                                            counted
                                              ? `COUNTING SCORE · Gross ${hole.grossScore} · SI ${hole.strokeIndex}`
                                              : `Gross ${hole.grossScore} · SI ${hole.strokeIndex}`
                                          }
                                        >
                                          {hole.netScore ?? "—"}
                                        </td>
                                      );
                                    })}

                                  <td
                                    style={{
                                      padding: 6,
                                      textAlign: "center",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {player.holes
                                      .slice(0, 9)
                                      .reduce(
                                        (sum, hole) =>
                                          sum +
                                          (hole.netScore ?? 0),
                                        0,
                                      )}
                                  </td>
                                </tr>
                              ))}

                              <tr>
                                <td
                                  style={{
                                    padding: 6,
                                    fontWeight: 800,
                                    whiteSpace: "nowrap",
                                    position: "sticky",
                                    left: 0,
                                    background: "white",
                                    zIndex: 1,
                                    borderTop:
                                      "2px solid rgba(0,0,0,.25)",
                                  }}
                                >
                                  COUNTING
                                </td>

                                {group.countingHoleTotals
                                  .slice(0, 9)
                                  .map((score, index) => (
                                    <td
                                      key={index}
                                      style={{
                                        padding: 6,
                                        textAlign: "center",
                                        fontWeight: 800,
                                        borderTop:
                                          "2px solid rgba(0,0,0,.25)",
                                      }}
                                    >
                                      {score}
                                    </td>
                                  ))}

                                <td
                                  style={{
                                    padding: 6,
                                    textAlign: "center",
                                    fontWeight: 900,
                                    borderTop:
                                      "2px solid rgba(0,0,0,.25)",
                                  }}
                                >
                                  {group.frontNine ?? "—"}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div style={{ marginTop: 18 }}>
                        <div className="smallLabel">
                          BACK 9 · 3 BEST OF 4
                        </div>

                        <div
                          style={{
                            overflowX: "auto",
                            marginTop: 6,
                          }}
                        >
                          <table
                            style={{
                              borderCollapse: "collapse",
                              width: "max-content",
                              minWidth: "100%",
                              fontSize: 13,
                            }}
                          >
                            <thead>
                              <tr>
                                <th
                                  style={{
                                    textAlign: "left",
                                    padding: 6,
                                    position: "sticky",
                                    left: 0,
                                    background: "white",
                                    zIndex: 2,
                                  }}
                                >
                                  Player
                                </th>

                                {Array.from(
                                  { length: 9 },
                                  (_, index) => (
                                    <th
                                      key={index}
                                      style={{
                                        textAlign: "center",
                                        padding: 6,
                                      }}
                                    >
                                      {index + 10}
                                    </th>
                                  ),
                                )}

                                <th style={{ padding: 6 }}>
                                  IN
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {group.players.map((player) => (
                                <tr key={player.id}>
                                  <td
                                    style={{
                                      padding: 6,
                                      fontWeight: 700,
                                      whiteSpace: "nowrap",
                                      position: "sticky",
                                      left: 0,
                                      background: "white",
                                      zIndex: 1,
                                      borderTop:
                                        "1px solid rgba(0,0,0,.08)",
                                    }}
                                  >
                                    {player.name}
                                  </td>

                                  {player.holes
                                    .slice(9)
                                    .map((hole) => {
                                      const countedPlayerIds =
                                        group.players
                                          .map(
                                            (
                                              candidate,
                                              candidateIndex,
                                            ) => ({
                                              id: candidate.id,
                                              order:
                                                candidateIndex,
                                              net:
                                                candidate.holes[
                                                  hole.holeNumber -
                                                    1
                                                ]?.netScore ??
                                                null,
                                            }),
                                          )
                                          .filter(
                                            (
                                              candidate,
                                            ): candidate is {
                                              id: string;
                                              order: number;
                                              net: number;
                                            } =>
                                              candidate.net !==
                                              null,
                                          )
                                          .sort(
                                            (a, b) =>
                                              a.net - b.net ||
                                              a.order - b.order,
                                          )
                                          .slice(0, 3)
                                          .map(
                                            (candidate) =>
                                              candidate.id,
                                          );

                                      const counted =
                                        countedPlayerIds.includes(
                                          player.id,
                                        );

                                      return (
                                        <td
                                          key={hole.holeNumber}
                                          style={{
                                            padding: 6,
                                            textAlign: "center",
                                            fontWeight: counted
                                              ? 900
                                              : 400,
                                            background: counted
                                              ? "var(--cream)"
                                              : undefined,
                                            borderTop:
                                              "1px solid rgba(0,0,0,.08)",
                                          }}
                                          title={
                                            counted
                                              ? `COUNTING SCORE · Gross ${hole.grossScore} · SI ${hole.strokeIndex}`
                                              : `Gross ${hole.grossScore} · SI ${hole.strokeIndex}`
                                          }
                                        >
                                          {hole.netScore ?? "—"}
                                        </td>
                                      );
                                    })}

                                  <td
                                    style={{
                                      padding: 6,
                                      textAlign: "center",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {player.holes
                                      .slice(9)
                                      .reduce(
                                        (sum, hole) =>
                                          sum +
                                          (hole.netScore ?? 0),
                                        0,
                                      )}
                                  </td>
                                </tr>
                              ))}

                              <tr>
                                <td
                                  style={{
                                    padding: 6,
                                    fontWeight: 800,
                                    whiteSpace: "nowrap",
                                    position: "sticky",
                                    left: 0,
                                    background: "white",
                                    zIndex: 1,
                                    borderTop:
                                      "2px solid rgba(0,0,0,.25)",
                                  }}
                                >
                                  COUNTING
                                </td>

                                {group.countingHoleTotals
                                  .slice(9)
                                  .map((score, index) => (
                                    <td
                                      key={index}
                                      style={{
                                        padding: 6,
                                        textAlign: "center",
                                        fontWeight: 800,
                                        borderTop:
                                          "2px solid rgba(0,0,0,.25)",
                                      }}
                                    >
                                      {score}
                                    </td>
                                  ))}

                                <td
                                  style={{
                                    padding: 6,
                                    textAlign: "center",
                                    fontWeight: 900,
                                    borderTop:
                                      "2px solid rgba(0,0,0,.25)",
                                  }}
                                >
                                  {group.backNine ?? "—"}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: 18,
                          padding: 12,
                          borderTop:
                            "2px solid rgba(0,0,0,.18)",
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          alignItems: "center",
                          fontWeight: 900,
                        }}
                      >
                        <span>BEST BALL TOTAL</span>
                        <span>
                          {group.total ?? "—"}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          padding: "8px 12px 0",
                          fontWeight: 800,
                        }}
                      >
                        <span>
                          {ordinal(group.place)}
                        </span>
                        <span>
                          {points(group.pointsPerPlayer)} pts
                        </span>
                      </div>
                    </details>

                    <div
                      style={{
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      Individual Results · Daily Low Net + Vet Head MVP
                    </div>
                  </>
                ) : null}

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
