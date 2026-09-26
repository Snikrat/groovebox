import { pool } from '../../db/pool.js';
import { albumSummaryJson } from '../albums/albums.repository.js';
import type { Favorite } from './favorites.types.js';

export async function listFavorites(userId: number): Promise<Favorite[]> {
  const { rows } = await pool.query<Favorite>(
    `SELECT f.album_id   AS "albumId",
            f.created_at AS "createdAt",
            r.rating,
            ${albumSummaryJson} AS album
       FROM favorites f
       JOIN albums a       ON a.id = f.album_id
       LEFT JOIN reviews r ON r.album_id = f.album_id AND r.user_id = f.user_id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC`,
    [userId],
  );
  return rows;
}

export async function addFavorite(userId: number, albumId: number): Promise<void> {
  await pool.query(
    `INSERT INTO favorites (user_id, album_id) VALUES ($1, $2)
     ON CONFLICT (user_id, album_id) DO NOTHING`,
    [userId, albumId],
  );
}

export async function removeFavorite(userId: number, albumId: number): Promise<void> {
  await pool.query('DELETE FROM favorites WHERE user_id = $1 AND album_id = $2', [userId, albumId]);
}
