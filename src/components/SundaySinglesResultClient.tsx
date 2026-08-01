"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LiveSundaySinglesMatch } from "@/lib/live-types";

type WinnerChoice = "LUKE" | "SAM" | "HALVED";

export default function SundaySinglesResultClient({
  match,
}: {
  match: LiveSundaySinglesMatch;
}) {
  const initialWinner: WinnerChoice | null = match.halved
    ? "HALVED"
    : match.winnerTeamId === match.lukeTeamId
      ? "LUKE"
      : match.winnerTeamId === match.samTeamId
        ? "SAM"
        : null;

  const [winner, setWinner] = useState<WinnerChoice | null>(
    initialWinner,
  );
  const [message, setMessage] = useState("Ready");
  const [busy, setBusy] = useState(false);
  const scoringOpen = match.sessionStatus === "open";
  const router = useRouter();

  async function saveResult() {
    if (!scoringOpen) {
      setMessage("Sunday Singles scoring is not open.");
      return;
    }

    if (!winner) {
      setMessage("Choose a winner or select Halved.");
      return;
    }

    setBusy(true);
    setMessage("Saving…");

    const winnerTeamId =
      winner === "LUKE"
        ? match.lukeTeamId
        : winner === "SAM"
          ? match.samTeamId
          : null;

    try {
      const response = await fetch("/api/sunday/singles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          pairingId: match.pairingId,
          winnerTeamId,
          halved: winner === "HALVED",
          closedOnHole: null,
          resultText: null,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to save result");
      }

      setMessage("Singles result saved");

      if (match.matchNumber < 12) {
        router.push(`/score/sunday/singles/${match.matchNumber + 1}`);
      } else {
        router.push("/score/sunday");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save result",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card scoreEntryCard">
      <div className="smallLabel">SINGLES MATCH {match.matchNumber}</div>

      {!scoringOpen && (
        <div className="errorNotice">
          Sunday Singles scoring is currently closed. Open the Sunday
          Singles session from the Administrator Dashboard before entering results.
        </div>
      )}

      <div className="teamTabs">
        <button
          type="button"
          className={
            winner === "LUKE"
              ? "teamTab activeTeamTab"
              : "teamTab"
          }
          onClick={() => setWinner("LUKE")}
          disabled={!scoringOpen}
        >
          {match.lukePlayer}
        </button>

        <button
          type="button"
          className={
            winner === "SAM"
              ? "teamTab activeTeamTab"
              : "teamTab"
          }
          onClick={() => setWinner("SAM")}
          disabled={!scoringOpen}
        >
          {match.samPlayer}
        </button>

        <button
          type="button"
          className={
            winner === "HALVED"
              ? "teamTab activeTeamTab"
              : "teamTab"
          }
          onClick={() => setWinner("HALVED")}
          disabled={!scoringOpen}
        >
          HALVED
        </button>
      </div>

      <button
        className="button"
        type="button"
        onClick={saveResult}
        disabled={busy || !scoringOpen}
      >
        {busy ? "Saving…" : "Save & Next Match"}
      </button>

      <p className="statusGood">{message}</p>
    </section>
  );
}
