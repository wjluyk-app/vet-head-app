import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE;

if (!url || !serviceKey) {
  throw new Error(
    "Vet Head Supabase URL or service-role key is missing from .env.local.",
  );
}

if (url !== "https://rzpntxaireviewkdswdt.supabase.co") {
  throw new Error(`Wrong Supabase project: ${url}`);
}

const supabase = createClient(url, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const playerSeeds = [
  ["P1", "Player 1", 2.4],
  ["P2", "Player 2", 4.1],
  ["P3", "Player 3", 6.3],
  ["P4", "Player 4", 7.8],
  ["P5", "Player 5", 9.2],
  ["P6", "Player 6", 10.5],
  ["P7", "Player 7", 12.0],
  ["P8", "Player 8", 13.7],
  ["P9", "Player 9", 15.1],
  ["P10", "Player 10", 17.3],
  ["P11", "Player 11", 19.6],
  ["P12", "Player 12", 22.0],
];

const courseSeeds = [
  ["CT1", "Placeholder North", "Tournament", 72, 72.1, 125],
  ["CT2", "Placeholder East", "Tournament", 72, 71.8, 123],
  ["CT3", "Placeholder West", "Tournament", 72, 72.5, 128],
  ["CT4", "Placeholder South", "Tournament", 72, 71.4, 120],
  ["CT5", "Placeholder Championship", "Tournament", 72, 72.8, 130],
];

const roundSeeds = [
  [1, "Thursday Individual Net", "2026-08-13", "08:00:00", "individual_net", "CT1"],
  [2, "Friday AM Individual Net", "2026-08-14", "08:00:00", "individual_net", "CT2"],
  [3, "Friday PM 4-Man Scramble", "2026-08-14", "14:00:00", "four_man_scramble", "CT3"],
  [4, "Saturday AM Individual Net", "2026-08-15", "08:00:00", "individual_net", "CT4"],
  [5, "Saturday PM 4-Man Scramble", "2026-08-15", "14:00:00", "four_man_scramble", "CT5"],
];

const pairingSeeds = {
  1: [
    ["P1", "P2", "P3", "P4"],
    ["P5", "P6", "P7", "P8"],
    ["P9", "P10", "P11", "P12"],
  ],
  2: [
    ["P1", "P5", "P9", "P10"],
    ["P2", "P6", "P11", "P12"],
    ["P3", "P4", "P7", "P8"],
  ],
  3: [
    ["P1", "P6", "P8", "P11"],
    ["P2", "P4", "P9", "P12"],
    ["P3", "P5", "P7", "P10"],
  ],
  4: [
    ["P1", "P7", "P9", "P12"],
    ["P2", "P5", "P8", "P10"],
    ["P3", "P4", "P6", "P11"],
  ],
  5: [
    ["P1", "P4", "P8", "P10"],
    ["P2", "P5", "P9", "P11"],
    ["P3", "P6", "P7", "P12"],
  ],
};

const individualNetTargets = {
  1: [70, 72, 74, 76, 71, 73, 75, 77, 72, 74, 76, 78],
  2: [73, 70, 75, 77, 72, 74, 76, 78, 71, 73, 75, 77],
  4: [72, 70, 74, 76, 71, 73, 75, 77, 69, 72, 74, 78],
};

const scrambleNetTargets = {
  3: [64, 66, 68],
  5: [67, 63, 65],
};

function unroundedCourseHandicap(index, slope, rating, par) {
  return index * (slope / 113) + (rating - par);
}

function roundedCourseHandicap(index, slope, rating, par) {
  return Math.round(
    unroundedCourseHandicap(index, slope, rating, par),
  );
}

function scrambleHandicap(courseHandicaps) {
  const sorted = [...courseHandicaps].sort((a, b) => a - b);

  return Math.round(
    sorted[0] * 0.25 +
      sorted[1] * 0.20 +
      sorted[2] * 0.15 +
      sorted[3] * 0.10,
  );
}

const { data: tournament, error: tournamentError } = await supabase
  .from("tournament")
  .select("*")
  .eq("name", "VET HEAD")
  .eq("year", 2026)
  .single();

if (tournamentError || !tournament) {
  throw new Error(
    tournamentError?.message ?? "VET HEAD 2026 tournament not found.",
  );
}

const { data: existingPlayers, error: existingPlayersError } =
  await supabase
    .from("player")
    .select("id, import_key, display_name")
    .eq("tournament_id", tournament.id);

if (existingPlayersError) {
  throw existingPlayersError;
}

const allowedPlaceholderNames = new Set(
  playerSeeds.map(([, name]) => name),
);

for (const player of existingPlayers ?? []) {
  if (
    player.display_name &&
    !allowedPlaceholderNames.has(player.display_name)
  ) {
    throw new Error(
      `STOP: Real/non-placeholder player detected: ${player.display_name}. No placeholder seed was applied.`,
    );
  }
}

const playerByKey = new Map();

for (const [importKey, displayName, handicapIndex] of playerSeeds) {
  const existing = (existingPlayers ?? []).find(
    (player) => player.import_key === importKey,
  );

  if (existing) {
    const { data, error } = await supabase
      .from("player")
      .update({
        display_name: displayName,
        handicap_index: handicapIndex,
        active: true,
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw error;
    playerByKey.set(importKey, data);
  } else {
    const { data, error } = await supabase
      .from("player")
      .insert({
        tournament_id: tournament.id,
        import_key: importKey,
        display_name: displayName,
        handicap_index: handicapIndex,
        active: true,
      })
      .select("*")
      .single();

    if (error) throw error;
    playerByKey.set(importKey, data);
  }
}

const { data: existingCourses, error: existingCoursesError } =
  await supabase
    .from("course_tee")
    .select("*")
    .eq("tournament_id", tournament.id);

if (existingCoursesError) throw existingCoursesError;

const courseByKey = new Map();

for (const [
  importKey,
  courseName,
  teeName,
  par,
  courseRating,
  slopeRating,
] of courseSeeds) {
  const existing = (existingCourses ?? []).find(
    (course) => course.import_key === importKey,
  );

  const payload = {
    tournament_id: tournament.id,
    import_key: importKey,
    course_name: courseName,
    tee_name: teeName,
    par,
    course_rating: courseRating,
    slope_rating: slopeRating,
  };

  if (existing) {
    const { data, error } = await supabase
      .from("course_tee")
      .update(payload)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw error;
    courseByKey.set(importKey, data);
  } else {
    const { data, error } = await supabase
      .from("course_tee")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;
    courseByKey.set(importKey, data);
  }
}

const roundByNumber = new Map();

for (const [
  roundNumber,
  name,
  roundDate,
  teeTime,
  format,
  courseKey,
] of roundSeeds) {
  const course = courseByKey.get(courseKey);

  if (!course) {
    throw new Error(`Course ${courseKey} not found.`);
  }

  const { data, error } = await supabase
    .from("tournament_round")
    .update({
      name,
      round_date: roundDate,
      tee_time: teeTime,
      format,
      course_tee_id: course.id,
      status: "complete",
    })
    .eq("tournament_id", tournament.id)
    .eq("round_number", roundNumber)
    .select("*")
    .single();

  if (error) throw error;
  roundByNumber.set(roundNumber, data);
}

const { data: groups, error: groupsError } = await supabase
  .from("round_group")
  .select("id, round_id, group_number, name");

if (groupsError) throw groupsError;

const tournamentRoundIds = new Set(
  [...roundByNumber.values()].map((round) => round.id),
);

const tournamentGroups = (groups ?? []).filter((group) =>
  tournamentRoundIds.has(group.round_id),
);

const groupByRoundAndNumber = new Map();

for (const group of tournamentGroups) {
  const round = [...roundByNumber.entries()].find(
    ([, value]) => value.id === group.round_id,
  );

  if (round) {
    groupByRoundAndNumber.set(
      `${round[0]}:${group.group_number}`,
      group,
    );
  }
}

if (groupByRoundAndNumber.size !== 15) {
  throw new Error(
    `Expected 15 Vet Head groups, found ${groupByRoundAndNumber.size}.`,
  );
}

const tournamentGroupIds = tournamentGroups.map((group) => group.id);

const { error: deleteAssignmentsError } = await supabase
  .from("round_group_player")
  .delete()
  .in("round_group_id", tournamentGroupIds);

if (deleteAssignmentsError) throw deleteAssignmentsError;

const pairingRows = [];

for (const [roundText, roundPairings] of Object.entries(pairingSeeds)) {
  const roundNumber = Number(roundText);

  roundPairings.forEach((playerKeys, index) => {
    const groupNumber = index + 1;
    const group = groupByRoundAndNumber.get(
      `${roundNumber}:${groupNumber}`,
    );

    if (!group) {
      throw new Error(
        `Round ${roundNumber} Group ${groupNumber} not found.`,
      );
    }

    playerKeys.forEach((playerKey, playerIndex) => {
      const player = playerByKey.get(playerKey);

      if (!player) {
        throw new Error(`Player ${playerKey} not found.`);
      }

      pairingRows.push({
        round_group_id: group.id,
        player_id: player.id,
        player_order: playerIndex + 1,
      });
    });
  });
}

const { error: pairingInsertError } = await supabase
  .from("round_group_player")
  .insert(pairingRows);

if (pairingInsertError) throw pairingInsertError;

const payoutRows = [
  ["PAY01", "Thursday Individual Net", 1, "1st", "player", 50, 1, 50],
  ["PAY02", "Thursday Individual Net", 1, "2nd", "player", 30, 1, 30],
  ["PAY03", "Thursday Individual Net", 1, "3rd", "player", 20, 1, 20],

  ["PAY04", "Friday AM Individual Net", 2, "1st", "player", 50, 1, 50],
  ["PAY05", "Friday AM Individual Net", 2, "2nd", "player", 30, 1, 30],
  ["PAY06", "Friday AM Individual Net", 2, "3rd", "player", 20, 1, 20],

  ["PAY07", "Friday PM Scramble", 3, "1st", "player", 25, 4, 100],

  ["PAY08", "Saturday AM Individual Net", 4, "1st", "player", 50, 1, 50],
  ["PAY09", "Saturday AM Individual Net", 4, "2nd", "player", 30, 1, 30],
  ["PAY10", "Saturday AM Individual Net", 4, "3rd", "player", 20, 1, 20],

  ["PAY11", "Saturday PM Scramble", 5, "1st", "player", 25, 4, 100],

  ["PAY12", "Vet Head MVP", null, "1st", "player", 225, 1, 225],
  ["PAY13", "Vet Head MVP", null, "2nd", "player", 125, 1, 125],
  ["PAY14", "Vet Head MVP", null, "3rd", "player", 75, 1, 75],
  ["PAY15", "Vet Head MVP", null, "4th", "player", 50, 1, 50],

  ["PAY16", "Vet Header", null, "1st", "player", 150, 1, 150],
  ["PAY17", "Vet Header", null, "2nd", "player", 75, 1, 75],
];

const { error: deletePayoutError } = await supabase
  .from("prize_payout")
  .delete()
  .eq("tournament_id", tournament.id);

if (deletePayoutError) throw deletePayoutError;

const payoutInsertRows = payoutRows.map(
  ([
    importKey,
    competition,
    roundNumber,
    place,
    recipientType,
    amountPerRecipient,
    recipients,
    totalPayout,
  ]) => ({
    tournament_id: tournament.id,
    import_key: importKey,
    competition,
    round_id:
      roundNumber === null
        ? null
        : roundByNumber.get(roundNumber)?.id ?? null,
    place,
    recipient_type: recipientType,
    amount_per_recipient: amountPerRecipient,
    recipients,
    total_payout: totalPayout,
  }),
);

const { error: payoutInsertError } = await supabase
  .from("prize_payout")
  .insert(payoutInsertRows);

if (payoutInsertError) throw payoutInsertError;

const roundIds = [...roundByNumber.values()].map((round) => round.id);

const { error: deleteIndividualError } = await supabase
  .from("individual_score")
  .delete()
  .in("round_id", roundIds);

if (deleteIndividualError) throw deleteIndividualError;

const { error: deleteScrambleError } = await supabase
  .from("scramble_score")
  .delete()
  .in("round_id", roundIds);

if (deleteScrambleError) throw deleteScrambleError;

const playerKeys = playerSeeds.map(([key]) => key);
const individualRows = [];

for (const roundNumber of [1, 2, 4]) {
  const round = roundByNumber.get(roundNumber);
  const courseKey = roundSeeds.find(
    ([number]) => number === roundNumber,
  )[5];
  const course = courseByKey.get(courseKey);
  const targetNets = individualNetTargets[roundNumber];

  playerKeys.forEach((playerKey, index) => {
    const player = playerByKey.get(playerKey);
    const courseHandicap = roundedCourseHandicap(
      Number(player.handicap_index),
      Number(course.slope_rating),
      Number(course.course_rating),
      Number(course.par),
    );

    const netScore = targetNets[index];
    const grossScore = netScore + courseHandicap;

    individualRows.push({
      round_id: round.id,
      player_id: player.id,
      gross_score: grossScore,
      course_handicap: courseHandicap,
      net_score: netScore,
    });
  });
}

const { error: individualInsertError } = await supabase
  .from("individual_score")
  .insert(individualRows);

if (individualInsertError) throw individualInsertError;

const scrambleRows = [];

for (const roundNumber of [3, 5]) {
  const round = roundByNumber.get(roundNumber);
  const courseKey = roundSeeds.find(
    ([number]) => number === roundNumber,
  )[5];
  const course = courseByKey.get(courseKey);

  pairingSeeds[roundNumber].forEach((groupPlayerKeys, index) => {
    const groupNumber = index + 1;
    const group = groupByRoundAndNumber.get(
      `${roundNumber}:${groupNumber}`,
    );

    const unroundedHandicaps = groupPlayerKeys.map((playerKey) => {
      const player = playerByKey.get(playerKey);

      return unroundedCourseHandicap(
        Number(player.handicap_index),
        Number(course.slope_rating),
        Number(course.course_rating),
        Number(course.par),
      );
    });

    const teamHandicap = scrambleHandicap(unroundedHandicaps);
    const netScore = scrambleNetTargets[roundNumber][index];
    const grossScore = netScore + teamHandicap;

    scrambleRows.push({
      round_id: round.id,
      round_group_id: group.id,
      gross_score: grossScore,
      team_handicap: teamHandicap,
      net_score: netScore,
    });
  });
}

const { error: scrambleInsertError } = await supabase
  .from("scramble_score")
  .insert(scrambleRows);

if (scrambleInsertError) throw scrambleInsertError;

const [
  playersCount,
  coursesCount,
  roundsCount,
  groupsCount,
  pairingsCount,
  individualCount,
  scrambleCount,
  payoutsResult,
] = await Promise.all([
  supabase
    .from("player")
    .select("*", { count: "exact", head: true })
    .eq("tournament_id", tournament.id)
    .eq("active", true),

  supabase
    .from("course_tee")
    .select("*", { count: "exact", head: true })
    .eq("tournament_id", tournament.id),

  supabase
    .from("tournament_round")
    .select("*", { count: "exact", head: true })
    .eq("tournament_id", tournament.id),

  supabase
    .from("round_group")
    .select("*", { count: "exact", head: true })
    .in("round_id", roundIds),

  supabase
    .from("round_group_player")
    .select("*", { count: "exact", head: true })
    .in("round_group_id", tournamentGroupIds),

  supabase
    .from("individual_score")
    .select("*", { count: "exact", head: true })
    .in("round_id", roundIds),

  supabase
    .from("scramble_score")
    .select("*", { count: "exact", head: true })
    .in("round_id", roundIds),

  supabase
    .from("prize_payout")
    .select("total_payout")
    .eq("tournament_id", tournament.id),
]);

const payoutTotal = (payoutsResult.data ?? []).reduce(
  (sum, row) => sum + Number(row.total_payout),
  0,
);

console.log("");
console.log("PLACEHOLDER TOURNAMENT SEEDED");
console.log(`Players:            ${playersCount.count} / 12`);
console.log(`Courses / Tees:     ${coursesCount.count} / 5`);
console.log(`Rounds:              ${roundsCount.count} / 5`);
console.log(`Groups:              ${groupsCount.count} / 15`);
console.log(`Pairing Slots:       ${pairingsCount.count} / 60`);
console.log(`Individual Scores:   ${individualCount.count} / 36`);
console.log(`Scramble Scores:     ${scrambleCount.count} / 6`);
console.log(`Payout Rows:         ${(payoutsResult.data ?? []).length} / 17`);
console.log(`Prize Pool:          $${payoutTotal} / $1200`);

if (
  playersCount.count !== 12 ||
  coursesCount.count !== 5 ||
  roundsCount.count !== 5 ||
  groupsCount.count !== 15 ||
  pairingsCount.count !== 60 ||
  individualCount.count !== 36 ||
  scrambleCount.count !== 6 ||
  (payoutsResult.data ?? []).length !== 17 ||
  payoutTotal !== 1200
) {
  throw new Error("Placeholder tournament verification failed.");
}

console.log("DATABASE VERIFICATION: PASSED");
