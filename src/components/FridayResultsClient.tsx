"use client";

import { useEffect, useState } from "react";
import type { FridayLiveResults } from "@/lib/friday-results";

function formatPoints(points: number): string {
  return Number.isInteger(points) ? String(points) : points.toFixed(1);
}

function formatTime(value: string | null): string {
  if (!value) return "No scores yet";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function FridayResultsClient({ initial }: { initial: FridayLiveResults }) {
  const [results, setResults] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh(): Promise<void> {
    setRefreshing(true);
    try {
      const response = await fetch("/api/friday/results", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.error ?? "Refresh failed");
      setResults(body.results);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const timer = window.setInterval(refresh, 15000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <section className="resultsScoreboard">
        <div className="teamTotal lukeTotal">
          <span>TEAM LUKE</span>
          <strong>{formatPoints(results.lukePoints)}</strong>
        </div>
        <div className="resultsCenter">
          <div>FRIDAY POINTS</div>
          <small>{results.completedMatches} of {results.matches.length} matches complete</small>
          <button className="refreshButton" type="button" onClick={refresh} disabled={refreshing}>
            {refreshing ? "Refreshing…" : "Refresh now"}
          </button>
        </div>
        <div className="teamTotal samTotal">
          <span>TEAM SAM</span>
          <strong>{formatPoints(results.samPoints)}</strong>
        </div>
      </section>

      {error && <div className="errorNotice">{error}</div>}

      <section className="matchResultsGrid">
        {results.matches.map((match) => (
          <article className="card matchResultCard" key={match.pairingId}>
            <div className="matchResultHeader">
              <div>
                <div className="smallLabel">MATCH {match.matchNumber}</div>
                <h2>{match.teeTime?.slice(0, 5) ?? "TBD"}</h2>
              </div>
              <div className={match.complete ? "matchComplete" : "matchPending"}>
                {match.complete ? "FINAL" : `${match.holesComplete}/18`}
              </div>
            </div>

            <div className="playersRow lukePlayers"><strong>Luke</strong><span>{match.lukePlayers}</span></div>
            <div className="playersRow samPlayers"><strong>Sam</strong><span>{match.samPlayers}</span></div>

            <div className="componentTable" role="table" aria-label={`Match ${match.matchNumber} results`}>
              <div className="componentRow componentHeading" role="row">
                <span>Segment</span><span>Luke</span><span>Sam</span><span>Point</span>
              </div>
              {match.components.map((component) => (
                <div className="componentRow" role="row" key={component.component}>
                  <span>{component.label}</span>
                  <span>{component.lukeScore ?? "—"}</span>
                  <span>{component.samScore ?? "—"}</span>
                  <span>
                    {component.winner === "PENDING"
                      ? `${component.holesComplete}/${component.holesRequired}`
                      : component.winner === "HALVED"
                        ? "½–½"
                        : component.winner === "LUKE"
                          ? "Luke"
                          : "Sam"}
                  </span>
                </div>
              ))}
            </div>

            <div className="matchPointLine">
              <strong>Luke {formatPoints(match.lukePoints)}</strong>
              <span>{match.status}</span>
              <strong>Sam {formatPoints(match.samPoints)}</strong>
            </div>
            <div className="lastUpdated">Last score update: {formatTime(match.lastUpdatedAt)}</div>
          </article>
        ))}
      </section>

      <div className="notice">
        Results refresh automatically every 15 seconds. Friday awards one point each for front nine, back nine and overall; ties split the point.
      </div>
    </>
  );
}
