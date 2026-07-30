"use client";

import { useMemo, useState } from "react";
import type {
  PairingDay,
  TeamRoster,
  TeamsPairingsData,
  TournamentPairing,
} from "@/lib/teams-pairings";

const pairingDays: PairingDay[] = ["Friday", "Saturday", "Sunday Front", "Sunday Back"];

function handicap(value: number): string {
  return value > 0 ? String(value) : value === 0 ? "0" : `+${Math.abs(value)}`;
}

function time(value: string): string {
  const [hourText, minute] = value.split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
}

function teamLabel(shortName: string): string {
  return shortName === "L. Swardo" ? "Team Luke" : "Team Sam";
}

function TeamRosterCard({ team }: { team: TeamRoster }) {
  return (
    <article className={team.shortName === "L. Swardo" ? "rosterCard rosterLuke" : "rosterCard rosterSam"}>
      <div className="rosterCardHeader">
        <div>
          <div className="smallLabel">{team.shortName}</div>
          <h2>{team.name}</h2>
        </div>
        <div className="rosterCount">{team.players.length} players</div>
      </div>

      <div className="rosterTableWrap">
        <table className="rosterTable">
          <thead>
            <tr>
              <th>Player</th>
              <th>Index</th>
              <th>Friday</th>
              <th>Saturday</th>
              <th>Mountain Tee</th>
              <th>Betsie Tee</th>
              <th>Housing</th>
            </tr>
          </thead>
          <tbody>
            {team.players.map((player) => (
              <tr key={player.sourcePlayerId}>
                <td>
                  <strong>{player.displayName}</strong>
                  {player.captain && <span className="captainBadge">Captain</span>}
                </td>
                <td>{player.handicapIndex.toFixed(1)}</td>
                <td>{handicap(player.fridayPlayingHandicap)}</td>
                <td>{handicap(player.betsieHandicap)}</td>
                <td>{player.mountainTee}</td>
                <td>{player.betsieTee}</td>
                <td>{player.housingUnit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function PairingCard({ pairing }: { pairing: TournamentPairing }) {
  const singles = pairing.day === "Sunday Back";
  return (
    <article className="pairingCard">
      <div className="pairingCardTop">
        <div>
          <span>Match {pairing.matchNumber}</span>
          <strong>{time(pairing.teeTime)}</strong>
        </div>
        <span className="pairingStatus">{pairing.status}</span>
      </div>

      <div className="pairingMatchup">
        <div className="pairingSide pairingLuke">
          <span>TEAM LUKE</span>
          <strong>
            {pairing.lukePlayer1}
            {!singles && pairing.lukePlayer2 ? ` / ${pairing.lukePlayer2}` : ""}
          </strong>
          <small>HCP {pairing.lukeHandicapReference ?? "—"}</small>
        </div>

        <div className="pairingVersus">VS</div>

        <div className="pairingSide pairingSam">
          <span>TEAM SAM</span>
          <strong>
            {pairing.samPlayer1}
            {!singles && pairing.samPlayer2 ? ` / ${pairing.samPlayer2}` : ""}
          </strong>
          <small>HCP {pairing.samHandicapReference ?? "—"}</small>
        </div>
      </div>

      <div className="pairingMeta">
        <span><strong>Course:</strong> {pairing.course}</span>
        <span><strong>Format:</strong> {pairing.format}</span>
        {pairing.throwsFirst && (
          <span><strong>Throws first:</strong> {teamLabel(pairing.throwsFirst)}</span>
        )}
        {pairing.strokesTo && (
          <span><strong>Strokes:</strong> {pairing.strokesTo}</span>
        )}
      </div>
    </article>
  );
}

export default function TeamsPairingsClient({ data }: { data: TeamsPairingsData }) {
  const [view, setView] = useState<"teams" | "pairings">("teams");
  const [day, setDay] = useState<PairingDay>("Friday");

  const activePairings = useMemo(() => data.pairings[day], [data.pairings, day]);

  return (
    <>
      <section className="teamsPairingsControls">
        <div className="sectionTabs" role="tablist" aria-label="Teams and pairings views">
          <button
            type="button"
            className={view === "teams" ? "sectionTab sectionTabActive" : "sectionTab"}
            onClick={() => setView("teams")}
          >
            Teams
          </button>
          <button
            type="button"
            className={view === "pairings" ? "sectionTab sectionTabActive" : "sectionTab"}
            onClick={() => setView("pairings")}
          >
            Pairings
          </button>
        </div>

        {view === "pairings" && (
          <div className="dayTabs" role="tablist" aria-label="Pairing day">
            {pairingDays.map((pairingDay) => (
              <button
                type="button"
                className={day === pairingDay ? "dayTab dayTabActive" : "dayTab"}
                onClick={() => setDay(pairingDay)}
                key={pairingDay}
              >
                {pairingDay}
              </button>
            ))}
          </div>
        )}
      </section>

      {view === "teams" ? (
        <>
          <section className="teamsSummary">
            <div>
              <span>TEAM LUKE</span>
              <strong>{data.teams.find((team) => team.shortName === "L. Swardo")?.players.length ?? 0}</strong>
            </div>
            <div className="teamsSummaryCenter">
              24 PLAYERS · 2 TEAMS
            </div>
            <div>
              <span>TEAM SAM</span>
              <strong>{data.teams.find((team) => team.shortName === "S. Swardo")?.players.length ?? 0}</strong>
            </div>
          </section>
          <section className="rosterGrid">
            {data.teams.map((team) => <TeamRosterCard team={team} key={team.shortName} />)}
          </section>
        </>
      ) : (
        <>
          <section className="pairingDayHeader">
            <div>
              <div className="smallLabel">{activePairings[0]?.course}</div>
              <h2>{day} Pairings</h2>
              <p>{activePairings[0]?.format} · {activePairings.length} matches</p>
            </div>
          </section>
          <section className="pairingGrid">
            {activePairings.map((pairing) => (
              <PairingCard pairing={pairing} key={`${pairing.day}-${pairing.matchNumber}`} />
            ))}
          </section>
        </>
      )}
    </>
  );
}
