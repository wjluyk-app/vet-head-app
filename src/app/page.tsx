import Link from "next/link";
import { tournamentHubGroups } from "@/data/tournament-hub";

export default function HomePage() {
  return (
    <>
      <section className="hubHero">
        <div className="hubHeroCopy">
          <div className="smallLabel hubEdition">CRYSTAL MOUNTAIN · AUGUST 28–30, 2026</div>
          <h1>Cubby Cup Tournament Hub</h1>
          <p>
            One private home for player information, live competition,
            prize money and final results.
          </p>
        </div>
        <div className="hubHeroScore">
          <div>
            <span>TEAM LUKE</span>
            <strong>8</strong>
          </div>
          <div className="hubScoreDivider">FRIDAY</div>
          <div>
            <span>TEAM SAM</span>
            <strong>10</strong>
          </div>
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
                className={item.featured ? "hubTile hubTileFeatured" : "hubTile"}
                href={item.href}
                key={item.title}
              >
                <div className="hubTileTop">
                  <span className="hubIcon">{item.icon}</span>
                  <span className={`hubStatus hubStatus${item.status.replace(" ", "")}`}>
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
          <span>Score entry, corrections, setup, audit history and exports.</span>
        </div>
        <Link className="secondaryButton" href="/admin">Open Admin</Link>
      </section>

      <div className="notice">
        Team-format scores are entered once as NET scores and are never handicapped again.
      </div>
    </>
  );
}
