import { pool } from '../../db/pool.js';
import { albumSummaryJson } from '../albums/albums.repository.js';
import type { Listen, ListenWithAlbum } from './listens.types.js';

const listenColumns = `l.id,
  l.album_id            AS "albumId",
  to_char(l.listened_on, 'YYYY-MM-DD') AS "listenedOn",
  l.rating,
  l.created_at           AS "createdAt"`;

export async function listListens(userId: number, limit: number, offset: number): Promise<ListenWithAlbum[]> {
  const { rows } = await pool.query<ListenWithAlbum>(
    `SELECT ${listenColumns}, ${albumSummaryJson} AS album, r.rating AS "reviewRating",
            -- "Reouvido": já existe uma audição mais antiga do mesmo álbum.
            -- O window function considera todas as audições do usuário, não só a página atual.
            l.id <> FIRST_VALUE(l.id) OVER (
              PARTITION BY l.album_id ORDER BY l.listened_on ASC, l.id ASC
            ) AS "isRelisten"
       FROM listens l
       JOIN albums a       ON a.id = l.album_id
       LEFT JOIN reviews r ON r.album_id = l.album_id AND r.user_id = l.user_id
      WHERE l.user_id = $1
      ORDER BY l.listened_on DESC, l.id DESC
      LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );
  return rows;
}

export async function listListensForAlbum(userId: number, albumId: number): Promise<Listen[]> {
  const { rows } = await pool.query<Listen>(
    `SELECT ${listenColumns}
       FROM listens l
      WHERE l.user_id = $1 AND l.album_id = $2
      ORDER BY l.listened_on DESC, l.id DESC`,
    [userId, albumId],
  );
  return rows;
}

export async function createListen(
  userId: number,
  albumId: number,
  listenedOn: string,
  rating: number | null,
): Promise<Listen> {
  const { rows } = await pool.query<Listen>(
    `INSERT INTO listens AS l (user_id, album_id, listened_on, rating)
     VALUES ($1, $2, $3, $4)
     RETURNING ${listenColumns}`,
    [userId, albumId, listenedOn, rating],
  );
  return rows[0];
}

/** Retorna null quando a audição não existe ou pertence a outro usuário. */
export async function updateListen(
  userId: number,
  id: number,
  listenedOn: string,
  rating: number | null,
): Promise<Listen | null> {
  const { rows } = await pool.query<Listen>(
    `UPDATE listens AS l
        SET listened_on = $3, rating = $4
      WHERE l.id = $1 AND l.user_id = $2
     RETURNING ${listenColumns}`,
    [id, userId, listenedOn, rating],
  );
  return rows[0] ?? null;
}

/** Retorna false quando a audição não existe ou pertence a outro usuário. */
export async function deleteListen(userId: number, id: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM listens WHERE id = $1 AND user_id = $2', [id, userId]);
  return rowCount === 1;
}
