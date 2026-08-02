import Link from "next/link";
import TournamentSectionShell from "@/components/TournamentSectionShell";
import { getBillAdminUser } from "@/lib/auth/admin";

export default async function FridayPage() {
  const adminUser = await getBillAdminUser();
  return (
    <TournamentSectionShell
      eyebrow="DAY 1 · MOUNTAIN COURSE"
      title="Friday"
      description="1 Best Ball of 2 — match play, field competition, skins and results."
      status="Live"
    >
      <section className="sectionActionGrid">
        <Link className="sectionActionCard sectionActionPrimary" href="/results/friday">
          <span>LIVE</span>
          <h2>Friday Tournament Board</h2>
          <p>Match points, hole scores, field standings, leaders and skins.</p>
          <strong>Open results →</strong>
        </Link>
        {adminUser && (
          <Link className="sectionActionCard" href="/score/friday">
            <span>ADMIN</span>
            <h2>Friday Score Entry</h2>
            <p>Enter or correct each team’s NET score by hole.</p>
            <strong>Open scoring →</strong>
          </Link>
        )}
        <Link className="sectionActionCard" href="/prize-money">
          <span>MONEY</span>
          <h2>Friday Prize Structure</h2>
          <p>Front, back, total and skins awards available on Friday.</p>
          <strong>View Friday prize structure →</strong>
        </Link>
      </section>
    </TournamentSectionShell>
  );
}
