CREATE TABLE track_favorites (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  track_id   INTEGER     NOT NULL REFERENCES tracks (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, track_id)
);

CREATE INDEX track_favorites_user_id_idx ON track_favorites (user_id);
