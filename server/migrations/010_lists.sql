CREATE TABLE lists (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX lists_user_id_idx ON lists (user_id);

CREATE TABLE list_items (
  id         SERIAL PRIMARY KEY,
  list_id    INTEGER     NOT NULL REFERENCES lists (id) ON DELETE CASCADE,
  album_id   INTEGER     NOT NULL REFERENCES albums (id) ON DELETE CASCADE,
  position   INTEGER     NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (list_id, album_id)
);

CREATE INDEX list_items_list_id_idx ON list_items (list_id);
