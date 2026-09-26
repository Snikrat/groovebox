import { Router } from 'express';
import { requireAuth, requireUser } from '../auth/auth.middleware.js';
import { HttpError } from '../../shared/httpError.js';
import { isPgError, PG_FOREIGN_KEY_VIOLATION } from '../../shared/pgErrors.js';
import { parseId } from '../../shared/validation.js';
import { addToWishlist, listWishlist, removeFromWishlist } from './wishlist.repository.js';

export const wishlistRouter = Router();

wishlistRouter.use(requireAuth);

wishlistRouter.get('/', async (req, res) => {
  res.json(await listWishlist(requireUser(req).id));
});

wishlistRouter.post('/:albumId', async (req, res) => {
  const albumId = parseId(req.params.albumId, 'albumId');

  try {
    await addToWishlist(requireUser(req).id, albumId);
  } catch (error) {
    if (isPgError(error, PG_FOREIGN_KEY_VIOLATION)) throw new HttpError(404, 'Álbum não encontrado.');
    throw error;
  }

  res.status(201).json({ albumId });
});

wishlistRouter.delete('/:albumId', async (req, res) => {
  await removeFromWishlist(requireUser(req).id, parseId(req.params.albumId, 'albumId'));
  res.status(204).end();
});
