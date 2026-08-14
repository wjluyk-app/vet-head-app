import Link from "next/link";
import ConfirmClearScoreButton from "@/components/ConfirmClearScoreButton";
import { requireScoreEntryAccess } from "@/lib/auth/score-entry";
import { getVetHeadRoundEntryData } from "@/lib/repositories/vet-head-db";
import {
  clearScrambleScoreAction,
  saveScrambleScoreAction,
} from "./actions";
import HybridIndividualGroupForm from "./HybridIndividualGroupForm";

export const dynamic = "force-dynamic";

export default async function VetHeadRoundEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ roundId: string }>;
  searchParams: Promise<{
    focus?: string;
    complete?: string;
  }>;
}) {
  await requireScoreEntryAccess();

  const resolvedSearchParams = await searchParams;
  const focusGroupId = resolvedSearchParams.focus ?? null;
  const roundComplete = resolvedSearchParams.complete === "1";

  const {
  round,
  groups,
  assignments,
  individualHoleScores,
  scrambleScores,
} = await getVetHeadRoundEntryData((await params).roundId);

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
            ? "Enter gross scores hole-by-hole. Holes 1–9 count the 2 best net scores of 4; holes 10–18 count the 3 best net scores of 4."
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
            <article
              className="vetRoundGroupCard"
              id={`group-${group.id}`}
              key={group.id}
            >
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
            <HybridIndividualGroupForm
              roundId={round.id}
              roundGroupId={group.id}
              players={groupAssignments.map((assignment) => ({
                id: assignment.id,
                playerId: assignment.player_id,
                playerName:
                  assignment.player?.display_name ?? "Player",
                handicapIndex: Number(
                  assignment.player?.handicap_index ?? 0,
                ),
              }))}
              existingHoleScores={individualHoleScores.filter(
                (score) =>
                  groupAssignments.some(
                    (assignment) =>
                      assignment.player_id === score.player_id,
                  ),
              )}
              courseName={courseTee?.course_name ?? ""}
              slopeRating={Number(
                courseTee?.slope_rating ?? 0,
              )}
              courseRating={Number(
                courseTee?.course_rating ?? 0,
              )}
              par={Number(courseTee?.par ?? 72)}
            />
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
                        autoFocus={focusGroupId === group.id}
                      />
                    </label>

                    <button
                      type="submit"
                      className="vetSaveScoreButton"
                    >
                      {scrambleScore ? "UPDATE TEAM" : "SAVE TEAM"}
                    </button>

                    {scrambleScore && (
                      <ConfirmClearScoreButton
                        action={clearScrambleScoreAction}
                        label="CLEAR SCORE"
                        message="Clear this saved scramble score? This cannot be undone."
                      />
                    )}
                  </div>
                </form>
              )}
            </article>
          );
        })}
      </section>

      {roundComplete && (
        <section
          className="vetRoundComplete"
          id="round-complete"
        >
          <div className="smallLabel">ROUND COMPLETE</div>
          <h2>All groups have been saved.</h2>
          <p>
            You can review or update any score above, or return to the
            round list.
          </p>

          <Link className="vetBackButton" href="/score">
            Back to Rounds
          </Link>
        </section>
      )}
    </main>
  );
}
