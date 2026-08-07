CREATE OR REPLACE FUNCTION set_session_status(
  p_session_id uuid,
  p_status session_status,
  p_reason text DEFAULT 'Administrator session status change'
)
RETURNS session
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_session session%ROWTYPE;
  v_old_status session_status;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT is_bill_admin() THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;

  SELECT *
  INTO v_session
  FROM session
  WHERE id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  v_old_status := v_session.status;

  IF v_old_status = p_status THEN
    RETURN v_session;
  END IF;

  UPDATE session
  SET status = p_status
  WHERE id = p_session_id
  RETURNING *
  INTO v_session;

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
    v_session.tournament_id,
    'session',
    v_session.id,
    'status',
    to_jsonb(v_old_status),
    to_jsonb(p_status),
    p_reason,
    v_user_id
  );

  RETURN v_session;
END;
$$;

REVOKE ALL ON FUNCTION set_session_status(
  uuid,
  session_status,
  text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION set_session_status(
  uuid,
  session_status,
  text
) TO authenticated;
