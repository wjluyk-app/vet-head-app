"use server";

import { revalidatePath } from "next/cache";
import { requireBillAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateVetHeadPlayer(formData: FormData) {
  await requireBillAdmin();

  const id = String(formData.get("id") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const handicapIndex = Number(formData.get("handicap_index"));
  const active = String(formData.get("active") ?? "") === "true";

  if (!id) {
    throw new Error("Player id is required.");
  }

  if (!displayName) {
    throw new Error("Player name is required.");
  }

  if (!Number.isFinite(handicapIndex)) {
    throw new Error("Handicap Index must be a number.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("player")
    .update({
      display_name: displayName,
      handicap_index: handicapIndex,
      active,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/players");
  revalidatePath("/admin");
}
