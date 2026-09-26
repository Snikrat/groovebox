import { pool } from '../../db/pool.js';
import { albumSummaryJson } from '../albums/albums.repository.js';
import type { FeaturedAlbum } from './featured.types.js';

export async function listFeatured(userId: number): Promise<FeaturedAlbum[]> {
  const { rows } = await pool.query<FeaturedAlbum>(
    `SELECT f.position, ${albumSummaryJson} AS album
       FROM featured_albums f
       JOIN albums a ON a.id = f.album_id
      WHERE f.user_id = $1
      ORDER BY f.position`,
    [userId],
  );
  return rows;
}

/** Substitui a lista inteira pela ordem informada (posições 1..N). Até 4 álbuns. */
export async function replaceFeatured(userId: number, albumIds: number[]): Promise<FeaturedAlbum[]> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM featured_albums WHERE user_id = $1', [userId]);

    if (albumIds.length > 0) {
      await client.query(
        `INSERT INTO featured_albums (user_id, album_id, position)
         SELECT $1, album_id, position
           FROM unnest($2::int[]) WITH ORDINALITY AS t(album_id, position)`,
        [userId, albumIds],
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return listFeatured(userId);
}
