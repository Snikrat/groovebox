import { Router } from 'express';
import { requireAuth, requireUser } from '../auth/auth.middleware.js';
import { HttpError } from '../../shared/httpError.js';
import { createNotification } from '../notifications/notifications.repository.js';
import { findPublicProfile } from '../profile/profile.repository.js';
import { follow, listFollowing, unfollow } from './follows.repository.js';

export const followsRouter = Router();

followsRouter.use(requireAuth);

followsRouter.get('/following', async (req, res) => {
  res.json(await listFollowing(requireUser(req).id));
});

followsRouter.post('/:username', async (req, res) => {
  const me = requireUser(req);
  const target = await findPublicProfile(req.params.username);
  if (!target) throw new HttpError(404, 'Usuário não encontrado.');
  if (target.id === me.id) throw new HttpError(400, 'Você não pode seguir a si mesmo.');

  const isNew = await follow(me.id, target.id);
  if (isNew) await createNotification(target.id, me.id, 'follow', null);
  res.status(201).json({ username: target.profile.username });
});

followsRouter.delete('/:username', async (req, res) => {
  const me = requireUser(req);
  const target = await findPublicProfile(req.params.username);
  if (!target) throw new HttpError(404, 'Usuário não encontrado.');

  await unfollow(me.id, target.id);
  res.status(204).end();
});
