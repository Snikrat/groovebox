CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usuário local/mock enquanto não existe autenticação.
INSERT INTO users (id, name) VALUES (1, 'Usuário');
SELECT setval(pg_get_serial_sequence('users', 'id'), 1);

CREATE TABLE albums (
  id                    SERIAL PRIMARY KEY,
  musicbrainz_id        UUID        NOT NULL UNIQUE, -- MBID do release-group
  title                 TEXT        NOT NULL,
  artist_name           TEXT        NOT NULL,
  artist_musicbrainz_id UUID,
  first_release_date    VARCHAR(10), -- datas do MusicBrainz podem ser parciais: "2010", "2010-07", "2010-07-27"
  primary_type          TEXT,
  cover_url             TEXT,        -- URL do Cover Art Archive; NULL quando não há capa
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tracks (
  id                       SERIAL PRIMARY KEY,
  album_id                 INTEGER NOT NULL REFERENCES albums (id) ON DELETE CASCADE,
  musicbrainz_recording_id UUID    NOT NULL,
  position                 INTEGER NOT NULL,
  title                    TEXT    NOT NULL,
  duration_ms              INTEGER,
  UNIQUE (album_id, position)
);

CREATE TABLE reviews (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  album_id   INTEGER      NOT NULL REFERENCES albums (id) ON DELETE CASCADE,
  rating     NUMERIC(2,1) NOT NULL CHECK (rating BETWEEN 0.5 AND 5 AND rating * 2 = TRUNC(rating * 2)),
  review     TEXT,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (user_id, album_id)
);

CREATE TABLE favorites (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  album_id   INTEGER     NOT NULL REFERENCES albums (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, album_id)
);
