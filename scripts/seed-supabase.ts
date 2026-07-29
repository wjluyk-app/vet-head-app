import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Supabase environment variables are missing.");

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const seed = JSON.parse(
    await readFile("src/data/2026-workbook-seed.json", "utf8"),
  );

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournament")
    .upsert(
      {
        name: seed.tournament.name,
        year: seed.tournament.year,
        venue: seed.tournament.venue,
        start_date: seed.tournament.startDate,
        end_date: seed.tournament.endDate,
        total_payout_pool: seed.tournament.totalPayoutPool,
        visual_template_version: seed.tournament.visualTemplateVersion,
      },
      { onConflict: "name,year" },
    )
    .select()
    .single();

  if (tournamentError) throw tournamentError;

  const teamRows = seed.teams.map((team: any) => ({
    tournament_id: tournament.id,
    name: team.name,
    short_name: team.shortName,
    pairing_advantage: team.pairingAdvantage,
  }));
  const { data: teams, error: teamError } = await supabase
    .from("team")
    .upsert(teamRows, { onConflict: "tournament_id,short_name" })
    .select();
  if (teamError) throw teamError;

  const teamByShortName = new Map(teams.map((team: any) => [team.short_name, team.id]));

  for (const sourcePlayer of seed.players) {
    const { data: player, error: playerError } = await supabase
      .from("player")
      .upsert(
        {
          source_player_id: sourcePlayer.sourcePlayerId,
          first_name: sourcePlayer.firstName,
          last_name: sourcePlayer.lastName,
          display_name: sourcePlayer.displayName,
          short_display_name: sourcePlayer.displayName,
          birthdate: sourcePlayer.birthdate,
          active: true,
          notes: sourcePlayer.notes,
        },
        { onConflict: "source_player_id" },
      )
      .select()
      .single();
    if (playerError) throw playerError;

    const teamId = teamByShortName.get(sourcePlayer.teamShortName);
    if (!teamId) throw new Error(`Missing team ${sourcePlayer.teamShortName}`);

    const { error: tournamentPlayerError } = await supabase
      .from("tournament_player")
      .upsert(
        {
          tournament_id: tournament.id,
          player_id: player.id,
          team_id: teamId,
          event_age: sourcePlayer.eventAge,
          handicap_index: sourcePlayer.handicapIndex,
          course_handicap: sourcePlayer.mountainHandicap,
          friday_playing_handicap: sourcePlayer.fridayPlayingHandicap,
          default_tee: sourcePlayer.eventTeeGroup,
          adjusted_tee: sourcePlayer.mountainTee,
          tee_reason: sourcePlayer.notes,
          captain_status: sourcePlayer.captain,
          shirt_size: sourcePlayer.shirtSize,
          housing_unit: sourcePlayer.housingUnit,
        },
        { onConflict: "tournament_id,player_id" },
      );
    if (tournamentPlayerError) throw tournamentPlayerError;
  }

  console.log(`Seeded tournament ${tournament.id}, ${teams.length} teams and ${seed.players.length} players.`);
  console.log("Pairing and scorecard persistence is the next transaction block.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
