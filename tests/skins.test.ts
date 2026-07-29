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
});
