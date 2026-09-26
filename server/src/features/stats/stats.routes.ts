import { Router } from 'express';
import { requireAuth, requireUser } from '../auth/auth.middleware.js';
import { getStats } from './stats.repository.js';

export const statsRouter = Router();

statsRouter.use(requireAuth);

statsRouter.get('/', async (req, res) => {
  res.json(await getStats(requireUser(req).id));
});
