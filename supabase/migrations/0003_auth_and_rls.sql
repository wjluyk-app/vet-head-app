-- Phase 1 role and row-level-security policies.

ALTER TABLE app_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE player ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_player ENABLE ROW LEVEL SECURITY;
ALTER TABLE session ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairing ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairing_participant ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecard ENABLE ROW LEVEL SECURITY;
ALTER TABLE hole_score ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_result ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_result ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_result ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_result ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_record ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION current_app_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM app_user
  WHERE id = auth.uid() AND active = true
$$;

-- Authenticated viewers can read tournament-facing data.
CREATE POLICY tournament_read ON tournament
FOR SELECT TO authenticated USING (true);

CREATE POLICY team_read ON team
FOR SELECT TO authenticated USING (true);

CREATE POLICY player_read ON player
FOR SELECT TO authenticated USING (true);

CREATE POLICY tournament_player_read ON tournament_player
FOR SELECT TO authenticated USING (true);

CREATE POLICY session_read ON session
FOR SELECT TO authenticated USING (true);

CREATE POLICY pairing_read ON pairing
FOR SELECT TO authenticated USING (true);

CREATE POLICY pairing_participant_read ON pairing_participant
FOR SELECT TO authenticated USING (true);

CREATE POLICY scorecard_read ON scorecard
FOR SELECT TO authenticated USING (true);

CREATE POLICY hole_score_read ON hole_score
FOR SELECT TO authenticated USING (true);

CREATE POLICY results_read ON match_result
FOR SELECT TO authenticated USING (true);

CREATE POLICY payout_read ON payout_result
FOR SELECT TO authenticated USING (true);

CREATE POLICY skins_read ON skin_result
FOR SELECT TO authenticated USING (true);

CREATE POLICY mvp_read ON mvp_result
FOR SELECT TO authenticated USING (true);

CREATE POLICY publication_read ON publication
FOR SELECT TO authenticated USING (
  status = 'published'
  OR current_app_role() IN ('tournament_admin','scorekeeper')
);

-- Scorekeepers and administrators may enter scores while the session is open.
CREATE POLICY hole_score_insert ON hole_score
FOR INSERT TO authenticated
WITH CHECK (
  current_app_role() IN ('tournament_admin','scorekeeper')
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

CREATE POLICY hole_score_update ON hole_score
FOR UPDATE TO authenticated
USING (
  current_app_role() IN ('tournament_admin','scorekeeper')
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
WITH CHECK (true);

-- Tournament administrators control configuration and publications.
CREATE POLICY publication_admin_write ON publication
FOR ALL TO authenticated
USING (current_app_role() = 'tournament_admin')
WITH CHECK (current_app_role() = 'tournament_admin');

CREATE POLICY audit_admin_read ON audit_record
FOR SELECT TO authenticated
USING (current_app_role() = 'tournament_admin');
