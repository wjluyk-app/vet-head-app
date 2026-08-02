import Link from "next/link";
import TournamentSectionShell from "@/components/TournamentSectionShell";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFridayMatchesFromDatabase } from "@/lib/repositories/friday-db";
import { getSaturdayMatchesFromDatabase } from "@/lib/repositories/saturday-db";
import { getSundayDataFromDatabase } from "@/lib/repositories/sunday-db";
import { calculateFridayTournamentBoard } from "@/lib/friday-tournament-board";
import { calculateSaturdayTournamentBoard } from "@/lib/saturday-tournament-board";
import { calculateSundayTournamentBoard } from "@/lib/sunday-tournament-board";
import { calculateOverallTournamentBoard } from "@/lib/overall-tournament-board";
import { calculatePlayerAwards } from "@/lib/player-awards";

export const dynamic = "force-dynamic";

const money = (value: number) =>
  `$${value.toFixed(value % 1 === 0 ? 0 : 2)}`;

export default async function PrizeMoneyPage() {
  const supabase = createAdminClient();

  const [fridayMatches, saturdayMatches, sundayData] =
    await Promise.all([
      getFridayMatchesFromDatabase(supabase),
      getSaturdayMatchesFromDatabase(supabase),
      getSundayDataFromDatabase(supabase),
    ]);

  const friday = calculateFridayTournamentBoard(fridayMatches);
  const saturday = calculateSaturdayTournamentBoard(saturdayMatches);
  const sunday = calculateSundayTournamentBoard(sundayData);
  const overall = calculateOverallTournamentBoard(
    friday,
    saturday,
    sunday,
  );

  const playerAwards = calculatePlayerAwards(
    friday,
    saturday,
    sunday,
    overall,
  );

  const winningTeam =
    overall.winner === "LUKE"
      ? "Team Luke"
      : overall.winner === "SAM"
        ? "Team Sam"
        : overall.winner === "TIED"
          ? "Tournament tied"
          : null;

  const payoutSections = [
    {
      title: "Friday Field",
      amount: 450,
      description: friday.fieldComplete
        ? `${money(friday.fieldDistributed)} distributed · Front, back and total`
        : "Front $100/$50 · Back $100/$50 · Total $100/$50",
      status: friday.fieldComplete ? "Final" : "Live",
      href: "/results/friday",
    },
    {
      title: "Friday Skins",
      amount: 200,
      description: friday.fieldComplete
        ? `${friday.skins.length} validated skin${friday.skins.length === 1 ? "" : "s"} · ${money(friday.skinsDistributed)} distributed`
        : "Unique low NET score · Next-hole validation on Holes 1–17",
      status: friday.fieldComplete ? "Final" : "Live",
      href: "/results/friday",
    },
    {
      title: "Saturday Field",
      amount: 450,
      description: saturday.fieldComplete
        ? `${money(saturday.fieldDistributed)} distributed · Front, back and total`
        : "Front $100/$50 · Back $100/$50 · Total $100/$50",
      status: saturday.fieldComplete ? "Final" : "Pending",
      href: "/results/saturday",
    },
    {
      title: "Sunday Pinehurst",
      amount: 150,
      description: sunday.pinehurstFieldComplete
        ? `${money(sunday.pinehurstFieldDistributed)} distributed · 1st $100 · 2nd $50`
        : "Front nine field · 1st $100 · 2nd $50",
      status: sunday.pinehurstFieldComplete ? "Final" : "Pending",
      href: "/results/sunday",
    },
    {
      title: "Winning Team",
      amount: 480,
      description: winningTeam
        ? `${winningTeam} · $40 per player`
        : "$40 per player on the winning team",
      status: overall.complete ? "Final" : "Pending",
      href: "/scoreboard",
    },
    {
      title: "MVP",
      amount: 70,
      description: playerAwards.complete
        ? `${playerAwards.leaders
            .map((leader) => `${leader.player} (${leader.points} pts)`)
            .join(" / ")} · ${money(playerAwards.mvpPayoutEach)} each`
        : "Most points earned by a player on the winning team",
      status: playerAwards.complete ? "Final" : "Pending",
      href: "/final-results",
    },
  ];

  const competitiveDistributed =
    friday.moneyDistributed +
    saturday.moneyDistributed +
    sunday.pinehurstFieldDistributed;

  const totalDistributed =
    competitiveDistributed +
    (overall.complete ? 480 : 0) +
    (playerAwards.complete ? 70 : 0);

  return (
    <TournamentSectionShell
      eyebrow="RESULTS & MONEY"
      title="Prize Structure"
      description="What is available to win across daily field payouts, skins, team awards and MVP."
      status="Live"
    >
      <section className="prizeStructureIntro">
        <div>
          <span className="smallLabel">HOW TO READ THIS PAGE</span>
          <h2>Prize Structure vs. Final Payouts</h2>
          <p>
            Prize Structure shows what is available to win. Final Payouts shows
            what each player actually earned after all results are complete.
          </p>
        </div>

        <Link className="secondaryButton" href="/final-results">
          View Final Payouts
        </Link>
      </section>

      <section className="prizePoolHero">
        <div>
          <span className="smallLabel">TOTAL EVENT PRIZE POOL</span>
          <strong>$1,800</strong>
        </div>

        <div>
          <span>Currently Distributed</span>
          <strong>{money(totalDistributed)}</strong>
        </div>

        <div>
          <span>Points Awarded</span>
          <strong>
            {overall.totalPointsAwarded} / {overall.maximumPoints}
          </strong>
        </div>

        <div>
          <span>Unresolved</span>
          <strong>{money(1800 - totalDistributed)}</strong>
        </div>
      </section>

      <section className="prizeMoneyGrid">
        {payoutSections.map((item) => (
          <article className="prizeMoneyCard" key={item.title}>
            <div className="prizeMoneyCardTop">
              <div>
                <span className="smallLabel">{item.status}</span>
                <h2>{item.title}</h2>
              </div>

              <strong>${item.amount}</strong>
            </div>

            <p>{item.description}</p>

            <Link href={item.href}>
              {item.status === "Final"
                ? "View final payouts →"
                : "View tournament section →"}
            </Link>
          </article>
        ))}
      </section>

      <section className="prizeMoneyRules">
        <article>
          <span className="smallLabel">FIELD PAYOUTS</span>
          <h2>Friday and Saturday</h2>

          <div className="prizeMoneyBreakdown">
            <div>
              <span>Front Nine</span>
              <strong>$100 / $50</strong>
            </div>

            <div>
              <span>Back Nine</span>
              <strong>$100 / $50</strong>
            </div>

            <div>
              <span>Total</span>
              <strong>$100 / $50</strong>
            </div>
          </div>
        </article>

        <article>
          <span className="smallLabel">FRIDAY SKINS</span>
          <h2>Skin Validation Rule</h2>

          <p>
            A skin requires the unique lowest NET team score. Holes 1–17
            must be validated by NET par or better on the next hole.
            Hole 18 needs no validation. Tied lows do not pay.
          </p>
        </article>
      </section>
    </TournamentSectionShell>
  );
}
