import Link from "next/link";
import TournamentSectionShell from "@/components/TournamentSectionShell";
import { getBillAdminUser } from "@/lib/auth/admin";

export default async function SaturdayPage() {
  const adminUser = await getBillAdminUser();
  return (
    <TournamentSectionShell
      eyebrow="DAY 2 · BETSIE VALLEY"
      title="Saturday"
      description="Two-Man Scramble — match play, field competition, payouts and scoring."
      status="Available"
    >
      <section className="sectionActionGrid">
        <Link className="sectionActionCard sectionActionPrimary" href="/results/saturday">
          <span>RESULTS</span>
          <h2>Saturday Tournament Board</h2>
          <p>Match points, hole scores, field standings and leaders.</p>
          <strong>Open results →</strong>
        </Link>

        {adminUser && (
          <Link className="sectionActionCard" href="/score/saturday">
            <span>ADMIN</span>
            <h2>Saturday Score Entry</h2>
            <p>Enter or correct each team’s NET scramble score by hole.</p>
            <strong>Open scoring →</strong>
          </Link>
        )}

        <Link className="sectionActionCard" href="/prize-money">
          <span>MONEY</span>
          <h2>Saturday Payouts</h2>
          <p>Front, back, total and per-player payment summary.</p>
          <strong>Open prize money →</strong>
        </Link>
      </section>

      <section className="saturdayFormatCard">
        <div>
          <span className="smallLabel">FORMAT</span>
          <h2>18-Hole Two-Man Scramble</h2>
          <p>35% of the low handicap plus 15% of the high handicap.</p>
        </div>

        <div>
          <span className="smallLabel">TEE TIMES</span>
          <strong>11:20 AM–12:10 PM</strong>
          <p>All groups begin on Hole 1 at Betsie Valley.</p>
        </div>

        <div>
          <span className="smallLabel">POINTS</span>
          <strong>18</strong>
          <p>Front, back and total are worth one point in each of six matches.</p>
        </div>
      </section>
    </TournamentSectionShell>
  );
}
