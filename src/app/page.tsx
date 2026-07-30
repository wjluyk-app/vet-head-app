import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <h1>Cubby Cup 2026</h1>
        <p>Private tournament-management prototype</p>
        <div className="grid">
          <div>
            <div className="kpi" style={{ color: "#e3b414" }}>8</div>
            <div>TEAM LUKE — Friday fixture</div>
          </div>
          <div>
            <div className="kpi" style={{ color: "white" }}>10</div>
            <div>TEAM SAM — Friday fixture</div>
          </div>
          <div>
            <div className="kpi" style={{ color: "#e3b414" }}>$650</div>
            <div>Friday money validation</div>
          </div>
        </div>
      </section>

      <section className="grid">
        <article className="card gold">
          <h2>Players Guide</h2>
          <p>12-page pre-tournament publication generated from approved setup data.</p>
          <span className="statusGood">Specification locked</span>
        </article>
        <article className="card">
          <h2>Friday scoring</h2>
          <p>Enter each two-man team’s NET score once, by hole.</p>
          <Link className="button" href="/score/friday">Open score entry</Link>
        </article>
        <article className="card gold">
          <h2>Friday live results</h2>
          <p>See every match, front/back/overall points and the Team Luke vs. Team Sam total.</p>
          <Link className="button" href="/results/friday">Open live scoreboard</Link>
        </article>
        <article className="card">
          <h2>Administration</h2>
          <p>Review setup, missing scores, reconciliation and publication readiness.</p>
          <Link className="button" href="/admin">Open dashboard</Link>
        </article>
      </section>
      <div className="notice">
        Prototype rule: team-format scores are already NET and are never handicapped again.
      </div>
    </>
  );
}
