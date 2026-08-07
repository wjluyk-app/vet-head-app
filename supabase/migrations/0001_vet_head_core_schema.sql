CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE round_format AS ENUM ('individual_net', 'four_man_scramble');
CREATE TYPE round_status AS ENUM ('setup', 'open', 'complete', 'published');

CREATE TABLE tournament (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  year integer NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'setup',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(name, year)
);

CREATE TABLE player (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  handicap_index numeric(5,1) NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE course_tee (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
  course_name text NOT NULL,
  tee_name text NOT NULL,
  par integer NOT NULL,
  course_rating numeric(4,1) NOT NULL,
  slope_rating integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tournament_round (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
  round_number integer NOT NULL CHECK (round_number BETWEEN 1 AND 5),
  name text NOT NULL,
  round_date date NOT NULL,
  tee_time time NOT NULL,
  format round_format NOT NULL,
  course_tee_id uuid NOT NULL REFERENCES course_tee(id),
  status round_status NOT NULL DEFAULT 'setup',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, round_number)
);

CREATE TABLE round_group (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES tournament_round(id) ON DELETE CASCADE,
  group_number integer NOT NULL CHECK (group_number BETWEEN 1 AND 3),
  name text,
  UNIQUE(round_id, group_number)
);

CREATE TABLE round_group_player (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_group_id uuid NOT NULL REFERENCES round_group(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES player(id) ON DELETE CASCADE,
  player_order integer NOT NULL CHECK (player_order BETWEEN 1 AND 4),
  UNIQUE(round_group_id, player_id),
  UNIQUE(round_group_id, player_order)
);

CREATE TABLE individual_score (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES tournament_round(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES player(id) ON DELETE CASCADE,
  gross_score integer NOT NULL CHECK (gross_score BETWEEN 18 AND 200),
  course_handicap integer NOT NULL,
  net_score integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(round_id, player_id)
);

CREATE TABLE scramble_score (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES tournament_round(id) ON DELETE CASCADE,
  round_group_id uuid NOT NULL REFERENCES round_group(id) ON DELETE CASCADE,
  gross_score integer NOT NULL CHECK (gross_score BETWEEN 18 AND 200),
  team_handicap numeric(5,1) NOT NULL,
  net_score numeric(6,1) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(round_id, round_group_id)
);

CREATE TABLE round_group_result (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES tournament_round(id) ON DELETE CASCADE,
  round_group_id uuid NOT NULL REFERENCES round_group(id) ON DELETE CASCADE,
  group_total numeric(7,1) NOT NULL,
  place integer NOT NULL CHECK (place BETWEEN 1 AND 3),
  points_per_player numeric(5,2) NOT NULL,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(round_id, round_group_id)
);

CREATE INDEX idx_player_tournament ON player(tournament_id);
CREATE INDEX idx_round_tournament ON tournament_round(tournament_id);
CREATE INDEX idx_group_round ON round_group(round_id);
CREATE INDEX idx_group_player_group ON round_group_player(round_group_id);
CREATE INDEX idx_individual_score_round ON individual_score(round_id);
CREATE INDEX idx_scramble_score_round ON scramble_score(round_id);
CREATE INDEX idx_group_result_round ON round_group_result(round_id);
