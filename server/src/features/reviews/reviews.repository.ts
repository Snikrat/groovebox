import { pool } from '../../db/pool.js';
import { albumSummaryJson } from '../albums/albums.repository.js';
import type { PublicReview, Review, ReviewInput, ReviewWithAlbum } from './reviews.types.js';

export const reviewColumns = `r.id,
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

/** Avaliações de outras pessoas para um álbum, com dados sociais. Pública: viewerId pode ser null. */
export async function listPublicReviewsForAlbum(
  albumId: number,
  excludeUserId: number | null,
  viewerId: number | null,
): Promise<PublicReview[]> {
  const { rows } = await pool.query<PublicReview>(
    `SELECT ${reviewColumns}, ${albumSummaryJson} AS album,
            json_build_object('username', u.username, 'name', u.name) AS author,
            (SELECT count(*)::int FROM review_likes WHERE review_id = r.id) AS "likeCount",
            EXISTS(SELECT 1 FROM review_likes WHERE review_id = r.id AND user_id = $3) AS "likedByMe",
            (SELECT count(*)::int FROM review_comments WHERE review_id = r.id) AS "commentCount"
       FROM reviews r
       JOIN users u  ON u.id = r.user_id
       JOIN albums a ON a.id = r.album_id
      WHERE r.album_id = $1 AND r.user_id IS DISTINCT FROM $2
      ORDER BY r.created_at DESC`,
    [albumId, excludeUserId, viewerId],
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

/** Retorna false quando a avaliação não existe ou pertence a outro usuário. */
export async function deleteReview(userId: number, id: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM reviews WHERE id = $1 AND user_id = $2', [id, userId]);
  return rowCount === 1;
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
