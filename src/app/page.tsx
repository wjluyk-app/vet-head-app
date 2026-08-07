import Link from "next/link";

export const dynamic = "force-dynamic";

const sections = [
  {
    title: "Pairings",
    description: "See all five predetermined groups and team assignments.",
    href: "/teams",
    action: "View pairings →",
  },
  {
    title: "Schedule",
    description: "Rounds, dates, start times, formats and course information.",
    href: "/schedule",
    action: "View schedule →",
  },
  {
    title: "Scoreboard",
    description: "Round results, Vet Head Winners points and Vet Head MVP standings.",
    href: "/scoreboard",
    action: "Open Scoreboard →",
    featured: true,
  },
  {
    title: "Player Guide",
    description: "Formats, handicap rules, scoring and championship structure.",
    href: "/player-guide",
    action: "Read Player Guide →",
  },
  {
    title: "Payouts",
    description: "Official $1,200 Vet Head prize structure.",
    href: "/prize-money",
    action: "View payouts →",
  },
  {
    title: "Final Results",
    description: "Champions and final standings when the tournament is complete.",
    href: "/final-results",
    action: "View final results →",
  },
];

export default function HomePage() {
  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">AUGUST 13–15, 2026</div>
        <h1>Vet Head Tournament Hub</h1>
        <p>
          One home for pairings, tee times, scoring, Vet Head Winners
          points, Vet Head MVP standings and payouts.
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <div className="smallLabel">PLAYERS</div>
          <div className="kpi">12</div>
          <p>One field · Same tees</p>
        </article>

        <article className="card">
          <div className="smallLabel">ROUNDS</div>
          <div className="kpi">5</div>
          <p>Three individual · Two scramble</p>
        </article>

        <article className="card">
          <div className="smallLabel">PRIZE POOL</div>
          <div className="kpi">$1,200</div>
          <p>Round payouts + Vet Head Winners + Vet Head MVP</p>
        </article>
      </section>

      <section
        className="tournamentBoardSection"
        style={{ marginTop: 24 }}
      >
        <div className="boardSectionHeader">
          <div>
            <div className="smallLabel">START HERE</div>
            <h2>Tournament Weekend</h2>
            <p>Thursday through Saturday · Five rounds</p>
          </div>
        </div>

        <section className="grid">
          <article className="card">
            <div className="smallLabel">THURSDAY · ROUND 1</div>
            <h3>Individual Net</h3>
            <div className="kpi">1:20 PM</div>
            <Link className="button" href="/thursday">
              Thursday
            </Link>
          </article>

          <article className="card">
            <div className="smallLabel">FRIDAY · ROUNDS 2 & 3</div>
            <h3>Individual + 4-Man Scramble</h3>
            <div className="kpi">9:00 / 3:20</div>
            <Link className="button" href="/friday">
              Friday
            </Link>
          </article>

          <article className="card">
            <div className="smallLabel">SATURDAY · ROUNDS 4 & 5</div>
            <h3>Individual + 4-Man Scramble</h3>
            <div className="kpi">9:10 / 2:50</div>
            <Link className="button" href="/saturday">
              Saturday
            </Link>
          </article>
        </section>
      </section>

      <section
        className="grid"
        style={{ marginTop: 24 }}
      >
        {sections.map((item) => (
          <article className="card" key={item.href}>
            <div className="smallLabel">
              {item.featured ? "LIVE TOURNAMENT" : "VET HEAD 2026"}
            </div>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <Link className="button" href={item.href}>
              {item.action}
            </Link>
          </article>
        ))}
      </section>

      <section
        className="card"
        style={{ marginTop: 24 }}
      >
        <div className="smallLabel">SCORING</div>
        <h2>Two Championships</h2>
        <p>
          <strong>Vet Head Winners:</strong> points earned from group
          finishes across all five rounds.
        </p>
        <p>
          <strong>Vet Head MVP:</strong> lowest combined net score from
          Thursday, Friday morning and Saturday morning.
        </p>
      </section>
    </main>
  );
}
