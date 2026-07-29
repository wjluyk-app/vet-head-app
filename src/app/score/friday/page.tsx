import Link from "next/link";
import { getFridayMatchesFromSeed } from "@/lib/repositories/friday";

export default function FridayMatchesPage() {
  const matches = getFridayMatchesFromSeed();

  return (
    <>
      <section className="hero">
        <h1>Friday Score Entry</h1>
        <p>Mountain Course · 1 Best Ball of 2 · NET team scores</p>
      </section>

      <section className="grid">
        {matches.map((match) => (
          <article className="card" key={match.matchNumber}>
            <h2>Match {match.matchNumber}</h2>
            <p><strong>{match.teeTime?.slice(0, 5) ?? "TBD"}</strong></p>
            <p>{match.luke.player1} / {match.luke.player2}</p>
            <p>vs.</p>
            <p>{match.sam.player1} / {match.sam.player2}</p>
            <Link className="button" href={`/score/friday/${match.matchNumber}`}>
              Enter scores
            </Link>
          </article>
        ))}
      </section>

      <div className="notice">
        The score-entry source is the approved 2026 workbook seed. Each match has exactly two team scorecards.
      </div>
    </>
  );
}
