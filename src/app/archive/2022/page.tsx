type MatchRow = {
  number: number;
  blue: string;
  bluePoints: number;
  green: string;
  greenPoints: number;
  score?: string;
};

const fridayMatches: MatchRow[] = [
  {
    number: 1,
    blue: "Mike Stone / Joe Mead",
    bluePoints: 1.5,
    green: "Dean Schuch / George Hoodhood",
    greenPoints: 1.5,
  },
  {
    number: 2,
    blue: "Brian Mogg / Charlie Hiotas",
    bluePoints: 0,
    green: "Nick Swardenski / Lou Bush",
    greenPoints: 3,
  },
  {
    number: 3,
    blue: "Mike Roth / Jeremy Bainbridge",
    bluePoints: 1.5,
    green: "Steve Chapman / J. Olszewski",
    greenPoints: 1.5,
  },
  {
    number: 4,
    blue: "Mark Hammonds / Paul DeJong",
    bluePoints: 1,
    green: "Kurt Swardenski / Chas",
    greenPoints: 2,
  },
  {
    number: 5,
    blue: "Randy Walls / Kevin Knox",
    bluePoints: 3,
    green: "Nick Schaut / Steve Tedhams",
    greenPoints: 0,
  },
  {
    number: 6,
    blue: "Brian Walls / Jim Norkus",
    bluePoints: 2,
    green: "Bruce Stone / Bill Luyk",
    greenPoints: 1,
  },
];

const saturdayMatches: MatchRow[] = [
  {
    number: 1,
    blue: "Charlie Hiotas / Mike Stone",
    bluePoints: 0,
    green: "Bruce Stone / Lou Bush",
    greenPoints: 1,
    score: "38–34",
  },
  {
    number: 2,
    blue: "Mike Roth / Mark Hammonds",
    bluePoints: 0.5,
    green: "Dean Schuch / Nick Schaut",
    greenPoints: 0.5,
    score: "33–33",
  },
  {
    number: 3,
    blue: "Kevin Knox / Jim Norkus",
    bluePoints: 0,
    green: "George Hoodhood / Nick Swardenski",
    greenPoints: 1,
    score: "33–30",
  },
  {
    number: 4,
    blue: "Joe Mead / Brian Mogg",
    bluePoints: 0,
    green: "Steve Chapman / Steve Tedhams",
    greenPoints: 1,
    score: "38–34",
  },
  {
    number: 5,
    blue: "Jeremy Bainbridge / Paul DeJong",
    bluePoints: 0,
    green: "Kurt Swardenski / J. Olszewski",
    greenPoints: 1,
    score: "38–32",
  },
  {
    number: 6,
    blue: "Randy Walls / Brian Walls",
    bluePoints: 0.5,
    green: "Bill Luyk / Chas",
    greenPoints: 0.5,
    score: "33–33",
  },
];

function point(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
}

function MatchTable({
  matches,
  showScore = false,
}: {
  matches: MatchRow[];
  showScore?: boolean;
}) {
  return (
    <div className="archiveTableWrap">
      <table className="archiveMatchTable">
        <thead>
          <tr>
            <th>Match</th>
            <th>Blue Team</th>
            {showScore ? <th>Score</th> : null}
            <th>Pts</th>
            <th>Green Team</th>
            <th>Pts</th>
          </tr>
        </thead>

        <tbody>
          {matches.map((match) => (
            <tr key={match.number}>
              <td>{match.number}</td>
              <td>{match.blue}</td>
              {showScore ? <td>{match.score}</td> : null}
              <td>{point(match.bluePoints)}</td>
              <td>{match.green}</td>
              <td>{point(match.greenPoints)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Archive2022Page() {
  return (
    <>
      <section className="archiveHero">
        <div>
          <div className="smallLabel">
            MOSTLY VERIFIED HISTORICAL RECORD
          </div>
          <h1>2022 Cubby Cup</h1>
          <p>Brian Walls vs. Charlie Olszewski</p>
        </div>

        <div className="archiveChampion">
          <span>CHAMPION</span>
          <strong>Team Olszewski</strong>
          <small>23.5–12.5</small>
        </div>
      </section>

      <section className="archiveMvp">
        <div className="smallLabel">2022 CUBBY CUP MVP</div>
        <h2>Lou Bush</h2>
      </section>

      <section className="archiveProgress">
        <article>
          <span>FRIDAY</span>
          <strong>9–9</strong>
          <small>Tied</small>
        </article>

        <article>
          <span>SATURDAY SCRAMBLE</span>
          <strong>5–1</strong>
          <small>Team Olszewski</small>
        </article>

        <article>
          <span>THROUGH SATURDAY</span>
          <strong>14–10</strong>
          <small>Team Olszewski</small>
        </article>

        <article>
          <span>SUNDAY SINGLES</span>
          <strong>9.5–2.5</strong>
          <small>Team Olszewski</small>
        </article>

        <article className="archiveProgressFinal">
          <span>FINAL</span>
          <strong>23.5–12.5</strong>
          <small>Team Olszewski</small>
        </article>
      </section>

      <section className="archiveDaySection">
        <header>
          <div>
            <div className="smallLabel">FRIDAY · AUGUST 26, 2022</div>
            <h2>Day 1</h2>
            <p>18 holes · One Best Ball of Two</p>
          </div>

          <div className="archiveDayScore">
            <span>BLUE 9</span>
            <strong>OLSZEWSKI 9</strong>
          </div>
        </header>

        <MatchTable matches={fridayMatches} />
      </section>

      <section className="archiveDaySection">
        <header>
          <div>
            <div className="smallLabel">SATURDAY · AUGUST 27, 2022</div>
            <h2>Two-Man Scramble</h2>
            <p>Six team matches</p>
          </div>

          <div className="archiveDayScore">
            <span>BLUE 1</span>
            <strong>OLSZEWSKI 5</strong>
          </div>
        </header>

        <MatchTable matches={saturdayMatches} showScore />
      </section>

      <section className="archiveDaySection">
        <header>
          <div>
            <div className="smallLabel">SUNDAY · AUGUST 28, 2022</div>
            <h2>Singles</h2>
            <p>Individual match play</p>
          </div>

          <div className="archiveDayScore">
            <span>BLUE 2.5</span>
            <strong>OLSZEWSKI 9.5</strong>
          </div>
        </header>

        <section className="archiveProgress archiveSundaySummary">
          <article>
            <span>ENTERING SINGLES</span>
            <strong>14–10</strong>
            <small>Team Olszewski</small>
          </article>

          <article>
            <span>SINGLES</span>
            <strong>9.5–2.5</strong>
            <small>Team Olszewski</small>
          </article>

          <article className="archiveProgressFinal">
            <span>FINAL</span>
            <strong>23.5–12.5</strong>
            <small>Team Olszewski</small>
          </article>
        </section>

        <div className="archiveSourceNote">
          The Sunday singles stage total is verified. Individual Sunday match
          results were not preserved clearly enough to reproduce without
          guessing.
        </div>
      </section>

      <section className="archiveAwardsSection">
        <div className="archiveSectionHeading">
          <div className="smallLabel">RECORDED AWARDS</div>
          <h2>2022 Tournament Notes</h2>
        </div>

        <div className="archivePayoutGrid">
          <article>
            <span>Closest to the Pin</span>
            <strong>Mark Hammonds · $100</strong>
          </article>

          <article>
            <span>Friday Skins</span>
            <strong>Six recorded skins</strong>
          </article>

          <article>
            <span>MVP</span>
            <strong>Lou Bush</strong>
          </article>
        </div>
      </section>

      <div className="archiveSourceNote">
        Historical record reconstructed from the original 2022 tournament
        boards and photographs. Official captain names and the detailed Friday
        skin winners were not shown clearly in the surviving source material.
      </div>
    </>
  );
}
