import Link from "next/link";

export default function VetHeadPlayerGuidePage() {
  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">VET HEAD 2026</div>
        <h1>Player Guide</h1>
        <p>
          Formats, handicaps, scoring and championship rules for Vet Head.
        </p>
      </section>

      <section
        className="tournamentBoardSection"
        style={{ marginTop: 24 }}
      >
        <div className="boardSectionHeader">
          <div>
            <div className="smallLabel">FORMATS & HANDICAPS</div>
            <h2>How Scores Are Calculated</h2>
          </div>
        </div>

        <section className="grid">
          <article className="card">
            <div className="smallLabel">INDIVIDUAL + BEST BALL</div>
            <h3>Three Individual + Best Ball Rounds</h3>

            <p>
              Each player plays his own ball for all 18 holes.
            </p>

            <p>
              Course Handicap = Handicap Index × (Slope ÷ 113) +
              (Course Rating − Par), rounded to the nearest whole number.
            </p>

            <p>
              <strong>
                Individual Net = Gross Score − Course Handicap.
              </strong>
            </p>

            <p>
              Each player&apos;s individual net score is used for that
              day&apos;s low-net payout and is also added to his Thursday,
              Friday AM and Saturday AM totals for the 54-hole Vet Head MVP.
            </p>

            <p>
              <strong>Group Best Ball:</strong> Holes 1–9 use the
              2 best net scores of the 4 players on each hole. Holes 10–18
              use the 3 best net scores of the 4 players on each hole.
            </p>

            <p>
              The 18-hole Best Ball total determines the group&apos;s
              finish and Vet Head Points for that round.
            </p>

            <p>
              <strong>
                CH = Course Handicap · • = 1 stroke · •• = 2 strokes
              </strong>
            </p>
          </article>

          <article className="card">
            <div className="smallLabel">4-MAN SCRAMBLE</div>
            <h3>Two Scramble Rounds</h3>

            <p>
              The four unrounded Course Handicaps are ordered from
              lowest to highest.
            </p>

            <p>
              25% of lowest + 20% of second + 15% of third +
              10% of highest.
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
            <div className="smallLabel">VET HEAD POINTS</div>
            <h2>Five-Round Points Competition</h2>
          </div>
        </div>

        <article className="card">
          <div className="smallLabel">ROUND POINTS</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "10px 18px",
              alignItems: "center",
            }}
          >
            <strong>1st Place</strong>
            <strong>8 pts</strong>

            <strong>2nd Place</strong>
            <strong>6 pts</strong>

            <strong>3rd Place</strong>
            <strong>4 pts</strong>
          </div>
        </article>

        <article className="card" style={{ marginTop: 16 }}>
          <div className="smallLabel">TIES</div>
          <h3>How Points Are Split</h3>

          <p>
            Tied groups split the available point pools. A tie for
            first produces 7 / 7 / 4. A tie for second produces
            8 / 5 / 5. A three-way tie produces 6 / 6 / 6.
          </p>

          <p>
            Final Vet Head Points ties remain tied. Prize money for
            the occupied places is pooled and split evenly.
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
            Add each player&apos;s net score from Thursday,
            Friday morning and Saturday morning. Lowest
            54-hole net total wins.
          </p>

          <p>
            Ties in the 54-hole Vet Head MVP remain tied. Prize money
            for the occupied places is pooled and split evenly.
          </p>
        </article>
      </section>

      <section className="grid" style={{ marginTop: 24 }}>
        <Link className="card" href="/teams">
          <div className="smallLabel">TOURNAMENT</div>
          <h3>Pairings</h3>
          <p>See every group and scramble team.</p>
        </Link>

        <Link className="card" href="/schedule">
          <div className="smallLabel">TOURNAMENT</div>
          <h3>Schedule</h3>
          <p>Rounds, courses and tee times.</p>
        </Link>

        <Link className="card" href="/scoreboard">
          <div className="smallLabel">LIVE TOURNAMENT</div>
          <h3>Scoreboard</h3>
          <p>Round results and championship standings.</p>
        </Link>

        <Link className="card" href="/prize-money">
          <div className="smallLabel">PAYOUTS</div>
          <h3>Payouts</h3>
          <p>Prize structure and payout results.</p>
        </Link>
      </section>
    </main>
  );
}
