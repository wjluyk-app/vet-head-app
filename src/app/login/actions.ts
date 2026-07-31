"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isBillAdminEmail } from "@/lib/auth/admin";

export async function signIn(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=Email%20and%20password%20are%20required");
  }

  if (!isBillAdminEmail(email)) {
    redirect("/login?error=Administrator%20access%20required");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent("Incorrect email or password")}`);
  }

  redirect("/admin");
}


export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
