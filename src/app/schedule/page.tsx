import TournamentSectionShell from "@/components/TournamentSectionShell";
import seed from "@/data/2026-workbook-seed.json";

function formatTime(value: string) {
  const [hourText, minute] = value.split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${minute} ${suffix}`;
}

const schedule = [
  {
    day: "Friday",
    sourceDay: "Friday",
    date: "August 28",
    course: "Mountain Course",
    format: "1 Best Ball of 2",
  },
  {
    day: "Saturday",
    sourceDay: "Saturday",
    date: "August 29",
    course: "Betsie Valley",
    format: "18-Hole Two-Man Scramble",
  },
  {
    day: "Sunday",
    sourceDay: "Sunday Front",
    date: "August 30",
    course: "Mountain Course",
    format: "Front Nine Pinehurst · Back Nine Singles",
  },
];

export default function Page() {
  return (
    <TournamentSectionShell
      eyebrow="EVENT INFORMATION"
      title="Schedule & Tee Times"
      description="The complete tournament schedule, courses, formats and starting times."
      status="Available"
    >
      <section className="scheduleOverview">
        <div>
          <span>FRIDAY</span>
          <strong>1:00 PM</strong>
        </div>
        <div>
          <span>SATURDAY</span>
          <strong>11:20 AM</strong>
        </div>
        <div>
          <span>SUNDAY</span>
          <strong>10:50 AM</strong>
        </div>
      </section>

      <section className="scheduleGrid">
        {schedule.map((item) => {
          const matches = seed.pairings
            .filter((pairing) => pairing.day === item.sourceDay)
            .sort((a, b) => a.matchNumber - b.matchNumber);

          return (
          <article className="scheduleCard" key={item.day}>
            <div className="scheduleCardHeader">
              <div>
                <div className="smallLabel">{item.date}</div>
                <h2>{item.day}</h2>
              </div>
              <span>{item.course}</span>
            </div>

            <div className="scheduleFormat">{item.format}</div>

            <div className="teeTimeGrid">
              {matches.map((match) => (
                <div className="teeTimeRow teeTimeRowDetailed" key={match.matchNumber}>
                  <div className="teeTimeMatch">
                    <span>Match {match.matchNumber}</span>
                    <strong>{match.teeTime ? formatTime(match.teeTime) : "Continues after front nine"}</strong>
                  </div>

                  <div className="teeTimeNames">
                    <div>
                      <span>TEAM LUKE</span>
                      <strong>
                        {match.lukePlayer1}
                        {match.lukePlayer2 ? ` & ${match.lukePlayer2}` : ""}
                      </strong>
                    </div>
                    <div className="teeTimeVs">VS</div>
                    <div>
                      <span>TEAM SAM</span>
                      <strong>
                        {match.samPlayer1}
                        {match.samPlayer2 ? ` & ${match.samPlayer2}` : ""}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {item.day === "Sunday" && (
              <div className="scheduleNote">
                Singles matches begin immediately after each Pinehurst match completes the front nine.
              </div>
            )}
          </article>
          );
        })}
      </section>

      <section className="scheduleSummaryCard">
        <div>
          <span className="smallLabel">TOURNAMENT WEEKEND</span>
          <h2>{seed.tournament.name} {seed.tournament.year}</h2>
        </div>
        <div>
          <strong>{seed.tournament.venue}</strong>
          <span>August 28–30, 2026</span>
        </div>
      </section>
    </TournamentSectionShell>
  );
}
