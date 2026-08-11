import Link from "next/link";
import { requireScoreEntryAccess } from "@/lib/auth/score-entry";
import { getVetHeadTournamentData } from "@/lib/repositories/vet-head-db";

export const dynamic = "force-dynamic";

function formatRoundLabel(format: string) {
  if (format === "individual_net") {
    return "Individual + Best Ball";
  }

  if (format === "four_man_scramble") {
    return "4-Man Scramble";
  }

  return format;
}

function roundTypeClass(format: string) {
  return format === "four_man_scramble"
    ? "vetScoreFormat vetScoreFormatScramble"
    : "vetScoreFormat";
}

export default async function ScoreEntryPage() {
  const access = await requireScoreEntryAccess();
  const data = await getVetHeadTournamentData();

  return (
    <main className="vetScorePage">
      <section className="vetScoreHero">
        <div className="vetScoreEyebrow">VET HEAD 2026</div>

        <h1>Score Entry</h1>

        <p className="vetScoreLead">
          Enter final 18-hole gross scores for the selected round.
        </p>

        <div className="vetScoreSignedIn">
          <span>Signed in as</span>
          <strong>{access.user.email}</strong>
          <span className="vetScoreRole">
            {access.role === "admin" ? "Admin" : "Score Entry"}
          </span>
        </div>
      </section>

      <section className="vetScoreRounds">
        <div className="vetScoreSectionHeading">
          <div>
            <span>TOURNAMENT SCORING</span>
            <h2>Select Round</h2>
          </div>

          <p>Choose the round you want to enter.</p>
        </div>

        <div className="vetScoreGrid">
          {data.rounds.map((round) => (
            <Link
              key={round.id}
              href={`/score/round/${round.id}`}
              className="vetScoreRoundCard"
            >
              <div className="vetScoreCardTop">
                <span className="vetScoreRoundNumber">
                  Round {round.round_number}
                </span>

                <span className={roundTypeClass(round.format)}>
                  {formatRoundLabel(round.format)}
                </span>
              </div>

              <h3>{round.name}</h3>

              <div className="vetScoreEnterButton">
                Enter Scores
                <span aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
