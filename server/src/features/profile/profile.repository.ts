import { pool } from '../../db/pool.js';
import type { PublicProfile } from './profile.types.js';

export async function findPublicProfile(username: string): Promise<{ id: number; profile: PublicProfile } | null> {
  const { rows } = await pool.query<{ id: number; username: string; name: string }>(
    'SELECT id, username, name FROM users WHERE username = $1',
    [username],
  );
  const user = rows[0];
  return user ? { id: user.id, profile: { username: user.username, name: user.name } } : null;
}
