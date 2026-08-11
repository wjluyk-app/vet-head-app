"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireScoreEntryAccess } from "@/lib/auth/score-entry";
import {
  clearVetHeadIndividualGroupScores,
  clearVetHeadScrambleScore,
  getVetHeadRoundEntryData,
  upsertVetHeadIndividualHoleScores,
  upsertVetHeadIndividualScore,
  upsertVetHeadScrambleScore,
} from "@/lib/repositories/vet-head-db";

export async function saveIndividualScoreAction(formData: FormData) {
  await requireScoreEntryAccess();

  const roundId = String(formData.get("roundId") ?? "");
  const playerId = String(formData.get("playerId") ?? "");
  const grossScore = Number(formData.get("grossScore"));

  if (!roundId || !playerId || !Number.isFinite(grossScore)) {
    throw new Error("Invalid individual score entry.");
  }

  const data = await getVetHeadRoundEntryData(roundId);

  const assignment = data.assignments.find(
    (item) => item.player_id === playerId,
  );

  if (!assignment?.player) {
    throw new Error("Player was not found in this round.");
  }

  const courseTee = Array.isArray(data.round.course_tee)
    ? data.round.course_tee[0]
    : data.round.course_tee;

  if (!courseTee) {
    throw new Error("Course and tee setup was not found.");
  }

  await upsertVetHeadIndividualScore({
    roundId,
    playerId,
    grossScore,
    handicapIndex: Number(assignment.player.handicap_index),
    slopeRating: Number(courseTee.slope_rating),
    courseRating: Number(courseTee.course_rating),
    par: Number(courseTee.par),
  });

  revalidatePath(`/score/round/${roundId}`);
}

export async function saveIndividualGroupAction(formData: FormData) {
  await requireScoreEntryAccess();

  const roundId = String(formData.get("roundId") ?? "");
  const roundGroupId = String(
    formData.get("roundGroupId") ?? "",
  );

  if (!roundId || !roundGroupId) {
    throw new Error(
      "Invalid individual group score entry.",
    );
  }

  const data = await getVetHeadRoundEntryData(roundId);

  const courseTee = Array.isArray(data.round.course_tee)
    ? data.round.course_tee[0]
    : data.round.course_tee;

  if (!courseTee) {
    throw new Error(
      "Course and tee setup was not found.",
    );
  }

  const groupAssignments = data.assignments
    .filter(
      (assignment) =>
        assignment.round_group_id === roundGroupId,
    )
    .sort(
      (a, b) =>
        a.player_order - b.player_order,
    );

  if (groupAssignments.length !== 4) {
    throw new Error(
      "Individual group must contain exactly four players.",
    );
  }

  for (const assignment of groupAssignments) {
    if (!assignment.player) {
      throw new Error(
        "A player was not found in this group.",
      );
    }

    const holes = Array.from(
      { length: 18 },
      (_, index) => {
        const holeNumber = index + 1;

        const grossScore = Number(
          formData.get(
            `grossScore_${assignment.player_id}_${holeNumber}`,
          ),
        );

        if (
          !Number.isInteger(grossScore) ||
          grossScore < 1 ||
          grossScore > 20
        ) {
          throw new Error(
            `Invalid hole ${holeNumber} score for ${assignment.player.display_name}.`,
          );
        }

        return {
          holeNumber,
          grossScore,
        };
      },
    );

    const grossScore = holes.reduce(
      (sum, hole) => sum + hole.grossScore,
      0,
    );

    await upsertVetHeadIndividualHoleScores({
      roundId,
      playerId: assignment.player_id,
      holes,
    });

    await upsertVetHeadIndividualScore({
      roundId,
      playerId: assignment.player_id,
      grossScore,
      handicapIndex: Number(
        assignment.player.handicap_index,
      ),
      slopeRating: Number(
        courseTee.slope_rating,
      ),
      courseRating: Number(
        courseTee.course_rating,
      ),
      par: Number(courseTee.par),
    });
  }

  revalidatePath(`/score/round/${roundId}`);
  revalidatePath("/scoreboard");
  revalidatePath("/payout-results");
  revalidatePath("/final-results");

  const orderedGroups = [...data.groups].sort(
    (a, b) => a.group_number - b.group_number,
  );

  const currentIndex = orderedGroups.findIndex(
    (group) => group.id === roundGroupId,
  );

  const nextGroup = orderedGroups[currentIndex + 1];

  if (nextGroup) {
    redirect(
      `/score/round/${roundId}?focus=${nextGroup.id}#group-${nextGroup.id}`,
    );
  }

  redirect(
    `/score/round/${roundId}?complete=1#round-complete`,
  );
}

export async function clearIndividualGroupAction(formData: FormData) {
  await requireScoreEntryAccess();

  const roundId = String(formData.get("roundId") ?? "");
  const roundGroupId = String(
    formData.get("roundGroupId") ?? "",
  );

  if (!roundId || !roundGroupId) {
    throw new Error(
      "Invalid individual group clear request.",
    );
  }

  const data = await getVetHeadRoundEntryData(roundId);

  const playerIds = data.assignments
    .filter(
      (assignment) =>
        assignment.round_group_id === roundGroupId,
    )
    .map((assignment) => assignment.player_id);

  if (playerIds.length !== 4) {
    throw new Error(
      "Individual group must contain exactly four players.",
    );
  }

  await clearVetHeadIndividualGroupScores({
    roundId,
    playerIds,
  });

  revalidatePath(`/score/round/${roundId}`);
  revalidatePath("/scoreboard");
  revalidatePath("/payout-results");
  revalidatePath("/final-results");

  redirect(
    `/score/round/${roundId}?focus=${roundGroupId}#group-${roundGroupId}`,
  );
}

export async function clearScrambleScoreAction(formData: FormData) {
  await requireScoreEntryAccess();

  const roundId = String(formData.get("roundId") ?? "");
  const roundGroupId = String(
    formData.get("roundGroupId") ?? "",
  );

  if (!roundId || !roundGroupId) {
    throw new Error("Invalid scramble clear request.");
  }

  await clearVetHeadScrambleScore({
    roundId,
    roundGroupId,
  });

  revalidatePath(`/score/round/${roundId}`);
  revalidatePath("/scoreboard");
  revalidatePath("/payout-results");
  revalidatePath("/final-results");

  redirect(
    `/score/round/${roundId}?focus=${roundGroupId}#group-${roundGroupId}`,
  );
}

export async function saveScrambleScoreAction(formData: FormData) {
  await requireScoreEntryAccess();

  const roundId = String(formData.get("roundId") ?? "");
  const roundGroupId = String(formData.get("roundGroupId") ?? "");
  const grossScore = Number(formData.get("grossScore"));

  if (!roundId || !roundGroupId || !Number.isFinite(grossScore)) {
    throw new Error("Invalid scramble score entry.");
  }

  const data = await getVetHeadRoundEntryData(roundId);

  const courseTee = Array.isArray(data.round.course_tee)
    ? data.round.course_tee[0]
    : data.round.course_tee;

  if (!courseTee) {
    throw new Error("Course and tee setup was not found.");
  }

  const teamAssignments = data.assignments.filter(
    (item) => item.round_group_id === roundGroupId,
  );

  if (teamAssignments.length !== 4) {
    throw new Error("Scramble team must contain exactly four players.");
  }

  await upsertVetHeadScrambleScore({
    roundId,
    roundGroupId,
    grossScore,
    players: teamAssignments.map((assignment) => ({
      handicapIndex: Number(assignment.player?.handicap_index),
      slopeRating: Number(courseTee.slope_rating),
      courseRating: Number(courseTee.course_rating),
      par: Number(courseTee.par),
    })),
  });

  revalidatePath(`/score/round/${roundId}`);

  const orderedGroups = [...data.groups].sort(
    (a, b) => a.group_number - b.group_number,
  );

  const currentIndex = orderedGroups.findIndex(
    (group) => group.id === roundGroupId,
  );

  const nextGroup = orderedGroups[currentIndex + 1];

  if (nextGroup) {
    redirect(
      `/score/round/${roundId}?focus=${nextGroup.id}#group-${nextGroup.id}`,
    );
  }

  redirect(
    `/score/round/${roundId}?complete=1#round-complete`,
  );
}
