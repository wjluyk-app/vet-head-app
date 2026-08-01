import { describe, expect, it } from "vitest";
import { calculatePlayerAwards } from "../src/lib/player-awards";

function matchPlayMatch(
  matchNumber: number,
  lukePoints: number,
  samPoints: number,
) {
  return {
    matchNumber,
    lukePoints,
    samPoints,
  };
}

describe("player awards", () => {
  it("adds each team result to both players in a team format", () => {
    const friday = {
      matchPlay: {
        matches: [matchPlayMatch(1, 3, 0)],
      },
    };

    const saturday = {
      matchPlay: {
        matches: [],
      },
    };

    const sunday = {
      pinehurst: { matches: [] },
      singles: [],
    };

    const overall = {
      complete: false,
      winner: "PENDING",
    };

    const awards = calculatePlayerAwards(
      friday as never,
      saturday as never,
      sunday as never,
      overall as never,
    );

    const lukePlayers = awards.playerTotals
      .filter((player) => player.team === "LUKE")
      .map((player) => player.points);

    expect(lukePlayers).toEqual([3, 3]);
  });

  it("awards Sunday singles points only to the individual player", () => {
    const awards = calculatePlayerAwards(
      {
        matchPlay: { matches: [] },
      } as never,
      {
        matchPlay: { matches: [] },
      } as never,
      {
        pinehurst: { matches: [] },
        singles: [
          {
            matchNumber: 1,
            lukePoints: 1,
            samPoints: 0,
          },
        ],
      } as never,
      {
        complete: false,
        winner: "PENDING",
      } as never,
    );

    const scorers = awards.playerTotals.filter(
      (player) => player.points > 0,
    );

    expect(scorers).toHaveLength(1);
    expect(scorers[0].team).toBe("LUKE");
    expect(scorers[0].points).toBe(1);
  });

  it("splits the MVP pot when winning-team players tie", () => {
    const awards = calculatePlayerAwards(
      {
        matchPlay: {
          matches: [matchPlayMatch(1, 3, 0)],
        },
      } as never,
      {
        matchPlay: { matches: [] },
      } as never,
      {
        pinehurst: { matches: [] },
        singles: [],
      } as never,
      {
        complete: true,
        winner: "LUKE",
      } as never,
    );

    expect(awards.complete).toBe(true);
    expect(awards.leaders).toHaveLength(2);
    expect(awards.mvpPayoutEach).toBe(35);
  });

  it("does not declare an MVP before the tournament is complete", () => {
    const awards = calculatePlayerAwards(
      {
        matchPlay: {
          matches: [matchPlayMatch(1, 3, 0)],
        },
      } as never,
      {
        matchPlay: { matches: [] },
      } as never,
      {
        pinehurst: { matches: [] },
        singles: [],
      } as never,
      {
        complete: false,
        winner: "PENDING",
      } as never,
    );

    expect(awards.complete).toBe(false);
    expect(awards.leaders).toEqual([]);
    expect(awards.mvpPayoutEach).toBe(0);
  });
});
