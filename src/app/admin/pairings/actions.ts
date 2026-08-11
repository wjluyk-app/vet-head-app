"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBillAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateVetHeadPairingRound(formData: FormData) {
  await requireBillAdmin();

  const roundId = String(formData.get("round_id") ?? "");

  if (!roundId) {
    throw new Error("Round id is required.");
  }

  const groups = [1, 2, 3].map((groupNumber) => {
    const groupId = String(
      formData.get(`group_${groupNumber}_id`) ?? "",
    );

    const playerIds = [1, 2, 3, 4].map((playerOrder) =>
      String(
        formData.get(
          `group_${groupNumber}_player_${playerOrder}_id`,
        ) ?? "",
      ),
    );

    return {
      groupNumber,
      groupId,
      playerIds,
    };
  });

  const groupIds = groups.map((group) => group.groupId);
  const allPlayerIds = groups.flatMap((group) => group.playerIds);

  if (groupIds.some((id) => !id)) {
    throw new Error("All three groups are required.");
  }

  if (new Set(groupIds).size !== 3) {
    throw new Error("Each round must contain three different groups.");
  }

  if (allPlayerIds.some((id) => !id)) {
    throw new Error("All 12 player positions are required.");
  }

  if (new Set(allPlayerIds).size !== 12) {
    throw new Error(
      "Each player must appear exactly once in the round. Check for a duplicate or missing player.",
    );
  }

  const supabase = createAdminClient();

  const { data: roundGroups, error: groupError } = await supabase
    .from("round_group")
    .select("id, round_id")
    .in("id", groupIds);

  if (groupError) {
    throw new Error(groupError.message);
  }

  if (
    !roundGroups ||
    roundGroups.length !== 3 ||
    roundGroups.some((group) => group.round_id !== roundId)
  ) {
    throw new Error(
      "Pairing groups do not all belong to the selected round.",
    );
  }

  const { data: existingAssignments, error: existingError } =
    await supabase
      .from("round_group_player")
      .select("round_group_id, player_id, player_order")
      .in("round_group_id", groupIds);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const assignments = groups.flatMap((group) =>
    group.playerIds.map((playerId, index) => ({
      round_group_id: group.groupId,
      player_id: playerId,
      player_order: index + 1,
    })),
  );

  const { error: deleteError } = await supabase
    .from("round_group_player")
    .delete()
    .in("round_group_id", groupIds);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const { error: insertError } = await supabase
    .from("round_group_player")
    .insert(assignments);

  if (insertError) {
    if (existingAssignments && existingAssignments.length > 0) {
      await supabase
        .from("round_group_player")
        .insert(existingAssignments);
    }

    throw new Error(
      `Pairings were not saved. Previous pairings were restored. ${insertError.message}`,
    );
  }

  revalidatePath("/admin/pairings");
  revalidatePath("/teams");
  revalidatePath("/schedule");
  revalidatePath("/score");
  revalidatePath("/scoreboard");

  redirect(`/admin/pairings?saved=${encodeURIComponent(roundId)}`);
}
