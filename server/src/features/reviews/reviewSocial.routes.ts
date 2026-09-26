import { Router } from 'express';
import { requireAuth, requireUser } from '../auth/auth.middleware.js';
import { HttpError } from '../../shared/httpError.js';
import { isPgError, PG_FOREIGN_KEY_VIOLATION } from '../../shared/pgErrors.js';
import { parseId } from '../../shared/validation.js';
import { createNotification } from '../notifications/notifications.repository.js';
import { addComment, deleteComment, likeReview, listComments, unlikeReview } from './reviewSocial.repository.js';
import { findReviewOwnerId } from './reviews.repository.js';

const MAX_COMMENT_LENGTH = 500;

export const reviewSocialRouter = Router();

reviewSocialRouter.post('/:id/likes', requireAuth, async (req, res) => {
  const reviewId = parseId(req.params.id);
  const me = requireUser(req);
  let isNew: boolean;

  try {
    isNew = await likeReview(me.id, reviewId);
  } catch (error) {
    if (isPgError(error, PG_FOREIGN_KEY_VIOLATION)) throw new HttpError(404, 'Avaliação não encontrada.');
    throw error;
  }

  if (isNew) {
    const ownerId = await findReviewOwnerId(reviewId);
    if (ownerId) await createNotification(ownerId, me.id, 'like', reviewId);
  }

  res.status(201).json({ reviewId });
});

reviewSocialRouter.delete('/:id/likes', requireAuth, async (req, res) => {
  await unlikeReview(requireUser(req).id, parseId(req.params.id));
  res.status(204).end();
});

// Comentários são públicos para leitura; só escrever e apagar exigem login.
reviewSocialRouter.get('/:id/comments', async (req, res) => {
  res.json(await listComments(parseId(req.params.id)));
});

reviewSocialRouter.post('/:id/comments', requireAuth, async (req, res) => {
  const reviewId = parseId(req.params.id);
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';

  if (!text) throw new HttpError(400, 'Escreva um comentário.');
  if (text.length > MAX_COMMENT_LENGTH) {
    throw new HttpError(400, `O comentário pode ter no máximo ${MAX_COMMENT_LENGTH} caracteres.`);
  }

  const me = requireUser(req);
  let comment;
  try {
    comment = await addComment(me.id, reviewId, text);
  } catch (error) {
    if (isPgError(error, PG_FOREIGN_KEY_VIOLATION)) throw new HttpError(404, 'Avaliação não encontrada.');
    throw error;
  }

  const ownerId = await findReviewOwnerId(reviewId);
  if (ownerId) await createNotification(ownerId, me.id, 'comment', reviewId);

  res.status(201).json(comment);
});

reviewSocialRouter.delete('/:id/comments/:commentId', requireAuth, async (req, res) => {
  const deleted = await deleteComment(requireUser(req).id, parseId(req.params.commentId, 'commentId'));
  if (!deleted) throw new HttpError(404, 'Comentário não encontrado.');

  res.status(204).end();
});
