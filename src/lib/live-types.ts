export interface LiveHoleScore {
  holeNumber: number;
  netScore: number;
  version: number;
  updatedAt: string;
}

export interface LiveTeamScorecard {
  id: string;
  sourceKey: string;
  teamShortName: string;
  player1: string;
  player2: string;
  scores: Array<LiveHoleScore | null>;
}

export interface LiveFridayMatch {
  pairingId: string;
  matchNumber: number;
  teeTime: string | null;
  course: string;
  format: string;
  sessionStatus?: string;
  luke: LiveTeamScorecard;
  sam: LiveTeamScorecard;
}

export interface ScoreSaveRequest {
  scorecardId: string;
  holeNumber: number;
  netScore: number;
  expectedVersion?: number;
  reason?: string;
}

export interface ScoreSaveResponse {
  ok: boolean;
  score?: {
    id: string;
    netScore: number;
    version: number;
    updatedAt: string;
  };
  conflict?: boolean;
  error?: string;
}

export interface LiveSundaySinglesMatch {
  pairingId: string;
  matchNumber: number;
  lukeTeamId: string;
  samTeamId: string;
  lukePlayer: string;
  samPlayer: string;
  lukeScorecardId: string;
  samScorecardId: string;
  lukeScores: Array<LiveHoleScore | null>;
  samScores: Array<LiveHoleScore | null>;
  winnerTeamId: string | null;
  halved: boolean;
  resultText: string | null;
  closedOnHole: number | null;
  status: string;
  sessionStatus?: string;
}

export interface LiveSundayData {
  pinehurst: LiveFridayMatch[];
  singles: LiveSundaySinglesMatch[];
}
