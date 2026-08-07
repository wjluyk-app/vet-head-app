"use client";

import Link from "next/link";
import { useState } from "react";
import {
  validateVetHeadWorkbook,
  importVetHeadWorkbook,
  type ImportValidationResult,
} from "./actions";

const EMPTY_RESULT: ImportValidationResult = {
  ok: false,
  errors: [],
  warnings: [],
  summary: {
    players: 0,
    courses: 0,
    rounds: 0,
    pairingGroups: 0,
    pairingSlotsFilled: 0,
    payoutTotal: 0,
    scoreEntryUsers: 0,
  },
};

export default function VetHeadImportPage() {
  const [result, setResult] =
    useState<ImportValidationResult>(EMPTY_RESULT);

  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function handleSubmit(formData: FormData) {
    setValidating(true);
    setImportMessage(null);

    const workbook = formData.get("workbook");

    if (workbook instanceof File) {
      setSelectedFile(workbook);
    }

    try {
      const nextResult = await validateVetHeadWorkbook(formData);
      setResult(nextResult);
    } finally {
      setValidating(false);
    }
  }

  async function handleImport() {
    if (!selectedFile) return;

    setImporting(true);
    setImportMessage(null);

    try {
      const formData = new FormData();
      formData.set("workbook", selectedFile);

      const importResult = await importVetHeadWorkbook(formData);

      if (importResult.ok) {
        setImportMessage(
          `Import complete: ${importResult.summary?.players ?? 0} players, ` +
          `${importResult.summary?.courses ?? 0} courses, ` +
          `${importResult.summary?.rounds ?? 0} rounds, ` +
          `${importResult.summary?.pairingAssignments ?? 0} pairing assignments, ` +
          `$${importResult.summary?.payoutTotal ?? 0} payouts.`
        );
      } else {
        setImportMessage(importResult.errors.join(" "));
      }
    } finally {
      setImporting(false);
    }
  }

  const hasResult =
    Boolean(result.filename) ||
    result.errors.length > 0 ||
    result.warnings.length > 0;

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="smallLabel">VET HEAD ADMIN</div>
        <h1>Import Tournament Workbook</h1>
        <p>
          Validate the completed Vet Head workbook before any tournament
          data is written to the database.
        </p>
      </section>

      <section className="card" style={{ marginTop: 22 }}>
        <h2>Upload Workbook</h2>

        <p>
          Use the completed Vet Head 2026 Master Data Import workbook.
        </p>

        <form action={handleSubmit}>
          <label>
            Excel Workbook
            <input
              className="textInput"
              type="file"
              name="workbook"
              accept=".xlsx"
              required
            />
          </label>

          <div style={{ marginTop: 18 }}>
            <button
              className="button"
              type="submit"
              disabled={validating}
            >
              {validating ? "Validating..." : "Validate Workbook"}
            </button>
          </div>
        </form>

        <p style={{ marginTop: 18 }}>
          Validation is read-only. It does not change players, courses,
          pairings, scores, payouts, or users.
        </p>
      </section>

      {hasResult ? (
        <section className="card" style={{ marginTop: 22 }}>
          <div className="smallLabel">
            {result.ok ? "VALIDATION PASSED" : "VALIDATION REVIEW"}
          </div>

          <h2>{result.filename ?? "Workbook"}</h2>

          <div className="grid">
            <article className="card">
              <h3>Players</h3>
              <div className="kpi">{result.summary.players} / 12</div>
            </article>

            <article className="card">
              <h3>Course / Tee Rows</h3>
              <div className="kpi">{result.summary.courses} / 5</div>
            </article>

            <article className="card">
              <h3>Rounds</h3>
              <div className="kpi">{result.summary.rounds} / 5</div>
            </article>

            <article className="card">
              <h3>Pairing Groups</h3>
              <div className="kpi">
                {result.summary.pairingGroups} / 15
              </div>
            </article>

            <article className="card">
              <h3>Pairing Slots</h3>
              <div className="kpi">
                {result.summary.pairingSlotsFilled} / 60
              </div>
            </article>

            <article className="card">
              <h3>Prize Pool</h3>
              <div className="kpi">
                ${result.summary.payoutTotal.toFixed(0)}
              </div>
            </article>

            <article className="card">
              <h3>Score Entry Users</h3>
              <div className="kpi">
                {result.summary.scoreEntryUsers}
              </div>
            </article>
          </div>

          {result.errors.length > 0 ? (
            <div className="errorNotice" style={{ marginTop: 20 }}>
              <strong>Errors</strong>
              <ul>
                {result.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.warnings.length > 0 ? (
            <div className="notice" style={{ marginTop: 20 }}>
              <strong>Warnings</strong>
              <ul>
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.ok ? (
            <div className="notice" style={{ marginTop: 20 }}>
              <strong>Workbook structure is valid.</strong>

              {result.summary.pairingSlotsFilled === 60 ? (
                <>
                  <p>
                    All required player, course, round, pairing and payout data
                    is present. This workbook is eligible for database import.
                  </p>

                  <button
                    className="button"
                    type="button"
                    onClick={handleImport}
                    disabled={importing}
                  >
                    {importing
                      ? "Importing..."
                      : "Import / Update Tournament"}
                  </button>
                </>
              ) : (
                <p>
                  Database import is locked until all 60 pairing slots are filled.
                </p>
              )}
            </div>
          ) : null}

          {importMessage ? (
            <div className="notice" style={{ marginTop: 20 }}>
              <strong>{importMessage}</strong>
            </div>
          ) : null}
        </section>
      ) : null}

      <div style={{ marginTop: 22 }}>
        <Link className="button" href="/admin">
          Back to Admin
        </Link>
      </div>
    </main>
  );
}
