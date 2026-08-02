import Link from "next/link";
import { tournamentHubGroups } from "@/data/tournament-hub";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFridayMatchesFromDatabase } from "@/lib/repositories/friday-db";
import { getSaturdayMatchesFromDatabase } from "@/lib/repositories/saturday-db";
import { getSundayDataFromDatabase } from "@/lib/repositories/sunday-db";
import { calculateFridayTournamentBoard } from "@/lib/friday-tournament-board";
import { calculateSaturdayTournamentBoard } from "@/lib/saturday-tournament-board";
import { calculateSundayTournamentBoard } from "@/lib/sunday-tournament-board";
import { calculateOverallTournamentBoard } from "@/lib/overall-tournament-board";

export const dynamic = "force-dynamic";

const points = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

export default async function HomePage() {
  const supabase = createAdminClient();

  const [fridayMatches, saturdayMatches, sundayData] =
    await Promise.all([
      getFridayMatchesFromDatabase(supabase),
      getSaturdayMatchesFromDatabase(supabase),
      getSundayDataFromDatabase(supabase),
    ]);

  const overall = calculateOverallTournamentBoard(
    calculateFridayTournamentBoard(fridayMatches),
    calculateSaturdayTournamentBoard(saturdayMatches),
    calculateSundayTournamentBoard(sundayData),
  );

  return (
    <>
      <section className="hubHero">
        <div className="hubHeroCopy">
          <div className="smallLabel hubEdition">
            CRYSTAL MOUNTAIN · AUGUST 28–30, 2026
          </div>
          <h1>Cubby Cup Tournament Hub</h1>
          <p>
            One private home for player information, live competition,
            prize money and final results.
          </p>
        </div>

        <Link className="hubHeroScore" href="/scoreboard">
          <div>
            <span>TEAM LUKE</span>
            <strong>{points(overall.overallLukePoints)}</strong>
          </div>

          <div className="hubScoreDivider">
            {overall.complete ? "FINAL" : "OVERALL"}
          </div>

          <div>
            <span>TEAM SAM</span>
            <strong>{points(overall.overallSamPoints)}</strong>
          </div>
        </Link>
      </section>

      {tournamentHubGroups.map((group) => (
        <section className="hubGroup" key={group.title}>
          <div className="hubGroupHeader">
            <div>
              <h2>{group.title}</h2>
              <p>{group.description}</p>
            </div>
          </div>

          <div className="hubTileGrid">
            {group.items.map((item) => (
              <Link
                className={
                  item.featured
                    ? "hubTile hubTileFeatured"
                    : "hubTile"
                }
                href={item.href}
                key={item.title}
              >
                <div className="hubTileTop hubTileTopNoIcon">
                  <span
                    className={`hubStatus hubStatus${item.status.replace(
                      " ",
                      "",
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="hubOpen">Open section →</span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="hubAdminBar">
        <div>
          <strong>Tournament Administration</strong>
          <span>
            Score entry, corrections, setup, audit history and exports.
          </span>
        </div>

        <Link className="secondaryButton" href="/admin">
          Open Admin
        </Link>
      </section>

      <div className="notice">
        Team-format scores are entered once as NET scores and are never
        handicapped again.
      </div>
    </>
  );
}
