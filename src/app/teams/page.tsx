import TeamsPairingsClient from "@/components/TeamsPairingsClient";
import MyWeekendClient from "@/components/MyWeekendClient";
import TournamentSectionShell from "@/components/TournamentSectionShell";
import { getTeamsPairingsData } from "@/lib/teams-pairings";

export default function TeamsPage() {
  const data = getTeamsPairingsData();

  return (
    <TournamentSectionShell
      eyebrow="EVENT INFORMATION"
      title="Teams & Pairings"
      description="Rosters, handicaps, tee assignments, pairings and tee times for all three tournament days."
      status="Available"
    >
      <MyWeekendClient data={data} />
      <TeamsPairingsClient data={data} />
    </TournamentSectionShell>
  );
}
