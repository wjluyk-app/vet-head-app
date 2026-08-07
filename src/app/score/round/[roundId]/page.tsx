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

  return (
    <main className="pageShell">
      <section className="contentCard">
        <div className="eyebrow">VET HEAD 2026 · SCORE ENTRY</div>

        <h1>{round.name}</h1>

        <p className="lede">
          {round.format === "individual_net"
            ? "Enter each player’s final 18-hole gross score."
            : "Enter each team’s final 18-hole gross scramble score."}
        </p>

        <p className="muted">
          {courseTee?.course_name ?? "Course TBD"}
          {" · "}
          {courseTee?.tee_name ?? "Tees TBD"}
        </p>

        <Link href="/score">← Back to rounds</Link>
      </section>

      <section className="sectionBlock">
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
            <article className="contentCard" key={group.id}>
              <div className="eyebrow">
                GROUP {group.group_number}
              </div>

              <h2>
                {group.name || `Group ${group.group_number}`}
              </h2>

              {round.format === "individual_net" ? (
                <div>
                  {groupAssignments.map((assignment) => {
                    const existingScore = individualScores.find(
                      (score) => score.player_id === assignment.player_id,
                    );

                    return (
                      <form
                        action={saveIndividualScoreAction}
                        key={assignment.id}
                        className="scoreEntryRow"
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

                        <div>
                          <strong>
                            {assignment.player?.display_name ?? "Player"}
                          </strong>

                          <div className="muted">
                            HI {assignment.player?.handicap_index ?? "—"}
                          </div>
                        </div>

                        <input
                          type="number"
                          name="grossScore"
                          min="18"
                          max="200"
                          required
                          defaultValue={
                            existingScore?.gross_score ?? ""
                          }
                          aria-label={`Gross score for ${
                            assignment.player?.display_name ?? "player"
                          }`}
                        />

                        <button type="submit" className="button">
                          Save
                        </button>

                        {existingScore && (
                          <div className="muted">
                            CH {existingScore.course_handicap} · Net{" "}
                            {existingScore.net_score}
                          </div>
                        )}
                      </form>
                    );
                  })}
                </div>
              ) : (
                <form action={saveScrambleScoreAction}>
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

                  <p>
                    {groupAssignments
                      .map(
                        (assignment) =>
                          assignment.player?.display_name ?? "Player",
                      )
                      .join(" / ")}
                  </p>

                  <div className="scoreEntryRow">
                    <label>
                      <strong>Gross Score</strong>
                    </label>

                    <input
                      type="number"
                      name="grossScore"
                      min="18"
                      max="200"
                      required
                      defaultValue={
                        scrambleScore?.gross_score ?? ""
                      }
                    />

                    <button type="submit" className="button">
                      Save
                    </button>

                    {scrambleScore && (
                      <div className="muted">
                        Team HCP {scrambleScore.team_handicap} · Net{" "}
                        {scrambleScore.net_score}
                      </div>
                    )}
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
