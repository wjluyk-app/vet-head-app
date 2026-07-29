"use client";

import { useEffect, useMemo, useState } from "react";
import type { FridayMatchView } from "@/lib/repositories/friday";
import {
  getLocalFridayScore,
  getPendingFridayScores,
  markFridayScoreSynced,
  saveLocalFridayScore,
} from "@/lib/local-score-store";

export default function FridayScorecardClient({ match }: { match: FridayMatchView }) {
  const [hole, setHole] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState<"L. Swardo" | "S. Swardo">("L. Swardo");
  const [score, setScore] = useState<number | null>(null);
  const [message, setMessage] = useState("Ready");
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    const local = getLocalFridayScore(match.matchNumber, selectedTeam, hole);
    const sourceCard = selectedTeam === "L. Swardo" ? match.luke : match.sam;
    setScore(local?.netScore ?? sourceCard.scores[hole - 1] ?? null);
  }, [hole, match, selectedTeam]);

  const players = useMemo(
    () => selectedTeam === "L. Swardo"
      ? `${match.luke.player1} / ${match.luke.player2}`
      : `${match.sam.player1} / ${match.sam.player2}`,
    [match, selectedTeam],
  );

  async function save(): Promise<void> {
    if (score === null) return;
    saveLocalFridayScore({
      matchNumber: match.matchNumber,
      teamShortName: selectedTeam,
      holeNumber: hole,
      netScore: score,
    });
    setMessage(online ? "Saved locally; syncing…" : "Saved offline");

    if (!online) return;

    try {
      const response = await fetch("/api/friday/scores", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          matchNumber: match.matchNumber,
          teamShortName: selectedTeam,
          holeNumber: hole,
          netScore: score,
        }),
      });
      if (!response.ok) throw new Error("Sync rejected");
      markFridayScoreSynced(match.matchNumber, selectedTeam, hole);
      setMessage("Saved and synced");
    } catch {
      setMessage("Saved locally; sync pending");
    }
  }

  async function saveAndNext(): Promise<void> {
    await save();
    setHole((current) => Math.min(18, current + 1));
  }

  return (
    <>
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
        <p>Enter the team’s NET score for Hole {hole}.</p>

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
          <button
            className="secondaryButton"
            type="button"
            onClick={() => setHole((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          <button className="button" type="button" onClick={saveAndNext}>
            Save & Next
          </button>
        </div>

        <p className="statusGood">{message}</p>
        <p>{getPendingFridayScores().length} locally pending score(s)</p>
      </section>
    </>
  );
}
