-- UP
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'ATTENDEE',
  is_organizer BOOLEAN NOT NULL DEFAULT FALSE,
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_role_organizer_check CHECK (
    (role = 'ATTENDEE' AND is_organizer = FALSE) OR
    (role = 'HOST' AND is_organizer = TRUE)
  )
);

-- DOWN
DROP TABLE IF EXISTS users;

