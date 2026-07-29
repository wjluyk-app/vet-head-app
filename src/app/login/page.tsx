"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  return (
    <section className="card loginCard">
      <h1>Private Access</h1>
      <p>Use an approved Cubby Cup email address.</p>
      <label>
        Email
        <input
          className="textInput"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
        />
      </label>
      <button
        className="button"
        type="button"
        onClick={() => alert(`Prototype login request for ${email}`)}
      >
        Send secure sign-in link
      </button>
      <div className="notice">
        Production login will use Supabase Auth and role-based permissions.
      </div>
    </section>
  );
}
