import Link from "next/link";
import { requireScoreEntryAccess } from "@/lib/auth/score-entry";
import { getVetHeadRoundEntryData } from "@/lib/repositories/vet-head-db";
import {
  saveIndividualScoreAction,
  saveScrambleScoreAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function VetHeadRoundEntryPage({
  params,
}: {
  params: Promise<{ roundId: string }>;
}) {
  await requireScoreEntryAccess();

  const { round, groups, assignments, individualScores, scrambleScores } =
    await getVetHeadRoundEntryData((await params).roundId);

  const courseTee = Array.isArray(round.course_tee)
    ? round.course_tee[0]
    : round.course_tee;

  const isIndividual = round.format === "individual_net";

  return (
    <main className="vetRoundEntryPage">
      <section className="vetRoundEntryHero">
        <div className="vetRoundEntryKicker">
          VET HEAD 2026 · SCORE ENTRY
        </div>

        <h1>{round.name}</h1>

        <p>
          {isIndividual
            ? "Enter each player’s final 18-hole gross score."
            : "Enter each team’s final 18-hole gross scramble score."}
        </p>

        <div className="vetRoundEntryMeta">
          <span>{courseTee?.course_name ?? "Course TBD"}</span>
          <span>•</span>
          <span>{courseTee?.tee_name ?? "Tees TBD"}</span>
        </div>

        <Link className="vetBackButton" href="/score">
          ← Back to Rounds
        </Link>
      </section>

      <section className="vetRoundEntryGroups">
        {groups.map((group) => {
          const groupAssignments = assignments
            .filter(
              (assignment) =>
                assignment.round_group_id === group.id,
            )
            .sort(
              (a, b) =>
                a.player_order - b.player_order,
            );

          const scrambleScore = scrambleScores.find(
            (score) => score.round_group_id === group.id,
          );

          return (
            <article className="vetRoundGroupCard" key={group.id}>
              <header className="vetRoundGroupHeader">
                <div>
                  <span>GROUP {group.group_number}</span>
                  <h2>
                    {group.name || `Group ${group.group_number}`}
                  </h2>
                </div>

                <div className="vetGroupCount">
                  {groupAssignments.length} Players
                </div>
              </header>

              {isIndividual ? (
                <div className="vetPlayerScoreList">
                  {groupAssignments.map((assignment) => {
                    const existingScore = individualScores.find(
                      (score) =>
                        score.player_id === assignment.player_id,
                    );

                    return (
                      <form
                        action={saveIndividualScoreAction}
                        key={assignment.id}
                        className="vetPlayerScoreRow"
                      >
                        <input
                          type="hidden"
                          name="roundId"
                          value={round.id}
                        />

                        <input
                          type="hidden"
                          name="playerId"
                          value={assignment.player_id}
                        />

                        <div className="vetPlayerScoreInfo">
                          <strong>
                            {assignment.player?.display_name ?? "Player"}
                          </strong>

                          <span>
                            HI {assignment.player?.handicap_index ?? "—"}
                          </span>

                          {existingScore && (
                            <small>
                              Course HDCP {existingScore.course_handicap}
                              {" · "}
                              Net {existingScore.net_score}
                            </small>
                          )}
                        </div>

                        <div className="vetScoreControls">
                          <label>
                            <span>Gross</span>

                            <input
                              type="number"
                              name="grossScore"
                              min="18"
                              max="200"
                              inputMode="numeric"
                              required
                              defaultValue={
                                existingScore?.gross_score ?? ""
                              }
                              aria-label={`Gross score for ${
                                assignment.player?.display_name ?? "player"
                              }`}
                            />
                          </label>

                          <button
                            type="submit"
                            className="vetSaveScoreButton"
                          >
                            {existingScore ? "Update" : "Save"}
                          </button>
                        </div>
                      </form>
                    );
                  })}
                </div>
              ) : (
                <form
                  action={saveScrambleScoreAction}
                  className="vetScrambleScoreForm"
                >
                  <input
                    type="hidden"
                    name="roundId"
                    value={round.id}
                  />

                  <input
                    type="hidden"
                    name="roundGroupId"
                    value={group.id}
                  />

                  <div className="vetScramblePlayers">
                    <span>TEAM</span>

                    <strong>
                      {groupAssignments
                        .map(
                          (assignment) =>
                            assignment.player?.display_name ?? "Player",
                        )
                        .join(" · ")}
                    </strong>
                  </div>

                  {scrambleScore && (
                    <div className="vetScrambleCurrent">
                      Team HDCP {scrambleScore.team_handicap}
                      {" · "}
                      Net {scrambleScore.net_score}
                    </div>
                  )}

                  <div className="vetScrambleControls">
                    <label>
                      <span>Gross Team Score</span>

                      <input
                        type="number"
                        name="grossScore"
                        min="18"
                        max="200"
                        inputMode="numeric"
                        required
                        defaultValue={
                          scrambleScore?.gross_score ?? ""
                        }
                      />
                    </label>

                    <button
                      type="submit"
                      className="vetSaveScoreButton"
                    >
                      {scrambleScore ? "Update Score" : "Save Score"}
                    </button>
                  </div>
                </form>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
