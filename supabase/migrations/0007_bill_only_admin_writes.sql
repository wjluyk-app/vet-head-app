CREATE OR REPLACE FUNCTION is_bill_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM app_user
    WHERE id = auth.uid()
      AND active = true
      AND role = 'tournament_admin'
      AND lower(email) = 'wjluyk@gmail.com'
  )
$$;

DROP POLICY IF EXISTS hole_score_insert ON hole_score;
CREATE POLICY hole_score_insert ON hole_score
FOR INSERT TO authenticated
WITH CHECK (
  is_bill_admin()
  AND EXISTS (
    SELECT 1
    FROM scorecard sc
    JOIN pairing p ON p.id = sc.pairing_id
    JOIN session s ON s.id = p.session_id
    WHERE sc.id = scorecard_id
      AND sc.locked = false
      AND s.status = 'open'
  )
);

DROP POLICY IF EXISTS hole_score_update ON hole_score;
CREATE POLICY hole_score_update ON hole_score
FOR UPDATE TO authenticated
USING (
  is_bill_admin()
  AND EXISTS (
    SELECT 1
    FROM scorecard sc
    JOIN pairing p ON p.id = sc.pairing_id
    JOIN session s ON s.id = p.session_id
    WHERE sc.id = hole_score.scorecard_id
      AND sc.locked = false
      AND s.status = 'open'
  )
)
WITH CHECK (is_bill_admin());

CREATE OR REPLACE FUNCTION save_singles_match_result(
  p_pairing_id uuid,
  p_winner_team_id uuid DEFAULT NULL,
  p_halved boolean DEFAULT false,
  p_closed_on_hole integer DEFAULT NULL,
  p_result_text text DEFAULT NULL
)
RETURNS match_result
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_name text;
  v_result match_result%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT is_bill_admin() THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;

  SELECT s.name
  INTO v_session_name
  FROM pairing p
  JOIN session s ON s.id = p.session_id
  WHERE p.id = p_pairing_id;

  IF v_session_name <> 'Sunday Singles' THEN
    RAISE EXCEPTION 'Pairing is not a Sunday singles match';
  END IF;

  IF p_halved = false AND p_winner_team_id IS NULL THEN
    RAISE EXCEPTION 'Winner team is required unless the match is halved';
  END IF;

  IF p_halved = true AND p_winner_team_id IS NOT NULL THEN
    RAISE EXCEPTION 'Halved match cannot have a winner team';
  END IF;

  INSERT INTO match_result (
    pairing_id,
    result_text,
    winner_team_id,
    halved,
    closed_on_hole,
    status,
    calculated_at
  )
  VALUES (
    p_pairing_id,
    p_result_text,
    p_winner_team_id,
    p_halved,
    p_closed_on_hole,
    'final',
    now()
  )
  ON CONFLICT (pairing_id)
  DO UPDATE SET
    result_text = EXCLUDED.result_text,
    winner_team_id = EXCLUDED.winner_team_id,
    halved = EXCLUDED.halved,
    closed_on_hole = EXCLUDED.closed_on_hole,
    status = 'final',
    calculated_at = now()
  RETURNING *
  INTO v_result;

  RETURN v_result;
END;
$$;

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
  v_session_status session_status;
  v_locked boolean;
  v_existing hole_score%ROWTYPE;
  v_saved hole_score%ROWTYPE;
  v_tournament_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT is_bill_admin() THEN
    RAISE EXCEPTION 'Administrator access required';
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

  SELECT *
  INTO v_existing
  FROM hole_score
  WHERE scorecard_id = p_scorecard_id
    AND hole_number = p_hole_number
  FOR UPDATE;

  IF FOUND
     AND p_expected_version IS NOT NULL
     AND v_existing.version <> p_expected_version THEN

    INSERT INTO score_sync_conflict (
      hole_score_id,
      scorecard_id,
      hole_number,
      client_score,
      server_score,
      client_version,
      server_version,
      submitted_by
    )
    VALUES (
      v_existing.id,
      p_scorecard_id,
      p_hole_number,
      p_net_score,
      v_existing.net_score,
      p_expected_version,
      v_existing.version,
      v_user_id
    );

    RETURN QUERY
    SELECT
      v_existing.id,
      v_existing.net_score,
      v_existing.version,
      v_existing.updated_at,
      true;

    RETURN;
  END IF;

  IF FOUND THEN
    UPDATE hole_score
    SET
      net_score = p_net_score,
      version = version + 1,
      updated_at = now(),
      entered_by = v_user_id
    WHERE id = v_existing.id
    RETURNING *
    INTO v_saved;

    IF v_existing.net_score IS DISTINCT FROM p_net_score THEN
      INSERT INTO audit_record (
        tournament_id,
        entity_type,
        entity_id,
        field_name,
        old_value,
        new_value,
        reason,
        user_id
      )
      VALUES (
        v_tournament_id,
        'hole_score',
        v_existing.id,
        'net_score',
        to_jsonb(v_existing.net_score),
        to_jsonb(p_net_score),
        p_reason,
        v_user_id
      );
    END IF;
  ELSE
    INSERT INTO hole_score (
      scorecard_id,
      hole_number,
      net_score,
      entered_by,
      version,
      updated_at
    )
    VALUES (
      p_scorecard_id,
      p_hole_number,
      p_net_score,
      v_user_id,
      1,
      now()
    )
    RETURNING *
    INTO v_saved;

    INSERT INTO audit_record (
      tournament_id,
      entity_type,
      entity_id,
      field_name,
      old_value,
      new_value,
      reason,
      user_id
    )
    VALUES (
      v_tournament_id,
      'hole_score',
      v_saved.id,
      'net_score',
      NULL,
      to_jsonb(p_net_score),
      p_reason,
      v_user_id
    );
  END IF;

  UPDATE scorecard
  SET
    updated_at = now(),
    version = version + 1
  WHERE id = p_scorecard_id;

  RETURN QUERY
  SELECT
    v_saved.id,
    v_saved.net_score,
    v_saved.version,
    v_saved.updated_at,
    false;
END;
$$;

REVOKE ALL ON FUNCTION save_team_hole_score(
  uuid,
  integer,
  integer,
  integer,
  text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION save_team_hole_score(
  uuid,
  integer,
  integer,
  integer,
  text
) TO authenticated;
