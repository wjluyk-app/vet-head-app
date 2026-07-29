import { createClient } from "@supabase/supabase-js";

async function main(): Promise<void> {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) throw new Error("Usage: npm run bootstrap:admin -- you@example.com");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are missing.");

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (error && !error.message.toLowerCase().includes("already")) throw error;

  let userId = data.user?.id;
  if (!userId) {
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;
    userId = users.users.find((user) => user.email?.toLowerCase() === email)?.id;
  }
  if (!userId) throw new Error("Could not resolve the administrator user.");

  const { error: appError } = await supabase.from("app_user").upsert({
    id: userId,
    email,
    display_name: email.split("@")[0],
    role: "tournament_admin",
    active: true,
  });
  if (appError) throw appError;
  console.log(`Tournament administrator ready: ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
