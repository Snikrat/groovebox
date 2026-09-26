import { Router } from 'express';
import { HttpError } from '../../shared/httpError.js';
import { isPgError, PG_UNIQUE_VIOLATION } from '../../shared/pgErrors.js';
import { SESSION_COOKIE, sessionCookieOptions } from './auth.middleware.js';
import { createSession, createUser, deleteSession, findUserByEmail } from './auth.repository.js';
import { hashPassword, verifyPassword } from './password.js';
import { generateUsername } from './username.js';
import type { AuthUser } from './auth.types.js';

const USERNAME_UNIQUE_CONSTRAINT = 'users_username_unique';
const MAX_USERNAME_ATTEMPTS = 3;

// generateUsername já evita a colisão mais comum (duas contas com o mesmo nome);
// isto cobre só a corrida rara de dois cadastros simultâneos escolhendo o mesmo candidato.
async function createUserWithUniqueUsername(name: string, email: string, passwordHash: string): Promise<AuthUser> {
  let username = await generateUsername(name);

  for (let attempt = 1; attempt <= MAX_USERNAME_ATTEMPTS; attempt++) {
    try {
      return await createUser(name, username, email, passwordHash);
    } catch (error) {
      const constraint = (error as { constraint?: string })?.constraint;
      if (isPgError(error, PG_UNIQUE_VIOLATION) && constraint === USERNAME_UNIQUE_CONSTRAINT) {
        username = `${username}-${attempt + 1}`;
        continue;
      }
      throw error;
    }
  }

  throw new HttpError(409, 'Não foi possível gerar um nome de usuário. Tente novamente.');
}

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 200;
const MAX_NAME_LENGTH = 60;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readString(body: unknown, field: string): string {
  const value = (body as Record<string, unknown> | undefined)?.[field];
  return typeof value === 'string' ? value : '';
}

function parseEmail(body: unknown): string {
  const email = readString(body, 'email').trim().toLowerCase();
  if (!EMAIL_REGEX.test(email) || email.length > 254) throw new HttpError(400, 'Informe um email válido.');
  return email;
}

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const name = readString(req.body, 'name').trim();
  const email = parseEmail(req.body);
  const password = readString(req.body, 'password');

  if (!name || name.length > MAX_NAME_LENGTH) {
    throw new HttpError(400, `Informe um nome com até ${MAX_NAME_LENGTH} caracteres.`);
  }
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    throw new HttpError(400, `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  }

  let user: AuthUser;
  try {
    user = await createUserWithUniqueUsername(name, email, await hashPassword(password));
  } catch (error) {
    if (isPgError(error, PG_UNIQUE_VIOLATION)) throw new HttpError(409, 'Este email já está cadastrado.');
    throw error;
  }

  res.cookie(SESSION_COOKIE, await createSession(user.id), sessionCookieOptions);
  res.status(201).json(user);
});

authRouter.post('/login', async (req, res) => {
  const email = readString(req.body, 'email').trim().toLowerCase();
  const password = readString(req.body, 'password');

  const user = email && password ? await findUserByEmail(email) : null;
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new HttpError(401, 'Email ou senha incorretos.');
  }

  res.cookie(SESSION_COOKIE, await createSession(user.id), sessionCookieOptions);
  res.json({ id: user.id, name: user.name, username: user.username, email: user.email });
});

authRouter.post('/logout', async (req, res) => {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  if (typeof token === 'string' && token) await deleteSession(token);

  const { maxAge: _maxAge, ...clearOptions } = sessionCookieOptions;
  res.clearCookie(SESSION_COOKIE, clearOptions);
  res.status(204).end();
});

// Retorna null quando não há ninguém logado.
authRouter.get('/me', (req, res) => {
  res.json(req.user ?? null);
});
