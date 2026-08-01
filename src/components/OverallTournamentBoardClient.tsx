"use client";

import { useEffect, useState } from "react";
import type { OverallTournamentBoard } from "@/lib/overall-tournament-board";

const points = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

export default function OverallTournamentBoardClient({
  initial,
}: {
  initial: OverallTournamentBoard;
}) {
  const [board, setBoard] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setBusy(true);

    try {
      const response = await fetch("/api/scoreboard", {
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

  const status = board.complete
    ? board.winner === "LUKE"
      ? "TEAM LUKE WINS"
      : board.winner === "SAM"
        ? "TEAM SAM WINS"
        : "FINAL SCORE TIED"
    : `${points(board.totalPointsAwarded)} of ${points(board.maximumPoints)} points awarded`;

  return (
    <>
      <section className="resultsScoreboard">
        <div className="teamTotal lukeTotal">
          <span>TEAM LUKE</span>
          <strong>{points(board.overallLukePoints)}</strong>
        </div>

        <div className="resultsCenter">
          <div>OVERALL SCORE</div>
          <small>{status}</small>
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
          <strong>{points(board.overallSamPoints)}</strong>
        </div>
      </section>

      {error && <div className="errorNotice">{error}</div>}

      <section className="boardKpiGrid boardKpiGridThree">
        <article className="boardKpi">
          <span>FRIDAY</span>
          <strong>
            Luke {points(board.fridayLukePoints)} · Sam{" "}
            {points(board.fridaySamPoints)}
          </strong>
          <small>18 points available</small>
        </article>

        <article className="boardKpi">
          <span>SATURDAY</span>
          <strong>
            Luke {points(board.saturdayLukePoints)} · Sam{" "}
            {points(board.saturdaySamPoints)}
          </strong>
          <small>18 points available</small>
        </article>

        <article className="boardKpi">
          <span>SUNDAY</span>
          <strong>
            Luke {points(board.sundayLukePoints)} · Sam{" "}
            {points(board.sundaySamPoints)}
          </strong>
          <small>18 points available</small>
        </article>
      </section>
    </>
  );
}
