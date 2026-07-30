import SundayTournamentBoardClient from "@/components/SundayTournamentBoardClient";
import { getSundayDataFromDatabase } from "@/lib/repositories/sunday-db";
import { calculateSundayTournamentBoard } from "@/lib/sunday-tournament-board";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function SundayResultsPage() {
  const sundayData = await getSundayDataFromDatabase(createAdminClient());

  return (
    <>
      <section className="hero fridayResultsHero">
        <h1>Sunday Tournament Board</h1>
        <p>Mountain Course · Pinehurst Front Nine · Singles Back Nine</p>
      </section>

      <SundayTournamentBoardClient
        initial={calculateSundayTournamentBoard(sundayData)}
      />
    </>
  );
}
