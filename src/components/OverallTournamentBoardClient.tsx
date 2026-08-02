"use client";

import { useEffect, useMemo, useState } from "react";
import type { OverallTournamentBoard } from "@/lib/overall-tournament-board";
import type {
  FridayBoardTeam,
  FridayTournamentBoard,
} from "@/lib/friday-tournament-board";
import type {
  SaturdayBoardTeam,
  SaturdayTournamentBoard,
} from "@/lib/saturday-tournament-board";
import type { SundayTournamentBoard } from "@/lib/sunday-tournament-board";

const points = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

type Day = "friday" | "saturday" | "sunday";
type TeamRow = FridayBoardTeam | SaturdayBoardTeam;
type TeamBoard = FridayTournamentBoard | SaturdayTournamentBoard;

function score(value: number | null) {
  return value ?? "—";
}

function TeamMatchCards({
  board,
  day,
  open,
  setOpen,
}: {
  board: TeamBoard;
  day: "friday" | "saturday";
  open: string | null;
  setOpen: (value: string | null) => void;
}) {
  const groups = useMemo(() => {
    const grouped = new Map<number, TeamRow[]>();

    board.teams.forEach((team) => {
      grouped.set(team.matchNumber, [
        ...(grouped.get(team.matchNumber) ?? []),
        team,
      ]);
    });

    return [...grouped.entries()].sort((a, b) => a[0] - b[0]);
  }, [board]);

  return (
    <div className="mobileMatchList">
      {groups.map(([matchNumber, teams]) => {
        const match = board.matchPlay.matches.find(
          (item) => item.matchNumber === matchNumber,
        );
        const luke = teams.find((team) => team.captainTeam === "LUKE");
        const sam = teams.find((team) => team.captainTeam === "SAM");
        const key = `${day}-${matchNumber}`;
        const expanded = open === key;

        return (
          <article className="mobileMatchCard" key={key}>
            <header className="mobileMatchHeader">
              <div>
                <span>MATCH {matchNumber}</span>
                <strong>{match?.status ?? "Pending"}</strong>
              </div>

              <div className="mobileMatchPoints">
                <span>LUKE {points(match?.lukePoints ?? 0)}</span>
                <span>SAM {points(match?.samPoints ?? 0)}</span>
              </div>
            </header>

            <div className="mobileTeamRow mobileLukeRow">
              <div>
                <span>TEAM LUKE</span>
                <strong>{luke?.players ?? "—"}</strong>
              </div>
              <div className="mobileTotals">
                <span>OUT<strong>{score(luke?.front ?? null)}</strong></span>
                <span>IN<strong>{score(luke?.back ?? null)}</strong></span>
                <span>TOTAL<strong>{score(luke?.total ?? null)}</strong></span>
              </div>
            </div>

            <div className="mobileTeamRow mobileSamRow">
              <div>
                <span>TEAM SAM</span>
                <strong>{sam?.players ?? "—"}</strong>
              </div>
              <div className="mobileTotals">
                <span>OUT<strong>{score(sam?.front ?? null)}</strong></span>
                <span>IN<strong>{score(sam?.back ?? null)}</strong></span>
                <span>TOTAL<strong>{score(sam?.total ?? null)}</strong></span>
              </div>
            </div>

            <button
              className="mobileExpandButton"
              type="button"
              onClick={() => setOpen(expanded ? null : key)}
            >
              {expanded ? "Hide hole-by-hole scores ▲" : "View hole-by-hole scores ▼"}
            </button>

            {expanded && (
              <div className="mobileHoleScroller">
                <table className="mobileHoleTable">
                  <thead>
                    <tr>
                      <th>Team</th>
                      {Array.from({ length: 18 }, (_, index) => (
                        <th key={index}>{index + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="mobileLukeHoleRow">
                      <th>Luke</th>
                      {luke?.scores.map((value, index) => (
                        <td key={index}>{score(value)}</td>
                      ))}
                    </tr>
                    <tr className="mobileSamHoleRow">
                      <th>Sam</th>
                      {sam?.scores.map((value, index) => (
                        <td key={index}>{score(value)}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function SundayCards({ board }: { board: SundayTournamentBoard }) {
  return (
    <>
      <div className="mobileSectionTitle">
        <span>FRONT NINE</span>
        <h2>Pinehurst Matches</h2>
      </div>

      <div className="mobileMatchList">
        {board.pinehurst.matches.map((match) => (
          <article className="mobileMatchCard" key={match.pairingId}>
            <header className="mobileMatchHeader">
              <div>
                <span>MATCH {match.matchNumber}</span>
                <strong>{match.status || "Pending"}</strong>
              </div>
              <div className="mobileMatchPoints">
                <span>LUKE {points(match.lukePoints)}</span>
                <span>SAM {points(match.samPoints)}</span>
              </div>
            </header>

            <div className="mobileTeamRow mobileLukeRow">
              <div>
                <span>TEAM LUKE</span>
                <strong>{match.lukePlayers}</strong>
              </div>
              <b>{score(match.lukeScore)}</b>
            </div>

            <div className="mobileTeamRow mobileSamRow">
              <div>
                <span>TEAM SAM</span>
                <strong>{match.samPlayers}</strong>
              </div>
              <b>{score(match.samScore)}</b>
            </div>
          </article>
        ))}
      </div>

      <div className="mobileSectionTitle">
        <span>BACK NINE</span>
        <h2>Singles Matches</h2>
      </div>

      <div className="mobileMatchList">
        {board.singles.map((match) => (
          <article className="mobileMatchCard" key={match.pairingId}>
            <header className="mobileMatchHeader">
              <div>
                <span>MATCH {match.matchNumber}</span>
                <strong>
                  {match.resultText ??
                    (match.winner === "HALVED"
                      ? "Halved"
                      : match.status || "Pending")}
                </strong>
              </div>
              <div className="mobileMatchPoints">
                <span>LUKE {points(match.lukePoints)}</span>
                <span>SAM {points(match.samPoints)}</span>
              </div>
            </header>

            <div className="mobileTeamRow mobileLukeRow">
              <div>
                <span>TEAM LUKE</span>
                <strong>{match.lukePlayer}</strong>
              </div>
            </div>

            <div className="mobileTeamRow mobileSamRow">
              <div>
                <span>TEAM SAM</span>
                <strong>{match.samPlayer}</strong>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export default function OverallTournamentBoardClient({
  initial,
  initialFriday,
  initialSaturday,
  initialSunday,
}: {
  initial: OverallTournamentBoard;
  initialFriday?: FridayTournamentBoard;
  initialSaturday?: SaturdayTournamentBoard;
  initialSunday?: SundayTournamentBoard;
}) {
  const [board, setBoard] = useState(initial);
  const [friday, setFriday] = useState(initialFriday);
  const [saturday, setSaturday] = useState(initialSaturday);
  const [sunday, setSunday] = useState(initialSunday);
  const [day, setDay] = useState<Day>("friday");
  const [open, setOpen] = useState<string | null>(null);
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
      setFriday(payload.friday);
      setSaturday(payload.saturday);
      setSunday(payload.sunday);
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
      <section className="resultsScoreboard mobileOverallScore">
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

      {friday && saturday && sunday && (
      <nav className="mobileDayTabs" aria-label="Scoreboard day">
        <button
          className={day === "friday" ? "activeMobileDay" : ""}
          onClick={() => {
            setDay("friday");
            setOpen(null);
          }}
        >
          <span>FRIDAY</span>
          <strong>
            {points(board.fridayLukePoints)}–{points(board.fridaySamPoints)}
          </strong>
        </button>

        <button
          className={day === "saturday" ? "activeMobileDay" : ""}
          onClick={() => {
            setDay("saturday");
            setOpen(null);
          }}
        >
          <span>SATURDAY</span>
          <strong>
            {points(board.saturdayLukePoints)}–{points(board.saturdaySamPoints)}
          </strong>
        </button>

        <button
          className={day === "sunday" ? "activeMobileDay" : ""}
          onClick={() => {
            setDay("sunday");
            setOpen(null);
          }}
        >
          <span>SUNDAY</span>
          <strong>
            {points(board.sundayLukePoints)}–{points(board.sundaySamPoints)}
          </strong>
        </button>
      </nav>
      )}

      {day === "friday" && friday && (
        <TeamMatchCards
          board={friday}
          day="friday"
          open={open}
          setOpen={setOpen}
        />
      )}

      {day === "saturday" && saturday && (
        <TeamMatchCards
          board={saturday}
          day="saturday"
          open={open}
          setOpen={setOpen}
        />
      )}

      {day === "sunday" && sunday && <SundayCards board={sunday} />}
    </>
  );
}
