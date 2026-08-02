"use client";

import { useMemo, useState } from "react";
import type {
  PairingDay,
  TeamPlayer,
  TeamsPairingsData,
  TournamentPairing,
} from "@/lib/teams-pairings";

const dayOrder: PairingDay[] = [
  "Friday",
  "Saturday",
  "Sunday Front",
  "Sunday Back",
];

function formatTime(value: string): string {
  const [hourText, minute] = value.split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${minute} ${suffix}`;
}

function handicap(value: number): string {
  return value > 0 ? String(value) : value === 0 ? "0" : `+${Math.abs(value)}`;
}

function fullName(player: TeamPlayer): string {
  return `${player.firstName} ${player.lastName}`;
}

function teamName(shortName: string): string {
  return shortName === "L. Swardo" ? "Team Luke" : "Team Sam";
}

function pairingContainsPlayer(
  pairing: TournamentPairing,
  player: TeamPlayer,
): boolean {
  return [
    pairing.lukePlayer1,
    pairing.lukePlayer2,
    pairing.samPlayer1,
    pairing.samPlayer2,
  ].includes(player.displayName);
}

function playerSide(
  pairing: TournamentPairing,
  player: TeamPlayer,
): "LUKE" | "SAM" {
  return [pairing.lukePlayer1, pairing.lukePlayer2].includes(
    player.displayName,
  )
    ? "LUKE"
    : "SAM";
}

function names(values: Array<string | null>): string[] {
  return values.filter((value): value is string => Boolean(value));
}

function pairingDetails(
  pairing: TournamentPairing,
  player: TeamPlayer,
) {
  const side = playerSide(pairing, player);

  const teammates =
    side === "LUKE"
      ? names([pairing.lukePlayer1, pairing.lukePlayer2]).filter(
          (name) => name !== player.displayName,
        )
      : names([pairing.samPlayer1, pairing.samPlayer2]).filter(
          (name) => name !== player.displayName,
        );

  const opponents =
    side === "LUKE"
      ? names([pairing.samPlayer1, pairing.samPlayer2])
      : names([pairing.lukePlayer1, pairing.lukePlayer2]);

  return {
    teammates,
    opponents,
    handicapReference:
      side === "LUKE"
        ? pairing.lukeHandicapReference
        : pairing.samHandicapReference,
  };
}

export default function MyWeekendClient({
  data,
}: {
  data: TeamsPairingsData;
}) {
  const players = useMemo(
    () =>
      data.teams
        .flatMap((team) => team.players)
        .sort((a, b) => fullName(a).localeCompare(fullName(b))),
    [data.teams],
  );

  const [selectedId, setSelectedId] = useState("");

  const player = players.find(
    (item) => item.sourcePlayerId === selectedId,
  );

  const playerPairings = useMemo(() => {
    if (!player) return [];

    return dayOrder
      .map((day) =>
        data.pairings[day].find((pairing) =>
          pairingContainsPlayer(pairing, player),
        ),
      )
      .filter(
        (pairing): pairing is TournamentPairing => Boolean(pairing),
      );
  }, [data.pairings, player]);

  return (
    <section className="myWeekendSection">
      <div className="myWeekendHeader">
        <div>
          <span className="smallLabel">FIND MY NAME</span>
          <h2>My Weekend</h2>
          <p>
            Select your name to see your team, housing, tees, handicaps,
            partners, opponents and tee times in one place.
          </p>
        </div>

        <label className="myWeekendSelector">
          <span>PLAYER</span>
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            <option value="">Select your name</option>
            {players.map((item) => (
              <option
                value={item.sourcePlayerId}
                key={item.sourcePlayerId}
              >
                {fullName(item)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!player ? (
        <div className="myWeekendPrompt">
          Choose your name above to build your personal tournament
          itinerary.
        </div>
      ) : (
        <>
          <div className="myWeekendPlayerCard">
            <div className="myWeekendIdentity">
              <span>{teamName(player.teamShortName).toUpperCase()}</span>
              <h3>{fullName(player)}</h3>
              {player.captain && <strong>CAPTAIN</strong>}
            </div>

            <div className="myWeekendPlayerFacts">
              <div>
                <span>INDEX</span>
                <strong>{player.handicapIndex.toFixed(1)}</strong>
              </div>
              <div>
                <span>HOUSING</span>
                <strong>{player.housingUnit}</strong>
              </div>
              <div>
                <span>MOUNTAIN TEE</span>
                <strong>{player.mountainTee}</strong>
              </div>
              <div>
                <span>BETSIE TEE</span>
                <strong>{player.betsieTee}</strong>
              </div>
              <div>
                <span>FRIDAY HCP</span>
                <strong>
                  {handicap(player.fridayPlayingHandicap)}
                </strong>
              </div>
              <div>
                <span>SATURDAY HCP</span>
                <strong>{handicap(player.betsieHandicap)}</strong>
              </div>
            </div>
          </div>

          <div className="myWeekendRounds">
            {playerPairings.map((pairing) => {
              const details = pairingDetails(pairing, player);
              const singles = pairing.day === "Sunday Back";

              return (
                <article
                  className="myWeekendRoundCard"
                  key={`${pairing.day}-${pairing.matchNumber}`}
                >
                  <header>
                    <div>
                      <span>{pairing.day.toUpperCase()}</span>
                      <h3>{pairing.format}</h3>
                    </div>

                    <div className="myWeekendTeeTime">
                      <span>MATCH {pairing.matchNumber}</span>
                      <strong>
                        {pairing.teeTime
                          ? formatTime(pairing.teeTime)
                          : "After Front Nine"}
                      </strong>
                    </div>
                  </header>

                  <div className="myWeekendCourse">
                    {pairing.course}
                  </div>

                  <div className="myWeekendMatchDetails">
                    <div>
                      <span>{singles ? "YOU" : "PARTNER"}</span>
                      <strong>
                        {singles
                          ? fullName(player)
                          : details.teammates.join(" / ") || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        {singles ? "OPPONENT" : "OPPONENTS"}
                      </span>
                      <strong>{details.opponents.join(" / ")}</strong>
                    </div>

                    <div>
                      <span>HANDICAP REFERENCE</span>
                      <strong>
                        {details.handicapReference ?? "—"}
                      </strong>
                    </div>

                    {pairing.strokesTo && (
                      <div>
                        <span>STROKES</span>
                        <strong>{pairing.strokesTo}</strong>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
