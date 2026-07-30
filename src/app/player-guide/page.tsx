import Link from "next/link";
import TournamentSectionShell from "@/components/TournamentSectionShell";

const guideSections = [
  {
    title: "Welcome",
    description:
      "A message from Four Putt Productions, the 2026 captain matchup, and what players should review before the weekend.",
    href: "#welcome",
  },
  {
    title: "Weekend Overview",
    description:
      "Dates, courses, formats, start times, championship points and the first-to-27.5 target.",
    href: "#overview",
  },
  {
    title: "Formats & Rules",
    description:
      "Best Ball, Scramble, Pinehurst, Singles, tee movement, pairing advantage and Friday skins rules.",
    href: "#formats",
  },
  {
    title: "Housing",
    description:
      "Unit assignments for all 24 players.",
    href: "#housing",
  },
  {
    title: "Sunday Pinehurst",
    description:
      "The complete alternate-shot procedure for the front nine.",
    href: "#pinehurst",
  },
];

export default function Page() {
  return (
    <TournamentSectionShell
      eyebrow="EVENT INFORMATION"
      title="Player Guide"
      description="The digital welcome letter with schedules, formats, rules, lodging and contacts."
      status="Available"
    >
      <section className="playerGuideActions">
        <a
          className="primaryButton"
          href="/guides/Cubby_Cup_2026_Players_Guide.pdf"
          target="_blank"
          rel="noreferrer"
        >
          View Full 12-Page PDF
        </a>
        <Link className="secondaryButton" href="/schedule">
          View Schedule & Tee Times
        </Link>
        <Link className="secondaryButton" href="/teams">
          View Teams & Pairings
        </Link>
      </section>

      <section className="playerGuideSnapshot">
        <div>
          <span>PLAYERS</span>
          <strong>24</strong>
        </div>
        <div>
          <span>CHAMPIONSHIP DAYS</span>
          <strong>3</strong>
        </div>
        <div>
          <span>FIRST TO</span>
          <strong>27.5</strong>
        </div>
        <div>
          <span>PRIZE POOL</span>
          <strong>$1,800</strong>
        </div>
      </section>

      <section className="playerGuideNav">
        {guideSections.map((section) => (
          <a href={section.href} className="playerGuideNavCard" key={section.title}>
            <strong>{section.title}</strong>
            <span>{section.description}</span>
          </a>
        ))}
      </section>

      <section className="playerGuideSection" id="welcome">
        <div className="playerGuideSectionHeader">
          <span className="smallLabel">WELCOME LETTER</span>
          <h2>Three Days. Two Teams. One Cubby Cup.</h2>
        </div>

        <div className="playerGuideWelcomeGrid">
          <article className="playerGuideTextCard">
            <p>
              On behalf of Four Putt Productions, welcome to the 2026 Cubby Cup at Crystal Mountain.
            </p>
            <p>
              For the first time in Cubby Cup history, two brothers go head-to-head as captains:
              Team Luke Swardenski versus Team Sam Swardenski.
            </p>
            <p>
              The competition begins Friday on the Mountain Course, moves Saturday to Betsie Valley,
              and concludes Sunday back on the Mountain Course. The first team to 27.5 points wins.
            </p>
            <p>
              Please review your unit assignment, match time, format and handicap reference before
              the weekend begins.
            </p>
          </article>

          <article className="playerGuideContacts">
            <div>
              <span className="smallLabel">FOUR PUTT PRODUCTIONS</span>
              <strong>Randy Walls</strong>
              <a href="tel:16163287006">616.328.7006</a>
            </div>
            <div>
              <span className="smallLabel">FOUR PUTT PRODUCTIONS</span>
              <strong>Bill Luyk</strong>
              <a href="tel:16162930165">616.293.0165</a>
            </div>
          </article>
        </div>
      </section>

      <section className="playerGuideSection" id="overview">
        <div className="playerGuideSectionHeader">
          <span className="smallLabel">WEEKEND OVERVIEW</span>
          <h2>Championship Schedule</h2>
        </div>

        <div className="playerGuideDayGrid">
          <article>
            <span>FRIDAY</span>
            <h3>Mountain Course</h3>
            <strong>1 Best Ball of 2</strong>
            <p>1:00 PM · 18 points · All groups start on Hole 1</p>
          </article>
          <article>
            <span>SATURDAY</span>
            <h3>Betsie Valley</h3>
            <strong>Two-Man Scramble</strong>
            <p>11:20 AM · 18 points · All groups start on Hole 1</p>
          </article>
          <article>
            <span>SUNDAY</span>
            <h3>Mountain Course</h3>
            <strong>Pinehurst + Singles</strong>
            <p>10:50 AM · 6 front-nine points + 12 singles points</p>
          </article>
        </div>
      </section>

      <section className="playerGuideSection" id="formats">
        <div className="playerGuideSectionHeader">
          <span className="smallLabel">FORMATS & RULES</span>
          <h2>How the Cup Is Played</h2>
        </div>

        <div className="playerGuideFormatGrid">
          <article>
            <span>FRIDAY</span>
            <h3>1 Best Ball of 2</h3>
            <strong>90% handicap</strong>
            <p>Six two-man matches. Front, back and total are worth one point each.</p>
          </article>
          <article>
            <span>SATURDAY</span>
            <h3>Two-Man Scramble</h3>
            <strong>35% low + 15% high</strong>
            <p>Six two-man matches. Front, back and total are worth one point each.</p>
          </article>
          <article>
            <span>SUNDAY FRONT</span>
            <h3>Pinehurst</h3>
            <strong>60% low + 40% high</strong>
            <p>Six front-nine matches worth one point each.</p>
          </article>
          <article>
            <span>SUNDAY BACK</span>
            <h3>Singles</h3>
            <strong>Full back-nine handicap</strong>
            <p>Twelve singles matches. Captains play in Match 12.</p>
          </article>
        </div>

        <div className="playerGuideRuleGrid">
          <article>
            <h3>Tee Movement</h3>
            <p>
              White tees by default. Over age 60 with Age + Mountain White handicap of at least 75
              moves to White / Green. Over age 70 with a total of at least 85 moves to Green.
            </p>
          </article>
          <article>
            <h3>Pairing Advantage</h3>
            <p>
              Sam won the draft coin toss. Luke receives the counter-pick advantage.
            </p>
          </article>
          <article>
            <h3>Friday Skins</h3>
            <p>
              A skin requires the unique lowest NET team score. Holes 1–17 must be validated by NET
              par or better on the next hole. Hole 18 needs no validation. Ties do not pay.
            </p>
          </article>
        </div>
      </section>

      <section className="playerGuideSection" id="housing">
        <div className="playerGuideSectionHeader">
          <span className="smallLabel">HOUSING ASSIGNMENTS</span>
          <h2>Player Units</h2>
        </div>

        <div className="playerGuideHousingGrid">
          <article>
            <h3>Unit 1</h3>
            <p>Matt Parks</p>
            <p>Scott Morgan</p>
            <p>Eric Blanding</p>
            <p>Brian Walls</p>
            <p>Randy Walls</p>
            <p>Charlie Olszewski</p>
            <p>Brian Mogg</p>
          </article>
          <article>
            <h3>Unit 2</h3>
            <p>Dean Schuch</p>
            <p>Steve Chapman</p>
            <p>Mark Hammonds</p>
            <p>Steve Tedhams</p>
            <p>Cohen Mead</p>
            <p>George Hoodhood</p>
            <p>Joe Mead</p>
          </article>
          <article>
            <h3>Unit 3</h3>
            <p>Luke Swardenski</p>
            <p>Sam Swardenski</p>
            <p>Bill Luyk</p>
            <p>Nick Swardenski</p>
            <p>Kurt Swardenski</p>
            <p>Nick Schaut</p>
            <p>Lou Bush</p>
            <p>Bruce Stone</p>
            <p>Mike Stone</p>
            <p>Charlie Hiotas</p>
          </article>
        </div>
      </section>

      <section className="playerGuideSection" id="pinehurst">
        <div className="playerGuideSectionHeader">
          <span className="smallLabel">SUNDAY FRONT NINE</span>
          <h2>Pinehurst Format Guide</h2>
        </div>

        <div className="playerGuideSteps">
          <article>
            <strong>1</strong>
            <div>
              <h3>Both Players Tee Off</h3>
              <p>Each partner hits a tee shot, leaving two balls in play.</p>
            </div>
          </article>
          <article>
            <strong>2</strong>
            <div>
              <h3>Swap Balls</h3>
              <p>Each player hits the other player’s tee shot for the second shot.</p>
            </div>
          </article>
          <article>
            <strong>3</strong>
            <div>
              <h3>Select the Better Second Shot</h3>
              <p>Choose the preferred second-shot position and pick up the other ball.</p>
            </div>
          </article>
          <article>
            <strong>4</strong>
            <div>
              <h3>Begin Alternate Shot</h3>
              <p>The player whose second shot was not selected plays the third shot.</p>
            </div>
          </article>
          <article>
            <strong>5</strong>
            <div>
              <h3>Alternate Until Holed</h3>
              <p>Continue alternating shots until the selected ball is holed.</p>
            </div>
          </article>
        </div>
      </section>
    </TournamentSectionShell>
  );
}
