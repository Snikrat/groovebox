CREATE TABLE follows (
  id          SERIAL PRIMARY KEY,
  follower_id INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  followee_id INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (follower_id, followee_id),
  CHECK (follower_id <> followee_id)
);

CREATE INDEX follows_follower_id_idx ON follows (follower_id);
CREATE INDEX follows_followee_id_idx ON follows (followee_id);
