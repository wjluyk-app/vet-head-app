"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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

type Day =
  | "friday"
  | "saturday"
  | "sunday-pinehurst"
  | "sunday-singles"
  | "skins";
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

function FridaySkinsBoard({
  board,
}: {
  board: FridayTournamentBoard;
}) {
  const holes = Array.from({ length: 18 }, (_, index) => {
    const hole = index + 1;
    const completed = board.teams.every(
      (team) => team.scores[index] !== null,
    );

    if (!completed) {
      return {
        hole,
        lowScore: null,
        players: "Awaiting scores",
        status: "Pending",
        payout: 0,
      };
    }

    const lowScore = Math.min(
      ...board.teams.map((team) => team.scores[index] as number),
    );

    const lowTeams = board.teams.filter(
      (team) => team.scores[index] === lowScore,
    );

    const winner = board.skins.find((skin) => skin.hole === hole);

    if (winner) {
      return {
        hole,
        lowScore,
        players: winner.players,
        status: "Skin Winner",
        payout: winner.teamPayout,
      };
    }

    if (lowTeams.length > 1) {
      return {
        hole,
        lowScore,
        players: lowTeams.map((team) => team.players).join(" / "),
        status: "Tied Low — No Skin",
        payout: 0,
      };
    }

    return {
      hole,
      lowScore,
      players: lowTeams[0]?.players ?? "—",
      status: hole === 18
        ? "No Skin"
        : "Not Validated",
      payout: 0,
    };
  });

  const money = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <section className="skinsScoreboardSection">
      <div className="skinsScoreboardHeader">
        <div>
          <span className="smallLabel">FRIDAY SKINS</span>
          <h2>18-Hole Skins Board</h2>
          <p>Unique low NET score with next-hole validation.</p>
        </div>

        <div className="skinsSummary">
          <div>
            <span>SKINS POT</span>
            <strong>{money(200)}</strong>
          </div>
          <div>
            <span>WINNING SKINS</span>
            <strong>{board.skins.length}</strong>
          </div>
          <div>
            <span>PER SKIN</span>
            <strong>
              {board.skins.length
                ? money(200 / board.skins.length)
                : "—"}
            </strong>
          </div>
        </div>
      </div>

      <div className="skinsHoleGrid">
        {holes.map((item) => (
          <article
            className={
              item.status === "Skin Winner"
                ? "skinsHoleCard skinsHoleWinner"
                : "skinsHoleCard"
            }
            key={item.hole}
          >
            <div className="skinsHoleTop">
              <span>HOLE</span>
              <strong>{item.hole}</strong>
            </div>

            <div className="skinsHoleScore">
              <span>LOW NET</span>
              <strong>{item.lowScore ?? "—"}</strong>
            </div>

            <div className="skinsHolePlayers">
              {item.players}
            </div>

            <div className="skinsHoleStatus">
              <span>{item.status}</span>
              {item.payout > 0 && <strong>{money(item.payout)}</strong>}
            </div>
          </article>
        ))}
      </div>

      <div className="skinsScoreboardFooter">
        <span>Total Distributed</span>
        <strong>{money(board.skinsDistributed)}</strong>
      </div>
    </section>
  );
}

function SundayPinehurstCards({
  board,
}: {
  board: SundayTournamentBoard;
}) {
  return (
    <>
      <div className="mobileSectionTitle">
        <span>SUNDAY FRONT NINE</span>
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
    </>
  );
}

function SundaySinglesCards({
  board,
}: {
  board: SundayTournamentBoard;
}) {
  return (
    <>
      <div className="mobileSectionTitle">
        <span>SUNDAY BACK NINE</span>
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
  const searchParams = useSearchParams();
  const requestedDay = searchParams.get("day");
  const initialDay: Day =
    requestedDay === "saturday" ||
    requestedDay === "sunday-pinehurst" ||
    requestedDay === "sunday-singles" ||
    requestedDay === "skins"
      ? requestedDay
      : "friday";

  const [board, setBoard] = useState(initial);
  const [friday, setFriday] = useState(initialFriday);
  const [saturday, setSaturday] = useState(initialSaturday);
  const [sunday, setSunday] = useState(initialSunday);
  const [day, setDay] = useState<Day>(initialDay);
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
          className={day === "sunday-pinehurst" ? "activeMobileDay" : ""}
          onClick={() => {
            setDay("sunday-pinehurst");
            setOpen(null);
          }}
        >
          <span>SUN PINEHURST</span>
          <strong>
            {points(sunday.pinehurstLukePoints)}–{points(sunday.pinehurstSamPoints)}
          </strong>
        </button>

        <button
          className={day === "sunday-singles" ? "activeMobileDay" : ""}
          onClick={() => {
            setDay("sunday-singles");
            setOpen(null);
          }}
        >
          <span>SUN SINGLES</span>
          <strong>
            {points(sunday.singlesLukePoints)}–{points(sunday.singlesSamPoints)}
          </strong>
        </button>

        <button
          className={day === "skins" ? "activeMobileDay" : ""}
          onClick={() => {
            setDay("skins");
            setOpen(null);
          }}
        >
          <span>FRIDAY SKINS</span>
          <strong>{friday.skins.length}</strong>
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

      {day === "sunday-pinehurst" && sunday && (
        <SundayPinehurstCards board={sunday} />
      )}

      {day === "sunday-singles" && sunday && (
        <SundaySinglesCards board={sunday} />
      )}

      {day === "skins" && friday && (
        <FridaySkinsBoard board={friday} />
      )}
    </>
  );
}
