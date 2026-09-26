import { pool } from '../../db/pool.js';
import { albumSummaryJson } from '../albums/albums.repository.js';
import type { Review, ReviewInput, ReviewWithAlbum } from './reviews.types.js';

const reviewColumns = `r.id,
  r.album_id   AS "albumId",
  r.rating,
  r.review,
  r.created_at AS "createdAt",
  r.updated_at AS "updatedAt"`;

export async function listReviews(userId: number): Promise<ReviewWithAlbum[]> {
  const { rows } = await pool.query<ReviewWithAlbum>(
    `SELECT ${reviewColumns}, ${albumSummaryJson} AS album
       FROM reviews r
       JOIN albums a ON a.id = r.album_id
      WHERE r.user_id = $1
      ORDER BY r.updated_at DESC`,
    [userId],
  );
  return rows;
}

export async function findReviewForAlbum(userId: number, albumId: number): Promise<Review | null> {
  const { rows } = await pool.query<Review>(
    `SELECT ${reviewColumns} FROM reviews r WHERE r.user_id = $1 AND r.album_id = $2`,
    [userId, albumId],
  );
  return rows[0] ?? null;
}

export async function createReview(userId: number, albumId: number, input: ReviewInput): Promise<Review> {
  const { rows } = await pool.query<Review>(
    `INSERT INTO reviews AS r (user_id, album_id, rating, review)
     VALUES ($1, $2, $3, $4)
     RETURNING ${reviewColumns}`,
    [userId, albumId, input.rating, input.review],
  );
  return rows[0];
}

export async function updateReview(userId: number, id: number, input: ReviewInput): Promise<Review | null> {
  const { rows } = await pool.query<Review>(
    `UPDATE reviews AS r
        SET rating = $3, review = $4, updated_at = now()
      WHERE r.id = $1 AND r.user_id = $2
     RETURNING ${reviewColumns}`,
    [id, userId, input.rating, input.review],
  );
  return rows[0] ?? null;
}
