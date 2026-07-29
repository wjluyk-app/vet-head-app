export default function AdminPage() {
  const checks = [
    ["Players imported", "24 / 24"],
    ["Friday pairings", "6 / 6"],
    ["Expected scorecards", "12"],
    ["Friday fixture", "Sam 10 — Luke 8"],
    ["Field payout pool", "$450"],
    ["Skins pool", "$200"],
    ["Friday money", "$650"],
    ["Players Guide", "12 pages"],
    ["Friday report", "5 pages"],
  ];

  return (
    <>
      <section className="hero">
        <h1>Administrator Dashboard</h1>
        <p>Phase 1 validation and publication control</p>
      </section>
      <section className="grid">
        {checks.map(([label, value]) => (
          <article className="card" key={label}>
            <h3>{label}</h3>
            <div className="kpi">{value}</div>
          </article>
        ))}
      </section>
    </>
  );
}
