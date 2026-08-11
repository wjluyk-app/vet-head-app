"use client";

import { useMemo, useState } from "react";
import { updateVetHeadPairingRound } from "./actions";

type Player = {
  id: string;
  import_key: string | null;
  display_name: string;
};

type Assignment = {
  player_id: string;
  player_order: number;
};

type Group = {
  id: string;
  group_number: number;
  name: string | null;
  group_tee_time: string | null;
  round_group_player: Assignment[];
};

type Round = {
  id: string;
  round_number: number;
  name: string;
  round_date: string;
  tee_time: string;
  format: string;
  round_group: Group[];
};

const formatTime = (value: string) => {
  const [hourText, minuteText] = String(value).slice(0, 5).split(":");
  const hour = Number(hourText);

  return `${hour % 12 || 12}:${minuteText} ${hour >= 12 ? "PM" : "AM"}`;
};

export default function RoundPairingEditor({
  round,
  players,
}: {
  round: Round;
  players: Player[];
}) {
  const initialSelections = useMemo(() => {
    const values: Record<string, string> = {};

    for (const group of round.round_group) {
      for (let order = 1; order <= 4; order += 1) {
        const assignment = group.round_group_player.find(
          (item) => item.player_order === order,
        );

        values[`${group.group_number}-${order}`] =
          assignment?.player_id ?? "";
      }
    }

    return values;
  }, [round]);

  const [selections, setSelections] = useState(initialSelections);

  const selectedValues = Object.values(selections).filter(Boolean);
  const selectedSet = new Set(selectedValues);

  const validRound =
    selectedValues.length === 12 &&
    selectedSet.size === 12;

  return (
    <section
      className="tournamentBoardSection"
      style={{ marginTop: 24 }}
    >
      <div className="boardSectionHeader">
        <div>
          <div className="smallLabel">
            ROUND {round.round_number}
          </div>

          <h2>{round.name}</h2>

          <p>
            {round.round_date} · {formatTime(round.tee_time)} ·{" "}
            {round.format === "four_man_scramble"
              ? "4-Man Scramble"
              : "Individual Net"}
          </p>
        </div>
      </div>

      <form action={updateVetHeadPairingRound}>
        <input
          type="hidden"
          name="round_id"
          value={round.id}
        />

        <section className="grid">
          {round.round_group.map((group) => (
            <article className="card" key={group.id}>
              <input
                type="hidden"
                name={`group_${group.group_number}_id`}
                value={group.id}
              />

              <div className="smallLabel">
                {round.format === "four_man_scramble"
                  ? `TEAM ${group.group_number}`
                  : `GROUP ${group.group_number}`}
              </div>

              <h3>
                {group.name ??
                  (round.format === "four_man_scramble"
                    ? `Team ${group.group_number}`
                    : `Group ${group.group_number}`)}
              </h3>

              <p>
                Tee Time:{" "}
                {formatTime(
                  group.group_tee_time ?? round.tee_time,
                )}
              </p>

              {[1, 2, 3, 4].map((order) => {
                const key = `${group.group_number}-${order}`;
                const currentPlayerId = selections[key] ?? "";

                return (
                  <label key={order}>
                    Player {order}

                    <select
                      className="textInput"
                      name={`group_${group.group_number}_player_${order}_id`}
                      value={currentPlayerId}
                      onChange={(event) => {
                        const nextPlayerId = event.target.value;

                        setSelections((current) => {
                          const updated = { ...current };

                          const otherEntry = Object.entries(current).find(
                            ([otherKey, playerId]) =>
                              otherKey !== key &&
                              playerId === nextPlayerId,
                          );

                          if (otherEntry) {
                            const [otherKey] = otherEntry;
                            updated[otherKey] = currentPlayerId;
                          }

                          updated[key] = nextPlayerId;

                          return updated;
                        });
                      }}
                      required
                    >
                      <option value="">
                        Select player
                      </option>

                      {players.map((player) => (
                        <option
                          key={player.id}
                          value={player.id}
                        >
                          {player.import_key ?? ""} —{" "}
                          {player.display_name}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              })}
            </article>
          ))}
        </section>

        <div
          style={{
            marginTop: 18,
            padding: "0 20px 20px",
          }}
        >
          {!validRound && (
            <p>
              <strong>
                Assign each of the 12 players exactly once before saving.
              </strong>
            </p>
          )}

          <button
            className="button"
            type="submit"
            disabled={!validRound}
          >
            Save {round.name} Pairings
          </button>
        </div>
      </form>
    </section>
  );
}
