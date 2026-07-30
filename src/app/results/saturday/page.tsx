import SaturdayTournamentBoardClient from "@/components/SaturdayTournamentBoardClient";
import { calculateSaturdayTournamentBoard } from "@/lib/saturday-tournament-board";
import { getSaturdayMatchesFromDatabase } from "@/lib/repositories/saturday-db";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function SaturdayResultsPage() {
  const matches = await getSaturdayMatchesFromDatabase(createAdminClient());

  return (
    <>
      <section className="hero fridayResultsHero">
        <h1>Saturday Tournament Board</h1>
        <p>Betsie Valley · Two-Man Scramble · NET team scores</p>
      </section>

      <SaturdayTournamentBoardClient
        initial={calculateSaturdayTournamentBoard(matches)}
      />
    </>
  );
}
