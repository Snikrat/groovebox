ALTER TABLE users ADD COLUMN username TEXT;

-- Gera um nome de usuário provisório para quem já tinha conta, a partir do nome.
-- Acentos e outros caracteres não-alfanuméricos viram "-"; o id garante que é único.
UPDATE users
   SET username = regexp_replace(lower(trim(name)), '[^a-z0-9]+', '-', 'g') || '-' || id
 WHERE username IS NULL;

ALTER TABLE users
  ALTER COLUMN username SET NOT NULL,
  ADD CONSTRAINT users_username_unique UNIQUE (username);
