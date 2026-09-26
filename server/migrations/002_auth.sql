-- O usuário mock (id 1) deixa de existir: agora cada pessoa cria sua conta.
-- Avaliações e favoritos dele são removidos em cascata; os álbuns importados continuam.
DELETE FROM users;

ALTER TABLE users
  ADD COLUMN email         TEXT NOT NULL UNIQUE, -- sempre salvo em minúsculas
  ADD COLUMN password_hash TEXT NOT NULL;

CREATE TABLE sessions (
  id         TEXT PRIMARY KEY, -- hash SHA-256 do token; o token em si só existe no cookie
  user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sessions_user_id_idx ON sessions (user_id);
