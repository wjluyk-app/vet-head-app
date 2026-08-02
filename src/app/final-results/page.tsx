import OverallTournamentBoardClient from "@/components/OverallTournamentBoardClient";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFridayMatchesFromDatabase } from "@/lib/repositories/friday-db";
import { getSaturdayMatchesFromDatabase } from "@/lib/repositories/saturday-db";
import { getSundayDataFromDatabase } from "@/lib/repositories/sunday-db";
import { calculateFridayTournamentBoard } from "@/lib/friday-tournament-board";
import { calculateSaturdayTournamentBoard } from "@/lib/saturday-tournament-board";
import { calculateSundayTournamentBoard } from "@/lib/sunday-tournament-board";
import { calculateOverallTournamentBoard } from "@/lib/overall-tournament-board";
import { calculatePlayerAwards } from "@/lib/player-awards";

export const dynamic = "force-dynamic";

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

interface PlayerPayout {
  player: string;
  team: "LUKE" | "SAM";
  fridayField: number;
  fridaySkins: number;
  saturdayField: number;
  sundayPinehurst: number;
  winningTeamBonus: number;
  mvpBonus: number;
  total: number;
}

export default async function FinalResultsPage() {
  const supabase = createAdminClient();

  const [fridayMatches, saturdayMatches, sundayData] =
    await Promise.all([
      getFridayMatchesFromDatabase(supabase),
      getSaturdayMatchesFromDatabase(supabase),
      getSundayDataFromDatabase(supabase),
    ]);

  const friday = calculateFridayTournamentBoard(fridayMatches);
  const saturday = calculateSaturdayTournamentBoard(saturdayMatches);
  const sunday = calculateSundayTournamentBoard(sundayData);

  const overall = calculateOverallTournamentBoard(
    friday,
    saturday,
    sunday,
  );

  const playerAwards = calculatePlayerAwards(
    friday,
    saturday,
    sunday,
    overall,
  );

  const payouts = new Map<string, PlayerPayout>();

  for (const player of playerAwards.playerTotals) {
    payouts.set(`${player.team}:${player.player}`, {
      player: player.player,
      team: player.team,
      fridayField: 0,
      fridaySkins: 0,
      saturdayField: 0,
      sundayPinehurst: 0,
      winningTeamBonus:
        overall.complete && overall.winner === player.team ? 40 : 0,
      mvpBonus: playerAwards.leaders.some(
        (leader) =>
          leader.team === player.team &&
          leader.player === player.player,
      )
        ? playerAwards.mvpPayoutEach
        : 0,
      total: 0,
    });
  }

  function add(
    team: "LUKE" | "SAM",
    players: string,
    field:
      | "fridayField"
      | "fridaySkins"
      | "saturdayField"
      | "sundayPinehurst",
    amount: number,
  ) {
    const names = players.split(" / ");
    const share = names.length ? amount / names.length : 0;

    for (const player of names) {
      const normalizedPlayer =
        player === "L. Swardo" ? "Luke Swardenski" : player;

      const row = payouts.get(`${team}:${normalizedPlayer}`);
      if (row) row[field] += share;
    }
  }

  for (const team of friday.teams) {
    add(
      team.captainTeam,
      team.players,
      "fridayField",
      team.fieldPayout,
    );

    const skinTotal = friday.skins
      .filter((skin) => skin.sourceKey === team.sourceKey)
      .reduce((sum, skin) => sum + skin.teamPayout, 0);

    add(
      team.captainTeam,
      team.players,
      "fridaySkins",
      skinTotal,
    );
  }

  for (const team of saturday.teams) {
    add(
      team.captainTeam,
      team.players,
      "saturdayField",
      team.fieldPayout,
    );
  }

  for (const match of sunday.pinehurst.matches) {
    add(
      "LUKE",
      match.lukePlayers,
      "sundayPinehurst",
      match.lukeFieldPayout,
    );
    add(
      "SAM",
      match.samPlayers,
      "sundayPinehurst",
      match.samFieldPayout,
    );
  }

  const playerPayouts = [...payouts.values()]
    .map((row) => ({
      ...row,
      total:
        row.fridayField +
        row.fridaySkins +
        row.saturdayField +
        row.sundayPinehurst +
        row.winningTeamBonus +
        row.mvpBonus,
    }))
    .sort(
      (a, b) =>
        b.total - a.total ||
        a.player.localeCompare(b.player),
    );

  const totalPaid = playerPayouts.reduce(
    (sum, player) => sum + player.total,
    0,
  );

  const championshipMessage = overall.complete
    ? overall.winner === "LUKE"
      ? "Team Luke are the 2026 Cubby Cup Champions."
      : overall.winner === "SAM"
        ? "Team Sam are the 2026 Cubby Cup Champions."
        : "The 2026 Cubby Cup finished tied."
    : "Final results will be declared after all 54 points are awarded.";

  return (
    <>
      <section className="hero fridayResultsHero">
        <div className="smallLabel">PERMANENT RECORD</div>
        <h1>Final Results</h1>
        <p>{championshipMessage}</p>
      </section>

      <OverallTournamentBoardClient initial={overall} />

      {playerAwards.complete && playerAwards.leaders.length > 0 && (
        <section className="mvpFeatureCard">
          <div className="mvpFeatureLabel">2026 CUBBY CUP MVP</div>

          <div className="mvpFeatureNames">
            {playerAwards.leaders.map((leader) => (
              <div key={`${leader.team}:${leader.player}`}>
                <h2>{leader.player}</h2>
                <p>
                  Team {leader.team} · {leader.points} points ·{" "}
                  {money(playerAwards.mvpPayoutEach)} award
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="finalPayoutSection">
        <div className="finalPayoutHeader">
          <div>
            <div className="smallLabel">FINAL PLAYER PAYOUTS</div>
            <h2>Player Payment Summary</h2>
            <p>
              All field awards, skins, team bonuses and MVP money.
            </p>
          </div>

          <div className="finalPayoutTotal">
            <span>TOTAL PAID</span>
            <strong>{money(totalPaid)}</strong>
          </div>
        </div>

        <div className="finalPayoutList">
          {playerPayouts.map((player) => (
            <article
              className="finalPayoutCard"
              key={`${player.team}:${player.player}`}
            >
              <div className="finalPayoutPlayer">
                <div>
                  <span>TEAM {player.team}</span>
                  <h3>{player.player}</h3>
                </div>

                <strong>{money(player.total)}</strong>
              </div>

              <div className="finalPayoutBreakdown">
                <div>
                  <span>Friday Field</span>
                  <strong>{money(player.fridayField)}</strong>
                </div>
                <div>
                  <span>Friday Skins</span>
                  <strong>{money(player.fridaySkins)}</strong>
                </div>
                <div>
                  <span>Saturday Field</span>
                  <strong>{money(player.saturdayField)}</strong>
                </div>
                <div>
                  <span>Sunday Pinehurst</span>
                  <strong>{money(player.sundayPinehurst)}</strong>
                </div>
                <div>
                  <span>Winning Team</span>
                  <strong>{money(player.winningTeamBonus)}</strong>
                </div>
                <div>
                  <span>MVP</span>
                  <strong>{money(player.mvpBonus)}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
