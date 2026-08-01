import { describe, expect, it } from "vitest";
import { calculateFridaySkins } from "../src/lib/skins";

describe("Friday skins", () => {
  it("rejects tied lows and validates holes 1-17 on the next hole", () => {
    const pars = Array(18).fill(4);
    const alpha = Array(18).fill(4);
    const bravo = Array(18).fill(4);
    const charlie = Array(18).fill(4);

    alpha[5] = 2;   // Hole 6 unique low
    alpha[6] = 4;   // Hole 7 validates
    bravo[13] = 1;  // Hole 14 unique low
    bravo[14] = 4;  // Hole 15 validates

    const skins = calculateFridaySkins([
      { team: "Alpha", scores: alpha, pars },
      { team: "Bravo", scores: bravo, pars },
      { team: "Charlie", scores: charlie, pars },
    ]);

    expect(skins.map((skin) => skin.hole)).toEqual([6, 14]);
  });

  it("automatically validates a unique skin on Hole 18", () => {
    const pars = Array(18).fill(4);
    const alpha = Array(18).fill(4);
    const bravo = Array(18).fill(4);
    const charlie = Array(18).fill(4);

    alpha[17] = 3;

    const skins = calculateFridaySkins([
      { team: "Alpha", scores: alpha, pars },
      { team: "Bravo", scores: bravo, pars },
      { team: "Charlie", scores: charlie, pars },
    ]);

    expect(skins).toEqual([
      {
        hole: 18,
        team: "Alpha",
        netScore: 3,
        validated: true,
      },
    ]);
  });

  it("rejects a unique low that is not validated on the next hole", () => {
    const pars = Array(18).fill(4);
    const alpha = Array(18).fill(4);
    const bravo = Array(18).fill(4);
    const charlie = Array(18).fill(4);

    alpha[4] = 2;
    alpha[5] = 5;

    const skins = calculateFridaySkins([
      { team: "Alpha", scores: alpha, pars },
      { team: "Bravo", scores: bravo, pars },
      { team: "Charlie", scores: charlie, pars },
    ]);

    expect(skins).toEqual([]);
  });

  it("returns no skins when every low score is tied", () => {
    const pars = Array(18).fill(4);
    const scores = Array(18).fill(4);

    const skins = calculateFridaySkins([
      { team: "Alpha", scores: [...scores], pars },
      { team: "Bravo", scores: [...scores], pars },
      { team: "Charlie", scores: [...scores], pars },
    ]);

    expect(skins).toEqual([]);
  });

});
