type SaturdayMatch = {
  number: number;
  bainbridge: string;
  bainbridgePoints: number;
  mogg: string;
  moggPoints: number;
};

const fridayPairings = [
  ["Cohen Mead / Nick Schaut", "Charlie Olszewski / Scott Morgan"],
  ["Mike Roth / Lou Bush", "Joe Mead / Bruce Stone"],
  ["Dean Schuch / George Hoodhood", "Brian Walls / Kevin Knox"],
  ["Paul DeJong / Jeremy Bainbridge", "Eric Blanding / Randy Walls"],
  ["Steve Chapman / Mark Hammonds-Randy Baker", "Mike Stone / Sam Swardenski"],
  ["Steve Tedhams / Kurt Swardenski", "Brian Mogg / Bill Luyk"],
] as const;

const saturdayMatches: SaturdayMatch[] = [
  {
    number: 1,
    bainbridge: "Cohen Mead / Lou Bush",
    bainbridgePoints: 2.5,
    mogg: "Eric Blanding / Scott Morgan",
    moggPoints: 0.5,
  },
  {
    number: 2,
    bainbridge: "George Hoodhood / Jeremy Bainbridge",
    bainbridgePoints: 0.5,
    mogg: "Mike Stone / Bruce Stone",
    moggPoints: 2.5,
  },
  {
    number: 3,
    bainbridge: "Dean Schuch / Mark Hammonds",
    bainbridgePoints: 3,
    mogg: "Joe Mead / Brian Walls",
    moggPoints: 0,
  },
  {
    number: 4,
    bainbridge: "Nick Schaut / Paul DeJong",
    bainbridgePoints: 0.5,
    mogg: "Bill Luyk / Sam Swardenski",
    moggPoints: 2.5,
  },
  {
    number: 5,
    bainbridge: "Kurt Swardenski / Steve Tedhams",
    bainbridgePoints: 2,
    mogg: "Randy Walls / Kevin Knox",
    moggPoints: 1,
  },
  {
    number: 6,
    bainbridge: "Steve Chapman / Mike Roth",
    bainbridgePoints: 2.5,
    mogg: "Brian Mogg / Charlie Olszewski",
    moggPoints: 0.5,
  },
];

const skins = [
  ["Hole 8", "Randy Walls", "$100"],
  ["Hole 16", "Eric Blanding", "$100"],
] as const;

const sundayAwards = [
  ["1st", "Eric Blanding / Charlie Olszewski"],
  ["Tied 2nd", "Randy Walls / Brian Mogg"],
  ["Tied 2nd", "George Hoodhood / Steve Tedhams"],
] as const;

function point(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
}

export default function Archive2023Page() {
  return (
    <>
      <section className="archiveHero">
        <div>
          <div className="smallLabel">
            MOSTLY VERIFIED HISTORICAL RECORD
          </div>
          <h1>2023 Cubby Cup</h1>
          <p>Jeremy Bainbridge vs. Brian Mogg</p>
        </div>

        <div className="archiveChampion">
          <span>CHAMPION</span>
          <strong>Team Mogg</strong>
          <small>31–23</small>
        </div>
      </section>

      <section className="archiveMvp">
        <div className="smallLabel">2023 CUBBY CUP CO-MVPs</div>
        <h2>Sam Swardenski · Bill Luyk</h2>
      </section>

      <section className="archiveProgress">
        <article>
          <span>FRIDAY</span>
          <strong>11–7</strong>
          <small>Team Mogg</small>
        </article>
        <article>
          <span>THROUGH SATURDAY</span>
          <strong>18–18</strong>
          <small>Tied</small>
        </article>
        <article>
          <span>SUNDAY SCRAMBLE</span>
          <strong>3.5–2.5</strong>
          <small>Team Mogg</small>
        </article>
        <article>
          <span>SUNDAY SINGLES</span>
          <strong>9.5–2.5</strong>
          <small>Team Mogg</small>
        </article>
        <article className="archiveProgressFinal">
          <span>FINAL</span>
          <strong>31–23</strong>
          <small>Team Mogg</small>
        </article>
      </section>

      <section className="archiveDaySection">
        <header>
          <div>
            <div className="smallLabel">FRIDAY · AUGUST 25, 2023</div>
            <h2>Hawk’s Eye</h2>
            <p>18 holes · One Best Ball of Two</p>
          </div>
          <div className="archiveDayScore">
            <span>BAINBRIDGE 7</span>
            <strong>MOGG 11</strong>
          </div>
        </header>

        <div className="archiveTableWrap">
          <table className="archiveMatchTable">
            <thead>
              <tr>
                <th>Match</th>
                <th>Team Bainbridge</th>
                <th>Team Mogg</th>
              </tr>
            </thead>
            <tbody>
              {fridayPairings.map(([bainbridge, mogg], index) => (
                <tr key={`${bainbridge}:${mogg}`}>
                  <td>{index + 1}</td>
                  <td>{bainbridge}</td>
                  <td>{mogg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="archiveSourceNote">
          Friday pairings and the 11–7 Team Mogg day total are verified. The
          individual match-point allocations were not clearly readable on the
          original board.
        </div>
      </section>

      <section className="archiveDaySection">
        <header>
          <div>
            <div className="smallLabel">SATURDAY · AUGUST 26, 2023</div>
            <h2>The Legend</h2>
            <p>Audi Format · Match Play</p>
          </div>
          <div className="archiveDayScore">
            <span>MOGG 7</span>
            <strong>BAINBRIDGE 11</strong>
          </div>
        </header>

        <div className="archiveTableWrap">
          <table className="archiveMatchTable">
            <thead>
              <tr>
                <th>Match</th>
                <th>Team Bainbridge</th>
                <th>Pts</th>
                <th>Team Mogg</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {saturdayMatches.map((match) => (
                <tr key={match.number}>
                  <td>{match.number}</td>
                  <td>{match.bainbridge}</td>
                  <td>{point(match.bainbridgePoints)}</td>
                  <td>{match.mogg}</td>
                  <td>{point(match.moggPoints)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="archiveDaySection">
        <header>
          <div>
            <div className="smallLabel">SUNDAY · AUGUST 27, 2023</div>
            <h2>Cedar River</h2>
            <p>Nine-hole scramble followed by singles</p>
          </div>
          <div className="archiveDayScore">
            <span>BAINBRIDGE 5</span>
            <strong>MOGG 13</strong>
          </div>
        </header>

        <section className="archiveProgress archiveSundaySummary">
          <article>
            <span>SCRAMBLE</span>
            <strong>3.5–2.5</strong>
            <small>Team Mogg</small>
          </article>
          <article>
            <span>SINGLES</span>
            <strong>9.5–2.5</strong>
            <small>Team Mogg</small>
          </article>
          <article className="archiveProgressFinal">
            <span>SUNDAY TOTAL</span>
            <strong>13–5</strong>
            <small>Team Mogg</small>
          </article>
        </section>

        <div className="archiveSourceNote">
          Sunday stage totals are verified from the original boards. Individual
          Sunday match results were not preserved clearly enough to reproduce
          without guessing.
        </div>
      </section>

      <section className="archiveAwardsSection">
        <div className="archiveSectionHeading">
          <div className="smallLabel">FRIDAY SKINS</div>
          <h2>Two Winning Skins</h2>
        </div>

        <div className="archiveSkinsGrid">
          {skins.map(([hole, player, amount]) => (
            <article key={hole}>
              <span>{hole}</span>
              <strong>{player}</strong>
              <small>{amount}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="archiveAwardsSection">
        <div className="archiveSectionHeading">
          <div className="smallLabel">SUNDAY SCRAMBLE FIELD</div>
          <h2>Recorded Winners</h2>
        </div>

        <div className="archivePayoutGrid">
          {sundayAwards.map(([place, players]) => (
            <article key={`${place}:${players}`}>
              <span>{players}</span>
              <strong>{place}</strong>
            </article>
          ))}
        </div>
      </section>

      <div className="archiveSourceNote">
        Historical record reconstructed from seven original 2023 tournament
        photographs.
      </div>
    </>
  );
}
