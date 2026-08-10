"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBillAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function saveTournamentIndexAction(formData: FormData) {
  await requireBillAdmin();

  const playerId = String(formData.get("playerId") ?? "");
  const averageScore = Number(formData.get("averageScore"));
  const courseRating = Number(formData.get("courseRating"));
  const slopeRating = Number(formData.get("slopeRating"));
  const par = Number(formData.get("par"));

  if (!playerId) {
    throw new Error("Select a player.");
  }

  if (
    !Number.isFinite(averageScore) ||
    !Number.isFinite(courseRating) ||
    !Number.isFinite(slopeRating) ||
    !Number.isFinite(par)
  ) {
    throw new Error("Average Score, Rating, Slope and Par are required.");
  }

  if (slopeRating < 55 || slopeRating > 155) {
    throw new Error("Slope Rating must be between 55 and 155.");
  }

  const estimatedIndexRaw =
    ((averageScore - courseRating) * 113) / slopeRating;

  const estimatedIndex =
    Math.round(estimatedIndexRaw * 10) / 10;

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("player")
    .update({
      handicap_index: estimatedIndex,
    })
    .eq("id", playerId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/players");
  revalidatePath("/admin/create-index");
  revalidatePath("/teams");
  revalidatePath("/scoreboard");

  redirect(
    `/admin/create-index?saved=1&index=${encodeURIComponent(
      estimatedIndex.toFixed(1),
    )}`,
  );
}
