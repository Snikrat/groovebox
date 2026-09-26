import { pool } from '../../db/pool.js';
import type { AlbumSummary } from '../albums/albums.types.js';
import type { GenreCount } from './browse.types.js';

const GENRES_LIMIT = 50;

const albumSummaryColumns = `a.id,
  a.musicbrainz_id     AS "musicbrainzId",
  a.title,
  a.artist_name        AS "artistName",
  a.first_release_date AS "firstReleaseDate",
  a.cover_url          AS "coverUrl"`;

/**
 * Gêneros presentes no banco local, com contagem — só entre os álbuns que alguém já
 * abriu no groovebox, não o catálogo inteiro do MusicBrainz.
 */
export async function listGenres(): Promise<GenreCount[]> {
  const { rows } = await pool.query<GenreCount>(
    `SELECT genre, count(*)::int AS count
       FROM albums, unnest(genres) AS genre
      GROUP BY genre
      ORDER BY count DESC, genre
      LIMIT $1`,
    [GENRES_LIMIT],
  );
  return rows;
}

export async function listAlbumsByGenre(genre: string): Promise<AlbumSummary[]> {
  const { rows } = await pool.query<AlbumSummary>(
    `SELECT ${albumSummaryColumns}
       FROM albums a
      WHERE $1 = ANY(a.genres)
      ORDER BY a.title`,
    [genre],
  );
  return rows;
}

export async function listAlbumsByYear(year: string): Promise<AlbumSummary[]> {
  const { rows } = await pool.query<AlbumSummary>(
    `SELECT ${albumSummaryColumns}
       FROM albums a
      WHERE substring(a.first_release_date from 1 for 4) = $1
      ORDER BY a.first_release_date, a.title`,
    [year],
  );
  return rows;
}
