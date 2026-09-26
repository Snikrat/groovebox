import type { CookieOptions, Request, RequestHandler } from 'express';
import { HttpError } from '../../shared/httpError.js';
import { findUserBySessionToken, SESSION_TTL_MS } from './auth.repository.js';
import type { AuthUser } from './auth.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const SESSION_COOKIE = 'groovebox_session';

export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_TTL_MS,
};

/** Identifica o usuário pelo cookie de sessão, se houver. Não bloqueia a requisição. */
export const loadUser: RequestHandler = async (req, _res, next) => {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  if (typeof token === 'string' && token) {
    req.user = (await findUserBySessionToken(token)) ?? undefined;
  }
  next();
};

/** Bloqueia com 401 todas as rotas do router quando não há usuário logado. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  requireUser(req);
  next();
};

/** Retorna o usuário logado ou responde 401. */
export function requireUser(req: Request): AuthUser {
  if (!req.user) throw new HttpError(401, 'Faça login para continuar.');
  return req.user;
}
