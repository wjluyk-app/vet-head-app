"use server";

import ExcelJS from "exceljs";
import { requireBillAdmin } from "@/lib/auth/admin";

export type ImportValidationResult = {
  ok: boolean;
  filename?: string;
  errors: string[];
  warnings: string[];
  summary: {
    players: number;
    courses: number;
    rounds: number;
    pairingGroups: number;
    pairingSlotsFilled: number;
    payoutTotal: number;
    scoreEntryUsers: number;
  };
};

const REQUIRED_SHEETS = [
  "Tournament_Settings",
  "Players",
  "Courses",
  "Rounds",
  "Pairings",
  "Format_Rules",
  "Points_Rules",
  "Vet_Header_Rules",
  "Prize_Money",
  "Score_Entry_Users",
];

function text(value: unknown): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "object" && value !== null) {
    if ("text" in value && typeof value.text === "string") {
      return value.text.trim();
    }

    if ("result" in value) {
      return String(value.result ?? "").trim();
    }
  }

  return String(value).trim();
}

function headers(sheet: ExcelJS.Worksheet) {
  const map = new Map<string, number>();

  sheet.getRow(3).eachCell((cell, column) => {
    const name = text(cell.value);
    if (name) map.set(name, column);
  });

  return map;
}

function countRows(
  sheet: ExcelJS.Worksheet,
  keyColumn: number,
  startRow = 4,
) {
  let count = 0;

  for (let row = startRow; row <= sheet.rowCount; row++) {
    if (text(sheet.getCell(row, keyColumn).value)) {
      count++;
    }
  }

  return count;
}

export async function validateVetHeadWorkbook(
  formData: FormData,
): Promise<ImportValidationResult> {
  await requireBillAdmin();

  const blankSummary = {
    players: 0,
    courses: 0,
    rounds: 0,
    pairingGroups: 0,
    pairingSlotsFilled: 0,
    payoutTotal: 0,
    scoreEntryUsers: 0,
  };

  const file = formData.get("workbook");

  if (!(file instanceof File) || file.size === 0) {
    return {
      ok: false,
      errors: ["Choose an Excel workbook."],
      warnings: [],
      summary: blankSummary,
    };
  }

  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return {
      ok: false,
      filename: file.name,
      errors: ["The import file must be an .xlsx workbook."],
      warnings: [],
      summary: blankSummary,
    };
  }

  const workbook = new ExcelJS.Workbook();

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await workbook.xlsx.load(buffer as any);
  } catch {
    return {
      ok: false,
      filename: file.name,
      errors: ["The workbook could not be opened."],
      warnings: [],
      summary: blankSummary,
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  for (const sheetName of REQUIRED_SHEETS) {
    if (!workbook.getWorksheet(sheetName)) {
      errors.push(`Missing required sheet: ${sheetName}`);
    }
  }

  if (errors.length) {
    return {
      ok: false,
      filename: file.name,
      errors,
      warnings,
      summary: blankSummary,
    };
  }

  const playersSheet = workbook.getWorksheet("Players")!;
  const coursesSheet = workbook.getWorksheet("Courses")!;
  const roundsSheet = workbook.getWorksheet("Rounds")!;
  const pairingsSheet = workbook.getWorksheet("Pairings")!;
  const payoutsSheet = workbook.getWorksheet("Prize_Money")!;
  const scoreUsersSheet = workbook.getWorksheet("Score_Entry_Users")!;

  const playerHeaders = headers(playersSheet);
  const courseHeaders = headers(coursesSheet);
  const roundHeaders = headers(roundsSheet);
  const pairingHeaders = headers(pairingsSheet);
  const payoutHeaders = headers(payoutsSheet);
  const scoreUserHeaders = headers(scoreUsersSheet);

  const requirements: Array<[string, Map<string, number>, string[]]> = [
    [
      "Players",
      playerHeaders,
      ["Player_ID", "Player_Name", "Handicap_Index", "Active"],
    ],
    [
      "Courses",
      courseHeaders,
      [
        "Course_Tee_ID",
        "Course_Name",
        "Tee_Name",
        "Course_Rating",
        "Slope",
        "Par",
      ],
    ],
    [
      "Rounds",
      roundHeaders,
      [
        "Round_ID",
        "Round_Name",
        "Date",
        "Format_Code",
        "Course_Tee_ID",
        "Tee_Time",
      ],
    ],
    [
      "Pairings",
      pairingHeaders,
      [
        "Round_ID",
        "Group_No",
        "Player_1_ID",
        "Player_2_ID",
        "Player_3_ID",
        "Player_4_ID",
      ],
    ],
    [
      "Prize_Money",
      payoutHeaders,
      [
        "Payout_ID",
        "Competition",
        "Place",
        "Amount_Per_Recipient",
        "Recipients",
        "Total_Payout",
      ],
    ],
    [
      "Score_Entry_Users",
      scoreUserHeaders,
      ["Email", "Display_Name", "Active", "Role"],
    ],
  ];

  for (const [sheetName, map, required] of requirements) {
    for (const column of required) {
      if (!map.has(column)) {
        errors.push(`${sheetName}: missing column "${column}"`);
      }
    }
  }

  if (errors.length) {
    return {
      ok: false,
      filename: file.name,
      errors,
      warnings,
      summary: blankSummary,
    };
  }

  const players = countRows(
    playersSheet,
    playerHeaders.get("Player_ID")!,
  );

  const courses = countRows(
    coursesSheet,
    courseHeaders.get("Course_Tee_ID")!,
  );

  const rounds = countRows(
    roundsSheet,
    roundHeaders.get("Round_ID")!,
  );

  const pairingGroups = countRows(
    pairingsSheet,
    pairingHeaders.get("Round_ID")!,
  );

  let pairingSlotsFilled = 0;

  const pairingPlayerColumns = [
    pairingHeaders.get("Player_1_ID")!,
    pairingHeaders.get("Player_2_ID")!,
    pairingHeaders.get("Player_3_ID")!,
    pairingHeaders.get("Player_4_ID")!,
  ];

  for (let row = 4; row <= pairingsSheet.rowCount; row++) {
    if (!text(pairingsSheet.getCell(
      row,
      pairingHeaders.get("Round_ID")!,
    ).value)) {
      continue;
    }

    for (const column of pairingPlayerColumns) {
      if (text(pairingsSheet.getCell(row, column).value)) {
        pairingSlotsFilled++;
      }
    }
  }

  let payoutTotal = 0;

  for (let row = 4; row <= payoutsSheet.rowCount; row++) {
    const payoutId = text(
      payoutsSheet.getCell(row, payoutHeaders.get("Payout_ID")!).value,
    );

    if (!payoutId) continue;

    const raw = payoutsSheet.getCell(
      row,
      payoutHeaders.get("Total_Payout")!,
    ).value;

    const value =
      typeof raw === "number"
        ? raw
        : Number(
            typeof raw === "object" &&
              raw !== null &&
              "result" in raw
              ? raw.result
              : raw,
          );

    if (Number.isFinite(value)) {
      payoutTotal += value;
    }
  }

  const scoreEntryUsers = countRows(
    scoreUsersSheet,
    scoreUserHeaders.get("Email")!,
  );

  if (players !== 12) {
    errors.push(`Expected 12 players; found ${players}.`);
  }

  if (courses !== 5) {
    errors.push(`Expected 5 course/tee rows; found ${courses}.`);
  }

  if (rounds !== 5) {
    errors.push(`Expected 5 rounds; found ${rounds}.`);
  }

  if (pairingGroups !== 15) {
    errors.push(`Expected 15 pairing groups; found ${pairingGroups}.`);
  }

  if (pairingSlotsFilled !== 60) {
    warnings.push(
      `Pairings are incomplete: ${pairingSlotsFilled} of 60 player slots are filled.`,
    );
  }

  if (payoutTotal !== 1200) {
    errors.push(
      `Prize payouts total $${payoutTotal.toFixed(0)} instead of $1,200.`,
    );
  }

  const expectedRoundCourseIds = ["CT1", "CT2", "CT3", "CT4", "CT5"];

  for (let index = 0; index < 5; index++) {
    const row = 4 + index;

    const actual = text(
      roundsSheet.getCell(
        row,
        roundHeaders.get("Course_Tee_ID")!,
      ).value,
    );

    if (actual !== expectedRoundCourseIds[index]) {
      errors.push(
        `Round R${index + 1} should use ${expectedRoundCourseIds[index]}; found "${actual || "blank"}".`,
      );
    }
  }

  return {
    ok: errors.length === 0,
    filename: file.name,
    errors,
    warnings,
    summary: {
      players,
      courses,
      rounds,
      pairingGroups,
      pairingSlotsFilled,
      payoutTotal,
      scoreEntryUsers,
    },
  };
}

type WorkbookImportResult = {
  ok: boolean;
  errors: string[];
  message?: string;
  summary?: {
    players: number;
    courses: number;
    rounds: number;
    groups: number;
    pairingAssignments: number;
    payouts: number;
    payoutTotal: number;
    scoreEntryUsers: number;
  };
};

function numberValue(value: unknown): number {
  if (typeof value === "number") return value;

  if (
    typeof value === "object" &&
    value !== null &&
    "result" in value &&
    typeof value.result === "number"
  ) {
    return value.result;
  }

  const parsed = Number(text(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function yesNo(value: unknown): boolean {
  return text(value).toLowerCase() !== "no";
}

function excelDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const raw = text(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (match) {
    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return raw;
}

function excelTime(value: unknown): string {
  if (value instanceof Date) {
    return value.toTimeString().slice(0, 5);
  }

  const raw = text(value).trim();

  const twelveHour = raw.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
  );

  if (twelveHour) {
    let hour = Number(twelveHour[1]);
    const minute = twelveHour[2];
    const period = twelveHour[3].toUpperCase();

    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    return `${String(hour).padStart(2, "0")}:${minute}`;
  }

  return raw.slice(0, 5);
}

function formatCodeToDatabase(value: string) {
  if (value === "IND_NET") return "individual_net";
  if (value === "SCR_4") return "four_man_scramble";

  throw new Error(`Unsupported Format_Code: ${value}`);
}

export async function importVetHeadWorkbook(
  formData: FormData,
): Promise<WorkbookImportResult> {
  await requireBillAdmin();

  const validation = await validateVetHeadWorkbook(formData);

  if (!validation.ok) {
    return {
      ok: false,
      errors: validation.errors,
    };
  }

  if (validation.summary.pairingSlotsFilled !== 60) {
    return {
      ok: false,
      errors: [
        `Import blocked: all 60 pairing slots must be filled. Current workbook has ${validation.summary.pairingSlotsFilled}.`,
      ],
    };
  }

  if (validation.summary.payoutTotal !== 1200) {
    return {
      ok: false,
      errors: [
        `Import blocked: payouts must total exactly $1,200.`,
      ],
    };
  }

  const file = formData.get("workbook");

  if (!(file instanceof File)) {
    return {
      ok: false,
      errors: ["Workbook file was not provided."],
    };
  }

  const workbook = new ExcelJS.Workbook();
  const buffer = Buffer.from(await file.arrayBuffer());
  await workbook.xlsx.load(buffer as any);

  const {
    createAdminClient,
  } = await import("@/lib/supabase/admin");

  const supabase = createAdminClient();

  const tournamentSettings =
    workbook.getWorksheet("Tournament_Settings")!;
  const playersSheet = workbook.getWorksheet("Players")!;
  const coursesSheet = workbook.getWorksheet("Courses")!;
  const roundsSheet = workbook.getWorksheet("Rounds")!;
  const pairingsSheet = workbook.getWorksheet("Pairings")!;
  const payoutsSheet = workbook.getWorksheet("Prize_Money")!;
  const scoreUsersSheet =
    workbook.getWorksheet("Score_Entry_Users")!;

  const settingValues = new Map<string, string>();

  for (
    let row = 4;
    row <= tournamentSettings.rowCount;
    row++
  ) {
    const field = text(
      tournamentSettings.getCell(row, 1).value,
    );

    const value = text(
      tournamentSettings.getCell(row, 2).value,
    );

    if (field) settingValues.set(field, value);
  }

  const tournamentName =
    settingValues.get("Tournament Name") || "VET HEAD";

  const tournamentYear = Number(
    settingValues.get("Tournament Year") || 2026,
  );

  const startDate = excelDate(
    settingValues.get("Start Date") || "08/13/2026",
  );

  const endDate = excelDate(
    settingValues.get("End Date") || "08/15/2026",
  );

  const {
    data: tournament,
    error: tournamentError,
  } = await supabase
    .from("tournament")
    .upsert(
      {
        name: tournamentName,
        year: tournamentYear,
        start_date: startDate,
        end_date: endDate,
      },
      {
        onConflict: "name,year",
      },
    )
    .select("id")
    .single();

  if (tournamentError || !tournament) {
    return {
      ok: false,
      errors: [
        tournamentError?.message ??
          "Tournament could not be imported.",
      ],
    };
  }

  const tournamentId = tournament.id;

  const playerHeaders = headers(playersSheet);

  const playerRows = [];

  for (let row = 4; row <= playersSheet.rowCount; row++) {
    const importKey = text(
      playersSheet.getCell(
        row,
        playerHeaders.get("Player_ID")!,
      ).value,
    );

    if (!importKey) continue;

    const displayName = text(
      playersSheet.getCell(
        row,
        playerHeaders.get("Player_Name")!,
      ).value,
    );

    const handicapIndex = numberValue(
      playersSheet.getCell(
        row,
        playerHeaders.get("Handicap_Index")!,
      ).value,
    );

    if (!displayName) {
      return {
        ok: false,
        errors: [`Players row ${row}: Player_Name is blank.`],
      };
    }

    playerRows.push({
      tournament_id: tournamentId,
      import_key: importKey,
      display_name: displayName,
      handicap_index: handicapIndex,
      active: yesNo(
        playersSheet.getCell(
          row,
          playerHeaders.get("Active")!,
        ).value,
      ),
    });
  }

  const {
    data: importedPlayers,
    error: playersError,
  } = await supabase
    .from("player")
    .upsert(playerRows, {
      onConflict: "tournament_id,import_key",
    })
    .select("id,import_key");

  if (playersError || !importedPlayers) {
    return {
      ok: false,
      errors: [
        playersError?.message ??
          "Players could not be imported.",
      ],
    };
  }

  const playerIdByKey = new Map(
    importedPlayers.map((player) => [
      player.import_key,
      player.id,
    ]),
  );

  const courseHeaders = headers(coursesSheet);

  const courseRows = [];

  for (let row = 4; row <= coursesSheet.rowCount; row++) {
    const importKey = text(
      coursesSheet.getCell(
        row,
        courseHeaders.get("Course_Tee_ID")!,
      ).value,
    );

    if (!importKey) continue;

    const courseName = text(
      coursesSheet.getCell(
        row,
        courseHeaders.get("Course_Name")!,
      ).value,
    );

    const teeName = text(
      coursesSheet.getCell(
        row,
        courseHeaders.get("Tee_Name")!,
      ).value,
    );

    if (!courseName) {
      return {
        ok: false,
        errors: [`Courses row ${row}: Course_Name is blank.`],
      };
    }

    courseRows.push({
      tournament_id: tournamentId,
      import_key: importKey,
      course_name: courseName,
      tee_name: teeName,
      course_rating: numberValue(
        coursesSheet.getCell(
          row,
          courseHeaders.get("Course_Rating")!,
        ).value,
      ),
      slope_rating: numberValue(
        coursesSheet.getCell(
          row,
          courseHeaders.get("Slope")!,
        ).value,
      ),
      par: numberValue(
        coursesSheet.getCell(
          row,
          courseHeaders.get("Par")!,
        ).value,
      ),
    });
  }

  const {
    data: importedCourses,
    error: coursesError,
  } = await supabase
    .from("course_tee")
    .upsert(courseRows, {
      onConflict: "tournament_id,import_key",
    })
    .select("id,import_key");

  if (coursesError || !importedCourses) {
    return {
      ok: false,
      errors: [
        coursesError?.message ??
          "Courses could not be imported.",
      ],
    };
  }

  const courseIdByKey = new Map(
    importedCourses.map((course) => [
      course.import_key,
      course.id,
    ]),
  );

  const roundHeaders = headers(roundsSheet);
  const roundRows = [];

  for (let row = 4; row <= roundsSheet.rowCount; row++) {
    const roundId = text(
      roundsSheet.getCell(
        row,
        roundHeaders.get("Round_ID")!,
      ).value,
    );

    if (!roundId) continue;

    const roundNumber = Number(
      roundId.replace(/^R/i, ""),
    );

    const courseKey = text(
      roundsSheet.getCell(
        row,
        roundHeaders.get("Course_Tee_ID")!,
      ).value,
    );

    const courseTeeId = courseIdByKey.get(courseKey);

    if (!courseTeeId) {
      return {
        ok: false,
        errors: [
          `Rounds row ${row}: unknown Course_Tee_ID "${courseKey}".`,
        ],
      };
    }

    const formatCode = text(
      roundsSheet.getCell(
        row,
        roundHeaders.get("Format_Code")!,
      ).value,
    );

    roundRows.push({
      tournament_id: tournamentId,
      round_number: roundNumber,
      name: text(
        roundsSheet.getCell(
          row,
          roundHeaders.get("Round_Name")!,
        ).value,
      ),
      round_date: excelDate(
        roundsSheet.getCell(
          row,
          roundHeaders.get("Date")!,
        ).value,
      ),
      tee_time: excelTime(
        roundsSheet.getCell(
          row,
          roundHeaders.get("Tee_Time")!,
        ).value,
      ),
      format: formatCodeToDatabase(formatCode),
      course_tee_id: courseTeeId,
    });
  }

  const {
    data: importedRounds,
    error: roundsError,
  } = await supabase
    .from("tournament_round")
    .upsert(roundRows, {
      onConflict: "tournament_id,round_number",
    })
    .select("id,round_number");

  if (roundsError || !importedRounds) {
    return {
      ok: false,
      errors: [
        roundsError?.message ??
          "Rounds could not be imported.",
      ],
    };
  }

  const roundIdByNumber = new Map(
    importedRounds.map((round) => [
      round.round_number,
      round.id,
    ]),
  );

  const pairingHeaders = headers(pairingsSheet);
  const groupRows = [];

  for (
    let row = 4;
    row <= pairingsSheet.rowCount;
    row++
  ) {
    const roundKey = text(
      pairingsSheet.getCell(
        row,
        pairingHeaders.get("Round_ID")!,
      ).value,
    );

    if (!roundKey) continue;

    const roundNumber = Number(
      roundKey.replace(/^R/i, ""),
    );

    const roundUuid = roundIdByNumber.get(roundNumber);

    if (!roundUuid) {
      return {
        ok: false,
        errors: [
          `Pairings row ${row}: unknown round "${roundKey}".`,
        ],
      };
    }

    const groupNumber = numberValue(
      pairingsSheet.getCell(
        row,
        pairingHeaders.get("Group_No")!,
      ).value,
    );

    const roundFormat = roundRows.find(
      (round) => round.round_number === roundNumber,
    )?.format;

    groupRows.push({
      round_id: roundUuid,
      group_number: groupNumber,
      name:
        roundFormat === "four_man_scramble"
          ? `Team ${groupNumber}`
          : `Group ${groupNumber}`,
    });
  }

  const {
    data: importedGroups,
    error: groupsError,
  } = await supabase
    .from("round_group")
    .upsert(groupRows, {
      onConflict: "round_id,group_number",
    })
    .select("id,round_id,group_number");

  if (groupsError || !importedGroups) {
    return {
      ok: false,
      errors: [
        groupsError?.message ??
          "Groups could not be imported.",
      ],
    };
  }

  const groupIdByKey = new Map(
    importedGroups.map((group) => [
      `${group.round_id}:${group.group_number}`,
      group.id,
    ]),
  );

  const groupIds = importedGroups.map(
    (group) => group.id,
  );

  if (groupIds.length !== 15) {
    return {
      ok: false,
      errors: [
        `Expected 15 database groups; found ${groupIds.length}.`,
      ],
    };
  }

  const pairingAssignments = [];

  for (
    let row = 4;
    row <= pairingsSheet.rowCount;
    row++
  ) {
    const roundKey = text(
      pairingsSheet.getCell(
        row,
        pairingHeaders.get("Round_ID")!,
      ).value,
    );

    if (!roundKey) continue;

    const roundNumber = Number(
      roundKey.replace(/^R/i, ""),
    );

    const roundUuid = roundIdByNumber.get(roundNumber)!;

    const groupNumber = numberValue(
      pairingsSheet.getCell(
        row,
        pairingHeaders.get("Group_No")!,
      ).value,
    );

    const groupUuid = groupIdByKey.get(
      `${roundUuid}:${groupNumber}`,
    );

    if (!groupUuid) {
      return {
        ok: false,
        errors: [
          `Pairings row ${row}: group could not be resolved.`,
        ],
      };
    }

    for (let order = 1; order <= 4; order++) {
      const playerKey = text(
        pairingsSheet.getCell(
          row,
          pairingHeaders.get(`Player_${order}_ID`)!,
        ).value,
      );

      const playerUuid = playerIdByKey.get(playerKey);

      if (!playerUuid) {
        return {
          ok: false,
          errors: [
            `Pairings row ${row}: unknown player "${playerKey}".`,
          ],
        };
      }

      pairingAssignments.push({
        round_group_id: groupUuid,
        player_id: playerUuid,
        player_order: order,
      });
    }
  }

  const { error: deleteAssignmentsError } =
    await supabase
      .from("round_group_player")
      .delete()
      .in("round_group_id", groupIds);

  if (deleteAssignmentsError) {
    return {
      ok: false,
      errors: [deleteAssignmentsError.message],
    };
  }

  const { error: assignmentsError } =
    await supabase
      .from("round_group_player")
      .insert(pairingAssignments);

  if (assignmentsError) {
    return {
      ok: false,
      errors: [assignmentsError.message],
    };
  }

  const payoutHeaders = headers(payoutsSheet);
  const payoutRows = [];
  let payoutTotal = 0;

  for (let row = 4; row <= payoutsSheet.rowCount; row++) {
    const payoutKey = text(
      payoutsSheet.getCell(
        row,
        payoutHeaders.get("Payout_ID")!,
      ).value,
    );

    if (!payoutKey) continue;

    const roundKey = payoutHeaders.has("Round_ID")
      ? text(
          payoutsSheet.getCell(
            row,
            payoutHeaders.get("Round_ID")!,
          ).value,
        )
      : "";

    const roundNumber = roundKey
      ? Number(roundKey.replace(/^R/i, ""))
      : null;

    const totalPayout = numberValue(
      payoutsSheet.getCell(
        row,
        payoutHeaders.get("Total_Payout")!,
      ).value,
    );

    payoutTotal += totalPayout;

    payoutRows.push({
      tournament_id: tournamentId,
      import_key: payoutKey,
      competition: text(
        payoutsSheet.getCell(
          row,
          payoutHeaders.get("Competition")!,
        ).value,
      ),
      round_id:
        roundNumber !== null
          ? roundIdByNumber.get(roundNumber) ?? null
          : null,
      place: text(
        payoutsSheet.getCell(
          row,
          payoutHeaders.get("Place")!,
        ).value,
      ),
      recipient_type: text(
        payoutsSheet.getCell(
          row,
          payoutHeaders.get("Recipient_Type")!,
        ).value,
      ),
      amount_per_recipient: numberValue(
        payoutsSheet.getCell(
          row,
          payoutHeaders.get("Amount_Per_Recipient")!,
        ).value,
      ),
      recipients: numberValue(
        payoutsSheet.getCell(
          row,
          payoutHeaders.get("Recipients")!,
        ).value,
      ),
      total_payout: totalPayout,
      updated_at: new Date().toISOString(),
    });
  }

  const { error: payoutsError } = await supabase
    .from("prize_payout")
    .upsert(payoutRows, {
      onConflict: "tournament_id,import_key",
    });

  if (payoutsError) {
    return {
      ok: false,
      errors: [payoutsError.message],
    };
  }

  const scoreUserHeaders = headers(scoreUsersSheet);
  const scoreUserRows = [];

  for (
    let row = 4;
    row <= scoreUsersSheet.rowCount;
    row++
  ) {
    const email = text(
      scoreUsersSheet.getCell(
        row,
        scoreUserHeaders.get("Email")!,
      ).value,
    ).toLowerCase();

    if (!email) continue;

    scoreUserRows.push({
      email,
      display_name: text(
        scoreUsersSheet.getCell(
          row,
          scoreUserHeaders.get("Display_Name")!,
        ).value,
      ) || null,
      active: yesNo(
        scoreUsersSheet.getCell(
          row,
          scoreUserHeaders.get("Active")!,
        ).value,
      ),
      updated_at: new Date().toISOString(),
    });
  }

  if (scoreUserRows.length > 0) {
    const { error: scoreUsersError } = await supabase
      .from("score_entry_user")
      .upsert(scoreUserRows, {
        onConflict: "email",
      });

    if (scoreUsersError) {
      return {
        ok: false,
        errors: [scoreUsersError.message],
      };
    }
  }

  return {
    ok: true,
    errors: [],
    message: "Vet Head workbook imported successfully.",
    summary: {
      players: playerRows.length,
      courses: courseRows.length,
      rounds: roundRows.length,
      groups: groupRows.length,
      pairingAssignments: pairingAssignments.length,
      payouts: payoutRows.length,
      payoutTotal,
      scoreEntryUsers: scoreUserRows.length,
    },
  };
}
