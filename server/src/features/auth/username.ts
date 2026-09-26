import { pool } from '../../db/pool.js';

const MAX_USERNAME_LENGTH = 40;

// Minúsculas, só letras e dígitos (acentos e espaços viram "-"), sem "-" nas pontas.
function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_USERNAME_LENGTH);
  return slug || 'usuario';
}

async function usernameExists(username: string): Promise<boolean> {
  const { rows } = await pool.query('SELECT 1 FROM users WHERE username = $1', [username]);
  return rows.length > 0;
}

/** Gera um nome de usuário único a partir do nome informado no cadastro, acrescentando um número se preciso. */
export async function generateUsername(name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let suffix = 2;
  while (await usernameExists(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}
