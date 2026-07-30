"use client";

import { useEffect, useMemo, useState } from "react";
import type { LiveFridayMatch } from "@/lib/live-types";
import {
  getLocalSundayScore,
  getPendingSundayScores,
  saveLocalSundayScore,
  syncPendingSundayScores,
} from "@/lib/local-sunday-score-store";

export default function SundayPinehurstScorecardClient({ match }: { match: LiveFridayMatch }) {
  const [hole, setHole] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState<"L. Swardo" | "S. Swardo">("L. Swardo");
  const [score, setScore] = useState<number | null>(null);
  const [message, setMessage] = useState("Ready");
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);

  const card = selectedTeam === "L. Swardo" ? match.luke : match.sam;

  function refreshPending(): void {
    setPending(getPendingSundayScores().filter((item) => item.syncStatus !== "synced").length);
  }

  useEffect(() => {
    setOnline(true);
    refreshPending();
    const onOnline = async () => {
      setOnline(true);
      setMessage("Connection restored; syncing…");
      const result = await syncPendingSundayScores();
      refreshPending();
      setMessage(result.conflicts ? "Sync conflict requires administrator review" : "Pending scores synchronized");
    };
    const onOffline = () => setOnline(false);
    const onQueue = () => refreshPending();
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("cubby-score-queue-changed", onQueue);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("cubby-score-queue-changed", onQueue);
    };
  }, []);

  useEffect(() => {
    const local = getLocalSundayScore(card.id, hole);
    const server = card.scores[hole - 1];
    setScore(local?.netScore ?? server?.netScore ?? null);
  }, [card, hole]);

  const players = useMemo(() => `${card.player1} / ${card.player2}`, [card]);

  async function save(): Promise<void> {
    if (score === null) return;
    const server = card.scores[hole - 1];
    saveLocalSundayScore({
      scorecardId: card.id,
      matchNumber: match.matchNumber,
      teamShortName: selectedTeam,
      holeNumber: hole,
      netScore: score,
      expectedVersion: server?.version,
    });
    refreshPending();
    setMessage(online ? "Saved locally; syncing…" : "Saved offline");

    if (online) {
      const result = await syncPendingSundayScores();
      refreshPending();
      if (result.conflicts) setMessage("Conflict: another scorekeeper changed this hole");
      else if (result.failed) setMessage("Saved locally; sign-in or connection required");
      else setMessage("Saved online");
    }
  }

  async function saveAndNext(): Promise<void> {
    await save();
    setHole((current) => Math.min(9, current + 1));
  }

  return (
    <section className="card scoreEntryCard">
      <div className="scoreEntryTop">
        <div>
          <div className="smallLabel">CURRENT HOLE</div>
          <div className="holeNumber">{hole}</div>
        </div>
        <div className={online ? "syncOnline" : "syncOffline"}>
          {online ? "ONLINE" : "OFFLINE"}
        </div>
      </div>

      <div className="teamTabs">
        {(["L. Swardo", "S. Swardo"] as const).map((team) => (
          <button
            type="button"
            key={team}
            className={selectedTeam === team ? "teamTab activeTeamTab" : "teamTab"}
            onClick={() => setSelectedTeam(team)}
          >
            {team === "L. Swardo" ? "TEAM LUKE" : "TEAM SAM"}
          </button>
        ))}
      </div>

      <h2>{players}</h2>
      <p>Enter the team’s NET Pinehurst score for Hole {hole}.</p>
      <div className="scoreGrid">
        {[2,3,4,5,6,7,8,9,10].map((value) => (
          <button
            className={score === value ? "scoreButton selectedScore" : "scoreButton"}
            key={value}
            onClick={() => setScore(value)}
            type="button"
          >
            {value}
          </button>
        ))}
      </div>
      <div className="scoreActions">
        <button className="secondaryButton" type="button" onClick={() => setHole((h) => Math.max(1, h - 1))}>
          Previous
        </button>
        <button className="button" type="button" onClick={saveAndNext}>
          Save & Next
        </button>
      </div>
      <p className="statusGood">{message}</p>
      <p>{pending} pending score(s)</p>
    </section>
  );
}
