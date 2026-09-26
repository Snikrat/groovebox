import { Router } from 'express';
import { requireAuth, requireUser } from '../auth/auth.middleware.js';
import { HttpError } from '../../shared/httpError.js';
import { isPgError, PG_FOREIGN_KEY_VIOLATION } from '../../shared/pgErrors.js';
import { parseId } from '../../shared/validation.js';
import { createListen, deleteListen, listListens, listListensForAlbum } from './listens.repository.js';

const PAGE_SIZE = 50;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Tolerância de 1 dia para diferenças de fuso entre o navegador e o servidor.
const FUTURE_TOLERANCE_MS = 24 * 60 * 60 * 1000;

function parseListenedOn(body: unknown): string {
  const value = (body as Record<string, unknown> | undefined)?.listenedOn;
  if (typeof value !== 'string' || !DATE_REGEX.test(value)) {
    throw new HttpError(400, 'Informe uma data no formato AAAA-MM-DD.');
  }

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new HttpError(400, 'Data inválida.');
  if (date.getTime() > Date.now() + FUTURE_TOLERANCE_MS) {
    throw new HttpError(400, 'A data não pode ser no futuro.');
  }

  return value;
}

export const listensRouter = Router();

listensRouter.use(requireAuth);

listensRouter.get('/', async (req, res) => {
  const userId = requireUser(req).id;

  if (req.query.albumId !== undefined) {
    const albumId = parseId(req.query.albumId, 'albumId');
    res.json(await listListensForAlbum(userId, albumId));
    return;
  }

  const offset = req.query.offset === undefined ? 0 : Number(req.query.offset);
  if (!Number.isInteger(offset) || offset < 0) throw new HttpError(400, 'offset inválido.');

  const items = await listListens(userId, PAGE_SIZE + 1, offset);
  res.json({ items: items.slice(0, PAGE_SIZE), hasMore: items.length > PAGE_SIZE });
});

listensRouter.post('/', async (req, res) => {
  const albumId = parseId(req.body?.albumId, 'albumId');
  const listenedOn = parseListenedOn(req.body);

  try {
    res.status(201).json(await createListen(requireUser(req).id, albumId, listenedOn));
  } catch (error) {
    if (isPgError(error, PG_FOREIGN_KEY_VIOLATION)) throw new HttpError(404, 'Álbum não encontrado.');
    throw error;
  }
});

listensRouter.delete('/:id', async (req, res) => {
  const deleted = await deleteListen(requireUser(req).id, parseId(req.params.id));
  if (!deleted) throw new HttpError(404, 'Audição não encontrada.');

  res.status(204).end();
});
