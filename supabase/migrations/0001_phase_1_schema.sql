-- Cubby Cup App Phase 1 PostgreSQL Schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE app_role AS ENUM ('tournament_admin','scorekeeper','captain','player','viewer');
CREATE TYPE session_status AS ENUM ('setup','open','submitted','review','locked','published');
CREATE TYPE publication_stage AS ENUM ('players_guide','friday','through_saturday','final');
CREATE TYPE publication_status AS ENUM ('draft','published','superseded');
CREATE TYPE score_subject_type AS ENUM ('team','player');

CREATE TABLE app_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  display_name text NOT NULL,
  role app_role NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tournament (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  year integer NOT NULL,
  venue text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'setup',
  total_payout_pool numeric(12,2) NOT NULL DEFAULT 0,
  visual_template_version text NOT NULL,
  draft_coin_toss_winner_team_id uuid,
  pairing_advantage_team_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(name, year)
);

CREATE TABLE team (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
  name text NOT NULL,
  short_name text NOT NULL,
  display_color text,
  captain_player_id uuid,
  draft_order_position integer,
  pairing_advantage boolean NOT NULL DEFAULT false,
  UNIQUE(tournament_id, short_name)
);

CREATE TABLE player (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_player_id text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  display_name text NOT NULL,
  short_display_name text NOT NULL,
  birthdate date,
  email text,
  mobile text,
  active boolean NOT NULL DEFAULT true,
  notes text
);

CREATE TABLE tournament_player (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES player(id),
  team_id uuid NOT NULL REFERENCES team(id),
  event_age integer,
  handicap_index numeric(5,1),
  course_handicap integer,
  friday_playing_handicap integer,
  saturday_playing_handicap integer,
  pinehurst_playing_handicap integer,
  singles_playing_handicap integer,
  default_tee text,
  adjusted_tee text,
  tee_reason text,
  captain_status boolean NOT NULL DEFAULT false,
  shirt_size text,
  housing_unit text,
  payment_status text,
  payment_amount numeric(12,2),
  payment_date date,
  payment_method text,
  payment_note text,
  UNIQUE(tournament_id, player_id)
);

CREATE TABLE tee_rule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
  name text NOT NULL,
  minimum_age integer NOT NULL,
  minimum_age_plus_handicap integer NOT NULL,
  source_tee text NOT NULL,
  recommended_tee text NOT NULL,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE tee_override (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_player_id uuid NOT NULL REFERENCES tournament_player(id),
  original_tee text,
  new_tee text NOT NULL,
  reason text NOT NULL,
  changed_by uuid NOT NULL REFERENCES app_user(id),
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE session (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
  name text NOT NULL,
  day_number integer NOT NULL,
  session_date date NOT NULL,
  course text NOT NULL,
  format text NOT NULL,
  hole_count integer NOT NULL,
  starting_hole_default integer,
  status session_status NOT NULL DEFAULT 'setup',
  live_results_enabled boolean NOT NULL DEFAULT false,
  skins_enabled boolean NOT NULL DEFAULT false,
  field_payouts_enabled boolean NOT NULL DEFAULT false,
  UNIQUE(tournament_id, name)
);

CREATE TABLE match_point_rule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES session(id) ON DELETE CASCADE,
  component text NOT NULL,
  winner_points numeric(6,2) NOT NULL,
  tie_points_each numeric(6,2) NOT NULL,
  loser_points numeric(6,2) NOT NULL DEFAULT 0,
  UNIQUE(session_id, component)
);

CREATE TABLE pairing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES session(id) ON DELETE CASCADE,
  match_number integer NOT NULL,
  tee_time time,
  starting_hole integer,
  match_order integer NOT NULL,
  throws_first_team_id uuid REFERENCES team(id),
  counter_team_id uuid REFERENCES team(id),
  status text NOT NULL DEFAULT 'setup',
  locked_at timestamptz,
  UNIQUE(session_id, match_number)
);

CREATE TABLE pairing_participant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pairing_id uuid NOT NULL REFERENCES pairing(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES team(id),
  player_id uuid NOT NULL REFERENCES player(id),
  participant_order integer NOT NULL,
  handicap_reference numeric(6,2),
  strokes_received integer,
  UNIQUE(pairing_id, player_id)
);

CREATE TABLE scorecard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pairing_id uuid NOT NULL REFERENCES pairing(id) ON DELETE CASCADE,
  subject_type score_subject_type NOT NULL,
  team_id uuid REFERENCES team(id),
  player_id uuid REFERENCES player(id),
  submitted_by uuid REFERENCES app_user(id),
  submitted_at timestamptz,
  locked boolean NOT NULL DEFAULT false,
  version integer NOT NULL DEFAULT 1,
  CHECK (
    (subject_type='team' AND team_id IS NOT NULL AND player_id IS NULL) OR
    (subject_type='player' AND player_id IS NOT NULL)
  )
);

CREATE TABLE hole_score (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scorecard_id uuid NOT NULL REFERENCES scorecard(id) ON DELETE CASCADE,
  hole_number integer NOT NULL CHECK (hole_number BETWEEN 1 AND 18),
  net_score integer NOT NULL CHECK (net_score BETWEEN 1 AND 20),
  entered_by uuid REFERENCES app_user(id),
  entered_at timestamptz NOT NULL DEFAULT now(),
  sync_client_id text,
  UNIQUE(scorecard_id, hole_number)
);

CREATE TABLE match_result (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pairing_id uuid NOT NULL UNIQUE REFERENCES pairing(id) ON DELETE CASCADE,
  result_text text,
  winner_team_id uuid REFERENCES team(id),
  halved boolean NOT NULL DEFAULT false,
  closed_on_hole integer,
  status text NOT NULL DEFAULT 'in_progress',
  calculated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE match_component_result (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_result_id uuid NOT NULL REFERENCES match_result(id) ON DELETE CASCADE,
  component text NOT NULL,
  team_id uuid NOT NULL REFERENCES team(id),
  points numeric(6,2) NOT NULL,
  UNIQUE(match_result_id, component, team_id)
);

CREATE TABLE payout_rule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES session(id) ON DELETE CASCADE,
  category text NOT NULL,
  place integer,
  amount numeric(12,2) NOT NULL,
  split_method text NOT NULL,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE payout_result (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
  session_id uuid REFERENCES session(id),
  category text NOT NULL,
  team_id uuid REFERENCES team(id),
  player_id uuid REFERENCES player(id),
  place integer,
  calculated_amount numeric(12,4) NOT NULL,
  final_amount numeric(12,2) NOT NULL,
  adjustment numeric(12,2) NOT NULL DEFAULT 0,
  calculation_trace jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE skin_result (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES session(id) ON DELETE CASCADE,
  hole_number integer NOT NULL,
  team_id uuid REFERENCES team(id),
  net_score integer,
  is_skin boolean NOT NULL,
  validation_status text NOT NULL,
  team_amount numeric(12,2) NOT NULL DEFAULT 0,
  per_player_amount numeric(12,2) NOT NULL DEFAULT 0,
  UNIQUE(session_id, hole_number)
);

CREATE TABLE mvp_result (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES player(id),
  session_id uuid REFERENCES session(id),
  points numeric(8,2) NOT NULL,
  reason text NOT NULL,
  manual_adjustment boolean NOT NULL DEFAULT false
);

CREATE TABLE publication (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
  stage publication_stage NOT NULL,
  version integer NOT NULL,
  status publication_status NOT NULL DEFAULT 'draft',
  page_count integer NOT NULL,
  file_name text NOT NULL,
  file_location text,
  file_checksum text,
  data_snapshot jsonb NOT NULL,
  generated_by uuid REFERENCES app_user(id),
  generated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  UNIQUE(tournament_id, stage, version)
);

CREATE TABLE audit_record (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid,
  field_name text,
  old_value jsonb,
  new_value jsonb,
  reason text,
  user_id uuid REFERENCES app_user(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  publication_regenerated boolean NOT NULL DEFAULT false
);

CREATE INDEX idx_hole_score_scorecard ON hole_score(scorecard_id);
CREATE INDEX idx_pairing_session ON pairing(session_id);
CREATE INDEX idx_audit_tournament_created ON audit_record(tournament_id, created_at DESC);
CREATE INDEX idx_payout_tournament_player ON payout_result(tournament_id, player_id);
