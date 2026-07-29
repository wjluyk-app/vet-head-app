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
