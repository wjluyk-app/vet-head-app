"use client";

import { useEffect, useState } from "react";
import type { SundayTournamentBoard } from "@/lib/sunday-tournament-board";

const points = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

export default function SundayTournamentBoardClient({
  initial,
}: {
  initial: SundayTournamentBoard;
}) {
  const [board, setBoard] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setBusy(true);

    try {
      const response = await fetch("/api/sunday/board", {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Refresh failed");
      }

      setBoard(payload.board);
      setError(null);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Refresh failed",
      );
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const interval = window.setInterval(refresh, 15000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <>
      <section className="resultsScoreboard">
        <div className="teamTotal lukeTotal">
          <span>TEAM LUKE</span>
          <strong>{points(board.sundayLukePoints)}</strong>
        </div>

        <div className="resultsCenter">
          <div>SUNDAY POINTS</div>
          <small>
            {board.completedPinehurstMatches +
              board.completedSinglesMatches}{" "}
            of 18 matches final
          </small>
          <button
            className="refreshButton"
            onClick={refresh}
            disabled={busy}
          >
            {busy ? "Refreshing…" : "Refresh now"}
          </button>
        </div>

        <div className="teamTotal samTotal">
          <span>TEAM SAM</span>
          <strong>{points(board.sundaySamPoints)}</strong>
        </div>
      </section>

      {error && <div className="errorNotice">{error}</div>}

      <section className="boardKpiGrid boardKpiGridThree">
        <article className="boardKpi">
          <span>PINEHURST</span>
          <strong>
            Luke {points(board.pinehurstLukePoints)} · Sam{" "}
            {points(board.pinehurstSamPoints)}
          </strong>
          <small>
            {board.completedPinehurstMatches} of 6 matches final
          </small>
        </article>

        <article className="boardKpi">
          <span>SINGLES</span>
          <strong>
            Luke {points(board.singlesLukePoints)} · Sam{" "}
            {points(board.singlesSamPoints)}
          </strong>
          <small>
            {board.completedSinglesMatches} of 12 matches final
          </small>
        </article>

        <article className="boardKpi">
          <span>SUNDAY TOTAL</span>
          <strong>
            Luke {points(board.sundayLukePoints)} · Sam{" "}
            {points(board.sundaySamPoints)}
          </strong>
          <small>18 total points available</small>
        </article>
      </section>

      <section className="tournamentBoardSection">
        <div className="boardSectionHeader">
          <div>
            <div className="smallLabel">FRONT NINE</div>
            <h2>Pinehurst Matches</h2>
            <p>Six team matches worth one point each.</p>
          </div>
        </div>

        <div className="boardTableWrap">
          <table className="fridayBoardTable">
            <thead>
              <tr>
                <th>Match</th>
                <th>Team Luke</th>
                <th>Team Sam</th>
                <th>Luke Pts</th>
                <th>Sam Pts</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {board.pinehurst.matches.map((match) => (
                <tr key={match.pairingId}>
                  <td className="matchNumberCell">
                    {match.matchNumber}
                  </td>
                  <td className="playersCell">
                    {match.lukePlayers}
                  </td>
                  <td className="playersCell">
                    {match.samPlayers}
                  </td>
                  <td className="pointsCell">
                    {points(match.lukePoints)}
                  </td>
                  <td className="pointsCell">
                    {points(match.samPoints)}
                  </td>
                  <td>
                    {match.status || "Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="tournamentBoardSection">
        <div className="boardSectionHeader">
          <div>
            <div className="smallLabel">BACK NINE</div>
            <h2>Singles Matches</h2>
            <p>Twelve individual matches worth one point each.</p>
          </div>
        </div>

        <div className="boardTableWrap">
          <table className="fridayBoardTable">
            <thead>
              <tr>
                <th>Match</th>
                <th>Team Luke</th>
                <th>Team Sam</th>
                <th>Result</th>
                <th>Luke Pts</th>
                <th>Sam Pts</th>
              </tr>
            </thead>

            <tbody>
              {board.singles.map((match) => (
                <tr key={match.pairingId}>
                  <td className="matchNumberCell">
                    {match.matchNumber}
                  </td>
                  <td className="playersCell">
                    {match.lukePlayer}
                  </td>
                  <td className="playersCell">
                    {match.samPlayer}
                  </td>
                  <td>
                    {match.resultText ??
                      (match.winner === "HALVED"
                        ? "Halved"
                        : match.winner === "LUKE"
                          ? `${match.lukePlayer} won`
                          : match.winner === "SAM"
                            ? `${match.samPlayer} won`
                            : "Pending")}
                  </td>
                  <td className="pointsCell">
                    {points(match.lukePoints)}
                  </td>
                  <td className="pointsCell">
                    {points(match.samPoints)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
