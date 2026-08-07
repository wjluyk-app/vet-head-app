import Link from "next/link";
import { requireScoreEntryAccess } from "@/lib/auth/score-entry";
import { getVetHeadTournamentData } from "@/lib/repositories/vet-head-db";

export const dynamic = "force-dynamic";

function formatRoundLabel(format: string) {
  if (format === "individual_net") {
    return "Individual Net";
  }

  if (format === "four_man_scramble") {
    return "4-Man Scramble";
  }

  return format;
}

export default async function ScoreEntryPage() {
  const access = await requireScoreEntryAccess();
  const data = await getVetHeadTournamentData();

  return (
    <main className="pageShell">
      <section className="contentCard">
        <div className="eyebrow">VET HEAD 2026</div>

        <h1>Score Entry</h1>

        <p className="lede">
          Enter final 18-hole gross scores for the selected round.
        </p>

        <p className="muted">
          Signed in as{" "}
          <strong>{access.user.email}</strong>
          {access.role === "admin" ? " · Admin" : " · Score Entry"}
        </p>
      </section>

      <section className="sectionBlock">
        <h2>Select Round</h2>

        <div className="hubGrid">
          {data.rounds.map((round) => (
            <Link
              key={round.id}
              href={`/score/round/${round.id}`}
              className="hubCard"
            >
              <div className="hubCardKicker">
                Round {round.round_number}
              </div>

              <h3>{round.name}</h3>

              <p>{formatRoundLabel(round.format)}</p>

              <span className="hubCardAction">
                Enter scores →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
