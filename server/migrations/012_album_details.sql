-- Metadados extras do MusicBrainz, preenchidos na importação. NULL/vazio para
-- álbuns já importados antes desta migration (não há reimportação automática).
ALTER TABLE albums
  ADD COLUMN genres         TEXT[],
  ADD COLUMN label          TEXT,
  ADD COLUMN country        TEXT,        -- código ISO 3166-1 alpha-2, ex. "US"
  ADD COLUMN external_links JSONB;       -- [{ "label": "Discogs", "url": "https://..." }, ...]
