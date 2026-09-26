import { Router } from 'express';
import { requireAuth, requireUser } from '../auth/auth.middleware.js';
import { HttpError } from '../../shared/httpError.js';
import { isPgError, PG_FOREIGN_KEY_VIOLATION } from '../../shared/pgErrors.js';
import { parseId } from '../../shared/validation.js';
import { addTrackFavorite, listFavoriteTrackIds, removeTrackFavorite } from './trackFavorites.repository.js';

export const trackFavoritesRouter = Router();

trackFavoritesRouter.use(requireAuth);

trackFavoritesRouter.get('/', async (req, res) => {
  const albumId = parseId(req.query.albumId, 'albumId');
  res.json(await listFavoriteTrackIds(requireUser(req).id, albumId));
});

trackFavoritesRouter.post('/:trackId', async (req, res) => {
  const trackId = parseId(req.params.trackId, 'trackId');

  try {
    await addTrackFavorite(requireUser(req).id, trackId);
  } catch (error) {
    if (isPgError(error, PG_FOREIGN_KEY_VIOLATION)) throw new HttpError(404, 'Faixa não encontrada.');
    throw error;
  }

  res.status(201).json({ trackId });
});

trackFavoritesRouter.delete('/:trackId', async (req, res) => {
  await removeTrackFavorite(requireUser(req).id, parseId(req.params.trackId, 'trackId'));
  res.status(204).end();
});
