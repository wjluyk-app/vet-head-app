import { describe, expect, it } from "vitest";
import { getTeamsPairingsData } from "../src/lib/teams-pairings";

describe("Teams and pairings data", () => {
  const data = getTeamsPairingsData();

  it("contains two complete 12-player teams", () => {
    expect(data.teams).toHaveLength(2);
    expect(data.teams.map((team) => team.players.length)).toEqual([12, 12]);
  });

  it("contains all 30 tournament pairings by day", () => {
    expect(data.pairings.Friday).toHaveLength(6);
    expect(data.pairings.Saturday).toHaveLength(6);
    expect(data.pairings["Sunday Front"]).toHaveLength(6);
    expect(data.pairings["Sunday Back"]).toHaveLength(12);
  });

  it("preserves the captain and tee assignment data", () => {
    const players = data.teams.flatMap((team) => team.players);
    expect(players.filter((player) => player.captain)).toHaveLength(2);
    expect(players.every((player) => Boolean(player.mountainTee))).toBe(true);
    expect(players.every((player) => Boolean(player.betsieTee))).toBe(true);
  });
});
