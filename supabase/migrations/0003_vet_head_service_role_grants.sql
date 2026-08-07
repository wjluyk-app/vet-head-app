GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  tournament,
  player,
  course_tee,
  tournament_round,
  round_group,
  round_group_player,
  individual_score,
  scramble_score,
  round_group_result
TO service_role;
