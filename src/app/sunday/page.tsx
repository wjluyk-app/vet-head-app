import Link from "next/link";
import TournamentSectionShell from "@/components/TournamentSectionShell";
import { getBillAdminUser } from "@/lib/auth/admin";

export default async function SundayPage() {
  const adminUser = await getBillAdminUser();
  return (
    <TournamentSectionShell
      eyebrow="DAY 3 · MOUNTAIN COURSE"
      title="Sunday"
      description="Pinehurst, singles, final team score and tournament champions."
      status="Live"
    >
      <section className="sectionActionGrid">
        <Link className="sectionActionCard sectionActionPrimary" href="/scoreboard?day=sunday-pinehurst">
          <span>RESULTS</span>
          <h2>Sunday Live Scoreboard</h2>
          <p>Front-nine Pinehurst, back-nine singles and the final team score.</p>
          <strong>Open scoreboard →</strong>
        </Link>

        {adminUser && (
          <Link className="sectionActionCard" href="/score/sunday">
            <span>ADMIN</span>
            <h2>Sunday Score Entry</h2>
            <p>Enter Pinehurst team scores and Sunday singles results.</p>
            <strong>Open scoring →</strong>
          </Link>
        )}

        <Link className="sectionActionCard" href="/final-results">
          <span>CHAMPIONS</span>
          <h2>Final Payouts</h2>
          <p>Winning team, MVP and the complete player payment summary.</p>
          <strong>View final payouts →</strong>
        </Link>
      </section>

      <section className="sundayFormatGrid">
        <article>
          <span className="smallLabel">FRONT NINE</span>
          <h2>Pinehurst</h2>
          <strong>6 matches · 6 points</strong>
          <p>Both players tee off, swap balls, select the better second shot, then alternate until holed.</p>
        </article>

        <article>
          <span className="smallLabel">BACK NINE</span>
          <h2>Singles</h2>
          <strong>12 matches · 12 points</strong>
          <p>Singles begin immediately after each Pinehurst group completes the front nine.</p>
        </article>

        <article>
          <span className="smallLabel">TEE TIMES</span>
          <h2>10:50 AM–11:40 AM</h2>
          <strong>All groups start on Hole 1</strong>
          <p>Captains Luke and Sam play the final singles match.</p>
        </article>
      </section>
    </TournamentSectionShell>
  );
}
