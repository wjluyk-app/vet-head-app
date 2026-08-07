CREATE TABLE score_entry_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  display_name text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_score_entry_user_email
  ON score_entry_user(lower(email));

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE score_entry_user
TO service_role;
