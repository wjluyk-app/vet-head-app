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

type RecentActivity = {
  id: string;
  sessionName: string;
  oldStatus: string;
  newStatus: string;
  reason: string | null;
  createdAt: string;
};

type AdminStatus = {
  ok: boolean;
  players: number;
  openConflicts: number;
  sessions: SessionStatus[];
  recentActivity: RecentActivity[];
  error?: string;
};

export default function AdminDashboardClient() {
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [updatingSessionId, setUpdatingSessionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function loadStatus() {
    try {
      const response = await fetch("/api/admin/status", {
        cache: "no-store",
      });
      const data = await response.json();
      setStatus(data);
    } catch {
      setStatus({
        ok: false,
        players: 0,
        openConflicts: 0,
        sessions: [],
        recentActivity: [],
        error: "Administrator status could not be loaded.",
      });
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  async function updateSessionStatus(
    sessionId: string,
    nextStatus: string,
  ) {
    setUpdatingSessionId(sessionId);
    setActionError(null);

    try {
      const response = await fetch("/api/admin/session-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          status: nextStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Session status update failed.");
      }

      await loadStatus();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Session status update failed.",
      );
    } finally {
      setUpdatingSessionId(null);
    }
  }

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

      {actionError && (
        <div className="errorNotice">{actionError}</div>
      )}

      {status.recentActivity.length > 0 && (
        <section className="tournamentBoardSection">
          <div className="boardSectionHeader">
            <div>
              <div className="smallLabel">AUDIT LOG</div>
              <h2>Recent Admin Activity</h2>
              <p>Latest session status changes.</p>
            </div>
          </div>

          <div className="card">
            {status.recentActivity.map((entry) => (
              <p key={entry.id}>
                <strong>{entry.sessionName}</strong>:{" "}
                {String(entry.oldStatus).replaceAll('"', "")} →{" "}
                {String(entry.newStatus).replaceAll('"', "")}
                {" · "}
                {new Date(entry.createdAt).toLocaleString()}
              </p>
            ))}
          </div>
        </section>
      )}

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

              <label>
                Session Status
                <select
                  className="textInput"
                  value={session.status}
                  disabled={updatingSessionId === session.id}
                  onChange={(event) =>
                    void updateSessionStatus(
                      session.id,
                      event.target.value,
                    )
                  }
                >
                  <option value="setup">Setup</option>
                  <option value="open">Open</option>
                  <option value="submitted">Submitted</option>
                  <option value="review">Review</option>
                  <option value="locked">Locked</option>
                  <option value="published">Published</option>
                </select>
              </label>

              {updatingSessionId === session.id && (
                <p>Updating status…</p>
              )}
            </article>
          );
        })}
      </section>
    </>
  );
}
