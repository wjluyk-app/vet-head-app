"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateCourseHandicap,
  calculateHoleNet,
  calculateHoleStrokes,
} from "@/lib/vet-head-scoring";
import {
  clearIndividualGroupAction,
  saveIndividualGroupAction,
} from "./actions";

type PlayerAssignment = {
  id: string;
  playerId: string;
  playerName: string;
  handicapIndex: number;
};

type HoleScore = {
  player_id: string;
  hole_number: number;
  gross_score: number;
};

type Props = {
  roundId: string;
  roundGroupId: string;
  players: PlayerAssignment[];
  existingHoleScores: HoleScore[];
  courseName: string;
  slopeRating: number;
  courseRating: number;
  par: number;
};

const CEDAR_RIVER_STROKE_INDEXES = [
  7, 11, 3, 13, 1, 17, 9, 15, 5,
  6, 12, 2, 16, 18, 10, 8, 14, 4,
];

const HAWKS_EYE_STROKE_INDEXES = [
  9, 7, 13, 3, 5, 15, 17, 12, 10,
  16, 8, 2, 11, 1, 6, 18, 4, 14,
];

function getStrokeIndexes(courseName: string) {
  const name = courseName.toLowerCase();

  if (name.includes("cedar")) {
    return CEDAR_RIVER_STROKE_INDEXES;
  }

  if (name.includes("hawk")) {
    return HAWKS_EYE_STROKE_INDEXES;
  }

  throw new Error(
    `Stroke indexes are not configured for ${courseName}.`,
  );
}

export default function HybridIndividualGroupForm({
  roundId,
  roundGroupId,
  players,
  existingHoleScores,
  courseName,
  slopeRating,
  courseRating,
  par,
}: Props) {
  const strokeIndexes = getStrokeIndexes(courseName);

  const initialScores = useMemo(() => {
    const values: Record<string, string> = {};

    for (const player of players) {
      for (let hole = 1; hole <= 18; hole += 1) {
        const existing = existingHoleScores.find(
          (score) =>
            score.player_id === player.playerId &&
            score.hole_number === hole,
        );

        values[`${player.playerId}-${hole}`] =
          existing ? String(existing.gross_score) : "";
      }
    }

    return values;
  }, [existingHoleScores, players]);

  const [scores, setScores] = useState(initialScores);
  const [dirty, setDirty] = useState(false);

  const hasSavedScorecard =
    existingHoleScores.length === players.length * 18;

  useEffect(() => {
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (!dirty) return;

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeLeaving);

    return () => {
      window.removeEventListener(
        "beforeunload",
        warnBeforeLeaving,
      );
    };
  }, [dirty]);

  const playerData = players.map((player) => {
    const courseHandicap = calculateCourseHandicap(
      player.handicapIndex,
      slopeRating,
      courseRating,
      par,
    );

    const holes = Array.from(
      { length: 18 },
      (_, index) => {
        const holeNumber = index + 1;
        const raw = scores[
          `${player.playerId}-${holeNumber}`
        ];
        const gross = raw === "" ? null : Number(raw);
        const strokeIndex = strokeIndexes[index];
        const strokes = calculateHoleStrokes(
          courseHandicap,
          strokeIndex,
        );

        return {
          holeNumber,
          gross,
          strokeIndex,
          strokes,
          net:
            gross === null
              ? null
              : calculateHoleNet(
                  gross,
                  courseHandicap,
                  strokeIndex,
                ),
        };
      },
    );

    const complete = holes.every(
      (hole) =>
        hole.gross !== null &&
        Number.isInteger(hole.gross) &&
        hole.gross >= 1 &&
        hole.gross <= 20,
    );

    const grossTotal = complete
      ? holes.reduce(
          (sum, hole) => sum + Number(hole.gross),
          0,
        )
      : null;

    const netTotal = complete
      ? holes.reduce(
          (sum, hole) => sum + Number(hole.net),
          0,
        )
      : null;

    return {
      ...player,
      courseHandicap,
      holes,
      complete,
      grossTotal,
      netTotal,
    };
  });

  const groupHoleTotals = Array.from(
    { length: 18 },
    (_, index) => {
      const holeNumber = index + 1;

      const nets = playerData
        .map((player) => player.holes[index].net)
        .filter(
          (value): value is number => value !== null,
        )
        .sort((a, b) => a - b);

      const needed = holeNumber <= 9 ? 2 : 3;

      if (nets.length < needed) {
        return null;
      }

      return nets
        .slice(0, needed)
        .reduce((sum, score) => sum + score, 0);
    },
  );

  const frontComplete = groupHoleTotals
    .slice(0, 9)
    .every((value) => value !== null);

  const backComplete = groupHoleTotals
    .slice(9)
    .every((value) => value !== null);

  const frontTotal = frontComplete
    ? groupHoleTotals
        .slice(0, 9)
        .filter(
          (value): value is number => value !== null,
        )
        .reduce(
          (sum, value) => sum + value,
          0,
        )
    : null;

  const backTotal = backComplete
    ? groupHoleTotals
        .slice(9)
        .filter(
          (value): value is number => value !== null,
        )
        .reduce(
          (sum, value) => sum + value,
          0,
        )
    : null;

  const groupTotal =
    frontTotal !== null && backTotal !== null
      ? frontTotal + backTotal
      : null;

  const allComplete = playerData.every(
    (player) => player.complete,
  );

  return (
    <form
      action={saveIndividualGroupAction}
      className="vetIndividualGroupForm"
      onSubmit={() => setDirty(false)}
    >
      <input
        type="hidden"
        name="roundId"
        value={roundId}
      />

      <input
        type="hidden"
        name="roundGroupId"
        value={roundGroupId}
      />

      <div className="hybridScoreTableWrap">
        <table className="hybridScoreTable">
          <thead>
            <tr>
              <th className="hybridStickyCorner">Hole</th>

              {playerData.map((player) => (
                <th
                  key={player.playerId}
                  className="hybridPlayerHeader"
                >
                  <div>{player.playerName}</div>
                  <small>
                    CH {player.courseHandicap}
                  </small>
                </th>
              ))}

              <th className="hybridPlayerHeader">
                Group
              </th>
            </tr>
          </thead>

          <tbody>
            {Array.from(
              { length: 18 },
              (_, index) => {
                const holeNumber = index + 1;

                return (
                  <tr key={holeNumber}>
                    <th className="hybridHoleHeader">
                      <div>{holeNumber}</div>
                      <small>
                        SI {strokeIndexes[index]}
                      </small>
                    </th>

                    {playerData.map(
                      (player, playerIndex) => {
                        const hole =
                          player.holes[index];

                        const dots =
                          hole.strokes > 0
                            ? "•".repeat(
                                hole.strokes,
                              )
                            : "";

                        return (
                          <td
                            key={player.playerId}
                            style={{
                              padding: 5,
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                position: "relative",
                                display: "inline-block",
                              }}
                            >
                              <input
                                type="number"
                                id={`score-${roundGroupId}-${playerIndex}-${holeNumber}`}
                                name={`grossScore_${player.playerId}_${holeNumber}`}
                                min="1"
                                max="20"
                                inputMode="numeric"
                                required
                                value={
                                  scores[
                                    `${player.playerId}-${holeNumber}`
                                  ] ?? ""
                                }
                                onChange={(event) => {
                                  const value =
                                    event.target.value;

                                  setScores(
                                    (current) => ({
                                      ...current,
                                      [`${player.playerId}-${holeNumber}`]:
                                        value,
                                    }),
                                  );
                                  setDirty(true);

                                  const numericValue =
                                    Number(value);

                                  if (
                                    !Number.isInteger(
                                      numericValue,
                                    ) ||
                                    numericValue < 2 ||
                                    numericValue > 20
                                  ) {
                                    return;
                                  }

                                  let nextPlayerIndex =
                                    playerIndex;
                                  let nextHoleNumber =
                                    holeNumber;

                                  if (holeNumber < 18) {
                                    nextHoleNumber =
                                      holeNumber + 1;
                                  } else if (
                                    playerIndex <
                                    playerData.length - 1
                                  ) {
                                    nextPlayerIndex =
                                      playerIndex + 1;
                                    nextHoleNumber = 1;
                                  } else {
                                    setTimeout(() => {
                                      const saveButton =
                                        document.getElementById(
                                          `save-group-${roundGroupId}`,
                                        );

                                      saveButton?.focus();
                                    }, 0);
                                    return;
                                  }

                                  setTimeout(() => {
                                    const nextInput =
                                      document.getElementById(
                                        `score-${roundGroupId}-${nextPlayerIndex}-${nextHoleNumber}`,
                                      );

                                    nextInput?.focus();

                                    (
                                      nextInput as HTMLInputElement | null
                                    )?.select();

                                    nextInput?.scrollIntoView({
                                      behavior: "smooth",
                                      block: "center",
                                      inline: "nearest",
                                    });
                                  }, 0);
                                }}
                                onKeyDown={(event) => {
                                  if (
                                    event.key !== "Enter" &&
                                    event.key !== "Tab"
                                  ) {
                                    return;
                                  }

                                  event.preventDefault();

                                  const goingBackward =
                                    event.key === "Tab" &&
                                    event.shiftKey;

                                  let nextPlayerIndex =
                                    playerIndex;
                                  let nextHoleNumber =
                                    holeNumber;

                                  if (goingBackward) {
                                    if (holeNumber > 1) {
                                      nextHoleNumber =
                                        holeNumber - 1;
                                    } else if (
                                      playerIndex > 0
                                    ) {
                                      nextPlayerIndex =
                                        playerIndex - 1;
                                      nextHoleNumber = 18;
                                    } else {
                                      return;
                                    }
                                  } else {
                                    if (holeNumber < 18) {
                                      nextHoleNumber =
                                        holeNumber + 1;
                                    } else if (
                                      playerIndex <
                                      playerData.length - 1
                                    ) {
                                      nextPlayerIndex =
                                        playerIndex + 1;
                                      nextHoleNumber = 1;
                                    } else {
                                      const saveButton =
                                        document.getElementById(
                                          `save-group-${roundGroupId}`,
                                        );

                                      saveButton?.focus();
                                      return;
                                    }
                                  }

                                  const nextInput =
                                    document.getElementById(
                                      `score-${roundGroupId}-${nextPlayerIndex}-${nextHoleNumber}`,
                                    );

                                  nextInput?.focus();
                                  (
                                    nextInput as HTMLInputElement | null
                                  )?.select();
                                }}
                                aria-label={`${player.playerName} hole ${holeNumber} gross score`}
                                style={{
                                  width: 62,
                                  height: 48,
                                  fontSize: 20,
                                  fontWeight: 700,
                                  textAlign: "center",
                                  paddingTop: 8,
                                }}
                              />

                              {dots && (
                                <span
                                  aria-label={`${hole.strokes} handicap stroke${hole.strokes === 1 ? "" : "s"}`}
                                  style={{
                                    position: "absolute",
                                    top: 1,
                                    right: 5,
                                    fontSize: 11,
                                    lineHeight: 1,
                                    fontWeight: 900,
                                    pointerEvents:
                                      "none",
                                  }}
                                >
                                  {dots}
                                </span>
                              )}
                            </div>

                            {hole.net !== null && (
                              <div
                                style={{
                                  fontSize: 11,
                                  marginTop: 2,
                                  color: "#4f6375",
                                  fontWeight: 700,
                                }}
                              >
                                Net {hole.net}
                              </div>
                            )}
                          </td>
                        );
                      },
                    )}

                    <td
                      style={{
                        padding: 8,
                        textAlign: "center",
                        fontWeight: 800,
                      }}
                    >
                      {groupHoleTotals[index] ?? "—"}
                      <div
                        style={{
                          fontSize: 10,
                          color: "#4f6375",
                          fontWeight: 800,
                        }}
                      >
                        {holeNumber <= 9
                          ? "2 BEST"
                          : "3 BEST"}
                      </div>
                    </td>
                  </tr>
                );
              },
            )}

            <tr>
              <th
                style={{
                  padding: 10,
                  textAlign: "center",
                }}
              >
                TOTAL
              </th>

              {playerData.map((player) => (
                <td
                  key={player.playerId}
                  style={{
                    padding: 10,
                    textAlign: "center",
                    fontWeight: 800,
                  }}
                >
                  <div>
                    Gross{" "}
                    {player.grossTotal ?? "—"}
                  </div>
                  <div>
                    Net {player.netTotal ?? "—"}
                  </div>
                </td>
              ))}

              <td
                style={{
                  padding: 10,
                  textAlign: "center",
                  fontWeight: 900,
                }}
              >
                {groupTotal ?? "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: 14,
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          fontWeight: 800,
        }}
      >
        <span>
          Front 9 · 2 Best:{" "}
          {frontTotal ?? "—"}
        </span>

        <span>
          Back 9 · 3 Best:{" "}
          {backTotal ?? "—"}
        </span>

        <span>
          Group Total:{" "}
          {groupTotal ?? "—"}
        </span>
      </div>

      <div className="vetGroupSaveArea hybridStickySaveArea">
        <div className="hybridSaveStatus">
          {!allComplete ? (
            <span>COMPLETE SCORECARD TO SAVE</span>
          ) : dirty ? (
            <span className="hybridUnsavedStatus">
              UNSAVED CHANGES
            </span>
          ) : hasSavedScorecard ? (
            <span className="hybridSavedStatus">
              ✓ SCORES SAVED
            </span>
          ) : (
            <span>READY TO SAVE</span>
          )}
        </div>

        <button
          type="submit"
          id={`save-group-${roundGroupId}`}
          className="vetSaveScoreButton vetSaveGroupButton"
          disabled={!allComplete}
        >
          SAVE GROUP SCORECARD
        </button>

        {hasSavedScorecard && (
          <button
            type="submit"
            className="vetClearScoreButton"
            formAction={clearIndividualGroupAction}
            formNoValidate
            onClick={(event) => {
              if (
                !window.confirm(
                  "Clear all saved scores for this group? This cannot be undone.",
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            CLEAR SCORECARD
          </button>
        )}
      </div>
    </form>
  );
}
