import { getBillAdminUser } from "@/lib/auth/admin";
import { getScoreEntryUser } from "@/lib/auth/score-entry";
import { signIn, signOut } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  const adminUser = await getBillAdminUser();

  if (adminUser) {
    return (
      <section className="card loginCard">
        <h1>Vet Head Account</h1>
        <p>Signed in as {adminUser.email} · Admin</p>

        <form action={signOut}>
          <button className="button" type="submit">
            Sign out
          </button>
        </form>
      </section>
    );
  }

  const scoreEntryAccess = await getScoreEntryUser();

  if (scoreEntryAccess) {
    return (
      <section className="card loginCard">
        <h1>Vet Head Account</h1>
        <p>
          Signed in as {scoreEntryAccess.user.email} · Score Entry
        </p>

        <form action={signOut}>
          <button className="button" type="submit">
            Sign out
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="card loginCard">
      <h1>Vet Head Sign In</h1>

      <p>
        Sign in with your authorized Admin or Score Entry account.
      </p>

      {params.error && (
        <div className="errorNotice">{params.error}</div>
      )}

      <form action={signIn}>
        <label>
          Email
          <input
            className="textInput"
            type="email"
            name="email"
            autoComplete="email"
            required
          />
        </label>

        <label>
          Password
          <input
            className="textInput"
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </label>

        <button className="button" type="submit">
          Sign in
        </button>
      </form>
    </section>
  );
}
