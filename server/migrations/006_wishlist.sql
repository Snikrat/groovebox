CREATE TABLE wishlist_items (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  album_id   INTEGER     NOT NULL REFERENCES albums (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, album_id)
);

CREATE INDEX wishlist_items_user_id_idx ON wishlist_items (user_id);
