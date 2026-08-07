import Link from "next/link";
import { getVetHeadPublicTournamentData } from "@/lib/repositories/vet-head-public";

export const dynamic = "force-dynamic";

export default async function VetHeadPlayerGuidePage() {
  const data = await getVetHeadPublicTournamentData();

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">VET HEAD 2026</div>
        <h1>Player Guide</h1>
        <p>
          August 13–15, 2026 · 12 players · Five rounds · Two
          championships
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <div className="smallLabel">PLAYERS</div>
          <div className="kpi">12</div>
          <p>All players compete from the same tournament tees.</p>
        </article>

        <article className="card">
          <div className="smallLabel">ROUNDS</div>
          <div className="kpi">5</div>
          <p>Three Individual Net · Two 4-Man Scrambles</p>
        </article>

        <article className="card">
          <div className="smallLabel">PRIZE POOL</div>
          <div className="kpi">$1,200</div>
          <p>Round payouts plus both season-long championships.</p>
        </article>
      </section>

      <section
        className="tournamentBoardSection"
        style={{ marginTop: 24 }}
      >
        <div className="boardSectionHeader">
          <div>
            <div className="smallLabel">SCHEDULE</div>
            <h2>Five Tournament Rounds</h2>
          </div>
        </div>

        <section className="grid">
          {data.rounds.map((round) => {
            const time = String(round.tee_time).slice(0, 5);
            const [hourText, minute] = time.split(":");
            const hour = Number(hourText);
            const formattedTime = `${hour % 12 || 12}:${minute} ${
              hour >= 12 ? "PM" : "AM"
            }`;

            return (
              <article className="card" key={round.id}>
                <div className="smallLabel">
                  ROUND {round.round_number}
                </div>
                <h3>{round.name}</h3>
                <p>
                  <strong>{formattedTime}</strong>
                </p>
                <p>
                  {round.format === "four_man_scramble"
                    ? "4-Man Scramble"
                    : "Individual Net"}
                </p>
              </article>
            );
          })}
        </section>
      </section>

      <section
        className="tournamentBoardSection"
        style={{ marginTop: 24 }}
      >
        <div className="boardSectionHeader">
          <div>
            <div className="smallLabel">HANDICAPS</div>
            <h2>How Scores Are Calculated</h2>
          </div>
        </div>

        <section className="grid">
          <article className="card">
            <h3>Individual Net</h3>
            <p>
              Course Handicap = Handicap Index × (Slope ÷ 113) +
              (Course Rating − Par), rounded to the nearest whole
              number.
            </p>
            <p>
              <strong>Net Score = Gross Score − Course Handicap.</strong>
            </p>
          </article>

          <article className="card">
            <h3>4-Man Scramble</h3>
            <p>
              The four unrounded Course Handicaps are ordered lowest
              to highest.
            </p>
            <p>
              25% of lowest + 20% of second + 15% of third + 10% of
              highest.
            </p>
            <p>
              The resulting team handicap is rounded once at the end.
            </p>
          </article>
        </section>
      </section>

      <section
        className="tournamentBoardSection"
        style={{ marginTop: 24 }}
      >
        <div className="boardSectionHeader">
          <div>
            <div className="smallLabel">VET HEAD WINNERS</div>
            <h2>Five-Round Points Race</h2>
          </div>
        </div>

        <section className="grid">
          <article className="card">
            <div className="kpi">8</div>
            <p>Points to every player in the 1st-place group/team.</p>
          </article>

          <article className="card">
            <div className="kpi">6</div>
            <p>Points to every player in the 2nd-place group/team.</p>
          </article>

          <article className="card">
            <div className="kpi">4</div>
            <p>Points to every player in the 3rd-place group/team.</p>
          </article>
        </section>

        <article className="card" style={{ marginTop: 16 }}>
          <h3>Ties</h3>
          <p>
            Tied groups split the available point pools. A tie for
            first produces 7 / 7 / 4. A tie for second produces
            8 / 5 / 5. A three-way tie produces 6 / 6 / 6.
          </p>
          <p>
            Overall MVP ties are broken by most 1st-place finishes,
            then most 2nd-place finishes, then lowest Vet Head MVP
            54-hole total.
          </p>
        </article>
      </section>

      <section
        className="tournamentBoardSection"
        style={{ marginTop: 24 }}
      >
        <div className="boardSectionHeader">
          <div>
            <div className="smallLabel">VET HEAD MVP</div>
            <h2>54-Hole Individual Championship</h2>
          </div>
        </div>

        <article className="card">
          <p>
            Add each player&apos;s net score from Thursday, Friday
            morning and Saturday morning. Lowest 54-hole net total
            wins.
          </p>
          <p>
            Ties are broken by Saturday morning net, then Friday
            morning net, then Thursday net.
          </p>
        </article>
      </section>

      <section className="grid" style={{ marginTop: 24 }}>
        <Link className="card" href="/teams">
          <h3>Pairings</h3>
          <p>See every group and team.</p>
        </Link>

        <Link className="card" href="/schedule">
          <h3>Schedule</h3>
          <p>Dates, courses and tee times.</p>
        </Link>

        <Link className="card" href="/scoreboard">
          <h3>Scoreboard</h3>
          <p>Current standings and results.</p>
        </Link>

        <Link className="card" href="/prize-money">
          <h3>Payouts</h3>
          <p>Official $1,200 prize structure.</p>
        </Link>
      </section>
    </main>
  );
}
