-- Add player scorecards and NET hole-by-hole scoring for Sunday Singles.

INSERT INTO scorecard (
  pairing_id,
  subject_type,
  team_id,
  player_id,
  source_key
)
SELECT
  pp.pairing_id,
  'player'::score_subject_type,
  pp.team_id,
  pp.player_id,
  '2026-sunday-singles-' || p.match_number || '-' || pp.player_id::text
FROM pairing_participant pp
JOIN pairing p
  ON p.id = pp.pairing_id
JOIN session s
  ON s.id = p.session_id
WHERE s.name = 'Sunday Singles'
  AND NOT EXISTS (
    SELECT 1
    FROM scorecard sc
    WHERE sc.pairing_id = pp.pairing_id
      AND sc.subject_type = 'player'
      AND sc.player_id = pp.player_id
  );

CREATE OR REPLACE FUNCTION save_player_hole_score(
  p_scorecard_id uuid,
  p_hole_number integer,
  p_net_score integer,
  p_expected_version integer DEFAULT NULL,
  p_reason text DEFAULT 'Sunday Singles NET score entry'
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
  v_session_name text;
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

  IF p_hole_number NOT BETWEEN 10 AND 18 THEN
    RAISE EXCEPTION 'Sunday Singles hole must be between 10 and 18';
  END IF;

  IF p_net_score NOT BETWEEN 1 AND 20 THEN
    RAISE EXCEPTION 'Invalid NET score';
  END IF;

  SELECT
    s.status,
    s.name,
    sc.locked,
    s.tournament_id
  INTO
    v_session_status,
    v_session_name,
    v_locked,
    v_tournament_id
  FROM scorecard sc
  JOIN pairing p
    ON p.id = sc.pairing_id
  JOIN session s
    ON s.id = p.session_id
  WHERE sc.id = p_scorecard_id
    AND sc.subject_type = 'player';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Player scorecard not found';
  END IF;

  IF v_session_name <> 'Sunday Singles' THEN
    RAISE EXCEPTION 'Scorecard is not a Sunday Singles scorecard';
  END IF;

  IF v_locked OR v_session_status <> 'open' THEN
    RAISE EXCEPTION 'Sunday Singles session is not open for scoring';
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

REVOKE ALL ON FUNCTION save_player_hole_score(
  uuid,
  integer,
  integer,
  integer,
  text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION save_player_hole_score(
  uuid,
  integer,
  integer,
  integer,
  text
) TO authenticated;
