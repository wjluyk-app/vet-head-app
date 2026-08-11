CREATE TABLE individual_hole_score (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES tournament_round(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES player(id) ON DELETE CASCADE,
  hole_number integer NOT NULL CHECK (hole_number BETWEEN 1 AND 18),
  gross_score integer NOT NULL CHECK (gross_score BETWEEN 1 AND 20),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(round_id, player_id, hole_number)
);

CREATE INDEX idx_individual_hole_score_round
  ON individual_hole_score(round_id);

CREATE INDEX idx_individual_hole_score_player
  ON individual_hole_score(player_id);

GRANT ALL ON TABLE individual_hole_score TO service_role;
