import { pool } from '../../db/pool.js';
import { albumSummaryJson } from '../albums/albums.repository.js';
import type { Notification, NotificationType } from './notifications.types.js';

/** Não notifica quando a pessoa interage com o próprio conteúdo. */
export async function createNotification(
  userId: number,
  actorId: number,
  type: NotificationType,
  reviewId: number | null,
): Promise<void> {
  if (userId === actorId) return;

  await pool.query('INSERT INTO notifications (user_id, actor_id, type, review_id) VALUES ($1, $2, $3, $4)', [
    userId,
    actorId,
    type,
    reviewId,
  ]);
}

export async function listNotifications(userId: number, limit: number, offset: number): Promise<Notification[]> {
  const { rows } = await pool.query<Notification>(
    `SELECT n.id, n.type,
            n.created_at AS "createdAt",
            n.read_at    AS "readAt",
            json_build_object('username', u.username, 'name', u.name) AS actor,
            CASE WHEN a.id IS NOT NULL THEN ${albumSummaryJson} ELSE NULL END AS album
       FROM notifications n
       JOIN users u         ON u.id = n.actor_id
       LEFT JOIN reviews r  ON r.id = n.review_id
       LEFT JOIN albums a   ON a.id = r.album_id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );
  return rows;
}

export async function countUnread(userId: number): Promise<number> {
  const { rows } = await pool.query<{ count: number }>(
    'SELECT count(*)::int AS count FROM notifications WHERE user_id = $1 AND read_at IS NULL',
    [userId],
  );
  return rows[0].count;
}

export async function markAllRead(userId: number): Promise<void> {
  await pool.query('UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL', [userId]);
}
