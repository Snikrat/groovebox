import { pool } from '../../db/pool.js';
import { albumSummaryJson } from '../albums/albums.repository.js';
import type { ListSummary, ListWithItems } from './lists.types.js';

const listColumns = `l.id, l.title, l.description,
  l.created_at AS "createdAt",
  l.updated_at AS "updatedAt"`;

export async function listListsByUser(userId: number): Promise<ListSummary[]> {
  const { rows } = await pool.query<ListSummary>(
    `SELECT ${listColumns}, count(li.id)::int AS "itemCount"
       FROM lists l
       LEFT JOIN list_items li ON li.list_id = l.id
      WHERE l.user_id = $1
      GROUP BY l.id
      ORDER BY l.updated_at DESC`,
    [userId],
  );
  return rows;
}

export async function findListById(id: number): Promise<ListWithItems | null> {
  const { rows } = await pool.query<ListWithItems & { itemCount: string | number }>(
    `SELECT ${listColumns},
            json_build_object('username', u.username, 'name', u.name) AS owner,
            count(li.id)::int AS "itemCount",
            coalesce(
              json_agg(${albumSummaryJson} ORDER BY li.position) FILTER (WHERE li.id IS NOT NULL),
              '[]'
            ) AS items
       FROM lists l
       JOIN users u          ON u.id = l.user_id
       LEFT JOIN list_items li ON li.list_id = l.id
       LEFT JOIN albums a      ON a.id = li.album_id
      WHERE l.id = $1
      GROUP BY l.id, u.username, u.name`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createList(userId: number, title: string, description: string | null): Promise<ListSummary> {
  const { rows } = await pool.query<ListSummary>(
    `INSERT INTO lists AS l (user_id, title, description)
     VALUES ($1, $2, $3)
     RETURNING ${listColumns}, 0 AS "itemCount"`,
    [userId, title, description],
  );
  return rows[0];
}

/** Retorna null quando a lista não existe ou pertence a outro usuário. */
export async function updateList(
  userId: number,
  id: number,
  title: string,
  description: string | null,
): Promise<ListSummary | null> {
  const { rows } = await pool.query<ListSummary>(
    `UPDATE lists AS l
        SET title = $3, description = $4, updated_at = now()
      WHERE l.id = $1 AND l.user_id = $2
     RETURNING ${listColumns}, (SELECT count(*)::int FROM list_items WHERE list_id = l.id) AS "itemCount"`,
    [id, userId, title, description],
  );
  return rows[0] ?? null;
}

export async function deleteList(userId: number, id: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM lists WHERE id = $1 AND user_id = $2', [id, userId]);
  return rowCount === 1;
}

/** Retorna false quando a lista não existe ou pertence a outro usuário. */
export async function addListItem(userId: number, listId: number, albumId: number): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: owned } = await client.query('SELECT 1 FROM lists WHERE id = $1 AND user_id = $2 FOR UPDATE', [
      listId,
      userId,
    ]);
    if (owned.length === 0) {
      await client.query('ROLLBACK');
      return false;
    }

    await client.query(
      `INSERT INTO list_items (list_id, album_id, position)
       SELECT $1, $2, coalesce(max(position), 0) + 1 FROM list_items WHERE list_id = $1
       ON CONFLICT (list_id, album_id) DO NOTHING`,
      [listId, albumId],
    );
    await client.query('UPDATE lists SET updated_at = now() WHERE id = $1', [listId]);
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function removeListItem(userId: number, listId: number, albumId: number): Promise<boolean> {
  const { rowCount } = await pool.query(
    `DELETE FROM list_items li
      USING lists l
      WHERE li.list_id = l.id AND l.id = $2 AND l.user_id = $1 AND li.album_id = $3`,
    [userId, listId, albumId],
  );
  if ((rowCount ?? 0) > 0) await pool.query('UPDATE lists SET updated_at = now() WHERE id = $1', [listId]);
  return (rowCount ?? 0) > 0;
}
