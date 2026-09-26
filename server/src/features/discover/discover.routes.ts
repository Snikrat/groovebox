import { Router } from 'express';
import { requireAuth, requireUser } from '../auth/auth.middleware.js';
import { listPopularAlbums, listPopularReviews } from './discover.repository.js';
import { listNewReleasesForUser } from './discover.service.js';

const ALBUMS_LIMIT = 8;
const REVIEWS_LIMIT = 5;

export const discoverRouter = Router();

discoverRouter.get('/albums', async (_req, res) => {
  res.json(await listPopularAlbums(ALBUMS_LIMIT));
});

discoverRouter.get('/reviews', async (req, res) => {
  res.json(await listPopularReviews(REVIEWS_LIMIT, req.user?.id ?? null));
});

discoverRouter.get('/new-releases', requireAuth, async (req, res) => {
  res.json(await listNewReleasesForUser(requireUser(req).id));
});
