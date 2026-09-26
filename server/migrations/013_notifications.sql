CREATE TABLE notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE, -- quem recebe
  actor_id   INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE, -- quem causou
  type       TEXT        NOT NULL CHECK (type IN ('follow', 'like', 'comment')),
  review_id  INTEGER     REFERENCES reviews (id) ON DELETE CASCADE, -- só para like/comment
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at    TIMESTAMPTZ
);

CREATE INDEX notifications_user_id_created_at_idx ON notifications (user_id, created_at DESC);
