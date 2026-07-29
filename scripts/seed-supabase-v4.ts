import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

type Seed = any;

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are missing.");
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const seed: Seed = JSON.parse(await readFile("src/data/2026-workbook-seed.json", "utf8"));

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournament")
    .upsert({
      name: seed.tournament.name,
      year: seed.tournament.year,
      venue: seed.tournament.venue,
      start_date: seed.tournament.startDate,
      end_date: seed.tournament.endDate,
      total_payout_pool: seed.tournament.totalPayoutPool,
      visual_template_version: seed.tournament.visualTemplateVersion,
    }, { onConflict: "name,year" })
    .select().single();
  if (tournamentError) throw tournamentError;

  const { data: teams, error: teamsError } = await supabase
    .from("team")
    .upsert(seed.teams.map((team: any) => ({
      tournament_id: tournament.id,
      name: team.name,
      short_name: team.shortName,
      pairing_advantage: team.pairingAdvantage,
    })), { onConflict: "tournament_id,short_name" })
    .select();
  if (teamsError) throw teamsError;
  const teamByShort = new Map(teams.map((team: any) => [team.short_name, team]));

  const playerByDisplay = new Map<string, any>();
  for (const source of seed.players) {
    const { data: player, error } = await supabase
      .from("player")
      .upsert({
        source_player_id: source.sourcePlayerId,
        first_name: source.firstName,
        last_name: source.lastName,
        display_name: source.displayName,
        short_display_name: source.displayName,
        birthdate: source.birthdate,
        active: true,
        notes: source.notes,
      }, { onConflict: "source_player_id" })
      .select().single();
    if (error) throw error;
    playerByDisplay.set(source.displayName, player);

    const team = teamByShort.get(source.teamShortName);
    if (!team) throw new Error(`Missing team ${source.teamShortName}`);
    const { error: tpError } = await supabase.from("tournament_player").upsert({
      tournament_id: tournament.id,
      player_id: player.id,
      team_id: team.id,
      event_age: source.eventAge,
      handicap_index: source.handicapIndex,
      course_handicap: source.mountainHandicap,
      friday_playing_handicap: source.fridayPlayingHandicap,
      saturday_playing_handicap: source.betsieHandicap,
      default_tee: source.eventTeeGroup,
      adjusted_tee: source.mountainTee,
      tee_reason: source.notes,
      captain_status: source.captain,
      shirt_size: source.shirtSize,
      housing_unit: source.housingUnit,
    }, { onConflict: "tournament_id,player_id" });
    if (tpError) throw tpError;
  }

  const sessions = [
    { name: "Friday", day_number: 1, session_date: "2026-08-28", course: "Mountain Course", format: "1 Best Ball of 2", hole_count: 18, skins_enabled: true, field_payouts_enabled: true },
    { name: "Saturday", day_number: 2, session_date: "2026-08-29", course: "Betsie Valley", format: "18-hole Scramble", hole_count: 18, skins_enabled: false, field_payouts_enabled: true },
    { name: "Sunday Pinehurst", day_number: 3, session_date: "2026-08-30", course: "Mountain Course", format: "Pinehurst", hole_count: 9, skins_enabled: false, field_payouts_enabled: true },
    { name: "Sunday Singles", day_number: 3, session_date: "2026-08-30", course: "Mountain Course", format: "Singles", hole_count: 9, skins_enabled: false, field_payouts_enabled: false },
  ];
  const sessionByName = new Map<string, any>();
  for (const item of sessions) {
    const { data, error } = await supabase.from("session").upsert({
      tournament_id: tournament.id,
      ...item,
      status: item.name === "Friday" ? "open" : "setup",
    }, { onConflict: "tournament_id,name" }).select().single();
    if (error) throw error;
    sessionByName.set(item.name, data);
  }

  const dayMap: Record<string, string> = {
    "Friday": "Friday",
    "Saturday": "Saturday",
    "Sunday Front": "Sunday Pinehurst",
    "Sunday Back": "Sunday Singles",
  };

  for (const source of seed.pairings) {
    const session = sessionByName.get(dayMap[source.day]);
    if (!session) throw new Error(`Missing session for ${source.day}`);
    const { data: pairing, error } = await supabase.from("pairing").upsert({
      session_id: session.id,
      match_number: source.matchNumber,
      tee_time: source.teeTime,
      starting_hole: source.day === "Sunday Back" ? 10 : 1,
      match_order: source.matchNumber,
      throws_first_team_id: source.throwsFirst ? teamByShort.get(source.throwsFirst)?.id : null,
      status: source.status?.toLowerCase() ?? "ready",
    }, { onConflict: "session_id,match_number" }).select().single();
    if (error) throw error;

    await supabase.from("pairing_participant").delete().eq("pairing_id", pairing.id);
    const participants = [
      [source.lukePlayer1, "L. Swardo", 1, source.lukeHandicapReference],
      [source.lukePlayer2, "L. Swardo", 2, source.lukeHandicapReference],
      [source.samPlayer1, "S. Swardo", 1, source.samHandicapReference],
      [source.samPlayer2, "S. Swardo", 2, source.samHandicapReference],
    ].filter(([name]) => Boolean(name));

    const participantRows = participants.map(([name, shortName, order, hcp]) => ({
      pairing_id: pairing.id,
      team_id: teamByShort.get(shortName as string)?.id,
      player_id: playerByDisplay.get(name as string)?.id,
      participant_order: order,
      handicap_reference: typeof hcp === "number" ? hcp : null,
    }));
    const { error: ppError } = await supabase.from("pairing_participant").insert(participantRows);
    if (ppError) throw ppError;

    if (source.day === "Friday" || source.day === "Saturday" || source.day === "Sunday Front") {
      for (const shortName of ["L. Swardo", "S. Swardo"]) {
        const sourceKey = `${source.day.toLowerCase().replaceAll(" ", "-")}-match-${source.matchNumber}-${shortName === "L. Swardo" ? "luke" : "sam"}`;
        const { data: scorecard, error: scError } = await supabase.from("scorecard").upsert({
          pairing_id: pairing.id,
          subject_type: "team",
          team_id: teamByShort.get(shortName)?.id,
          source_key: sourceKey,
          locked: false,
        }, { onConflict: "source_key" }).select().single();
        if (scError) throw scError;

        if (source.day === "Friday") {
          const sourceCard = seed.friday.scorecards.find(
            (card: any) => card.matchNumber === source.matchNumber && card.teamShortName === shortName,
          );
          if (!sourceCard) throw new Error(`Missing source Friday scorecard ${sourceKey}`);
          const rows = sourceCard.scores.map((netScore: number, index: number) => ({
            scorecard_id: scorecard.id,
            hole_number: index + 1,
            net_score: netScore,
            version: 1,
          }));
          const { error: hsError } = await supabase.from("hole_score").upsert(
            rows, { onConflict: "scorecard_id,hole_number" },
          );
          if (hsError) throw hsError;
        }
      }
    }
  }

  const { count: playerCount } = await supabase.from("tournament_player")
    .select("*", { count: "exact", head: true }).eq("tournament_id", tournament.id);
  const { count: fridayPairings } = await supabase.from("pairing")
    .select("*", { count: "exact", head: true }).eq("session_id", sessionByName.get("Friday").id);
  const { count: fridayScores } = await supabase.from("hole_score")
    .select("*, scorecard!inner(pairing!inner(session_id))", { count: "exact", head: true })
    .eq("scorecard.pairing.session_id", sessionByName.get("Friday").id);

  if (playerCount !== 24 || fridayPairings !== 6 || fridayScores !== 216) {
    throw new Error(`Seed validation failed: players=${playerCount}, Friday pairings=${fridayPairings}, Friday scores=${fridayScores}`);
  }

  console.log("Version 4 seed completed.");
  console.log(`Players: ${playerCount}`);
  console.log(`Friday pairings: ${fridayPairings}`);
  console.log(`Friday hole scores: ${fridayScores}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
