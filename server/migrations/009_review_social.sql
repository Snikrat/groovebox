CREATE TABLE review_likes (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  review_id  INTEGER     NOT NULL REFERENCES reviews (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, review_id)
);

CREATE INDEX review_likes_review_id_idx ON review_likes (review_id);

CREATE TABLE review_comments (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  review_id  INTEGER     NOT NULL REFERENCES reviews (id) ON DELETE CASCADE,
  text       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX review_comments_review_id_idx ON review_comments (review_id);
