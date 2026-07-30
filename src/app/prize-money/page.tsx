import Link from "next/link";
import TournamentSectionShell from "@/components/TournamentSectionShell";

const payoutSections = [
  {
    title: "Friday Field",
    amount: 450,
    description: "Front $100/$50 · Back $100/$50 · Total $100/$50",
    status: "Live",
    href: "/results/friday",
  },
  {
    title: "Friday Skins",
    amount: 200,
    description: "Unique low NET score · Next-hole validation on Holes 1–17",
    status: "Live",
    href: "/results/friday",
  },
  {
    title: "Saturday Field",
    amount: 450,
    description: "Front $100/$50 · Back $100/$50 · Total $100/$50",
    status: "Pending",
    href: "/saturday",
  },
  {
    title: "Sunday Pinehurst",
    amount: 150,
    description: "Front nine only · 1st $100 · 2nd $50",
    status: "Pending",
    href: "/sunday",
  },
  {
    title: "Winning Team",
    amount: 480,
    description: "$40 per player on the winning team",
    status: "Pending",
    href: "/scoreboard",
  },
  {
    title: "MVP",
    amount: 70,
    description: "Most points earned by a player on the winning team",
    status: "Pending",
    href: "/final-results",
  },
];

export default function Page() {
  return (
    <TournamentSectionShell
      eyebrow="RESULTS & MONEY"
      title="Prize Money"
      description="Payout structure, daily winnings, skins and per-player payment totals."
      status="Available"
    >
      <section className="prizePoolHero">
        <div>
          <span className="smallLabel">TOTAL EVENT PRIZE POOL</span>
          <strong>$1,800</strong>
        </div>
        <div>
          <span>Friday</span>
          <strong>$650</strong>
        </div>
        <div>
          <span>Saturday</span>
          <strong>$450</strong>
        </div>
        <div>
          <span>Sunday + Team Awards</span>
          <strong>$700</strong>
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
              {item.status === "Live" ? "View current results →" : "View tournament section →"}
            </Link>
          </article>
        ))}
      </section>

      <section className="prizeMoneyRules">
        <article>
          <span className="smallLabel">FRIDAY FIELD</span>
          <h2>Field Payout Structure</h2>
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
            A skin requires the unique lowest NET team score. Holes 1–17 must be
            validated by NET par or better on the next hole. Hole 18 needs no
            validation. Tied lows do not pay.
          </p>
        </article>
      </section>

      <section className="prizeMoneySummary">
        <div>
          <span className="smallLabel">CURRENTLY LIVE</span>
          <h2>Friday Payouts</h2>
          <p>
            Friday field payouts and validated skins are calculated from the same
            NET team scores used for match play.
          </p>
        </div>

        <Link className="primaryButton" href="/results/friday">
          Open Friday Results
        </Link>
      </section>
    </TournamentSectionShell>
  );
}
