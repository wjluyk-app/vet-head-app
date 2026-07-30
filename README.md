# Cubby Cup App — Phase 1 Prototype

This repository is the first executable scaffold for the private, responsive Cubby Cup web app.

## Included

- Next.js + TypeScript application structure
- V11-inspired navy/gold responsive interface
- Administrator dashboard
- Mobile Friday score-entry prototype
- Friday match-point engine
- Field-payout tie and residual-cent allocator
- Friday skins validation engine
- Publication readiness validation
- PostgreSQL/Supabase Phase 1 schema
- 2026 Friday parity fixture
- Automated tests

## Locked rules represented in code

1. Team-format scores are entered as NET team scores.
2. The scoring engine does not subtract handicaps.
3. Friday uses one score source for match play, field competition and skins.
4. Friday validation totals are Team Luke 8 and Team Sam 10.
5. Friday field payouts total $450.
6. Friday skins total $200.
7. Friday money awarded totals $650.
8. Players Guide is 12 pages; Friday result release is 5 pages.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
npm test
```

Open `http://localhost:3000`.

## What is still needed before production

- Actual Supabase project and credentials
- Workbook import implementation against the approved v68 file
- Authentication and role enforcement
- Persistence and offline synchronization
- Exact V11 PDF templates
- Full visual and device QA
- Production hosting and backups

This is a development scaffold, not a deployed production application.


## Workbook importer

The repository now includes `scripts/import-workbook.ts`.

```bash
npm install
npm run import:workbook -- /path/to/Cubby_Cup_App_2026_Source_Workbook_v68.xlsx
```

The importer refuses to complete unless it finds the required worksheets, exactly 24 players, 12 complete Friday scorecards, and the locked Friday parity result of Team Luke 8 / Team Sam 10.

A complete extracted 2026 seed is included at:

`src/data/2026-workbook-seed.json`


## Version 3 additions

- Real 2026 Friday match selection
- Real player pairings and tee times
- Hole-by-hole mobile score-entry route
- Browser-local offline score persistence
- Online/offline indicator and sync contract
- Supabase client setup
- Login scaffold
- Role-based row-level-security migration
- Initial production database seed script

The API currently validates score synchronization but intentionally does not yet write production data until authenticated database IDs and audit transactions are connected.


# Version 4 — Live Database Scoring

Version 4 changes the operating model from a workbook-seed display prototype to a real Supabase scoring application.

## Added

- Complete 2026 database seeding: tournament, teams, 24 players, four sessions, 30 pairings, participants, scorecards and Friday hole scores
- Supabase-backed Friday match reads
- Authenticated magic-link login
- Atomic hole-score save RPC
- Optimistic conflict detection using score versions
- Immutable score correction audit records
- Offline queue with automatic retry when connectivity returns
- Administrator bootstrap script
- Database verification script
- Live database status API
- Protected scoring and administration routes

## Required rollout sequence

1. Apply `0004_live_scoring.sql` in Supabase.
2. Pull Version 4 dependencies with `npm install`.
3. Run `npm run seed:supabase`.
4. Run `npm run verify:database`.
5. Create the first administrator:
   `npm run bootstrap:admin -- your-email@example.com`
6. Add the same email to Supabase Auth redirect configuration.
7. Commit and deploy.
8. Sign in through `/login`.
9. Enter a test score and verify it in `hole_score` and `audit_record`.

## Expected seed verification

- Players: 24
- Sessions: 4
- Pairings: 30
- Friday scorecards: 12
- Friday hole scores: 216

The app remains governed by the non-negotiable rule that team-format entries are already NET and are never handicapped again.


# Version 5 — Friday Live Results

Version 5 adds a Supabase-backed Friday live scoreboard. It awards one point for the front nine, one for the back nine, and one for the 18-hole overall result. Ties split the available point. Incomplete segments remain pending and receive no points until both scorecards contain all required NET hole scores.

## New routes

- `/results/friday` — authenticated live scoreboard
- `/api/friday/results` — authenticated JSON results feed

The scoreboard refreshes every 15 seconds and can also be refreshed manually.


# Version 6 — Friday Tournament Board

Spreadsheet-inspired Friday board with live hole scores, match points, field rankings, $450 payouts, validated $200 skins, expandable match detail, and navy/gold styling.


# Version 6A — Tournament Hub

Version 6A establishes the permanent information architecture before additional tournament modules are built.

## Home destinations

1. Overall Scoreboard
2. Friday
3. Saturday
4. Sunday
5. Player Guide
6. Teams & Pairings
7. Schedule & Tee Times
8. Prize Money
9. Final Results

Administration remains a smaller protected destination rather than a player-facing home tile.

All routes are present. Friday links to the existing live board and score-entry system; unfinished modules use polished route shells so future functionality can be added without redesigning navigation.


# Teams & Pairings Section

The Teams & Pairings block is now populated directly from the 2026 workbook seed.

It includes both 12-player rosters, captains, handicap references, tee assignments, housing units, and all 30 tournament pairings across Friday, Saturday, Sunday Front and Sunday Back.
