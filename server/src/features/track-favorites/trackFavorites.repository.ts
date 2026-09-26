import { pool } from '../../db/pool.js';

export async function listFavoriteTrackIds(userId: number, albumId: number): Promise<number[]> {
  const { rows } = await pool.query<{ trackId: number }>(
    `SELECT tf.track_id AS "trackId"
       FROM track_favorites tf
       JOIN tracks t ON t.id = tf.track_id
      WHERE tf.user_id = $1 AND t.album_id = $2`,
    [userId, albumId],
  );
  return rows.map((row) => row.trackId);
}

export async function addTrackFavorite(userId: number, trackId: number): Promise<void> {
  await pool.query(
    `INSERT INTO track_favorites (user_id, track_id) VALUES ($1, $2)
     ON CONFLICT (user_id, track_id) DO NOTHING`,
    [userId, trackId],
  );
}

export async function removeTrackFavorite(userId: number, trackId: number): Promise<void> {
  await pool.query('DELETE FROM track_favorites WHERE user_id = $1 AND track_id = $2', [userId, trackId]);
}
