import { pool } from '../../db/pool.js';
import type { PersonSummary, SuggestedPerson } from './people.types.js';

const SEARCH_LIMIT = 20;

// Escapa curingas do ILIKE (%, _, \) para que a busca trate o termo como texto literal.
function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function searchPeople(term: string): Promise<PersonSummary[]> {
  const { rows } = await pool.query<PersonSummary>(
    `SELECT username, name FROM users
      WHERE name ILIKE $1 OR username ILIKE $1
      ORDER BY name
      LIMIT $2`,
    [`%${escapeLike(term)}%`, SEARCH_LIMIT],
  );
  return rows;
}

/** Pessoas mais seguidas no app, sem quem o usuário já segue nem ele mesmo — um proxy simples de sugestão. */
export async function listSuggestedPeople(viewerId: number | null, limit: number): Promise<SuggestedPerson[]> {
  const { rows } = await pool.query<SuggestedPerson>(
    `SELECT u.username, u.name, count(f.id)::int AS "followerCount"
       FROM users u
       LEFT JOIN follows f ON f.followee_id = u.id
      WHERE u.id IS DISTINCT FROM $1
        AND NOT EXISTS (
          SELECT 1 FROM follows WHERE follower_id = $1 AND followee_id = u.id
        )
      GROUP BY u.id
      ORDER BY "followerCount" DESC, u.created_at DESC
      LIMIT $2`,
    [viewerId, limit],
  );
  return rows;
}
