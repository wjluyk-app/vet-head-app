import { getFridayMatchFromSeed } from "@/lib/repositories/friday";
import FridayScorecardClient from "@/components/FridayScorecardClient";

export default async function FridayMatchPage({
  params,
}: {
  params: Promise<{ matchNumber: string }>;
}) {
  const { matchNumber: rawMatchNumber } = await params;
  const matchNumber = Number(rawMatchNumber);
  if (!Number.isInteger(matchNumber) || matchNumber < 1 || matchNumber > 6) {
    throw new Error("Invalid Friday match number.");
  }

  const match = getFridayMatchFromSeed(matchNumber);

  return (
    <>
      <section className="hero">
        <h1>Friday Match {match.matchNumber}</h1>
        <p>{match.course} · {match.teeTime?.slice(0, 5) ?? "TBD"}</p>
      </section>
      <FridayScorecardClient match={match} />
    </>
  );
}
