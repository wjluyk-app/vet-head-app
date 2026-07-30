import Link from "next/link";
import TournamentSectionShell from "@/components/TournamentSectionShell";

export default function FridayPage() {
  return (
    <TournamentSectionShell
      eyebrow="DAY 1 · MOUNTAIN COURSE"
      title="Friday"
      description="One Best Ball of Two — live match play, field competition, skins and scoring."
      status="Live"
    >
      <section className="sectionActionGrid">
        <Link className="sectionActionCard sectionActionPrimary" href="/results/friday">
          <span>LIVE</span>
          <h2>Friday Tournament Board</h2>
          <p>Match points, hole scores, field standings, leaders and skins.</p>
          <strong>Open results →</strong>
        </Link>
        <Link className="sectionActionCard" href="/score/friday">
          <span>ADMIN</span>
          <h2>Friday Score Entry</h2>
          <p>Enter or correct each team’s NET score by hole.</p>
          <strong>Open scoring →</strong>
        </Link>
        <Link className="sectionActionCard" href="/prize-money">
          <span>MONEY</span>
          <h2>Friday Payouts</h2>
          <p>Front, back, total, skins and per-player payment summary.</p>
          <strong>Open prize money →</strong>
        </Link>
      </section>
    </TournamentSectionShell>
  );
}
