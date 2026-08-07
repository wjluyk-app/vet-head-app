import { redirect } from "next/navigation";
import { isBillAdminEmail } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function getScoreEntryUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user?.email) {
    return null;
  }

  if (isBillAdminEmail(data.user.email)) {
    return {
      user: data.user,
      role: "admin" as const,
    };
  }

  const admin = createAdminClient();

  const { data: scoreEntryUser, error: accessError } = await admin
    .from("score_entry_user")
    .select("id, email, display_name, active")
    .eq("email", data.user.email.trim().toLowerCase())
    .eq("active", true)
    .maybeSingle();

  if (accessError || !scoreEntryUser) {
    return null;
  }

  return {
    user: data.user,
    role: "score_entry" as const,
    scoreEntryUser,
  };
}

export async function requireScoreEntryAccess() {
  const access = await getScoreEntryUser();

  if (!access) {
    redirect("/login?error=Score%20entry%20access%20required");
  }

  return access;
}
