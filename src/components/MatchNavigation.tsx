import Link from "next/link";

export default function MatchNavigation({
  matchNumber,
  totalMatches,
  basePath,
  allMatchesPath,
}: {
  matchNumber: number;
  totalMatches: number;
  basePath: string;
  allMatchesPath: string;
}) {
  return (
    <nav className="matchNavigation" aria-label="Match navigation">
      {matchNumber > 1 ? (
        <Link href={`${basePath}/${matchNumber - 1}`}>← Previous Match</Link>
      ) : (
        <span />
      )}

      <Link href={allMatchesPath}>All Matches</Link>

      {matchNumber < totalMatches ? (
        <Link href={`${basePath}/${matchNumber + 1}`}>Next Match →</Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
