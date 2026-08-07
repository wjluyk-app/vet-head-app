"use server";

import { revalidatePath } from "next/cache";
import { requireBillAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function saveScoreEntryUser(formData: FormData) {
  await requireBillAdmin();

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const displayName =
    String(formData.get("display_name") ?? "").trim() || null;

  const active =
    String(formData.get("active") ?? "true") === "true";

  if (!email) {
    throw new Error("Email is required.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("score_entry_user")
    .upsert(
      {
        email,
        display_name: displayName,
        active,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "email",
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/score-entry-users");
  revalidatePath("/admin");
}

export async function updateScoreEntryUser(formData: FormData) {
  await requireBillAdmin();

  const id = String(formData.get("id") ?? "");
  const displayName =
    String(formData.get("display_name") ?? "").trim() || null;

  const active =
    String(formData.get("active") ?? "true") === "true";

  if (!id) {
    throw new Error("Score Entry User id is required.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("score_entry_user")
    .update({
      display_name: displayName,
      active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/score-entry-users");
  revalidatePath("/admin");
}
