import { sendMagicLink } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string; at?: string }>;
}) {
  const params = await searchParams;
  return (
    <section className="card loginCard">
      <h1>Private Cubby Cup Access</h1>
      <p>Approved administrators and scorekeepers receive a secure sign-in link by email.</p>
      {params.sent === "1" && (
        <div className="notice">Check your email for the secure Cubby Cup sign-in link.</div>
      )}
      {params.error && params.at && Date.now() - Number(params.at) < 60000 && <div className="errorNotice">{params.error}</div>}
      <form action={sendMagicLink}>
        <label>
          Email
          <input className="textInput" type="email" name="email" required />
        </label>
        <button className="button" type="submit">Send secure sign-in link</button>
      </form>
    </section>
  );
}
