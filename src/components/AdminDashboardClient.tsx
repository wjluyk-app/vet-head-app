"use client";

import { useEffect, useState } from "react";

type SessionStatus = {
  id: string;
  name: string;
  status: string;
  pairings: number;
  scorecards: number;
  holeScores: number;
  expectedScores: number;
  results: number;
  expectedResults: number;
};

type AdminStatus = {
  ok: boolean;
  players: number;
  openConflicts: number;
  sessions: SessionStatus[];
  error?: string;
};

export default function AdminDashboardClient() {
  const [status, setStatus] = useState<AdminStatus | null>(null);

  useEffect(() => {
    fetch("/api/admin/status", { cache: "no-store" })
      .then((response) => response.json())
      .then(setStatus)
      .catch(() =>
        setStatus({
          ok: false,
          players: 0,
          openConflicts: 0,
          sessions: [],
          error: "Administrator status could not be loaded.",
        }),
      );
  }, []);

  if (!status) {
    return <div className="notice">Loading tournament status…</div>;
  }

  if (!status.ok) {
    return (
      <div className="errorNotice">
        {status.error ?? "Administrator status unavailable."}
      </div>
    );
  }

  return (
    <>
      <section className="grid">
        <article className="card">
          <h3>Players Imported</h3>
          <div className="kpi">{status.players} / 24</div>
        </article>

        <article className="card">
          <h3>Open Score Conflicts</h3>
          <div className="kpi">{status.openConflicts}</div>
        </article>
      </section>

      <section className="grid">
        {status.sessions.map((session) => {
          const scoreProgress =
            session.expectedScores > 0
              ? `${session.holeScores} / ${session.expectedScores}`
              : `${session.results} / ${session.expectedResults}`;

          return (
            <article className="card" key={session.id}>
              <span className="smallLabel">
                {session.status.toUpperCase()}
              </span>
              <h2>{session.name}</h2>
              <p>Pairings: {session.pairings}</p>
              <p>Scorecards: {session.scorecards}</p>
              <div className="kpi">{scoreProgress}</div>
              <p>
                {session.expectedScores > 0
                  ? "Hole scores entered"
                  : "Match results entered"}
              </p>
            </article>
          );
        })}
      </section>
    </>
  );
}
