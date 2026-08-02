const upcomingYears = [
  {
    year: 2027,
    dates: "August 27–29, 2027",
    captainOne: "Nick Swardenski",
    captainTwo: "Nick Schaut",
    venue: "TBD",
  },
  {
    year: 2028,
    dates: "August 25–27, 2028",
    captainOne: "Scott Morgan",
    captainTwo: "Eric Blanding",
    venue: "TBD",
  },
  {
    year: 2029,
    dates: "August 24–26, 2029",
    captainOne: "Mark Hammonds",
    captainTwo: "Dean Schuch",
    venue: "TBD",
  },
  {
    year: 2030,
    dates: "August 23–25, 2030",
    captainOne: "Randy Walls",
    captainTwo: "Bill Luyk",
    venue: "TBD",
  },
];

export default function UpcomingYearsPage() {
  return (
    <>
      <section className="upcomingYearsHero">
        <div className="smallLabel">CUBBY CUP FUTURE CAPTAINS</div>
        <h1>Upcoming Years</h1>
        <p>
          Future Cubby Cup dates and captain matchups. The tournament is held
          annually on the weekend before Labor Day weekend.
        </p>
      </section>

      <section className="upcomingYearsGrid">
        {upcomingYears.map((event) => (
          <article className="upcomingYearCard" key={event.year}>
            <div className="upcomingYearCardHeader">
              <div className="upcomingYearNumber">{event.year}</div>
              <div className="upcomingYearDates">{event.dates}</div>
            </div>

            <div className="upcomingYearMatchup">
              <div>
                <span>CAPTAIN</span>
                <strong>{event.captainOne}</strong>
              </div>

              <div className="upcomingYearVersus">VS</div>

              <div>
                <span>CAPTAIN</span>
                <strong>{event.captainTwo}</strong>
              </div>
            </div>

            <div className="upcomingYearVenue">
              <span>VENUE</span>
              <strong>{event.venue}</strong>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
