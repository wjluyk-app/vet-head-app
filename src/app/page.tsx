import Link from "next/link";
import { getVetHeadPublicTournamentData } from "@/lib/repositories/vet-head-public";

export const dynamic = "force-dynamic";

function formatTeeTime(value: string) {
  const [hourText, minute] = String(value).slice(0, 5).split(":");
  const hour = Number(hourText);

  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
}

const sections = [
  {
    title: "Pairings",
    description: "See all five predetermined groups and team assignments.",
    href: "/teams",
    action: "View pairings →",
  },
  {
    title: "Players",
    description: "USGA Handicap Index and Course Handicap for each course.",
    href: "/players",
    action: "View players →",
  },
  {
    title: "Schedule",
    description: "Rounds, dates, start times, formats and course information.",
    href: "/schedule",
    action: "View schedule →",
  },
  {
    title: "Scoreboard",
    description: "Round results, Vet Head Points and Vet Head MVP standings.",
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

export default async function HomePage() {
  const data = await getVetHeadPublicTournamentData();

  const round1 = data.rounds.find((round) => round.round_number === 1);
  const round2 = data.rounds.find((round) => round.round_number === 2);
  const round3 = data.rounds.find((round) => round.round_number === 3);
  const round4 = data.rounds.find((round) => round.round_number === 4);
  const round5 = data.rounds.find((round) => round.round_number === 5);

  if (!round1 || !round2 || !round3 || !round4 || !round5) {
    throw new Error("Vet Head tournament rounds are incomplete.");
  }

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel heroDate">AUGUST 13–15, 2026</div>
        <h1>Vet Head Tournament Hub</h1>
        <p>
          One home for pairings, tee times, scoring, Vet Head Points,
          Vet Head MVP standings and payouts.
        </p>
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
            <h3>Individual + Best Ball</h3>
            <div className="kpi">{formatTeeTime(round1.tee_time)}</div>
            <Link className="button" href="/thursday">
              Thursday
            </Link>
          </article>

          <article className="card">
            <div className="smallLabel">FRIDAY · ROUNDS 2 & 3</div>
            <h3>Individual + 4-Man Scramble</h3>
            <div className="kpi">
              {formatTeeTime(round2.tee_time)} / {formatTeeTime(round3.tee_time)}
            </div>
            <Link className="button" href="/friday">
              Friday
            </Link>
          </article>

          <article className="card">
            <div className="smallLabel">SATURDAY · ROUNDS 4 & 5</div>
            <h3>Individual + 4-Man Scramble</h3>
            <div className="kpi">
              {formatTeeTime(round4.tee_time)} / {formatTeeTime(round5.tee_time)}
            </div>
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

    </main>
  );
}
