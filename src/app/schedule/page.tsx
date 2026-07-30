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
    date: "August 28",
    course: "Mountain Course",
    format: "1 Best Ball of 2",
    times: ["13:00:00", "13:10:00", "13:20:00", "13:30:00", "13:40:00", "13:50:00"],
  },
  {
    day: "Saturday",
    date: "August 29",
    course: "Betsie Valley",
    format: "18-Hole Two-Man Scramble",
    times: ["11:20:00", "11:30:00", "11:40:00", "11:50:00", "12:00:00", "12:10:00"],
  },
  {
    day: "Sunday",
    date: "August 30",
    course: "Mountain Course",
    format: "Front Nine Pinehurst · Back Nine Singles",
    times: ["10:50:00", "11:00:00", "11:10:00", "11:20:00", "11:30:00", "11:40:00"],
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
        {schedule.map((item) => (
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
              {item.times.map((time, index) => (
                <div className="teeTimeRow" key={time}>
                  <span>Match {index + 1}</span>
                  <strong>{formatTime(time)}</strong>
                </div>
              ))}
            </div>

            {item.day === "Sunday" && (
              <div className="scheduleNote">
                Singles matches begin immediately after each Pinehurst match completes the front nine.
              </div>
            )}
          </article>
        ))}
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
