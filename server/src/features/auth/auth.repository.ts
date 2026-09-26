import { createHash, randomBytes } from 'node:crypto';
import { pool } from '../../db/pool.js';
import type { AuthUser, UserWithPassword } from './auth.types.js';

const SESSION_TTL_DAYS = 30;
export const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function findUserByEmail(email: string): Promise<UserWithPassword | null> {
  const { rows } = await pool.query<UserWithPassword>(
    'SELECT id, name, username, email, password_hash AS "passwordHash" FROM users WHERE email = $1',
    [email],
  );
  return rows[0] ?? null;
}

export async function createUser(
  name: string,
  username: string,
  email: string,
  passwordHash: string,
): Promise<AuthUser> {
  const { rows } = await pool.query<AuthUser>(
    `INSERT INTO users (name, username, email, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, username, email`,
    [name, username, email, passwordHash],
  );
  return rows[0];
}

/** Cria a sessão e retorna o token que vai no cookie. */
export async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  await pool.query('DELETE FROM sessions WHERE expires_at < now()');
  await pool.query('INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)', [
    hashToken(token),
    userId,
    new Date(Date.now() + SESSION_TTL_MS),
  ]);
  return token;
}

export async function updateUsername(userId: number, username: string): Promise<AuthUser> {
  const { rows } = await pool.query<AuthUser>(
    'UPDATE users SET username = $2 WHERE id = $1 RETURNING id, name, username, email',
    [userId, username],
  );
  return rows[0];
}

export async function findUserBySessionToken(token: string): Promise<AuthUser | null> {
  const { rows } = await pool.query<AuthUser>(
    `SELECT u.id, u.name, u.username, u.email
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.id = $1 AND s.expires_at > now()`,
    [hashToken(token)],
  );
  return rows[0] ?? null;
}

export async function deleteSession(token: string): Promise<void> {
  await pool.query('DELETE FROM sessions WHERE id = $1', [hashToken(token)]);
}
