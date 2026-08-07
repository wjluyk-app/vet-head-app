import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE;

if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!key) throw new Error("Missing Vet Head Supabase service role key");

if (url !== "https://rzpntxaireviewkdswdt.supabase.co") {
  throw new Error(`Wrong Supabase project: ${url}`);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function rows(table, select = "*") {
  const { data, error } = await supabase.from(table).select(select);
  if (error) throw error;
  return data ?? [];
}

const tournaments = await rows("tournament");
assert(tournaments.length >= 1, "No tournament found");

const tournament =
  tournaments.find((t) => t.name === "Vet Head" && Number(t.year) === 2026) ||
  tournaments.find((t) => Number(t.year) === 2026) ||
  tournaments[0];

const tournamentId = tournament.id;

const { data: players, error: playersError } = await supabase
  .from("player")
  .select("id, import_key, display_name, handicap_index, active")
  .eq("tournament_id", tournamentId);

if (playersError) throw playersError;

const { data: courses, error: coursesError } = await supabase
  .from("course_tee")
  .select("*")
  .eq("tournament_id", tournamentId);

if (coursesError) throw coursesError;

const { data: rounds, error: roundsError } = await supabase
  .from("tournament_round")
  .select("*")
  .eq("tournament_id", tournamentId)
  .order("round_number");

if (roundsError) throw roundsError;

const roundIds = rounds.map((r) => r.id);

const { data: groups, error: groupsError } = await supabase
  .from("round_group")
  .select("*")
  .in("round_id", roundIds)
  .order("group_number");

if (groupsError) throw groupsError;

const groupIds = groups.map((g) => g.id);

const { data: slots, error: slotsError } = await supabase
  .from("round_group_player")
  .select("*")
  .in("round_group_id", groupIds);

if (slotsError) throw slotsError;

const { data: individualScores, error: individualError } = await supabase
  .from("individual_score")
  .select("*")
  .in("round_id", roundIds);

if (individualError) throw individualError;

const { data: scrambleScores, error: scrambleError } = await supabase
  .from("scramble_score")
  .select("*")
  .in("round_id", roundIds);

if (scrambleError) throw scrambleError;

const { data: payouts, error: payoutsError } = await supabase
  .from("prize_payout")
  .select("*")
  .eq("tournament_id", tournamentId);

if (payoutsError) throw payoutsError;

assert(players.length === 12, `Players ${players.length}/12`);
assert(courses.length === 5, `Courses ${courses.length}/5`);
assert(rounds.length === 5, `Rounds ${rounds.length}/5`);
assert(groups.length === 15, `Groups ${groups.length}/15`);
assert(slots.length === 60, `Pairing slots ${slots.length}/60`);
assert(individualScores.length === 36, `Individual scores ${individualScores.length}/36`);
assert(scrambleScores.length === 6, `Scramble scores ${scrambleScores.length}/6`);
assert(payouts.length === 17, `Payout rows ${payouts.length}/17`);

const payoutTotal = payouts.reduce(
  (sum, p) => sum + Number(p.total_payout ?? 0),
  0,
);

assert(payoutTotal === 1200, `Prize pool $${payoutTotal}/$1200`);

const roundByNumber = new Map(rounds.map((r) => [Number(r.round_number), r]));

for (const n of [1, 2, 3, 4, 5]) {
  const r = roundByNumber.get(n);
  assert(r, `Missing round ${n}`);
  assert(r.status === "complete", `Round ${n} status is ${r.status}, expected complete`);
}

const playerById = new Map(players.map((p) => [p.id, p]));

const individualRoundNumbers = [1, 2, 4];
const individualTotals = new Map();

for (const roundNumber of individualRoundNumbers) {
  const round = roundByNumber.get(roundNumber);
  const scores = individualScores.filter((s) => s.round_id === round.id);

  assert(scores.length === 12, `Round ${roundNumber} individual scores ${scores.length}/12`);

  for (const score of scores) {
    const key = score.player_id;
    individualTotals.set(
      key,
      (individualTotals.get(key) ?? 0) + Number(score.net_score),
    );
  }
}

const vetHeader = [...individualTotals.entries()]
  .map(([playerId, total]) => {
    const getNet = (roundNumber) => {
      const round = roundByNumber.get(roundNumber);
      const score = individualScores.find(
        (s) => s.round_id === round.id && s.player_id === playerId,
      );
      return Number(score?.net_score ?? 999);
    };

    return {
      player: playerById.get(playerId),
      total,
      saturdayAm: getNet(4),
      fridayAm: getNet(2),
      thursday: getNet(1),
    };
  })
  .sort(
    (a, b) =>
      a.total - b.total ||
      a.saturdayAm - b.saturdayAm ||
      a.fridayAm - b.fridayAm ||
      a.thursday - b.thursday,
  );

assert(vetHeader.length === 12, "Vet Head MVP standings incomplete");

const vhWinner = vetHeader[0];

assert(
  vhWinner.player?.import_key === "P9",
  `Expected Vet Head MVP P9, got ${vhWinner.player?.import_key ?? "unknown"}`,
);
assert(
  vhWinner.total === 212,
  `Expected Vet Head MVP winning total 212, got ${vhWinner.total}`,
);

const expectedGroupTotals = {
  1: [292, 296, 300],
  2: [289, 296, 306],
  3: [64, 66, 68],
  4: [294, 290, 297],
  5: [67, 63, 65],
};

const playerPoints = new Map();
const firsts = new Map();
const seconds = new Map();

for (const roundNumber of [1, 2, 3, 4, 5]) {
  const round = roundByNumber.get(roundNumber);

  const roundGroups = groups
    .filter((g) => g.round_id === round.id)
    .sort((a, b) => a.group_number - b.group_number);

  assert(roundGroups.length === 3, `Round ${roundNumber}: expected 3 groups`);

  const computed = [];

  for (const group of roundGroups) {
    if (roundNumber === 3 || roundNumber === 5) {
      const score = scrambleScores.find((s) => s.round_group_id === group.id);
      assert(score, `Missing scramble score round ${roundNumber} group ${group.group_number}`);
      computed.push(Number(score.net_score));
    } else {
      const memberIds = slots
        .filter((s) => s.round_group_id === group.id)
        .map((s) => s.player_id);

      const scores = individualScores.filter(
        (s) => s.round_id === round.id && memberIds.includes(s.player_id),
      );

      assert(scores.length === 4, `Round ${roundNumber} group ${group.group_number}: expected 4 scores`);
      computed.push(scores.reduce((sum, s) => sum + Number(s.net_score), 0));
    }
  }

  const expected = expectedGroupTotals[roundNumber];

  assert(
    JSON.stringify(computed) === JSON.stringify(expected),
    `Round ${roundNumber} group totals ${JSON.stringify(computed)} expected ${JSON.stringify(expected)}`,
  );

  const ranked = roundGroups
    .map((group, i) => ({
      group,
      total: computed[i],
    }))
    .sort((a, b) => a.total - b.total);

  const pointsByGroupId = new Map();

  if (ranked[0].total === ranked[1].total && ranked[1].total === ranked[2].total) {
    for (const x of ranked) pointsByGroupId.set(x.group.id, 6);
  } else if (ranked[0].total === ranked[1].total) {
    pointsByGroupId.set(ranked[0].group.id, 7);
    pointsByGroupId.set(ranked[1].group.id, 7);
    pointsByGroupId.set(ranked[2].group.id, 4);
  } else if (ranked[1].total === ranked[2].total) {
    pointsByGroupId.set(ranked[0].group.id, 8);
    pointsByGroupId.set(ranked[1].group.id, 5);
    pointsByGroupId.set(ranked[2].group.id, 5);
  } else {
    pointsByGroupId.set(ranked[0].group.id, 8);
    pointsByGroupId.set(ranked[1].group.id, 6);
    pointsByGroupId.set(ranked[2].group.id, 4);
  }

  for (const group of roundGroups) {
    const points = pointsByGroupId.get(group.id);

    const place =
      points === 8 ? 1 :
      points === 6 ? 2 :
      points === 4 ? 3 :
      null;

    const members = slots.filter((s) => s.round_group_id === group.id);

    assert(members.length === 4, `Round ${roundNumber} group ${group.group_number}: expected 4 players`);

    for (const member of members) {
      playerPoints.set(
        member.player_id,
        (playerPoints.get(member.player_id) ?? 0) + points,
      );

      if (place === 1) {
        firsts.set(member.player_id, (firsts.get(member.player_id) ?? 0) + 1);
      }

      if (place === 2) {
        seconds.set(member.player_id, (seconds.get(member.player_id) ?? 0) + 1);
      }
    }
  }
}

const mvp = players
  .map((player) => ({
    player,
    points: playerPoints.get(player.id) ?? 0,
    firsts: firsts.get(player.id) ?? 0,
    seconds: seconds.get(player.id) ?? 0,
    vetHeader: individualTotals.get(player.id) ?? 999,
  }))
  .sort(
    (a, b) =>
      b.points - a.points ||
      b.firsts - a.firsts ||
      b.seconds - a.seconds ||
      a.vetHeader - b.vetHeader,
  );

assert(
  mvp[0].player.import_key === "P2",
  `Expected MVP P2, got ${mvp[0].player.import_key}`,
);

assert(
  mvp[0].points === 36,
  `Expected MVP 36 points, got ${mvp[0].points}`,
);

console.log("");
console.log("DATABASE TOURNAMENT VALIDATION");
console.log("------------------------------");
console.log(`Players:             ${players.length}/12`);
console.log(`Courses / Tees:      ${courses.length}/5`);
console.log(`Rounds:              ${rounds.length}/5`);
console.log(`Groups:              ${groups.length}/15`);
console.log(`Pairing Slots:       ${slots.length}/60`);
console.log(`Individual Scores:   ${individualScores.length}/36`);
console.log(`Scramble Scores:     ${scrambleScores.length}/6`);
console.log(`Payout Rows:         ${payouts.length}/17`);
console.log(`Prize Pool:          $${payoutTotal}/$1200`);
console.log(`Vet Head MVP Champion: ${vhWinner.player.display_name} (${vhWinner.total})`);
console.log(`Vet Head Winners:        ${mvp[0].player.display_name} (${mvp[0].points} points)`);
console.log("");
console.log("DATABASE E2E VALIDATION: PASSED");
