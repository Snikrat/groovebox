CREATE TABLE featured_albums (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  album_id   INTEGER     NOT NULL REFERENCES albums (id) ON DELETE CASCADE,
  position   SMALLINT    NOT NULL CHECK (position BETWEEN 1 AND 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, position),
  UNIQUE (user_id, album_id)
);
