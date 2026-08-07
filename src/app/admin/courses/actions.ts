"use server";

import { revalidatePath } from "next/cache";
import { requireBillAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateVetHeadCourse(formData: FormData) {
  await requireBillAdmin();

  const id = String(formData.get("id") ?? "");
  const courseName = String(formData.get("course_name") ?? "").trim();
  const teeName = String(formData.get("tee_name") ?? "").trim();
  const courseRating = Number(formData.get("course_rating"));
  const slopeRating = Number(formData.get("slope_rating"));
  const par = Number(formData.get("par"));

  if (!id) {
    throw new Error("Course / tee id is required.");
  }

  if (!courseName) {
    throw new Error("Course name is required.");
  }

  if (!teeName) {
    throw new Error("Tee name is required.");
  }

  if (!Number.isFinite(courseRating)) {
    throw new Error("Course Rating must be a number.");
  }

  if (!Number.isFinite(slopeRating)) {
    throw new Error("Slope must be a number.");
  }

  if (!Number.isFinite(par)) {
    throw new Error("Par must be a number.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("course_tee")
    .update({
      course_name: courseName,
      tee_name: teeName,
      course_rating: courseRating,
      slope_rating: slopeRating,
      par,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/courses");
  revalidatePath("/admin");
}
