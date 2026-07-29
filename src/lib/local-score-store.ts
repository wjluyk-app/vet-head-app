export interface LocalFridayScore {
  matchNumber: number;
  teamShortName: string;
  holeNumber: number;
  netScore: number;
  updatedAt: string;
  syncStatus: "local" | "syncing" | "synced" | "conflict";
}

const STORAGE_KEY = "cubby-cup-friday-scores-v1";

function readAll(): LocalFridayScore[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LocalFridayScore[];
  } catch {
    return [];
  }
}

function writeAll(scores: LocalFridayScore[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

export function getLocalFridayScore(
  matchNumber: number,
  teamShortName: string,
  holeNumber: number,
): LocalFridayScore | undefined {
  return readAll().find(
    (item) =>
      item.matchNumber === matchNumber &&
      item.teamShortName === teamShortName &&
      item.holeNumber === holeNumber,
  );
}

export function saveLocalFridayScore(
  input: Omit<LocalFridayScore, "updatedAt" | "syncStatus">,
): LocalFridayScore {
  const scores = readAll();
  const next: LocalFridayScore = {
    ...input,
    updatedAt: new Date().toISOString(),
    syncStatus: "local",
  };
  const index = scores.findIndex(
    (item) =>
      item.matchNumber === input.matchNumber &&
      item.teamShortName === input.teamShortName &&
      item.holeNumber === input.holeNumber,
  );
  if (index >= 0) scores[index] = next;
  else scores.push(next);
  writeAll(scores);
  return next;
}

export function getPendingFridayScores(): LocalFridayScore[] {
  return readAll().filter((item) => item.syncStatus !== "synced");
}

export function markFridayScoreSynced(
  matchNumber: number,
  teamShortName: string,
  holeNumber: number,
): void {
  const scores = readAll();
  const item = scores.find(
    (score) =>
      score.matchNumber === matchNumber &&
      score.teamShortName === teamShortName &&
      score.holeNumber === holeNumber,
  );
  if (item) {
    item.syncStatus = "synced";
    writeAll(scores);
  }
}
