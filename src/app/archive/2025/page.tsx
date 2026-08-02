const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

type TeamMatch = {
  number: number;
  walls: string;
  wallsPoints: number;
  luyk: string;
  luykPoints: number;
};

const fridayMatches: TeamMatch[] = [
  { number: 1, walls: "Charlie Olszewski / Brian Mogg", wallsPoints: 0.5, luyk: "Steve Chapman / Nick Schaut", luykPoints: 2.5 },
  { number: 2, walls: "Kurt Swardenski / George Hoodhood", wallsPoints: 2.5, luyk: "Mike Stone / Lou Bush", luykPoints: 0.5 },
  { number: 3, walls: "Dean Schuch / Jeremy Bainbridge", wallsPoints: 0, luyk: "Luke Swardenski / Charlie Hiotas", luykPoints: 3 },
  { number: 4, walls: "Eric Blanding / Randy Walls", wallsPoints: 0, luyk: "Sam Swardenski / Steve Tedhams", luykPoints: 3 },
  { number: 5, walls: "Scott Morgan / Joe Mead", wallsPoints: 1.5, luyk: "Mike Roth / Mark Hammonds", luykPoints: 1.5 },
  { number: 6, walls: "Brian Walls / Curt Lichty", wallsPoints: 0, luyk: "Bill Luyk / Nick Swardenski", luykPoints: 3 },
];

const saturdayMatches: TeamMatch[] = [
  { number: 1, walls: "Dean Schuch / Brian Mogg", wallsPoints: 0, luyk: "Luke Swardenski / Mark Hammonds", luykPoints: 3 },
  { number: 2, walls: "Kurt Swardenski / Joe Mead", wallsPoints: 0.5, luyk: "Lou Bush / Nick Schaut", luykPoints: 2.5 },
  { number: 3, walls: "Scott Morgan / Brian Walls", wallsPoints: 3, luyk: "Mike Roth / Steve Tedhams", luykPoints: 0 },
  { number: 4, walls: "Eric Blanding / Curt Lichty", wallsPoints: 0, luyk: "Sam Swardenski / Steve Chapman", luykPoints: 3 },
  { number: 5, walls: "George Hoodhood / Jeremy Bainbridge", wallsPoints: 3, luyk: "Bill Luyk / Charlie Hiotas", luykPoints: 0 },
  { number: 6, walls: "Randy Walls / Charlie Olszewski", wallsPoints: 0.5, luyk: "Nick Swardenski / Mike Stone", luykPoints: 2.5 },
];

const sundayTeamMatches: TeamMatch[] = [
  { number: 1, walls: "Kurt Swardenski / Joe Mead", wallsPoints: 0, luyk: "Steve Chapman / Mark Hammonds", luykPoints: 1 },
  { number: 2, walls: "Eric Blanding / Charlie Olszewski", wallsPoints: 0.5, luyk: "Sam Swardenski / Mike Roth", luykPoints: 0.5 },
  { number: 3, walls: "Scott Morgan / Brian Mogg", wallsPoints: 0.5, luyk: "Luke Swardenski / Mike Stone", luykPoints: 0.5 },
  { number: 4, walls: "Dean Schuch / George Hoodhood", wallsPoints: 0, luyk: "Charlie Hiotas / Nick Schaut", luykPoints: 1 },
  { number: 5, walls: "Brian Walls / Jeremy Bainbridge", wallsPoints: 0, luyk: "Nick Swardenski / Lou Bush", luykPoints: 1 },
  { number: 6, walls: "Randy Walls / Curt Lichty", wallsPoints: 0, luyk: "Bill Luyk / Steve Tedhams", luykPoints: 1 },
];

const singles = [
  ["Kurt Swardenski", 0.5, "Steve Chapman", 0.5],
  ["Joe Mead", 0.5, "Mark Hammonds", 0.5],
  ["Eric Blanding", 0.5, "Sam Swardenski", 0.5],
  ["Charlie Olszewski", 0, "Mike Roth", 1],
  ["Scott Morgan", 0.5, "Luke Swardenski", 0.5],
  ["Brian Mogg", 1, "Mike Stone", 0],
  ["Dean Schuch", 0.5, "Charlie Hiotas", 0.5],
  ["George Hoodhood", 0.5, "Nick Schaut", 0.5],
  ["Brian Walls", 1, "Nick Swardenski", 0],
  ["Jeremy Bainbridge", 0, "Lou Bush", 1],
  ["Curt Lichty", 0.5, "Steve Tedhams", 0.5],
  ["Randy Walls", 0, "Bill Luyk", 1],
] as const;

const fridayAwards: readonly (readonly [string, string, string])[] = [
  ["Front 1st · 30", "Kurt Swardenski / George Hoodhood", "$50 per player"],
  ["Front 2nd tie · 31", "Charlie Olszewski / Brian Mogg", "$8.33 per player"],
  ["Front 2nd tie · 31", "Steve Chapman / Nick Schaut", "$8.33 per player"],
  ["Front 2nd tie · 31", "Joe Mead / Scott Morgan", "$8.33 per player"],
  ["Back 1st · 29", "Mike Roth / Mark Hammonds", "$50 per player"],
  ["Back 2nd tie · 30", "Mike Stone / Lou Bush", "$12.50 per player"],
  ["Back 2nd tie · 30", "Joe Mead / Scott Morgan", "$12.50 per player"],
  ["Total 1st tie · 61", "Kurt Swardenski / George Hoodhood", "$37.50 per player"],
  ["Total 1st tie · 61", "Joe Mead / Scott Morgan", "$37.50 per player"],
];

const saturdayAwards: readonly (readonly [string, string, string])[] = [
  ["Front 1st · 32", "George Hoodhood / Jeremy Bainbridge", "$50 per player"],
  ["Front 2nd · 34", "Lou Bush / Nick Schaut", "$25 per player"],
  ["Back 1st · 34", "George Hoodhood / Jeremy Bainbridge", "$50 per player"],
  ["Back 2nd · 35", "Luke Swardenski / Mark Hammonds", "$25 per player"],
  ["Total 1st · 66", "George Hoodhood / Jeremy Bainbridge", "$50 per player"],
  ["Total 2nd tie · 73", "Lou Bush / Nick Schaut", "$12.50 per player"],
  ["Total 2nd tie · 73", "Steve Chapman / Sam Swardenski", "$12.50 per player"],
];

const sundayAwards: readonly (readonly [string, string, string])[] = [
  ["Front 1st · 31", "Bill Luyk / Steve Tedhams", "$50 per player"],
  ["Front 2nd tie · 34", "Sam Swardenski / Mike Roth", "$6.25 per player"],
  ["Front 2nd tie · 34", "Charlie Olszewski / Eric Blanding", "$6.25 per player"],
  ["Front 2nd tie · 34", "Luke Swardenski / Mike Stone", "$6.25 per player"],
  ["Front 2nd tie · 34", "Nick Swardenski / Lou Bush", "$6.25 per player"],
];

const skins = [
  ["Hole 1", "Scott Morgan / Joe Mead", "Eagle"],
  ["Hole 10", "Scott Morgan / Joe Mead", "Eagle"],
  ["Hole 14", "Scott Morgan / Joe Mead", "Double eagle"],
  ["Hole 4", "Mike Roth / Mark Hammonds", "Eagle"],
  ["Hole 11", "Mike Roth / Mark Hammonds", "Eagle"],
  ["Hole 15", "Mike Roth / Mark Hammonds", "Eagle"],
];

const payouts = [
  ["George Hoodhood", 237.5],
  ["Mark Hammonds", 165],
  ["Jeremy Bainbridge", 150],
  ["Mike Roth", 146.25],
  ["Joe Mead", 108.33],
  ["Scott Morgan", 108.33],
  ["Lou Bush", 96.25],
  ["Bill Luyk", 90],
  ["Steve Tedhams", 90],
  ["Luke Swardenski", 87.91],
  ["Kurt Swardenski", 87.5],
  ["Nick Schaut", 85.83],
  ["Steve Chapman", 77.49],
  ["Sam Swardenski", 75.41],
  ["Mike Stone", 58.75],
  ["Charlie Hiotas", 46.25],
  ["Nick Swardenski", 46.25],
  ["Brian Mogg", 8.33],
  ["Charlie Olszewski", 8.33],
  ["Eric Blanding", 6.25],
  ["Brian Walls", 0],
  ["Curt Lichty", 0],
  ["Dean Schuch", 0],
  ["Randy Walls", 0],
] as const;

function point(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
}

function MatchTable({
  matches,
}: {
  matches: TeamMatch[];
}) {
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
              <td>{match.luyk}</td>
              <td>{point(match.luykPoints)}</td>
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
          {rows.map(([place, players, amount]) => (
            <tr key={`${place}:${players}`}>
              <td>{place}</td>
              <td>{players}</td>
              <td>{amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Archive2025Page() {
  return (
    <>
      <section className="archiveHero">
        <div>
          <div className="smallLabel">25TH ANNIVERSARY · VERIFIED HISTORICAL RECORD</div>
          <h1>2025 Cubby Cup</h1>
          <p>Shanty Part VII · Randy Walls vs. Bill Luyk</p>
        </div>

        <div className="archiveChampion">
          <span>CHAMPION</span>
          <strong>Team Luyk</strong>
          <small>36–18</small>
        </div>
      </section>

      <section className="archiveMvp">
        <div className="smallLabel">2025 CUBBY CUP MVPs · 7 POINTS EACH</div>
        <h2>Luke Swardenski · Sam Swardenski · Steve Chapman</h2>
      </section>

      <section className="archiveProgress">
        <article>
          <span>FRIDAY</span>
          <strong>13.5–4.5</strong>
          <small>Team Luyk</small>
        </article>
        <article>
          <span>THROUGH SATURDAY</span>
          <strong>24.5–11.5</strong>
          <small>Team Luyk</small>
        </article>
        <article>
          <span>SUNDAY TEAM</span>
          <strong>5–1</strong>
          <small>Team Luyk</small>
        </article>
        <article>
          <span>SUNDAY SINGLES</span>
          <strong>6.5–5.5</strong>
          <small>Team Luyk</small>
        </article>
        <article className="archiveProgressFinal">
          <span>FINAL</span>
          <strong>36–18</strong>
          <small>Team Luyk</small>
        </article>
      </section>

      <section className="archiveDaySection">
        <header>
          <div>
            <div className="smallLabel">FRIDAY · AUGUST 22, 2025</div>
            <h2>Hawk’s Eye</h2>
            <p>18 holes · One Best Ball of Two</p>
          </div>
          <div className="archiveDayScore">
            <span>WALLS 4.5</span>
            <strong>LUYK 13.5</strong>
          </div>
        </header>
        <MatchTable matches={fridayMatches} />
      </section>

      <section className="archiveDaySection">
        <header>
          <div>
            <div className="smallLabel">SATURDAY · AUGUST 23, 2025</div>
            <h2>The Legend</h2>
            <p>Audi Format · Match Play</p>
          </div>
          <div className="archiveDayScore">
            <span>WALLS 7</span>
            <strong>LUYK 11</strong>
          </div>
        </header>
        <MatchTable matches={saturdayMatches} />
      </section>

      <section className="archiveDaySection">
        <header>
          <div>
            <div className="smallLabel">SUNDAY · AUGUST 24, 2025</div>
            <h2>Cedar River</h2>
            <p>Team matches followed by singles</p>
          </div>
          <div className="archiveDayScore">
            <span>TEAM 5–1</span>
            <strong>SINGLES 6.5–5.5</strong>
          </div>
        </header>

        <h3 className="archiveSubheading">Sunday Team Matches</h3>
        <MatchTable matches={sundayTeamMatches} />

        <h3 className="archiveSubheading">Sunday Singles</h3>
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
              {singles.map(([walls, wallsPoints, luyk, luykPoints], index) => (
                <tr key={`${walls}:${luyk}`}>
                  <td>{index + 1}</td>
                  <td>{walls}</td>
                  <td>{point(wallsPoints)}</td>
                  <td>{luyk}</td>
                  <td>{point(luykPoints)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="archiveAwardsSection">
        <div className="archiveSectionHeading">
          <div className="smallLabel">FIELD AWARDS</div>
          <h2>Daily Payout Winners</h2>
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
          <article>
            <h3>Sunday</h3>
            <AwardTable rows={sundayAwards} />
          </article>
        </div>
      </section>

      <section className="archiveAwardsSection">
        <div className="archiveSectionHeading">
          <div className="smallLabel">FRIDAY SKINS</div>
          <h2>Six Winning Skins</h2>
          <p>$16.66 per player for each skin.</p>
        </div>

        <div className="archiveSkinsGrid">
          {skins.map(([hole, players, result]) => (
            <article key={`${hole}:${players}`}>
              <span>{hole}</span>
              <strong>{players}</strong>
              <small>{result}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="archiveAwardsSection">
        <div className="archivePayoutHeading">
          <div>
            <div className="smallLabel">FINAL INDIVIDUAL PAYOUTS</div>
            <h2>2025 Payment Record</h2>
          </div>
        </div>

        <div className="archivePayoutGrid">
          {payouts.map(([player, amount]) => (
            <article key={player}>
              <span>{player}</span>
              <strong>{amount ? money(amount) : "—"}</strong>
            </article>
          ))}
        </div>
      </section>

      <div className="archiveSourceNote">
        Historical record reconstructed from the official 2025 Cubby Cup Tournament Summary.
      </div>
    </>
  );
}
