import Link from "next/link";

const archiveYears = [
  {
    year: 2025,
    subtitle: "25th Anniversary",
    captains: "Randy Walls vs. Bill Luyk",
    champion: "Team Luyk",
    finalScore: "36–18",
    href: "/archive/2025",
  },
  {
    year: 2024,
    subtitle: "Verified Historical Record",
    captains: "Team Stone vs. Team Bush",
    champion: "Team Stone",
    finalScore: "34.5–19.5",
    href: "/archive/2024",
  },
  {
    year: 2023,
    subtitle: "Mostly Verified Historical Record",
    captains: "Team Bainbridge vs. Team Mogg",
    champion: "Team Mogg",
    finalScore: "31–23",
    href: "/archive/2023",
  },
];

export default function TournamentArchivePage() {
  return (
    <>
      <section className="archiveLandingHero">
        <div className="smallLabel">CUBBY CUP HISTORY</div>
        <h1>Tournament Archive</h1>
        <p>
          Past champions, final scores, match results, MVPs, payouts and
          permanent tournament records.
        </p>
      </section>

      <section className="archiveYearSection">
        <div className="archiveYearHeading">
          <div>
            <div className="smallLabel">AVAILABLE TOURNAMENT RECORDS</div>
            <h2>Select a Year</h2>
          </div>
        </div>

        <div className="archiveYearGrid">
          {archiveYears.map((event) => (
            <Link
              className="archiveYearCard"
              href={event.href}
              key={event.year}
            >
              <div className="archiveYearCardTop">
                <span>{event.subtitle}</span>
                <strong>{event.year}</strong>
              </div>

              <div className="archiveYearCardBody">
                <div>
                  <span>CAPTAINS</span>
                  <strong>{event.captains}</strong>
                </div>

                <div className="archiveYearResult">
                  <div>
                    <span>CHAMPION</span>
                    <strong>{event.champion}</strong>
                  </div>

                  <div>
                    <span>FINAL SCORE</span>
                    <strong>{event.finalScore}</strong>
                  </div>
                </div>
              </div>

              <div className="archiveYearOpen">
                View {event.year} tournament archive →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
