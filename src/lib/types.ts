export type TeamCode = "LUKE" | "SAM";

export interface TeamScorecard {
  team: TeamCode;
  scores: number[];
}

export interface MatchPointRules {
  frontWinner: number;
  frontTieEach: number;
  backWinner: number;
  backTieEach: number;
  overallWinner: number;
  overallTieEach: number;
}

export interface ComponentResult {
  component: "front" | "back" | "overall";
  lukePoints: number;
  samPoints: number;
  lukeScore: number;
  samScore: number;
  winner: TeamCode | "HALVED";
}

export interface FridayMatchResult {
  components: ComponentResult[];
  lukePoints: number;
  samPoints: number;
  holeWinners: Array<TeamCode | "HALVED">;
  finalStatus: string;
}
