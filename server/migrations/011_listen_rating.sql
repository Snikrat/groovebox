-- Nota opcional por audição, independente da nota "oficial" do álbum (reviews.rating).
-- Reflete o que a pessoa achou NAQUELE dia, como no diário do Letterboxd.
ALTER TABLE listens
  ADD COLUMN rating NUMERIC(2,1)
  CHECK (rating IS NULL OR (rating BETWEEN 0.5 AND 5 AND rating * 2 = TRUNC(rating * 2)));
