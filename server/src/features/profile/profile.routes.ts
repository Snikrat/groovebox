import { Router } from 'express';
import { HttpError } from '../../shared/httpError.js';
import { listFavorites } from '../favorites/favorites.repository.js';
import { listReviews } from '../reviews/reviews.repository.js';
import { findPublicProfile } from './profile.repository.js';

export const profileRouter = Router();

async function requireProfile(username: string) {
  const found = await findPublicProfile(username);
  if (!found) throw new HttpError(404, 'Usuário não encontrado.');
  return found;
}

profileRouter.get('/:username', async (req, res) => {
  const { profile } = await requireProfile(req.params.username);
  res.json(profile);
});

profileRouter.get('/:username/reviews', async (req, res) => {
  const { id } = await requireProfile(req.params.username);
  res.json(await listReviews(id));
});

profileRouter.get('/:username/favorites', async (req, res) => {
  const { id } = await requireProfile(req.params.username);
  res.json(await listFavorites(id));
});
