-- UP
CREATE TABLE mehfil_cards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CONSTRAINT mehfil_cards_display_name_check CHECK (char_length(trim(display_name)) > 0),
  bio TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  show_bio BOOLEAN NOT NULL DEFAULT TRUE,
  show_avatar BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DOWN
DROP TABLE IF EXISTS mehfil_cards;

