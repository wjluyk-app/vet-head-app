import FridayTournamentBoardClient from "@/components/FridayTournamentBoardClient";
import { calculateFridayTournamentBoard } from "@/lib/friday-tournament-board";
import { getFridayMatchesFromDatabase } from "@/lib/repositories/friday-db";
import { createAdminClient } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export default async function FridayResultsPage(){const matches=await getFridayMatchesFromDatabase(createAdminClient());return <><section className="hero fridayResultsHero"><h1>Friday Tournament Board</h1><p>Mountain Course · 1 Best Ball of 2 · NET team scores</p></section><FridayTournamentBoardClient initial={calculateFridayTournamentBoard(matches)}/></>}
