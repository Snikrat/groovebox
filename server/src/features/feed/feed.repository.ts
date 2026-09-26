import { pool } from '../../db/pool.js';
import { albumSummaryJson } from '../albums/albums.repository.js';
import { reviewColumns } from '../reviews/reviews.repository.js';
import type { PublicReview } from '../reviews/reviews.types.js';

/** Avaliações recentes de quem o usuário segue. */
export async function listFeed(followerId: number, limit: number, offset: number): Promise<PublicReview[]> {
  const { rows } = await pool.query<PublicReview>(
    `SELECT ${reviewColumns}, ${albumSummaryJson} AS album,
            json_build_object('username', u.username, 'name', u.name) AS author,
            (SELECT count(*)::int FROM review_likes WHERE review_id = r.id) AS "likeCount",
            EXISTS(SELECT 1 FROM review_likes WHERE review_id = r.id AND user_id = $1) AS "likedByMe",
            (SELECT count(*)::int FROM review_comments WHERE review_id = r.id) AS "commentCount"
       FROM reviews r
       JOIN follows f ON f.followee_id = r.user_id AND f.follower_id = $1
       JOIN users u   ON u.id = r.user_id
       JOIN albums a  ON a.id = r.album_id
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3`,
    [followerId, limit, offset],
  );
  return rows;
}
