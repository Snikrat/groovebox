import { pool } from '../../db/pool.js';
import type { ArtistCount, DecadeCount, RatingCount, Stats } from './stats.types.js';

const TOP_ARTISTS_LIMIT = 5;

// Todos os valores possíveis de nota, para o gráfico de barras mostrar até as que têm 0.
const ALL_RATINGS = Array.from({ length: 10 }, (_, i) => (i + 1) / 2);

export async function getStats(userId: number): Promise<Stats> {
  const [summary, ratings, topArtists, byDecade, user] = await Promise.all([
    pool.query<{ totalReviews: number; averageRating: number | null }>(
      `SELECT count(*)::int AS "totalReviews", round(avg(rating), 2) AS "averageRating"
         FROM reviews WHERE user_id = $1`,
      [userId],
    ),
    pool.query<RatingCount>(
      `SELECT rating, count(*)::int AS count FROM reviews WHERE user_id = $1 GROUP BY rating`,
      [userId],
    ),
    pool.query<ArtistCount>(
      `SELECT a.artist_name AS "artistName", count(*)::int AS count
         FROM reviews r JOIN albums a ON a.id = r.album_id
        WHERE r.user_id = $1
        GROUP BY a.artist_name
        ORDER BY count DESC, "artistName"
        LIMIT $2`,
      [userId, TOP_ARTISTS_LIMIT],
    ),
    pool.query<DecadeCount>(
      `SELECT (substring(a.first_release_date from 1 for 3) || '0')::int AS decade, count(*)::int AS count
         FROM reviews r JOIN albums a ON a.id = r.album_id
        WHERE r.user_id = $1 AND a.first_release_date ~ '^[0-9]{4}'
        GROUP BY decade
        ORDER BY decade`,
      [userId],
    ),
    pool.query<{ createdAt: string }>('SELECT created_at AS "createdAt" FROM users WHERE id = $1', [userId]),
  ]);

  const { rows: listenRows } = await pool.query<{ totalListens: number }>(
    'SELECT count(*)::int AS "totalListens" FROM listens WHERE user_id = $1',
    [userId],
  );

  const countByRating = new Map(ratings.rows.map((row) => [row.rating, row.count]));

  return {
    totalReviews: summary.rows[0].totalReviews,
    totalListens: listenRows[0].totalListens,
    averageRating: summary.rows[0].averageRating,
    ratingDistribution: ALL_RATINGS.map((rating) => ({ rating, count: countByRating.get(rating) ?? 0 })),
    topArtists: topArtists.rows,
    albumsByDecade: byDecade.rows,
    memberSince: user.rows[0].createdAt,
  };
}
