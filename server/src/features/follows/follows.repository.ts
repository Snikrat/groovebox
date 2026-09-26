import { pool } from '../../db/pool.js';
import type { FollowedUser } from './follows.types.js';

/** Retorna false quando já seguia (idempotente) — usado para não notificar de novo. */
export async function follow(followerId: number, followeeId: number): Promise<boolean> {
  const { rowCount } = await pool.query(
    `INSERT INTO follows (follower_id, followee_id) VALUES ($1, $2)
     ON CONFLICT (follower_id, followee_id) DO NOTHING`,
    [followerId, followeeId],
  );
  return rowCount === 1;
}

export async function unfollow(followerId: number, followeeId: number): Promise<void> {
  await pool.query('DELETE FROM follows WHERE follower_id = $1 AND followee_id = $2', [followerId, followeeId]);
}

export async function isFollowing(followerId: number, followeeId: number): Promise<boolean> {
  const { rows } = await pool.query(
    'SELECT 1 FROM follows WHERE follower_id = $1 AND followee_id = $2',
    [followerId, followeeId],
  );
  return rows.length > 0;
}

/** Usuários que o usuário (dado pelo id) segue. */
export async function listFollowing(userId: number): Promise<FollowedUser[]> {
  const { rows } = await pool.query<FollowedUser>(
    `SELECT u.username, u.name
       FROM follows f
       JOIN users u ON u.id = f.followee_id
      WHERE f.follower_id = $1
      ORDER BY f.created_at DESC`,
    [userId],
  );
  return rows;
}

export async function listFollowers(userId: number): Promise<FollowedUser[]> {
  const { rows } = await pool.query<FollowedUser>(
    `SELECT u.username, u.name
       FROM follows f
       JOIN users u ON u.id = f.follower_id
      WHERE f.followee_id = $1
      ORDER BY f.created_at DESC`,
    [userId],
  );
  return rows;
}

export async function countFollowStats(userId: number): Promise<{ followers: number; following: number }> {
  const { rows } = await pool.query<{ followers: string; following: string }>(
    `SELECT
       (SELECT count(*) FROM follows WHERE followee_id = $1) AS followers,
       (SELECT count(*) FROM follows WHERE follower_id = $1) AS following`,
    [userId],
  );
  return { followers: Number(rows[0].followers), following: Number(rows[0].following) };
}

/** Ids de quem o usuário segue, para montar a query do feed. */
export async function listFolloweeIds(followerId: number): Promise<number[]> {
  const { rows } = await pool.query<{ followeeId: number }>(
    'SELECT followee_id AS "followeeId" FROM follows WHERE follower_id = $1',
    [followerId],
  );
  return rows.map((row) => row.followeeId);
}
