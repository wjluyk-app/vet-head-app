"use server";

import { revalidatePath } from "next/cache";
import { requireBillAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateVetHeadRound(formData: FormData) {
  await requireBillAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const roundDate = String(formData.get("round_date") ?? "");
  const teeTime = String(formData.get("tee_time") ?? "");
  const format = String(formData.get("format") ?? "");
  const courseTeeId = String(formData.get("course_tee_id") ?? "");

  if (!id || !name || !roundDate || !teeTime || !courseTeeId) {
    throw new Error("All round fields are required.");
  }

  if (
    format !== "individual_net" &&
    format !== "four_man_scramble"
  ) {
    throw new Error("Invalid round format.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("tournament_round")
    .update({
      name,
      round_date: roundDate,
      tee_time: teeTime,
      format,
      course_tee_id: courseTeeId,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/rounds");
  revalidatePath("/schedule");
  revalidatePath("/admin");
}
