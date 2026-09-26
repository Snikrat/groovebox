import { Router } from 'express';
import { listPopularAlbums, listPopularReviews } from './discover.repository.js';

const ALBUMS_LIMIT = 8;
const REVIEWS_LIMIT = 5;

export const discoverRouter = Router();

discoverRouter.get('/albums', async (_req, res) => {
  res.json(await listPopularAlbums(ALBUMS_LIMIT));
});

discoverRouter.get('/reviews', async (req, res) => {
  res.json(await listPopularReviews(REVIEWS_LIMIT, req.user?.id ?? null));
});
