"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function sendMagicLink(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) redirect("/login?error=Email%20is%20required");

  const supabase = await createClient();
  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${baseUrl}/auth/callback`,
      shouldCreateUser: false,
    },
  });

  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}&at=${Date.now()}`);
  redirect("/login?sent=1");
}
