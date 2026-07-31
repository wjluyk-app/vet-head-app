import { createAdminClient } from "@/lib/supabase/admin";
import { getFridayMatchesFromDatabase } from "@/lib/repositories/friday-db";
import { calculateFridayTournamentBoard } from "@/lib/friday-tournament-board";
export const dynamic = "force-dynamic";
export async function GET(){
  try { const matches=await getFridayMatchesFromDatabase(createAdminClient()); return Response.json({ok:true,board:calculateFridayTournamentBoard(matches)}); }
  catch(error){ return Response.json({ok:false,error:error instanceof Error?error.message:"Board unavailable"},{status:500}); }
}
