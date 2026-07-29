import { signIn } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <section className="card loginCard">
      <h1>Private Cubby Cup Access</h1>
      <p>Approved administrators and scorekeepers can sign in below.</p>

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
