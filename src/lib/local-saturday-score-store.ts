export interface LocalSaturdayScore {
  scorecardId: string;
  matchNumber: number;
  teamShortName: string;
  holeNumber: number;
  netScore: number;
  expectedVersion?: number;
  updatedAt: string;
  syncStatus: "local" | "syncing" | "synced" | "conflict";
  lastError?: string;
}

const STORAGE_KEY = "cubby-cup-saturday-scores-v1";

function readAll(): LocalSaturdayScore[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as LocalSaturdayScore[];
  } catch {
    return [];
  }
}

function writeAll(scores: LocalSaturdayScore[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  window.dispatchEvent(new CustomEvent("cubby-score-queue-changed"));
}

export function getLocalSaturdayScore(
  scorecardId: string,
  holeNumber: number,
): LocalSaturdayScore | undefined {
  return readAll().find(
    (item) => item.scorecardId === scorecardId && item.holeNumber === holeNumber,
  );
}

export function saveLocalSaturdayScore(
  input: Omit<LocalSaturdayScore, "updatedAt" | "syncStatus">,
): LocalSaturdayScore {
  const scores = readAll();
  const next: LocalSaturdayScore = {
    ...input,
    updatedAt: new Date().toISOString(),
    syncStatus: "local",
  };
  const index = scores.findIndex(
    (item) => item.scorecardId === input.scorecardId && item.holeNumber === input.holeNumber,
  );
  if (index >= 0) scores[index] = next;
  else scores.push(next);
  writeAll(scores);
  return next;
}

export function getPendingSaturdayScores(): LocalSaturdayScore[] {
  return readAll().filter((item) => item.syncStatus !== "synced");
}

export function updateLocalSaturdayScore(
  scorecardId: string,
  holeNumber: number,
  patch: Partial<LocalSaturdayScore>,
): void {
  const scores = readAll();
  const item = scores.find(
    (score) => score.scorecardId === scorecardId && score.holeNumber === holeNumber,
  );
  if (item) {
    Object.assign(item, patch);
    writeAll(scores);
  }
}

export async function syncPendingSaturdayScores(): Promise<{
  synced: number;
  conflicts: number;
  failed: number;
}> {
  const pending = getPendingSaturdayScores();
  let synced = 0;
  let conflicts = 0;
  let failed = 0;

  for (const item of pending) {
    updateLocalSaturdayScore(item.scorecardId, item.holeNumber, { syncStatus: "syncing" });
    try {
      const response = await fetch("/api/saturday/scores", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scorecardId: item.scorecardId,
          holeNumber: item.holeNumber,
          netScore: item.netScore,
          expectedVersion: item.expectedVersion,
        }),
      });
      const body = await response.json();
      if (response.status === 401) {
        updateLocalSaturdayScore(item.scorecardId, item.holeNumber, {
          syncStatus: "local",
          lastError: "Sign-in required",
        });
        failed += 1;
        continue;
      }
      if (!response.ok || !body.ok) throw new Error(body.error ?? "Sync failed");
      if (body.conflict) {
        updateLocalSaturdayScore(item.scorecardId, item.holeNumber, {
          syncStatus: "conflict",
          lastError: "Another scorekeeper changed this hole",
        });
        conflicts += 1;
      } else {
        updateLocalSaturdayScore(item.scorecardId, item.holeNumber, {
          syncStatus: "synced",
          expectedVersion: body.score.version,
          lastError: undefined,
        });
        synced += 1;
      }
    } catch (error) {
      updateLocalSaturdayScore(item.scorecardId, item.holeNumber, {
        syncStatus: "local",
        lastError: error instanceof Error ? error.message : "Sync failed",
      });
      failed += 1;
    }
  }
  return { synced, conflicts, failed };
}
