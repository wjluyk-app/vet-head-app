"use client";

import { useEffect, useMemo, useState } from "react";
import type { LiveSundaySinglesMatch } from "@/lib/live-types";

type Side = "LUKE" | "SAM";

function calculateStatus(match: LiveSundaySinglesMatch) {
  let margin = 0;
  let holesComplete = 0;
  let closedOnHole: number | null = null;

  for (let index = 0; index < 9; index += 1) {
    const luke = match.lukeScores[index];
    const sam = match.samScores[index];

    if (!luke || !sam) break;

    holesComplete += 1;

    if (luke.netScore < sam.netScore) margin += 1;
    if (sam.netScore < luke.netScore) margin -= 1;

    const holesRemaining = 9 - holesComplete;

    if (Math.abs(margin) > holesRemaining) {
      closedOnHole = holesComplete + 9;
      break;
    }
  }

  if (closedOnHole) {
    const winner = margin > 0 ? match.lukePlayer : match.samPlayer;
    return `${winner} wins ${Math.abs(margin)} & ${9 - holesComplete}`;
  }

  if (holesComplete === 9) {
    if (margin === 0) return "Match halved";
    return `${margin > 0 ? match.lukePlayer : match.samPlayer} wins 1 UP`;
  }

  if (margin === 0) return `All square through ${holesComplete}`;
  return `${margin > 0 ? match.lukePlayer : match.samPlayer} ${Math.abs(margin)} UP through ${holesComplete}`;
}

export default function SundaySinglesResultClient({
  match,
}: {
  match: LiveSundaySinglesMatch;
}) {
  const [hole, setHole] = useState(10);
  const [side, setSide] = useState<Side>("LUKE");
  const [score, setScore] = useState<number | null>(null);
  const [message, setMessage] = useState("Ready");
  const [busy, setBusy] = useState(false);
  const [lukeScores, setLukeScores] = useState(match.lukeScores);
  const [samScores, setSamScores] = useState(match.samScores);

  const scoringOpen = match.sessionStatus === "open";
  const selectedScorecardId =
    side === "LUKE" ? match.lukeScorecardId : match.samScorecardId;
  const selectedScores =
    side === "LUKE" ? lukeScores : samScores;
  const selectedPlayer =
    side === "LUKE" ? match.lukePlayer : match.samPlayer;

  useEffect(() => {
    setScore(selectedScores[hole - 10]?.netScore ?? null);
  }, [hole, selectedScores, side]);

  const liveMatch = useMemo(
    () => ({
      ...match,
      lukeScores,
      samScores,
    }),
    [match, lukeScores, samScores],
  );

  const matchStatus = useMemo(
    () => calculateStatus(liveMatch),
    [liveMatch],
  );

  async function save(goNext: boolean) {
    if (!scoringOpen) {
      setMessage("Sunday Singles scoring is not open.");
      return;
    }

    if (score === null) {
      setMessage("Select a NET score.");
      return;
    }

    const existing = selectedScores[hole - 10];

    setBusy(true);
    setMessage("Saving…");

    try {
      const response = await fetch("/api/sunday/singles/scores", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scorecardId: selectedScorecardId,
          holeNumber: hole,
          netScore: score,
          expectedVersion: existing?.version,
          reason: "Sunday Singles NET hole score",
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to save score");
      }

      if (payload.conflict) {
        setMessage("Conflict: another entry changed this hole.");
        return;
      }

      const savedScore = {
        id: payload.score.id,
        holeNumber: hole,
        netScore: payload.score.netScore,
        version: payload.score.version,
        updatedAt: payload.score.updatedAt,
      };

      if (side === "LUKE") {
        setLukeScores((current) => {
          const next = [...current];
          next[hole - 10] = savedScore;
          return next;
        });
      } else {
        setSamScores((current) => {
          const next = [...current];
          next[hole - 10] = savedScore;
          return next;
        });
      }

      setMessage("NET score saved");

      if (goNext) {
        if (side === "LUKE") {
          setSide("SAM");
        } else if (hole < 18) {
          setSide("LUKE");
          setHole((current) => current + 1);
        } else {
          setMessage("Final NET score saved");
        }
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save score",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card scoreEntryCard">
      <div className="scoreEntryTop">
        <div>
          <div className="smallLabel">CURRENT HOLE</div>
          <div className="holeNumber">{hole}</div>
        </div>

        <div className="syncOnline">NET SCORES</div>
      </div>

      {!scoringOpen && (
        <div className="errorNotice">
          Sunday Singles scoring is currently closed. Open the Sunday
          Singles session from the Administrator Dashboard before entering
          scores.
        </div>
      )}

      <div className="teamTabs">
        <button
          type="button"
          className={side === "LUKE" ? "teamTab activeTeamTab" : "teamTab"}
          onClick={() => setSide("LUKE")}
        >
          {match.lukePlayer}
        </button>

        <button
          type="button"
          className={side === "SAM" ? "teamTab activeTeamTab" : "teamTab"}
          onClick={() => setSide("SAM")}
        >
          {match.samPlayer}
        </button>
      </div>

      <h2>{selectedPlayer}</h2>
      <p>Enter the player’s NET score for Hole {hole}.</p>

      <div className="scoreGrid">
        {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
          <button
            className={
              score === value
                ? "scoreButton selectedScore"
                : "scoreButton"
            }
            key={value}
            onClick={() => setScore(value)}
            disabled={!scoringOpen || busy}
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
          onClick={() => setHole((current) => Math.max(10, current - 1))}
          disabled={busy}
        >
          Previous Hole
        </button>

        <button
          className="button"
          type="button"
          onClick={() => save(true)}
          disabled={busy || !scoringOpen}
        >
          {busy ? "Saving…" : "Save & Next"}
        </button>
      </div>

      <p><strong>Match status:</strong> {matchStatus}</p>
      <p className="statusGood">{message}</p>
    </section>
  );
}
