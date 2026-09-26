import { Router } from 'express';
import { requireAuth, requireUser } from '../auth/auth.middleware.js';
import { HttpError } from '../../shared/httpError.js';
import { listFeed } from './feed.repository.js';

const PAGE_SIZE = 20;

export const feedRouter = Router();

feedRouter.use(requireAuth);

feedRouter.get('/', async (req, res) => {
  const offset = req.query.offset === undefined ? 0 : Number(req.query.offset);
  if (!Number.isInteger(offset) || offset < 0) throw new HttpError(400, 'offset inválido.');

  const items = await listFeed(requireUser(req).id, PAGE_SIZE + 1, offset);
  res.json({ items: items.slice(0, PAGE_SIZE), hasMore: items.length > PAGE_SIZE });
});
