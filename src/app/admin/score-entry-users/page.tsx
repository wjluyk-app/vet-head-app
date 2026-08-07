import Link from "next/link";
import { requireBillAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  saveScoreEntryUser,
  updateScoreEntryUser,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function ScoreEntryUsersAdminPage() {
  await requireBillAdmin();

  const supabase = createAdminClient();

  const { data: users, error } = await supabase
    .from("score_entry_user")
    .select("id, email, display_name, active")
    .order("email");

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">VET HEAD ADMIN</div>
        <h1>Score Entry Users</h1>
        <p>
          Authorize limited users who may enter and correct scores.
          They do not receive tournament setup or Admin access.
        </p>
      </section>

      <section className="card" style={{ marginTop: 22 }}>
        <div className="smallLabel">ADD USER</div>
        <h2>Authorize Scorekeeper</h2>

        <form action={saveScoreEntryUser}>
          <label>
            Email
            <input
              className="textInput"
              type="email"
              name="email"
              required
            />
          </label>

          <label>
            Display Name
            <input
              className="textInput"
              type="text"
              name="display_name"
            />
          </label>

          <label>
            Active
            <select
              className="textInput"
              name="active"
              defaultValue="true"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <div style={{ marginTop: 16 }}>
            <button className="button" type="submit">
              Authorize Scorekeeper
            </button>
          </div>
        </form>
      </section>

      {(users ?? []).length > 0 ? (
        <section className="grid" style={{ marginTop: 22 }}>
          {(users ?? []).map((user) => (
            <form
              action={updateScoreEntryUser}
              className="card"
              key={user.id}
            >
              <input type="hidden" name="id" value={user.id} />

              <div className="smallLabel">SCORE ENTRY</div>
              <h3>{user.email}</h3>

              <label>
                Display Name
                <input
                  className="textInput"
                  type="text"
                  name="display_name"
                  defaultValue={user.display_name ?? ""}
                />
              </label>

              <label>
                Active
                <select
                  className="textInput"
                  name="active"
                  defaultValue={user.active ? "true" : "false"}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>

              <div style={{ marginTop: 16 }}>
                <button className="button" type="submit">
                  Save User
                </button>
              </div>
            </form>
          ))}
        </section>
      ) : (
        <section className="card" style={{ marginTop: 22 }}>
          <p>No additional Score Entry users are authorized yet.</p>
        </section>
      )}

      <div style={{ marginTop: 22 }}>
        <Link className="button" href="/admin">
          Back to Admin
        </Link>
      </div>
    </main>
  );
}
