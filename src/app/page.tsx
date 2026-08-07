import Link from "next/link";
import { tournamentHubGroups } from "@/data/tournament-hub";

export const dynamic = "force-dynamic";

function hubActionLabel(href: string): string {
  const labels: Record<string, string> = {
    "/scoreboard": "Open Scoreboard →",
    "/friday": "View Friday competition →",
    "/saturday": "View Saturday competition →",
    "/sunday": "View Sunday competition →",
    "/player-guide": "Read Player Guide →",
    "/teams": "View pairings →",
    "/schedule": "View tee times →",
    "/prize-money": "View prize structure →",
    "/final-results": "View final payouts →",
    "/archive": "View tournament archive →",
    "/upcoming-years": "View upcoming years →",
  };

  return labels[href] ?? "Open section →";
}

export default function HomePage() {
  return (
    <>
      <section className="hubHero">
        <div className="hubHeroCopy">
          <div className="smallLabel hubEdition">
            AUGUST 13–15, 2026
          </div>
          <h1>Vet Head Tournament Hub</h1>
          <p>
            One home for pairings, tee times, scoring, Vet Head points
            and the Vet Header race.
          </p>
        </div>

        <Link className="hubHeroScore" href="/scoreboard">
          <div>
            <span>PLAYERS</span>
            <strong>12</strong>
          </div>

          <div className="hubScoreDivider">
            VET HEAD
          </div>

          <div>
            <span>ROUNDS</span>
            <strong>5</strong>
          </div>
        </Link>
      </section>

      <section className="hubStartHere" aria-labelledby="start-here-heading">
        <div className="hubStartHereCopy">
          <span className="smallLabel">VET HEAD</span>
          <h2 id="start-here-heading">Start Here</h2>
          <p>
            Check your pairings and tee times, then use the Scoreboard for
            Vet Head points, Vet Header standings and round results.
          </p>
        </div>

        <div className="hubStartHereActions">
          <Link href="/teams">
            <span>1</span>
            <strong>View Pairings</strong>
          </Link>

          <Link href="/schedule">
            <span>2</span>
            <strong>View Tee Times</strong>
          </Link>

          <Link href="/scoreboard">
            <span>3</span>
            <strong>Open Scoreboard</strong>
          </Link>
        </div>
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
                <span className="hubOpen">{hubActionLabel(item.href)}</span>
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


    </>
  );
}
