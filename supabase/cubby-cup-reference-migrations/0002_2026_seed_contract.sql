-- Seed helpers for the 2026 validation fixture.
-- Run after 0001_phase_1_schema.sql.

INSERT INTO tournament (
  name, year, venue, start_date, end_date, total_payout_pool, visual_template_version
) VALUES (
  'Cubby Cup', 2026, 'Crystal Mountain Resort',
  DATE '2026-08-28', DATE '2026-08-30', 1800.00, 'V11'
)
ON CONFLICT (name, year) DO NOTHING;

-- Application-level importer inserts teams, players, tournament_player records,
-- sessions, pairings and scorecards in one transaction. It must:
-- 1. reject any import that does not contain exactly 24 active players;
-- 2. reject duplicate display names or source player IDs;
-- 3. reject Friday unless it contains 6 pairings and 12 scorecards;
-- 4. mark all team-format scores as already NET;
-- 5. reproduce Team Luke 8 and Team Sam 10 before committing.
