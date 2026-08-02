"use client";

import { useMemo, useState } from "react";

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

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function FinalPayoutsClient({
  payouts,
  totalPaid,
}: {
  payouts: PlayerPayout[];
  totalPaid: number;
}) {
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState<"ALL" | "LUKE" | "SAM">("ALL");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return payouts.filter((player) => {
      const matchesName =
        !normalized || player.player.toLowerCase().includes(normalized);
      const matchesTeam = team === "ALL" || player.team === team;

      return matchesName && matchesTeam;
    });
  }, [payouts, query, team]);

  return (
    <section className="finalPayoutSection">
      <div className="finalPayoutHeader">
        <div>
          <div className="smallLabel">FINAL PLAYER PAYOUTS</div>
          <h2>Player Payment Summary</h2>
          <p>All field awards, skins, team bonuses and MVP money.</p>
        </div>

        <div className="finalPayoutTotal">
          <span>TOTAL PAID</span>
          <strong>{money(totalPaid)}</strong>
        </div>
      </div>

      <div className="finalPayoutTools">
        <label>
          <span>FIND A PLAYER</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type a player name"
          />
        </label>

        <div className="finalPayoutTeamFilter" aria-label="Filter payouts by team">
          {(["ALL", "LUKE", "SAM"] as const).map((option) => (
            <button
              type="button"
              className={team === option ? "activePayoutFilter" : ""}
              onClick={() => setTeam(option)}
              key={option}
            >
              {option === "ALL" ? "All Players" : `Team ${option}`}
            </button>
          ))}
        </div>

        <div className="finalPayoutCount">
          {filtered.length} of {payouts.length} players shown
        </div>
      </div>

      <div className="finalPayoutList">
        {filtered.map((player) => (
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

      {filtered.length === 0 && (
        <div className="finalPayoutEmpty">
          No player matched that search.
        </div>
      )}
    </section>
  );
}
