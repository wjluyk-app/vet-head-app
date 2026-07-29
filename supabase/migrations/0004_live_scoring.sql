-- Cubby Cup App Version 4: live scoring, optimistic concurrency and audit trail.

ALTER TABLE player
  ADD CONSTRAINT player_source_player_id_unique UNIQUE (source_player_id);

ALTER TABLE scorecard
  ADD COLUMN IF NOT EXISTS source_key text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS scorecard_source_key_unique
  ON scorecard(source_key)
  WHERE source_key IS NOT NULL;

ALTER TABLE hole_score
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS score_sync_conflict (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hole_score_id uuid REFERENCES hole_score(id) ON DELETE CASCADE,
  scorecard_id uuid NOT NULL REFERENCES scorecard(id) ON DELETE CASCADE,
  hole_number integer NOT NULL CHECK (hole_number BETWEEN 1 AND 18),
  client_score integer NOT NULL CHECK (client_score BETWEEN 1 AND 20),
  server_score integer CHECK (server_score BETWEEN 1 AND 20),
  client_version integer,
  server_version integer,
  submitted_by uuid REFERENCES app_user(id),
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES app_user(id),
  resolution_note text
);

ALTER TABLE score_sync_conflict ENABLE ROW LEVEL SECURITY;

CREATE POLICY score_sync_conflict_admin_read ON score_sync_conflict
FOR SELECT TO authenticated
USING (current_app_role() = 'tournament_admin');

CREATE OR REPLACE FUNCTION save_team_hole_score(
  p_scorecard_id uuid,
  p_hole_number integer,
  p_net_score integer,
  p_expected_version integer DEFAULT NULL,
  p_reason text DEFAULT 'Score entry'
)
RETURNS TABLE (
  hole_score_id uuid,
  saved_score integer,
  saved_version integer,
  saved_at timestamptz,
  conflict boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_role app_role;
  v_session_status session_status;
  v_locked boolean;
  v_existing hole_score%ROWTYPE;
  v_saved hole_score%ROWTYPE;
  v_tournament_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT role INTO v_role
  FROM app_user
  WHERE id = v_user_id AND active = true;

  IF v_role NOT IN ('tournament_admin', 'scorekeeper') THEN
    RAISE EXCEPTION 'Score entry permission denied';
  END IF;

  IF p_hole_number NOT BETWEEN 1 AND 18 THEN
    RAISE EXCEPTION 'Invalid hole number';
  END IF;

  IF p_net_score NOT BETWEEN 1 AND 20 THEN
    RAISE EXCEPTION 'Invalid NET score';
  END IF;

  SELECT s.status, sc.locked, s.tournament_id
  INTO v_session_status, v_locked, v_tournament_id
  FROM scorecard sc
  JOIN pairing p ON p.id = sc.pairing_id
  JOIN session s ON s.id = p.session_id
  WHERE sc.id = p_scorecard_id
    AND sc.subject_type = 'team';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Team scorecard not found';
  END IF;

  IF v_locked OR v_session_status <> 'open' THEN
    RAISE EXCEPTION 'Session is not open for scoring';
  END IF;

  SELECT * INTO v_existing
  FROM hole_score
  WHERE scorecard_id = p_scorecard_id
    AND hole_number = p_hole_number
  FOR UPDATE;

  IF FOUND AND p_expected_version IS NOT NULL
     AND v_existing.version <> p_expected_version THEN
    INSERT INTO score_sync_conflict (
      hole_score_id, scorecard_id, hole_number,
      client_score, server_score, client_version, server_version,
      submitted_by
    ) VALUES (
      v_existing.id, p_scorecard_id, p_hole_number,
      p_net_score, v_existing.net_score, p_expected_version,
      v_existing.version, v_user_id
    );

    RETURN QUERY SELECT
      v_existing.id, v_existing.net_score, v_existing.version,
      v_existing.updated_at, true;
    RETURN;
  END IF;

  IF FOUND THEN
    UPDATE hole_score
    SET net_score = p_net_score,
        version = version + 1,
        updated_at = now(),
        entered_by = v_user_id
    WHERE id = v_existing.id
    RETURNING * INTO v_saved;

    IF v_existing.net_score IS DISTINCT FROM p_net_score THEN
      INSERT INTO audit_record (
        tournament_id, entity_type, entity_id, field_name,
        old_value, new_value, reason, user_id
      ) VALUES (
        v_tournament_id, 'hole_score', v_existing.id, 'net_score',
        to_jsonb(v_existing.net_score), to_jsonb(p_net_score),
        p_reason, v_user_id
      );
    END IF;
  ELSE
    INSERT INTO hole_score (
      scorecard_id, hole_number, net_score, entered_by,
      version, updated_at
    ) VALUES (
      p_scorecard_id, p_hole_number, p_net_score, v_user_id,
      1, now()
    )
    RETURNING * INTO v_saved;

    INSERT INTO audit_record (
      tournament_id, entity_type, entity_id, field_name,
      old_value, new_value, reason, user_id
    ) VALUES (
      v_tournament_id, 'hole_score', v_saved.id, 'net_score',
      NULL, to_jsonb(p_net_score), p_reason, v_user_id
    );
  END IF;

  UPDATE scorecard
  SET updated_at = now(),
      version = version + 1
  WHERE id = p_scorecard_id;

  RETURN QUERY SELECT
    v_saved.id, v_saved.net_score, v_saved.version,
    v_saved.updated_at, false;
END;
$$;

REVOKE ALL ON FUNCTION save_team_hole_score(uuid, integer, integer, integer, text)
FROM PUBLIC;
GRANT EXECUTE ON FUNCTION save_team_hole_score(uuid, integer, integer, integer, text)
TO authenticated;
