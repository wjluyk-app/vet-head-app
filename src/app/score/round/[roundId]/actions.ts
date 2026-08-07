"use server";

import { revalidatePath } from "next/cache";
import { requireScoreEntryAccess } from "@/lib/auth/score-entry";
import {
  getVetHeadRoundEntryData,
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
}
