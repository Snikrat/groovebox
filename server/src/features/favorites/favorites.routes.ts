import { Router } from 'express';
import { requireAuth, requireUser } from '../auth/auth.middleware.js';
import { HttpError } from '../../shared/httpError.js';
import { isPgError, PG_FOREIGN_KEY_VIOLATION } from '../../shared/pgErrors.js';
import { parseId } from '../../shared/validation.js';
import { addFavorite, listFavorites, removeFavorite } from './favorites.repository.js';

export const favoritesRouter = Router();

favoritesRouter.use(requireAuth);

favoritesRouter.get('/', async (req, res) => {
  res.json(await listFavorites(requireUser(req).id));
});

favoritesRouter.post('/:albumId', async (req, res) => {
  const albumId = parseId(req.params.albumId, 'albumId');

  try {
    await addFavorite(requireUser(req).id, albumId);
  } catch (error) {
    if (isPgError(error, PG_FOREIGN_KEY_VIOLATION)) throw new HttpError(404, 'Álbum não encontrado.');
    throw error;
  }

  res.status(201).json({ albumId });
});

favoritesRouter.delete('/:albumId', async (req, res) => {
  await removeFavorite(requireUser(req).id, parseId(req.params.albumId, 'albumId'));
  res.status(204).end();
});
