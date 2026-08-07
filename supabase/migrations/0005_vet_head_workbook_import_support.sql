-- Vet Head workbook import support
-- Adds stable workbook keys and a persistent payout table.
-- Designed for repeatable/upsert-safe Excel imports.

ALTER TABLE player
  ADD COLUMN import_key text;

UPDATE player
SET import_key =
  CASE
    WHEN display_name ~ '^Player [0-9]+$'
      THEN 'P' || substring(display_name from '[0-9]+$')
    ELSE NULL
  END
WHERE import_key IS NULL;

CREATE UNIQUE INDEX idx_player_tournament_import_key
  ON player(tournament_id, import_key)
  WHERE import_key IS NOT NULL;


ALTER TABLE course_tee
  ADD COLUMN import_key text;

-- The original seed created one placeholder course/tee.
-- Treat that existing record as CT1 so the workbook importer
-- updates it rather than creating a duplicate.
WITH ranked_course_tees AS (
  SELECT
    id,
    tournament_id,
    row_number() OVER (
      PARTITION BY tournament_id
      ORDER BY created_at, id
    ) AS rn
  FROM course_tee
)
UPDATE course_tee ct
SET import_key = 'CT1'
FROM ranked_course_tees ranked
WHERE ct.id = ranked.id
  AND ranked.rn = 1
  AND ct.import_key IS NULL;

CREATE UNIQUE INDEX idx_course_tee_tournament_import_key
  ON course_tee(tournament_id, import_key)
  WHERE import_key IS NOT NULL;


CREATE TABLE prize_payout (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL
    REFERENCES tournament(id) ON DELETE CASCADE,

  import_key text NOT NULL,
  competition text NOT NULL,

  round_id uuid
    REFERENCES tournament_round(id) ON DELETE CASCADE,

  place text NOT NULL,
  recipient_type text NOT NULL,

  amount_per_recipient numeric(10,2) NOT NULL
    CHECK (amount_per_recipient >= 0),

  recipients integer NOT NULL
    CHECK (recipients >= 1),

  total_payout numeric(10,2) NOT NULL
    CHECK (total_payout >= 0),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(tournament_id, import_key)
);

CREATE INDEX idx_prize_payout_tournament
  ON prize_payout(tournament_id);

CREATE INDEX idx_prize_payout_round
  ON prize_payout(round_id);


GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE prize_payout
TO service_role;
