"use server";

import { revalidatePath } from "next/cache";
import { requireBillAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateVetHeadPairingGroup(formData: FormData) {
  await requireBillAdmin();

  const groupId = String(formData.get("group_id") ?? "");

  const playerIds = [1, 2, 3, 4].map((order) =>
    String(formData.get(`player_${order}_id`) ?? ""),
  );

  if (!groupId) {
    throw new Error("Group id is required.");
  }

  if (playerIds.some((id) => !id)) {
    throw new Error("All four player positions are required.");
  }

  if (new Set(playerIds).size !== 4) {
    throw new Error("A player cannot appear twice in the same group.");
  }

  const supabase = createAdminClient();

  const { error: deleteError } = await supabase
    .from("round_group_player")
    .delete()
    .eq("round_group_id", groupId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const assignments = playerIds.map((playerId, index) => ({
    round_group_id: groupId,
    player_id: playerId,
    player_order: index + 1,
  }));

  const { error: insertError } = await supabase
    .from("round_group_player")
    .insert(assignments);

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath("/admin/pairings");
  revalidatePath("/teams");
  revalidatePath("/schedule");
  revalidatePath("/score");
}
