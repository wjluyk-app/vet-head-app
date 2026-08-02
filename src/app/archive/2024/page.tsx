type MatchRow = {
  number: number;
  stone: string;
  stonePoints: number;
  bush: string;
  bushPoints: number;
};

const fridayMatches: MatchRow[] = [
  { number: 1, stone: "Eric Blanding / Brian Mogg", stonePoints: 2, bush: "Randy Walls / Brian Walls", bushPoints: 1 },
  { number: 2, stone: "Mike Roth / Steve Chapman", stonePoints: 3, bush: "Joe Mead / Andy Brander", bushPoints: 0 },
  { number: 3, stone: "Bill Luyk / Bruce Stone", stonePoints: 0.5, bush: "Luke Swardenski / Nick Schaut", bushPoints: 2.5 },
  { number: 4, stone: "Nick Swardenski / Mark Hammonds", stonePoints: 3, bush: "Kurt Swardenski / Charlie Hiotas", bushPoints: 0 },
  { number: 5, stone: "Charlie Olszewski / Randy Baker", stonePoints: 2.5, bush: "Lou Bush / Cohen Mead", bushPoints: 0.5 },
  { number: 6, stone: "Steve Tedhams / Mike Stone", stonePoints: 3, bush: "Jim Norkus / George Hoodhood", bushPoints: 0 },
];

const saturdayMatches: MatchRow[] = [
  { number: 1, stone: "Eric Blanding / Randy Baker", stonePoints: 0, bush: "Randy Walls / George Hoodhood", bushPoints: 3 },
  { number: 2, stone: "Mike Roth / Steve Tedhams", stonePoints: 2.5, bush: "Andy Brander / Nick Schaut", bushPoints: 0.5 },
  { number: 3, stone: "Mike Stone / Bill Luyk", stonePoints: 1.5, bush: "Joe Mead / Luke Swardenski", bushPoints: 1.5 },
  { number: 4, stone: "Nick Swardenski / Charlie Olszewski", stonePoints: 1, bush: "Brian Walls / Lou Bush", bushPoints: 2 },
  { number: 5, stone: "Steve Chapman / Brian Mogg", stonePoints: 2.5, bush: "Cohen Mead / Charlie Hiotas", bushPoints: 0.5 },
  { number: 6, stone: "Mark Hammonds / Bruce Stone", stonePoints: 3, bush: "Kurt Swardenski / Jim Norkus", bushPoints: 0 },
];

const sundayScramble: MatchRow[] = [
  { number: 1, stone: "Mike Roth / Mark Hammonds", stonePoints: 0, bush: "Kurt Swardenski / Cohen Mead", bushPoints: 1 },
  { number: 2, stone: "Eric Blanding / Bill Luyk", stonePoints: 0, bush: "Andy Brander / Randy Walls", bushPoints: 1 },
  { number: 3, stone: "Steve Chapman / Randy Baker", stonePoints: 1, bush: "Kurt Swardenski / Joe Mead", bushPoints: 0 },
  { number: 4, stone: "Nick Swardenski / Charlie Olszewski", stonePoints: 0, bush: "Brian Walls / Nick Schaut", bushPoints: 1 },
  { number: 5, stone: "Steve Tedhams / Brian Mogg", stonePoints: 1, bush: "George Hoodhood / Jim Norkus", bushPoints: 0 },
  { number: 6, stone: "Bruce Stone / Mike Stone", stonePoints: 1, bush: "Charlie Hiotas / Lou Bush", bushPoints: 0 },
];

const singles = [
  ["Mike Roth", 1, "Kurt Swardenski", 0],
  ["Mark Hammonds", 1, "Cohen Mead", 0],
  ["Eric Blanding", 0, "Randy Walls", 1],
  ["Bill Luyk", 0, "Andy Brander", 1],
  ["Steve Chapman", 1, "Nick Swardenski", 0],
  ["Randy Baker", 0, "Joe Mead", 1],
  ["Nick Swardenski", 1, "Brian Walls", 0],
  ["Charlie Olszewski", 1, "Nick Schaut", 0],
  ["Steve Tedhams", 1, "George Hoodhood", 0],
  ["Brian Mogg", 1, "Jim Norkus", 0],
  ["Bruce Stone", 0, "Charlie Hiotas", 1],
  ["Mike Stone", 0, "Lou Bush", 1],
] as const;

const fridayAwards = [
  ["Front 1st", "Eric Blanding / Brian Mogg", "Recorded winner"],
  ["Back 1st", "Mike Roth / Steve Chapman", "Recorded winner"],
  ["Total 1st", "Mike Roth / Steve Chapman", "Recorded winner"],
  ["Front 2nd", "Steve Tedhams / Mike Stone", "Recorded runner-up"],
  ["Back 2nd", "Mike Stone / Steve Tedhams", "Recorded runner-up"],
  ["Total 2nd", "Mike Stone / Steve Tedhams", "Recorded runner-up"],
] as const;

const saturdayAwards = [
  ["Front 1st · 33", "Steve Tedhams / Mike Roth", "1st"],
  ["Front 2nd tie · 35", "Steve Chapman / Brian Mogg", "2nd"],
  ["Front 2nd tie · 35", "Mark Hammonds / Bruce Stone", "2nd"],
  ["Back 1st · 35", "Mark Hammonds / Bruce Stone", "1st"],
  ["Back 2nd · 37", "Joe Mead / Luke Swardenski", "2nd"],
  ["Total 1st · 70", "Mark Hammonds / Bruce Stone", "1st"],
  ["Total 2nd · 71", "Mike Roth / Steve Tedhams", "2nd"],
] as const;

const skins = [
  ["Hole 4", "Kurt Swardenski / Charlie Hiotas", "Eagle 2"],
  ["Hole 7", "Luke Swardenski / Nick Schaut", "Eagle 3"],
  ["Hole 12", "Luke Swardenski / Nick Schaut", "Eagle 2"],
  ["Hole 18", "George Hoodhood / Jim Norkus", "Eagle 3"],
] as const;

function point(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
}

function MatchTable({ matches }: { matches: MatchRow[] }) {
  return (
    <div className="archiveTableWrap">
      <table className="archiveMatchTable">
        <thead>
          <tr>
            <th>Match</th>
            <th>Team Stone</th>
            <th>Pts</th>
            <th>Team Bush</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr key={match.number}>
              <td>{match.number}</td>
              <td>{match.stone}</td>
              <td>{point(match.stonePoints)}</td>
              <td>{match.bush}</td>
              <td>{point(match.bushPoints)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AwardTable({
  rows,
}: {
  rows: readonly (readonly [string, string, string])[];
}) {
  return (
    <div className="archiveTableWrap">
      <table className="archiveAwardTable">
        <tbody>
          {rows.map(([place, players, result]) => (
            <tr key={`${place}:${players}`}>
              <td>{place}</td>
              <td>{players}</td>
              <td>{result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Archive2024Page() {
  return (
    <>
      <section className="archiveHero">
        <div>
          <div className="smallLabel">
            VERIFIED HISTORICAL RECORD
          </div>
          <h1>2024 Cubby Cup</h1>
          <p>Team Stone vs. Team Bush</p>
        </div>

        <div className="archiveChampion">
          <span>CHAMPION</span>
          <strong>Team Stone</strong>
          <small>34.5–19.5</small>
        </div>
      </section>

      <section className="archiveMvp">
        <div className="smallLabel">2024 CUBBY CUP CO-MVPs · 7.5 POINTS EACH</div>
        <h2>Steve Tedhams · Steve Chapman</h2>
      </section>

      <section className="archiveProgress">
        <article>
          <span>FRIDAY</span>
          <strong>14–4</strong>
          <small>Team Stone</small>
        </article>
        <article>
          <span>THROUGH SATURDAY</span>
          <strong>24.5–11.5</strong>
          <small>Team Stone</small>
        </article>
        <article>
          <span>SUNDAY SCRAMBLE</span>
          <strong>3–3</strong>
          <small>Even</small>
        </article>
        <article>
          <span>SUNDAY SINGLES</span>
          <strong>7–5</strong>
          <small>Team Stone</small>
        </article>
        <article className="archiveProgressFinal">
          <span>FINAL</span>
          <strong>34.5–19.5</strong>
          <small>Team Stone</small>
        </article>
      </section>

      <section className="archiveDaySection">
        <header>
          <div>
            <div className="smallLabel">FRIDAY · AUGUST 23, 2024</div>
            <h2>Hawk’s Eye</h2>
            <p>18 holes · One Best Ball of Two</p>
          </div>
          <div className="archiveDayScore">
            <span>BUSH 4</span>
            <strong>STONE 14</strong>
          </div>
        </header>
        <MatchTable matches={fridayMatches} />
      </section>

      <section className="archiveDaySection">
        <header>
          <div>
            <div className="smallLabel">SATURDAY · AUGUST 24, 2024</div>
            <h2>The Legend</h2>
            <p>Audi Format · Match Play</p>
          </div>
          <div className="archiveDayScore">
            <span>BUSH 7.5</span>
            <strong>STONE 10.5</strong>
          </div>
        </header>
        <MatchTable matches={saturdayMatches} />
      </section>

      <section className="archiveDaySection">
        <header>
          <div>
            <div className="smallLabel">SUNDAY · AUGUST 25, 2024</div>
            <h2>Cedar River</h2>
            <p>Nine-hole scramble followed by singles</p>
          </div>
          <div className="archiveDayScore">
            <span>SCRAMBLE 3–3</span>
            <strong>SINGLES 7–5 STONE</strong>
          </div>
        </header>

        <h3 className="archiveSubheading">Sunday Scramble</h3>
        <MatchTable matches={sundayScramble} />

        <h3 className="archiveSubheading">Sunday Singles</h3>
        <div className="archiveTableWrap">
          <table className="archiveMatchTable">
            <thead>
              <tr>
                <th>Match</th>
                <th>Team Stone</th>
                <th>Pts</th>
                <th>Team Bush</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {singles.map(([stone, stonePoints, bush, bushPoints], index) => (
                <tr key={`${stone}:${bush}`}>
                  <td>{index + 1}</td>
                  <td>{stone}</td>
                  <td>{point(stonePoints)}</td>
                  <td>{bush}</td>
                  <td>{point(bushPoints)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="archiveAwardsSection">
        <div className="archiveSectionHeading">
          <div className="smallLabel">FIELD AWARDS</div>
          <h2>Recorded Daily Winners</h2>
        </div>

        <div className="archiveAwardsGrid">
          <article>
            <h3>Friday</h3>
            <AwardTable rows={fridayAwards} />
          </article>

          <article>
            <h3>Saturday</h3>
            <AwardTable rows={saturdayAwards} />
          </article>
        </div>
      </section>

      <section className="archiveAwardsSection">
        <div className="archiveSectionHeading">
          <div className="smallLabel">FRIDAY SKINS</div>
          <h2>Four Winning Skins</h2>
          <p>$50 per player for each recorded skin.</p>
        </div>

        <div className="archiveSkinsGrid">
          {skins.map(([hole, players, result]) => (
            <article key={hole}>
              <span>{hole}</span>
              <strong>{players}</strong>
              <small>{result}</small>
            </article>
          ))}
        </div>
      </section>

      <div className="archiveSourceNote">
        Verified from the original 2024 clubhouse scoreboards, results board,
        and confirmed historical match results.
      </div>
    </>
  );
}
