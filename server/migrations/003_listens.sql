CREATE TABLE listens (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  album_id    INTEGER NOT NULL REFERENCES albums (id) ON DELETE CASCADE,
  listened_on DATE    NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX listens_user_id_listened_on_idx ON listens (user_id, listened_on DESC);
CREATE INDEX listens_user_id_album_id_idx ON listens (user_id, album_id);
