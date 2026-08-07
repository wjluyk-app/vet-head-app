"use server";

import { revalidatePath } from "next/cache";
import { requireBillAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateVetHeadPayout(formData: FormData) {
  await requireBillAdmin();

  const id = String(formData.get("id") ?? "");
  const competition = String(formData.get("competition") ?? "").trim();
  const place = String(formData.get("place") ?? "").trim();
  const recipientType = String(
    formData.get("recipient_type") ?? "",
  ).trim();

  const amountPerRecipient = Number(
    formData.get("amount_per_recipient"),
  );

  const recipients = Number(formData.get("recipients"));
  const totalPayout = Number(formData.get("total_payout"));

  if (!id) {
    throw new Error("Payout id is required.");
  }

  if (!competition || !place || !recipientType) {
    throw new Error("Competition, place and recipient type are required.");
  }

  if (
    !Number.isFinite(amountPerRecipient) ||
    !Number.isFinite(recipients) ||
    !Number.isFinite(totalPayout)
  ) {
    throw new Error("Payout amounts must be valid numbers.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("prize_payout")
    .update({
      competition,
      place,
      recipient_type: recipientType,
      amount_per_recipient: amountPerRecipient,
      recipients,
      total_payout: totalPayout,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/payouts");
  revalidatePath("/prize-money");
  revalidatePath("/admin");
}
