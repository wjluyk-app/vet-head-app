import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVetHeadScoreboardData } from "@/lib/repositories/vet-head-scoreboard";

export const dynamic = "force-dynamic";

const money = (value: number) =>
  `$${value.toFixed(value % 1 === 0 ? 0 : 2)}`;

const placeNumber = (place: string) => {
  const value = Number.parseInt(place, 10);
  return Number.isFinite(value) ? value : 999;
};

const placeLabel = (place: number, tied: boolean) => {
  if (tied) return `T${place}`;
  if (place === 1) return "1st";
  if (place === 2) return "2nd";
  if (place === 3) return "3rd";
  return `${place}th`;
};

const splitMoney = (total: number, count: number) => {
  const cents = Math.round(total * 100);
  const base = Math.floor(cents / count);
  const remainder = cents - base * count;

  return Array.from(
    { length: count },
    (_, index) => (base + (index < remainder ? 1 : 0)) / 100,
  );
};

type PrizeRow = {
  id: string;
  round_id: string | null;
  competition: string;
  place: string;
  total_payout: number | string;
};

type RankedEntry = {
  id: string;
  title: string;
  detail: string;
  tieKey: string;
};

type Award = {
  id: string;
  playerId: string;
  place: string;
  title: string;
  detail: string;
  amount: number;
};

const allocateAwards = (
  entries: RankedEntry[],
  prizes: PrizeRow[],
): Award[] => {
  const prizeMap = new Map(
    prizes.map((prize) => [
      placeNumber(prize.place),
      Number(prize.total_payout),
    ]),
  );

  const awards: Award[] = [];
  let index = 0;

  while (index < entries.length) {
    const start = index;
    const tieKey = entries[index].tieKey;

    while (
      index + 1 < entries.length &&
      entries[index + 1].tieKey === tieKey
    ) {
      index += 1;
    }

    const tiedEntries = entries.slice(start, index + 1);
    const startPlace = start + 1;

    let pool = 0;

    for (
      let occupiedPlace = startPlace;
      occupiedPlace < startPlace + tiedEntries.length;
      occupiedPlace += 1
    ) {
      pool += prizeMap.get(occupiedPlace) ?? 0;
    }

    if (pool > 0) {
      const amounts = splitMoney(pool, tiedEntries.length);

      tiedEntries.forEach((entry, tiedIndex) => {
        awards.push({
          id: entry.id,
          playerId: entry.id,
          place: placeLabel(startPlace, tiedEntries.length > 1),
          title: entry.title,
          detail: entry.detail,
          amount: amounts[tiedIndex],
        });
      });
    }

    index += 1;
  }

  return awards;
};

export default async function PayoutResultsPage() {
  const board = await getVetHeadScoreboardData();
  const supabase = createAdminClient();

  const { data: payouts, error } = await supabase
    .from("prize_payout")
    .select(`
      id,
      round_id,
      competition,
      place,
      total_payout
    `)
    .eq("tournament_id", board.tournament.id)
    .order("import_key");

  if (error) {
    throw new Error(error.message);
  }

  const prizeRows = (payouts ?? []) as PrizeRow[];

  const groupedPrizes = new Map<string, PrizeRow[]>();

  for (const prize of prizeRows) {
    const existing = groupedPrizes.get(prize.competition) ?? [];
    existing.push(prize);
    groupedPrizes.set(prize.competition, existing);
  }

  const individualRoundAwards = board.rounds
    .filter(
      (round) =>
        round.format === "individual_net" &&
        round.complete,
    )
    .map((round) => {
      const prizes =
        prizeRows.filter((prize) => prize.round_id === round.id);

      const players = round.groups
        .flatMap((group) => group.players)
        .filter(
          (player): player is typeof player & { net: number } =>
            player.net !== null,
        )
        .sort((a, b) => a.net - b.net);

      const entries: RankedEntry[] = players.map((player) => ({
        id: player.id,
        title: player.name,
        detail: `${player.net} net`,
        tieKey: String(player.net),
      }));

      return {
        competition:
          prizes[0]?.competition ?? round.name,
        complete: true,
        awards: allocateAwards(entries, prizes),
      };
    });

  const scrambleAwards = board.rounds
    .filter(
      (round) =>
        round.format === "four_man_scramble" &&
        round.complete,
    )
    .map((round) => {
      const prizes =
        prizeRows.filter((prize) => prize.round_id === round.id);

      const teams = [...round.groups]
        .filter(
          (group): group is typeof group & { total: number } =>
            group.total !== null,
        )
        .sort((a, b) => a.total - b.total);

      const teamEntries: RankedEntry[] = teams.map((team) => ({
        id: team.id,
        title: team.name,
        detail: `${team.total} net`,
        tieKey: String(team.total),
      }));

      const teamAwards = allocateAwards(teamEntries, prizes);

      const awards: Award[] = [];

      for (const teamAward of teamAwards) {
        const team = teams.find(
          (item) => item.id === teamAward.id,
        );

        if (!team) continue;

        const perPlayer = splitMoney(
          teamAward.amount,
          team.players.length,
        );

        team.players.forEach((player, index) => {
          awards.push({
            id: `${team.id}-${player.id}`,
            playerId: player.id,
            place: teamAward.place,
            title: player.name,
            detail: `${team.name} · ${team.total} net`,
            amount: perPlayer[index],
          });
        });
      }

      return {
        competition:
          prizes[0]?.competition ?? round.name,
        complete: true,
        awards,
      };
    });

  const pointsPrizes =
    groupedPrizes.get("Vet Head Winners") ?? [];

  const pointsComplete = board.completedRounds === 5;

  const pointsEntries: RankedEntry[] = board.mvp.map(
    (standing) => {
      const mvpStanding = board.vetHeader.find(
        (item) => item.playerId === standing.playerId,
      );

      return {
        id: standing.playerId,
        title: standing.playerName,
        detail: `${standing.totalPoints} points`,
        tieKey: [
          standing.totalPoints,
          standing.firstPlaceFinishes,
          standing.secondPlaceFinishes,
          mvpStanding?.totalNet ?? 9999,
        ].join("|"),
      };
    },
  );

  const pointsAwards = pointsComplete
    ? allocateAwards(pointsEntries, pointsPrizes)
    : [];

  const mvpPrizes =
    groupedPrizes.get("Vet Head MVP") ?? [];

  const individualRoundsComplete = board.rounds
    .filter((round) => round.format === "individual_net")
    .every((round) => round.complete);

  const mvpEntries: RankedEntry[] = board.vetHeader.map(
    (standing) => ({
      id: standing.playerId,
      title: standing.playerName,
      detail: `${standing.totalNet} net`,
      tieKey: [
        standing.totalNet,
        standing.saturdayAmNet,
        standing.fridayAmNet,
        standing.thursdayNet,
      ].join("|"),
    }),
  );

  const mvpAwards = individualRoundsComplete
    ? allocateAwards(mvpEntries, mvpPrizes)
    : [];

  const sections = [
    ...individualRoundAwards,
    ...scrambleAwards,
    {
      competition: "Vet Head Points",
      complete: pointsComplete,
      awards: pointsAwards,
    },
    {
      competition: "Vet Head MVP",
      complete: individualRoundsComplete,
      awards: mvpAwards,
    },
  ];

  const paidTotal = sections.reduce(
    (sectionTotal, section) =>
      sectionTotal +
      section.awards.reduce(
        (total, award) => total + award.amount,
        0,
      ),
    0,
  );

  const winningsByPlayer = new Map(
    board.players.map((player) => [
      player.id,
      {
        playerId: player.id,
        playerName: player.display_name,
        total: 0,
        payouts: 0,
      },
    ]),
  );

  for (const section of sections) {
    for (const award of section.awards) {
      const player = winningsByPlayer.get(award.playerId);

      if (!player) continue;

      player.total += award.amount;
      player.payouts += 1;
    }
  }

  const sortedWinnings = Array.from(
    winningsByPlayer.values(),
  ).sort(
    (a, b) =>
      b.total - a.total ||
      a.playerName.localeCompare(b.playerName),
  );

  const winningsRanking: Array<{
    playerId: string;
    playerName: string;
    total: number;
    payouts: number;
    rank: number;
  }> = [];

  let previousTotal: number | null = null;
  let previousRank = 0;

  sortedWinnings.forEach((player, index) => {
    const rank =
      previousTotal !== null && player.total === previousTotal
        ? previousRank
        : index + 1;

    winningsRanking.push({
      ...player,
      rank,
    });

    previousTotal = player.total;
    previousRank = rank;
  });

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">VET HEAD 2026</div>
        <h1>Payout Results</h1>
        <p>
          Prize money automatically calculated from official scoring
          results. Ties split the money for the occupied places.
        </p>
      </section>

      <nav className="payoutTabs" aria-label="Payout views">
        <Link className="payoutTab" href="/prize-money">
          Preview
        </Link>
        <Link
          className="payoutTab payoutTabActive"
          href="/payout-results"
        >
          Results
        </Link>
      </nav>

      <section
        className="tournamentBoardSection"
        style={{ marginTop: 24 }}
      >
        <div className="boardSectionHeader">
          <div>
            <div className="smallLabel">PLAYER WINNINGS</div>
            <h2>Total Winnings</h2>
            <p>All players ranked from highest to lowest winnings.</p>
          </div>
        </div>

        <div className="card payoutLeaderboard">
          {winningsRanking.map((player) => {
            const tied =
              winningsRanking.filter(
                (item) => item.total === player.total,
              ).length > 1;

            return (
              <div
                className="payoutLeaderboardRow"
                key={player.playerId}
              >
                <div className="payoutRank">
                  {tied ? `T${player.rank}` : player.rank}
                </div>

                <div className="payoutPlayer">
                  <strong>{player.playerName}</strong>
                  <span>
                    {player.payouts}{" "}
                    {player.payouts === 1 ? "payout" : "payouts"}
                  </span>
                </div>

                <div className="payoutAmount">
                  {money(player.total)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid">
        <article className="card">
          <h3>Prize Pool</h3>
          <div className="kpi">$1,200</div>
        </article>

        <article className="card">
          <h3>Results Awarded</h3>
          <div className="kpi">{money(paidTotal)}</div>
        </article>
      </section>

      {sections.map((section) => (
        <section
          className="tournamentBoardSection"
          key={section.competition}
          style={{ marginTop: 24 }}
        >
          <div className="boardSectionHeader">
            <div>
              <div className="smallLabel">PAYOUT RESULTS</div>
              <h2>{section.competition}</h2>
            </div>
          </div>

          {!section.complete ? (
            <article className="card">
              <h3>Pending</h3>
              <p>
                This payout will finalize when the applicable scoring
                is complete.
              </p>
            </article>
          ) : section.awards.length === 0 ? (
            <article className="card">
              <p>No payout recipients calculated.</p>
            </article>
          ) : (
            <section className="grid">
              {section.awards.map((award) => (
                <article className="card" key={award.id}>
                  <div className="smallLabel">{award.place}</div>
                  <h3>{award.title}</h3>
                  <div className="kpi">{money(award.amount)}</div>
                  <p>{award.detail}</p>
                </article>
              ))}
            </section>
          )}
        </section>
      ))}

      <section className="grid" style={{ marginTop: 24 }}>
        <Link className="card" href="/prize-money">
          <h3>Payouts Preview</h3>
          <p>See the complete $1,200 prize structure.</p>
        </Link>

        <Link className="card" href="/scoreboard">
          <h3>Scoreboard</h3>
          <p>View the scoring behind these payouts.</p>
        </Link>
      </section>
    </main>
  );
}
