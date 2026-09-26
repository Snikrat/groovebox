import { pool } from '../../db/pool.js';
import type { ReviewComment } from './reviews.types.js';

export async function likeReview(userId: number, reviewId: number): Promise<void> {
  await pool.query(
    `INSERT INTO review_likes (user_id, review_id) VALUES ($1, $2)
     ON CONFLICT (user_id, review_id) DO NOTHING`,
    [userId, reviewId],
  );
}

export async function unlikeReview(userId: number, reviewId: number): Promise<void> {
  await pool.query('DELETE FROM review_likes WHERE user_id = $1 AND review_id = $2', [userId, reviewId]);
}

export async function listComments(reviewId: number): Promise<ReviewComment[]> {
  const { rows } = await pool.query<ReviewComment>(
    `SELECT c.id, c.review_id AS "reviewId", c.text, c.created_at AS "createdAt",
            json_build_object('username', u.username, 'name', u.name) AS author
       FROM review_comments c
       JOIN users u ON u.id = c.user_id
      WHERE c.review_id = $1
      ORDER BY c.created_at ASC`,
    [reviewId],
  );
  return rows;
}

export async function addComment(userId: number, reviewId: number, text: string): Promise<ReviewComment> {
  const { rows } = await pool.query<{ id: number; reviewId: number; text: string; createdAt: string }>(
    `INSERT INTO review_comments (user_id, review_id, text)
     VALUES ($1, $2, $3)
     RETURNING id, review_id AS "reviewId", text, created_at AS "createdAt"`,
    [userId, reviewId, text],
  );
  const { rows: userRows } = await pool.query<{ username: string; name: string }>(
    'SELECT username, name FROM users WHERE id = $1',
    [userId],
  );
  return { ...rows[0], author: userRows[0] };
}

/** Retorna false quando o comentário não existe ou pertence a outro usuário. */
export async function deleteComment(userId: number, commentId: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM review_comments WHERE id = $1 AND user_id = $2', [
    commentId,
    userId,
  ]);
  return rowCount === 1;
}
