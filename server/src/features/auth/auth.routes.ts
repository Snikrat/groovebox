import { Router } from 'express';
import { HttpError } from '../../shared/httpError.js';
import { isPgError, PG_UNIQUE_VIOLATION } from '../../shared/pgErrors.js';
import { SESSION_COOKIE, sessionCookieOptions } from './auth.middleware.js';
import { createSession, createUser, deleteSession, findUserByEmail } from './auth.repository.js';
import { hashPassword, verifyPassword } from './password.js';

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

  let user;
  try {
    user = await createUser(name, email, await hashPassword(password));
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
  res.json({ id: user.id, name: user.name, email: user.email });
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
