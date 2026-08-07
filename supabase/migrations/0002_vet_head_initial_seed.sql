DO $$
DECLARE
  tournament_uuid uuid;
  course_tee_uuid uuid;
  round1 uuid;
  round2 uuid;
  round3 uuid;
  round4 uuid;
  round5 uuid;
  g1 uuid;
  g2 uuid;
  g3 uuid;
BEGIN

INSERT INTO tournament (
  name,
  year,
  start_date,
  end_date,
  status
)
VALUES (
  'VET HEAD',
  2026,
  '2026-08-13',
  '2026-08-15',
  'setup'
)
RETURNING id INTO tournament_uuid;

INSERT INTO course_tee (
  tournament_id,
  course_name,
  tee_name,
  par,
  course_rating,
  slope_rating
)
VALUES (
  tournament_uuid,
  'Placeholder Course',
  'Tournament Tees',
  72,
  72.0,
  113
)
RETURNING id INTO course_tee_uuid;

INSERT INTO player (tournament_id, display_name, handicap_index)
SELECT
  tournament_uuid,
  'Player ' || n,
  0.0
FROM generate_series(1,12) AS n;

INSERT INTO tournament_round (
  tournament_id,
  round_number,
  name,
  round_date,
  tee_time,
  format,
  course_tee_id
)
VALUES
  (
    tournament_uuid,
    1,
    'Thursday Individual Net',
    '2026-08-13',
    '08:00',
    'individual_net',
    course_tee_uuid
  )
RETURNING id INTO round1;

INSERT INTO tournament_round (
  tournament_id,
  round_number,
  name,
  round_date,
  tee_time,
  format,
  course_tee_id
)
VALUES
  (
    tournament_uuid,
    2,
    'Friday Morning Individual Net',
    '2026-08-14',
    '08:00',
    'individual_net',
    course_tee_uuid
  )
RETURNING id INTO round2;

INSERT INTO tournament_round (
  tournament_id,
  round_number,
  name,
  round_date,
  tee_time,
  format,
  course_tee_id
)
VALUES
  (
    tournament_uuid,
    3,
    'Friday Afternoon 4-Man Scramble',
    '2026-08-14',
    '14:00',
    'four_man_scramble',
    course_tee_uuid
  )
RETURNING id INTO round3;

INSERT INTO tournament_round (
  tournament_id,
  round_number,
  name,
  round_date,
  tee_time,
  format,
  course_tee_id
)
VALUES
  (
    tournament_uuid,
    4,
    'Saturday Morning Individual Net',
    '2026-08-15',
    '08:00',
    'individual_net',
    course_tee_uuid
  )
RETURNING id INTO round4;

INSERT INTO tournament_round (
  tournament_id,
  round_number,
  name,
  round_date,
  tee_time,
  format,
  course_tee_id
)
VALUES
  (
    tournament_uuid,
    5,
    'Saturday Afternoon 4-Man Scramble',
    '2026-08-15',
    '14:00',
    'four_man_scramble',
    course_tee_uuid
  )
RETURNING id INTO round5;

-- ROUND 1
INSERT INTO round_group (round_id, group_number, name)
VALUES (round1,1,'Group 1') RETURNING id INTO g1;
INSERT INTO round_group_player (round_group_id, player_id, player_order)
SELECT g1, id, row_number() OVER (ORDER BY display_name)
FROM player
WHERE tournament_id=tournament_uuid
AND display_name IN ('Player 1','Player 2','Player 3','Player 4');

INSERT INTO round_group (round_id, group_number, name)
VALUES (round1,2,'Group 2') RETURNING id INTO g2;
INSERT INTO round_group_player (round_group_id, player_id, player_order)
SELECT g2, id, row_number() OVER (ORDER BY display_name)
FROM player
WHERE tournament_id=tournament_uuid
AND display_name IN ('Player 5','Player 6','Player 7','Player 8');

INSERT INTO round_group (round_id, group_number, name)
VALUES (round1,3,'Group 3') RETURNING id INTO g3;
INSERT INTO round_group_player (round_group_id, player_id, player_order)
SELECT g3, id, row_number() OVER (ORDER BY display_name)
FROM player
WHERE tournament_id=tournament_uuid
AND display_name IN ('Player 9','Player 10','Player 11','Player 12');

-- ROUND 2
INSERT INTO round_group (round_id, group_number, name)
VALUES (round2,1,'Group 1') RETURNING id INTO g1;
INSERT INTO round_group_player (round_group_id, player_id, player_order)
SELECT g1, id, row_number() OVER (ORDER BY display_name)
FROM player
WHERE tournament_id=tournament_uuid
AND display_name IN ('Player 1','Player 5','Player 9','Player 10');

INSERT INTO round_group (round_id, group_number, name)
VALUES (round2,2,'Group 2') RETURNING id INTO g2;
INSERT INTO round_group_player (round_group_id, player_id, player_order)
SELECT g2, id, row_number() OVER (ORDER BY display_name)
FROM player
WHERE tournament_id=tournament_uuid
AND display_name IN ('Player 2','Player 6','Player 11','Player 12');

INSERT INTO round_group (round_id, group_number, name)
VALUES (round2,3,'Group 3') RETURNING id INTO g3;
INSERT INTO round_group_player (round_group_id, player_id, player_order)
SELECT g3, id, row_number() OVER (ORDER BY display_name)
FROM player
WHERE tournament_id=tournament_uuid
AND display_name IN ('Player 3','Player 4','Player 7','Player 8');

-- ROUND 3
INSERT INTO round_group (round_id, group_number, name)
VALUES (round3,1,'Team 1') RETURNING id INTO g1;
INSERT INTO round_group_player (round_group_id, player_id, player_order)
SELECT g1, id, row_number() OVER (ORDER BY display_name)
FROM player
WHERE tournament_id=tournament_uuid
AND display_name IN ('Player 1','Player 6','Player 8','Player 11');

INSERT INTO round_group (round_id, group_number, name)
VALUES (round3,2,'Team 2') RETURNING id INTO g2;
INSERT INTO round_group_player (round_group_id, player_id, player_order)
SELECT g2, id, row_number() OVER (ORDER BY display_name)
FROM player
WHERE tournament_id=tournament_uuid
AND display_name IN ('Player 2','Player 4','Player 9','Player 12');

INSERT INTO round_group (round_id, group_number, name)
VALUES (round3,3,'Team 3') RETURNING id INTO g3;
INSERT INTO round_group_player (round_group_id, player_id, player_order)
SELECT g3, id, row_number() OVER (ORDER BY display_name)
FROM player
WHERE tournament_id=tournament_uuid
AND display_name IN ('Player 3','Player 5','Player 7','Player 10');

-- ROUND 4
INSERT INTO round_group (round_id, group_number, name)
VALUES (round4,1,'Group 1') RETURNING id INTO g1;
INSERT INTO round_group_player (round_group_id, player_id, player_order)
SELECT g1, id, row_number() OVER (ORDER BY display_name)
FROM player
WHERE tournament_id=tournament_uuid
AND display_name IN ('Player 1','Player 7','Player 9','Player 12');

INSERT INTO round_group (round_id, group_number, name)
VALUES (round4,2,'Group 2') RETURNING id INTO g2;
INSERT INTO round_group_player (round_group_id, player_id, player_order)
SELECT g2, id, row_number() OVER (ORDER BY display_name)
FROM player
WHERE tournament_id=tournament_uuid
AND display_name IN ('Player 2','Player 5','Player 8','Player 10');

INSERT INTO round_group (round_id, group_number, name)
VALUES (round4,3,'Group 3') RETURNING id INTO g3;
INSERT INTO round_group_player (round_group_id, player_id, player_order)
SELECT g3, id, row_number() OVER (ORDER BY display_name)
FROM player
WHERE tournament_id=tournament_uuid
AND display_name IN ('Player 3','Player 4','Player 6','Player 11');

-- ROUND 5
INSERT INTO round_group (round_id, group_number, name)
VALUES (round5,1,'Team 1') RETURNING id INTO g1;
INSERT INTO round_group_player (round_group_id, player_id, player_order)
SELECT g1, id, row_number() OVER (ORDER BY display_name)
FROM player
WHERE tournament_id=tournament_uuid
AND display_name IN ('Player 1','Player 4','Player 8','Player 10');

INSERT INTO round_group (round_id, group_number, name)
VALUES (round5,2,'Team 2') RETURNING id INTO g2;
INSERT INTO round_group_player (round_group_id, player_id, player_order)
SELECT g2, id, row_number() OVER (ORDER BY display_name)
FROM player
WHERE tournament_id=tournament_uuid
AND display_name IN ('Player 2','Player 5','Player 9','Player 11');

INSERT INTO round_group (round_id, group_number, name)
VALUES (round5,3,'Team 3') RETURNING id INTO g3;
INSERT INTO round_group_player (round_group_id, player_id, player_order)
SELECT g3, id, row_number() OVER (ORDER BY display_name)
FROM player
WHERE tournament_id=tournament_uuid
AND display_name IN ('Player 3','Player 6','Player 7','Player 12');

END $$;
