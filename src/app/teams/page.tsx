import Link from "next/link";
import { getVetHeadPublicTournamentData } from "@/lib/repositories/vet-head-public";
import {
  calculateFourPlayerScrambleHandicap,
  calculateUnroundedCourseHandicap,
} from "@/lib/vet-head-scoring";

export const dynamic = "force-dynamic";

const formatTime = (value: string) => {
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";

  return `${hour % 12 || 12}:${minuteText} ${suffix}`;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));

export default async function VetHeadPairingsPage() {
  const data = await getVetHeadPublicTournamentData();

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">VET HEAD 2026</div>
        <h1>Pairings</h1>
        <p>
          Predetermined groups for all five tournament rounds.
        </p>
      </section>

      {data.rounds.map((round) => (
        <section
          className="tournamentBoardSection"
          key={round.id}
          style={{ marginTop: 24 }}
        >
          <div className="boardSectionHeader">
            <div>
              <div className="smallLabel">
                ROUND {round.round_number}
              </div>

              <h2>{round.name}</h2>

              <p>
                {formatDate(round.round_date)} ·{" "}
                {formatTime(String(round.tee_time).slice(0, 5))} ·{" "}
                {round.format === "four_man_scramble"
                  ? "4-Man Scramble"
                  : "Individual Net"}
              </p>
            </div>
          </div>

          <section className="grid">
            {round.groups.map((group) => (
              <article className="card" key={group.id}>
                <div className="smallLabel">
                  {round.format === "four_man_scramble"
                    ? `TEAM ${group.group_number}`
                    : `GROUP ${group.group_number}`}
                </div>

                <h3>
                  {group.name ??
                    (round.format === "four_man_scramble"
                      ? `Team ${group.group_number}`
                      : `Group ${group.group_number}`)}
                </h3>

                <p style={{ marginTop: 4, marginBottom: 12 }}>
                  <strong>
                    Tee Time: {formatTime(String(group.group_tee_time ?? round.tee_time).slice(0, 5))}
                  </strong>
                </p>

                {round.format === "four_man_scramble" && group.players.length === 4 && (
                  <p style={{ marginTop: 0, marginBottom: 12 }}>
                    <strong>
                      Team Handicap: {
                        calculateFourPlayerScrambleHandicap(
                          group.players.map((player) =>
                            calculateUnroundedCourseHandicap(
                              Number(player.handicapIndex ?? 0),
                              Number(round.course_tee?.[0]?.slope_rating ?? 113),
                              Number(round.course_tee?.[0]?.course_rating ?? 72),
                              Number(round.course_tee?.[0]?.par ?? 72),
                            ),
                          ),
                        )
                      }
                    </strong>
                  </p>
                )}

                {group.players.map((player) => (
                  <div
                    key={player.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "9px 0",
                      borderTop: "1px solid rgba(0,0,0,.08)",
                    }}
                  >
                    <strong>{player.name}</strong>

                    {round.format !== "four_man_scramble" && (
                      <span>
                        {player.handicapIndex === null
                          ? "HI —"
                          : `HI ${player.handicapIndex}`}
                      </span>
                    )}
                  </div>
                ))}
              </article>
            ))}
          </section>
        </section>
      ))}

      <div style={{ marginTop: 24 }}>
        <Link className="button" href="/">
          Tournament Hub
        </Link>
      </div>
    </main>
  );
}
