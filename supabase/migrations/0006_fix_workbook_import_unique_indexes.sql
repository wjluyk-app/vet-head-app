DROP INDEX IF EXISTS idx_player_tournament_import_key;

CREATE UNIQUE INDEX idx_player_tournament_import_key
ON player(tournament_id, import_key);

DROP INDEX IF EXISTS idx_course_tee_tournament_import_key;

CREATE UNIQUE INDEX idx_course_tee_tournament_import_key
ON course_tee(tournament_id, import_key);
