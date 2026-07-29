import { z } from "zod";

export const holeScoreSchema = z.object({
  holeNumber: z.number().int().min(1).max(18),
  netScore: z.number().int().min(1).max(20),
});

export const teamScorecardSchema = z.object({
  pairingId: z.string().uuid(),
  teamId: z.string().uuid(),
  scoresAreNet: z.literal(true),
  scores: z.array(holeScoreSchema).length(18),
});

export function assertReadyForFridayPublication(input: {
  completeScorecards: number;
  expectedScorecards: number;
  sessionLocked: boolean;
  payoutExpected: number;
  payoutActual: number;
  skinsExpected: number;
  skinsActual: number;
}): void {
  if (input.completeScorecards !== input.expectedScorecards) {
    throw new Error("Friday has incomplete scorecards.");
  }
  if (!input.sessionLocked) {
    throw new Error("Friday must be locked before publication.");
  }
  if (Math.round(input.payoutActual * 100) !== Math.round(input.payoutExpected * 100)) {
    throw new Error("Friday field payouts do not reconcile.");
  }
  if (Math.round(input.skinsActual * 100) !== Math.round(input.skinsExpected * 100)) {
    throw new Error("Friday skins do not reconcile.");
  }
}
