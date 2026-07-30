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
  v_user_id uuid := auth.uid();
  v_role app_role;
  v_session_name text;
  v_result match_result%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT role
  INTO v_role
  FROM app_user
  WHERE id = v_user_id
    AND active = true;

  IF v_role NOT IN ('tournament_admin', 'scorekeeper') THEN
    RAISE EXCEPTION 'Result entry permission denied';
  END IF;

  SELECT s.name
  INTO v_session_name
  FROM pairing p
  JOIN session s ON s.id = p.session_id
  WHERE p.id = p_pairing_id;

  IF v_session_name <> 'Sunday Back' THEN
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

REVOKE ALL ON FUNCTION save_singles_match_result(uuid, uuid, boolean, integer, text)
FROM PUBLIC;

GRANT EXECUTE ON FUNCTION save_singles_match_result(uuid, uuid, boolean, integer, text)
TO authenticated;
