type TeamMatch = {
  number: number;
  mead: string;
  meadPoints: number;
  roth: string;
  rothPoints: number;
};

const fridayMatches: TeamMatch[] = [
  { number: 1, mead: "Brian Mogg / Steve Chapman", meadPoints: 2, roth: "Curt Lichty / Steve Lovell", rothPoints: 1 },
  { number: 2, mead: "Randy Walls / George Hoodhood", meadPoints: 3, roth: "Bill Luyk / Paul DeJong", rothPoints: 0 },
  { number: 3, mead: "Joe Mead / Mike Stone", meadPoints: 1, roth: "Lou Bush / Jeremy Bainbridge", rothPoints: 2 },
  { number: 4, mead: "Mark Hammonds / Kurt Swardenski", meadPoints: 3, roth: "Dean Schuch / Steve Tedhams", rothPoints: 0 },
  { number: 5, mead: "Charlie Hiotas / Jim Norkus", meadPoints: 0, roth: "Nick Swardenski / Bruce Stone", rothPoints: 3 },
  { number: 6, mead: "Cohen Mead / Charlie Olszewski", meadPoints: 3, roth: "Mike Roth / Brian Walls", rothPoints: 0 },
];

const scrambleMatches: TeamMatch[] = [
  { number: 1, mead: "Charlie Hiotas / Kurt Swardenski", meadPoints: 0.5, roth: "Jeremy Bainbridge / Paul DeJong", rothPoints: 0.5 },
  { number: 2, mead: "Steve Chapman / Mark Hammonds", meadPoints: 1, roth: "Curt Lichty / Steve Tedhams", rothPoints: 0 },
  { number: 3, mead: "George Hoodhood / Jim Norkus", meadPoints: 0, roth: "Dean Schuch / Lou Bush", rothPoints: 1 },
  { number: 4, mead: "Brian Mogg / Joe Mead", meadPoints: 1, roth: "Steve Lovell / Bruce Stone", rothPoints: 0 },
  { number: 5, mead: "Charlie Olszewski / Mike Stone", meadPoints: 0, roth: "Nick Schaut / Nick Swardenski", rothPoints: 1 },
  { number: 6, mead: "Randy Walls / Cohen Mead", meadPoints: 1, roth: "Bill Luyk / Mike Roth", rothPoints: 0 },
];

const singles = [
  ["Kurt Swardenski", 1, "Paul DeJong", 0],
  ["Charlie Hiotas", 0, "Jeremy Bainbridge", 1],
  ["Steve Chapman", 0, "Curt Lichty", 1],
  ["Mark Hammonds", 0.5, "Steve Tedhams", 0.5],
  ["George Hoodhood", 1, "Dean Schuch", 0],
  ["Jim Norkus", 0, "Lou Bush", 1],
  ["Brian Mogg", 0, "Steve Lovell", 1],
  ["Joe Mead", 0, "Bruce Stone", 1],
  ["Charlie Olszewski", 0, "Nick Swardenski", 1],
  ["Mike Stone", 1, "Nick Schaut", 0],
  ["Randy Walls", 1, "Bill Luyk", 0],
  ["Cohen Mead", 0, "Mike Roth", 1],
] as const;

function point(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
}

function MatchTable({ matches }: { matches: TeamMatch[] }) {
  return (
    <div className="archiveTableWrap">
      <table className="archiveMatchTable">
        <thead>
          <tr>
            <th>Match</th>
            <th>Team Mead</th>
            <th>Pts</th>
            <th>Team Roth</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr key={match.number}>
              <td>{match.number}</td>
              <td>{match.mead}</td>
              <td>{point(match.meadPoints)}</td>
              <td>{match.roth}</td>
              <td>{point(match.rothPoints)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Archive2021Page() {
  return (
    <>
      <section className="archiveHero">
        <div>
          <div className="smallLabel">VERIFIED HISTORICAL RECORD</div>
          <h1>2021 Cubby Cup</h1>
          <p>Cohen Mead vs. Mike Roth</p>
        </div>

        <div className="archiveChampion">
          <span>CHAMPION</span>
          <strong>Team Mead</strong>
          <small>20–16</small>
        </div>
      </section>

      <section className="archiveProgress">
        <article>
          <span>FRIDAY</span>
          <strong>12–6</strong>
          <small>Team Mead</small>
        </article>
        <article>
          <span>SATURDAY SCRAMBLE</span>
          <strong>3.5–2.5</strong>
          <small>Team Mead</small>
        </article>
        <article>
          <span>ENTERING SINGLES</span>
          <strong>15.5–8.5</strong>
          <small>Team Mead</small>
        </article>
        <article>
          <span>SINGLES</span>
          <strong>7.5–4.5</strong>
          <small>Team Roth</small>
        </article>
        <article className="archiveProgressFinal">
          <span>FINAL</span>
          <strong>20–16</strong>
          <small>Team Mead</small>
        </article>
      </section>

      <section className="archiveDaySection">
        <header>
          <div>
            <div className="smallLabel">FRIDAY · AUGUST 27, 2021</div>
            <h2>Day 1</h2>
            <p>18 holes · One Best Ball of Two</p>
          </div>
          <div className="archiveDayScore">
            <span>ROTH 6</span>
            <strong>MEAD 12</strong>
          </div>
        </header>
        <MatchTable matches={fridayMatches} />
      </section>

      <section className="archiveDaySection">
        <header>
          <div>
            <div className="smallLabel">SATURDAY · AUGUST 28, 2021</div>
            <h2>Nine-Hole Scramble</h2>
            <p>Six two-man matches</p>
          </div>
          <div className="archiveDayScore">
            <span>ROTH 2.5</span>
            <strong>MEAD 3.5</strong>
          </div>
        </header>
        <MatchTable matches={scrambleMatches} />
      </section>

      <section className="archiveDaySection">
        <header>
          <div>
            <div className="smallLabel">SATURDAY · AUGUST 28, 2021</div>
            <h2>Singles</h2>
            <p>Twelve individual match-play matches</p>
          </div>
          <div className="archiveDayScore">
            <span>MEAD 4.5</span>
            <strong>ROTH 7.5</strong>
          </div>
        </header>

        <div className="archiveTableWrap">
          <table className="archiveMatchTable">
            <thead>
              <tr>
                <th>Match</th>
                <th>Team Mead</th>
                <th>Pts</th>
                <th>Team Roth</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {singles.map(([mead, meadPoints, roth, rothPoints], index) => (
                <tr key={`${mead}:${roth}`}>
                  <td>{index + 1}</td>
                  <td>{mead}</td>
                  <td>{point(meadPoints)}</td>
                  <td>{roth}</td>
                  <td>{point(rothPoints)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="archiveAwardsSection">
        <div className="archiveSectionHeading">
          <div className="smallLabel">HISTORICAL RECORD</div>
          <h2>Awards and Payouts</h2>
          <p>
            No MVP, skins, field-payout, or individual-payout record was visible
            in the surviving 2021 tournament boards.
          </p>
        </div>
      </section>

      <div className="archiveSourceNote">
        Verified historical record reconstructed from the three surviving 2021
        tournament boards.
      </div>
    </>
  );
}
