import { pool } from '../../db/pool.js';
import { albumSummaryJson } from '../albums/albums.repository.js';
import type { WishlistItem } from './wishlist.types.js';

export async function listWishlist(userId: number): Promise<WishlistItem[]> {
  const { rows } = await pool.query<WishlistItem>(
    `SELECT w.album_id   AS "albumId",
            w.created_at AS "createdAt",
            ${albumSummaryJson} AS album
       FROM wishlist_items w
       JOIN albums a ON a.id = w.album_id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC`,
    [userId],
  );
  return rows;
}

export async function addToWishlist(userId: number, albumId: number): Promise<void> {
  await pool.query(
    `INSERT INTO wishlist_items (user_id, album_id) VALUES ($1, $2)
     ON CONFLICT (user_id, album_id) DO NOTHING`,
    [userId, albumId],
  );
}

export async function removeFromWishlist(userId: number, albumId: number): Promise<void> {
  await pool.query('DELETE FROM wishlist_items WHERE user_id = $1 AND album_id = $2', [userId, albumId]);
}
