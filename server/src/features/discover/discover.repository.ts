import { pool } from '../../db/pool.js';
import { albumSummaryJson } from '../albums/albums.repository.js';
import { reviewColumns } from '../reviews/reviews.repository.js';
import type { PublicReview } from '../reviews/reviews.types.js';
import type { PopularAlbum } from './discover.types.js';

const RECENT_WINDOW = '30 days';

/**
 * Álbuns mais avaliados recentemente (últimos 30 dias); em caso de empate ou de pouca
 * atividade recente, desempata pelo total de avaliações. Só considera álbuns com pelo
 * menos uma avaliação, então a seção some naturalmente enquanto o app estiver vazio.
 */
export async function listPopularAlbums(limit: number): Promise<PopularAlbum[]> {
  const { rows } = await pool.query<PopularAlbum>(
    `SELECT ${albumSummaryJson} AS album,
            count(r.id) FILTER (WHERE r.created_at > now() - interval '${RECENT_WINDOW}')::int AS "recentCount",
            count(r.id)::int AS "totalCount"
       FROM albums a
       JOIN reviews r ON r.album_id = a.id
      GROUP BY a.id
      ORDER BY "recentCount" DESC, "totalCount" DESC
      LIMIT $1`,
    [limit],
  );
  return rows;
}

/** Avaliações públicas mais curtidas, de qualquer usuário (não só de quem você segue). */
export async function listPopularReviews(limit: number, viewerId: number | null): Promise<PublicReview[]> {
  const { rows } = await pool.query<PublicReview>(
    `SELECT ${reviewColumns}, ${albumSummaryJson} AS album,
            json_build_object('username', u.username, 'name', u.name) AS author,
            (SELECT count(*)::int FROM review_likes WHERE review_id = r.id) AS "likeCount",
            EXISTS(SELECT 1 FROM review_likes WHERE review_id = r.id AND user_id = $2) AS "likedByMe",
            (SELECT count(*)::int FROM review_comments WHERE review_id = r.id) AS "commentCount"
       FROM reviews r
       JOIN users u  ON u.id = r.user_id
       JOIN albums a ON a.id = r.album_id
      WHERE EXISTS (SELECT 1 FROM review_likes WHERE review_id = r.id)
      ORDER BY (SELECT count(*) FROM review_likes WHERE review_id = r.id) DESC, r.created_at DESC
      LIMIT $1`,
    [limit, viewerId],
  );
  return rows;
}
