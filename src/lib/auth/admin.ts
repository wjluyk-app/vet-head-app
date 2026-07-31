import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const BILL_ADMIN_EMAIL = "wjluyk@gmail.com";

export function isBillAdminEmail(
  email: string | null | undefined,
): boolean {
  return email?.trim().toLowerCase() === BILL_ADMIN_EMAIL;
}

export async function getBillAdminUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user || !isBillAdminEmail(data.user.email)) {
    return null;
  }

  return data.user;
}

export async function requireBillAdmin() {
  const user = await getBillAdminUser();

  if (!user) {
    redirect("/login?error=Administrator%20access%20required");
  }

  return user;
}
