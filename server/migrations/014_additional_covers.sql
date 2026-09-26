-- Contracapa e páginas do encarte, do Cover Art Archive. NULL/vazio se não houver
-- ou para álbuns importados antes desta migration.
ALTER TABLE albums ADD COLUMN additional_covers JSONB;
