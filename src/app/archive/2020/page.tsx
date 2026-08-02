type TeamMatch = {
  number: number;
  walls: string;
  wallsPoints: number;
  bones: string;
  bonesPoints: number;
};

const fridayMatches: TeamMatch[] = [
  {
    number: 1,
    walls: "Curty / Mike Roth",
    wallsPoints: 2,
    bones: "R. Mead / Bruce Stone",
    bonesPoints: 1,
  },
  {
    number: 2,
    walls: "Chas / Jeremy Bainbridge",
    wallsPoints: 2,
    bones: "Joe Mead / Nick Swardenski",
    bonesPoints: 1,
  },
  {
    number: 3,
    walls: "Cohen Mead / George Hoodhood",
    wallsPoints: 0,
    bones: "Bill Luyk / Nick Schaut",
    bonesPoints: 3,
  },
  {
    number: 4,
    walls: "Brian Walls / Kurt Swardenski",
    wallsPoints: 2.5,
    bones: "Lou Bush / Mike Stone",
    bonesPoints: 0.5,
  },
  {
    number: 5,
    walls: "Randy Walls / Brian Mogg",
    wallsPoints: 2.5,
    bones: "Steve Tedhams / Steve Chapman",
    bonesPoints: 0.5,
  },
];

const saturdayMatches: TeamMatch[] = [
  {
    number: 1,
    walls: "Mike Roth / Jeremy Bainbridge",
    wallsPoints: 1,
    bones: "Lou Bush / Bruce Stone",
    bonesPoints: 2,
  },
  {
    number: 2,
    walls: "Randy Walls / Chas",
    wallsPoints: 3,
    bones: "Joe Mead / Nick Schaut",
    bonesPoints: 0,
  },
  {
    number: 3,
    walls: "Cohen Mead / Brian Mogg",
    wallsPoints: 1,
    bones: "Steve Chapman / Nick Swardenski",
    bonesPoints: 2,
  },
  {
    number: 4,
    walls: "Kurt Swardenski / George Hoodhood",
    wallsPoints: 0,
    bones: "P. Mead / Mike Stone",
    bonesPoints: 3,
  },
  {
    number: 5,
    walls: "Curty / Brian Walls",
    wallsPoints: 0,
    bones: "Bill Luyk / Steve Tedhams",
    bonesPoints: 3,
  },
];

const sundayScramble: TeamMatch[] = [
  {
    number: 1,
    walls: "Curty / George Hoodhood",
    wallsPoints: 1,
    bones: "R. Mead / Joe Mead",
    bonesPoints: 0,
  },
  {
    number: 2,
    walls: "Cohen Mead / Kurt Swardenski",
    wallsPoints: 1,
    bones: "Bruce Stone / Nick Schaut",
    bonesPoints: 0,
  },
  {
    number: 3,
    walls: "Brian Walls / Jeremy Bainbridge",
    wallsPoints: 1,
    bones: "Steve Chapman / Nick Swardenski",
    bonesPoints: 0,
  },
  {
    number: 4,
    walls: "Brian Mogg / Chas",
    wallsPoints: 0,
    bones: "Lou Bush / Mike Stone",
    bonesPoints: 1,
  },
];

const singles = [
  ["Curty", 0, "R. Mead", 1],
  ["George Hoodhood", 1, "Joe Mead", 0],
  ["Kurt Swardenski", 1, "Bruce Stone", 0],
  ["Cohen Mead", 0, "Nick Schaut", 1],
  ["Brian Walls", 0, "Steve Chapman", 1],
  ["Jeremy Bainbridge", 0, "Nick Swardenski", 1],
  ["Chas", 1, "Mike Stone", 0],
  ["Brian Mogg", 1, "Lou Bush", 0],
  ["Mike Roth", 0, "Steve Tedhams", 1],
  ["Randy Walls", 0, "Bill Luyk", 1],
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
            <th>Team Walls</th>
            <th>Pts</th>
            <th>Team Luyk</th>
            <th>Pts</th>
          </tr>
        </thead>

        <tbody>
          {matches.map((match) => (
            <tr key={match.number}>
              <td>{match.number}</td>
              <td>{match.walls}</td>
              <td>{point(match.wallsPoints)}</td>
              <td>{match.bones}</td>
              <td>{point(match.bonesPoints)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Archive2020Page() {
  return (
    <>
      <section className="archiveHero">
        <div>
          <div className="smallLabel">MOSTLY VERIFIED HISTORICAL RECORD</div>
          <h1>2020 Cubby Cup</h1>
          <p>Randy Walls vs. Bill Luyk</p>
        </div>

        <div className="archiveChampion">
          <span>CHAMPION</span>
          <strong>Team Luyk</strong>
          <small>23.5–21.5</small>
        </div>
      </section>

      <section className="archiveProgress">
        <article>
          <span>FRIDAY</span>
          <strong>9–6</strong>
          <small>Team Walls</small>
        </article>

        <article>
          <span>SATURDAY AUDI</span>
          <strong>10–5</strong>
          <small>Team Luyk</small>
        </article>

        <article>
          <span>SUNDAY SCRAMBLE</span>
          <strong>3.5–1.5</strong>
          <small>Team Walls</small>
        </article>

        <article>
          <span>SUNDAY SINGLES</span>
          <strong>6–4</strong>
          <small>Team Luyk</small>
        </article>

        <article className="archiveProgressFinal">
          <span>FINAL</span>
          <strong>23.5–21.5</strong>
          <small>Team Luyk</small>
        </article>
      </section>

      <section className="archiveDaySection">
        <header>
          <div>
            <div className="smallLabel">FRIDAY · SEPTEMBER 25, 2020</div>
            <h2>Two Best of Two</h2>
            <p>Five two-man matches · Three points per match</p>
          </div>

          <div className="archiveDayScore">
            <span>LUYK 6</span>
            <strong>WALLS 9</strong>
          </div>
        </header>

        <MatchTable matches={fridayMatches} />
      </section>

      <section className="archiveDaySection">
        <header>
          <div>
            <div className="smallLabel">SATURDAY · SEPTEMBER 26, 2020</div>
            <h2>Audi Format</h2>
            <p>Five team matches</p>
          </div>

          <div className="archiveDayScore">
            <span>WALLS 5</span>
            <strong>LUYK 10</strong>
          </div>
        </header>

        <MatchTable matches={saturdayMatches} />
      </section>

      <section className="archiveDaySection">
        <header>
          <div>
            <div className="smallLabel">SUNDAY · SEPTEMBER 27, 2020</div>
            <h2>Nine-Hole Scramble</h2>
            <p>Five two-man matches</p>
          </div>

          <div className="archiveDayScore">
            <span>LUYK 1.5</span>
            <strong>WALLS 3.5</strong>
          </div>
        </header>

        <MatchTable matches={sundayScramble} />

        <div className="archiveSourceNote">
          Four Sunday scramble matches were readable in the surviving board.
          The fifth match was not clear enough to reproduce without guessing.
          The official session total was Team Walls 3.5, Team Luyk 1.5.
        </div>
      </section>

      <section className="archiveDaySection">
        <header>
          <div>
            <div className="smallLabel">SUNDAY · SEPTEMBER 27, 2020</div>
            <h2>Singles</h2>
            <p>Ten individual match-play matches</p>
          </div>

          <div className="archiveDayScore">
            <span>WALLS 4</span>
            <strong>LUYK 6</strong>
          </div>
        </header>

        <div className="archiveTableWrap">
          <table className="archiveMatchTable">
            <thead>
              <tr>
                <th>Match</th>
                <th>Team Walls</th>
                <th>Pts</th>
                <th>Team Luyk</th>
                <th>Pts</th>
              </tr>
            </thead>

            <tbody>
              {singles.map(([walls, wallsPoints, bones, bonesPoints], index) => (
                <tr key={`${walls}:${bones}`}>
                  <td>{index + 1}</td>
                  <td>{walls}</td>
                  <td>{point(wallsPoints)}</td>
                  <td>{bones}</td>
                  <td>{point(bonesPoints)}</td>
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
            in the surviving 2020 tournament boards.
          </p>
        </div>
      </section>

      <div className="archiveSourceNote">
        Historical record reconstructed from four surviving 2020 tournament
        boards. Player names are reproduced as recorded where full names could
        not be verified.
      </div>
    </>
  );
}
