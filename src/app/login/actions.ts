"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isBillAdminEmail } from "@/lib/auth/admin";

export async function signIn(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=Email%20and%20password%20are%20required");
  }

  const isAdmin = isBillAdminEmail(email);

  if (!isAdmin) {
    const admin = createAdminClient();

    const { data: scoreEntryUser, error: accessError } = await admin
      .from("score_entry_user")
      .select("id")
      .eq("email", email)
      .eq("active", true)
      .maybeSingle();

    if (accessError || !scoreEntryUser) {
      redirect("/login?error=Access%20not%20authorized");
    }
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent("Incorrect email or password")}`,
    );
  }

  redirect(isAdmin ? "/admin" : "/score");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
