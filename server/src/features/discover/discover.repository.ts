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

const RECENT_ARTISTS_LIMIT = 10;

/** Os artistas mais recentemente avaliados pelo usuário (um mbid por artista, sem repetir). */
export async function listRecentlyReviewedArtistMbids(userId: number): Promise<string[]> {
  const { rows } = await pool.query<{ artistMbid: string }>(
    `SELECT a.artist_musicbrainz_id AS "artistMbid"
       FROM reviews r
       JOIN albums a ON a.id = r.album_id
      WHERE r.user_id = $1 AND a.artist_musicbrainz_id IS NOT NULL
      GROUP BY a.artist_musicbrainz_id
      ORDER BY max(r.updated_at) DESC
      LIMIT $2`,
    [userId, RECENT_ARTISTS_LIMIT],
  );
  return rows.map((row) => row.artistMbid);
}

/** MBIDs de álbuns que o usuário já avaliou ou colocou em "quero ouvir" — para não sugerir de novo. */
export async function listKnownAlbumMbids(userId: number): Promise<Set<string>> {
  const { rows } = await pool.query<{ musicbrainzId: string }>(
    `SELECT DISTINCT a.musicbrainz_id AS "musicbrainzId"
       FROM albums a
      WHERE a.id IN (
        SELECT album_id FROM reviews WHERE user_id = $1
        UNION
        SELECT album_id FROM wishlist_items WHERE user_id = $1
      )`,
    [userId],
  );
  return new Set(rows.map((row) => row.musicbrainzId));
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
