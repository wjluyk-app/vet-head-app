import ExcelJS from "exceljs";
import { z } from "zod";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const playerSchema = z.object({
  sourcePlayerId: z.string(),
  teamShortName: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  displayName: z.string(),
  eventAge: z.number(),
  handicapIndex: z.number(),
  eventTeeGroup: z.string(),
  mountainTee: z.string(),
  captain: z.boolean(),
});

function excelDate(value: ExcelJS.CellValue): string | null {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number") {
    const date = new Date(Date.UTC(1899, 11, 30) + value * 86_400_000);
    return date.toISOString().slice(0, 10);
  }
  return null;
}

function display(cell: ExcelJS.Cell): string {
  return cell.text.trim();
}

function numeric(cell: ExcelJS.Cell): number | null {
  const value = cell.value;
  if (typeof value === "number") return value;
  const parsed = Number(cell.text);
  return Number.isFinite(parsed) ? parsed : null;
}

async function main(): Promise<void> {
  const input = process.argv[2];
  const output = process.argv[3] ?? "src/data/imported-workbook.json";
  if (!input) {
    throw new Error("Usage: npm run import:workbook -- <workbook.xlsx> [output.json]");
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(input);

  const requiredSheets = [
    "Players",
    "Control",
    "Match Setup",
    "Friday Net Scores",
    "Payouts",
    "Skins",
    "MVP",
  ];
  for (const sheetName of requiredSheets) {
    if (!workbook.getWorksheet(sheetName)) {
      throw new Error(`Missing required worksheet: ${sheetName}`);
    }
  }

  const playersSheet = workbook.getWorksheet("Players")!;
  const players = [];
  for (let rowNumber = 5; rowNumber <= 28; rowNumber += 1) {
    const row = playersSheet.getRow(rowNumber);
    if (!display(row.getCell(1))) continue;
    const player = {
      sourcePlayerId: display(row.getCell(1)),
      teamShortName: display(row.getCell(2)),
      shirtSize: display(row.getCell(3)),
      firstName: display(row.getCell(4)),
      lastName: display(row.getCell(5)),
      displayName: display(row.getCell(6)),
      birthdate: excelDate(row.getCell(7).value),
      eventAge: numeric(row.getCell(9)),
      handicapIndex: numeric(row.getCell(10)),
      mountainWhiteHandicap: numeric(row.getCell(11)),
      agePlusMountainWhiteHandicap: numeric(row.getCell(12)),
      eventTeeGroup: display(row.getCell(13)),
      mountainTee: display(row.getCell(14)),
      mountainHandicap: numeric(row.getCell(15)),
      fridayPlayingHandicap: numeric(row.getCell(16)),
      betsieTee: display(row.getCell(17)),
      betsieHandicap: numeric(row.getCell(18)),
      mountainFront9Handicap: numeric(row.getCell(19)),
      mountainBack9Handicap: numeric(row.getCell(20)),
      notes: display(row.getCell(23)) || null,
      housingUnit: display(row.getCell(24)) || null,
      captain: display(row.getCell(23)) === "Captain",
    };
    playerSchema.parse(player);
    players.push(player);
  }

  if (players.length !== 24) {
    throw new Error(`Expected 24 players; imported ${players.length}.`);
  }

  const fridaySheet = workbook.getWorksheet("Friday Net Scores")!;
  const pars = [
    ...Array.from({ length: 9 }, (_, index) => numeric(fridaySheet.getRow(1).getCell(5 + index))),
    ...Array.from({ length: 9 }, (_, index) => numeric(fridaySheet.getRow(1).getCell(15 + index))),
  ];
  if (pars.some((par) => par === null)) throw new Error("Friday pars are incomplete.");

  const scoreRows = [5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 20, 21];
  const scorecards = scoreRows.map((rowNumber, index) => {
    const row = fridaySheet.getRow(rowNumber);
    const scores = [
      ...Array.from({ length: 9 }, (_, offset) => numeric(row.getCell(5 + offset))),
      ...Array.from({ length: 9 }, (_, offset) => numeric(row.getCell(15 + offset))),
    ];
    if (scores.some((score) => score === null)) {
      throw new Error(`Incomplete Friday scorecard at worksheet row ${rowNumber}.`);
    }
    return {
      matchNumber: Math.floor(index / 2) + 1,
      teamShortName: display(row.getCell(2)),
      player1: display(row.getCell(3)),
      player2: display(row.getCell(4)),
      scores,
      out: numeric(row.getCell(14)),
      in: numeric(row.getCell(24)),
      total: numeric(row.getCell(25)),
      points: numeric(row.getCell(26)),
    };
  });

  const points = scorecards.reduce(
    (totals, card) => {
      totals[card.teamShortName] = (totals[card.teamShortName] ?? 0) + (card.points ?? 0);
      return totals;
    },
    {} as Record<string, number>,
  );
  if (points["L. Swardo"] !== 8 || points["S. Swardo"] !== 10) {
    throw new Error(`Friday parity failed: ${JSON.stringify(points)}`);
  }

  const result = {
    sourceWorkbook: path.basename(input),
    importedAt: new Date().toISOString(),
    players,
    friday: { pars, scorecards, expectedTeamPoints: points },
  };

  await writeFile(output, JSON.stringify(result, null, 2), "utf8");
  console.log(`Imported ${players.length} players and ${scorecards.length} Friday scorecards.`);
  console.log(`Friday parity: Luke ${points["L. Swardo"]}, Sam ${points["S. Swardo"]}`);
  console.log(`Wrote ${output}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
