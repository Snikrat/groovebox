import { Router } from 'express';
import { requireAuth, requireUser } from '../auth/auth.middleware.js';
import { HttpError } from '../../shared/httpError.js';
import { countUnread, listNotifications, markAllRead } from './notifications.repository.js';

const PAGE_SIZE = 30;

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get('/', async (req, res) => {
  const offset = req.query.offset === undefined ? 0 : Number(req.query.offset);
  if (!Number.isInteger(offset) || offset < 0) throw new HttpError(400, 'offset inválido.');

  const items = await listNotifications(requireUser(req).id, PAGE_SIZE + 1, offset);
  res.json({ items: items.slice(0, PAGE_SIZE), hasMore: items.length > PAGE_SIZE });
});

notificationsRouter.get('/unread-count', async (req, res) => {
  res.json({ count: await countUnread(requireUser(req).id) });
});

notificationsRouter.post('/read-all', async (req, res) => {
  await markAllRead(requireUser(req).id);
  res.status(204).end();
});
