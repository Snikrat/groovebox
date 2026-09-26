import { Router } from 'express';
import { requireAuth, requireUser } from '../auth/auth.middleware.js';
import { HttpError } from '../../shared/httpError.js';
import { isPgError, PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION } from '../../shared/pgErrors.js';
import { parseId } from '../../shared/validation.js';
import { createReview, findReviewForAlbum, listReviews, updateReview } from './reviews.repository.js';
import type { ReviewInput } from './reviews.types.js';

const MAX_REVIEW_LENGTH = 2000;

function parseReviewInput(body: unknown): ReviewInput {
  const { rating, review } = (body ?? {}) as Record<string, unknown>;

  // Notas de 0.5 a 5, em passos de 0.5.
  if (typeof rating !== 'number' || rating < 0.5 || rating > 5 || !Number.isInteger(rating * 2)) {
    throw new HttpError(400, 'A nota deve ser entre 0.5 e 5, em intervalos de 0.5.');
  }
  if (review !== undefined && review !== null && typeof review !== 'string') {
    throw new HttpError(400, 'A avaliação deve ser um texto.');
  }

  const text = typeof review === 'string' ? review.trim() : '';
  if (text.length > MAX_REVIEW_LENGTH) {
    throw new HttpError(400, `A avaliação pode ter no máximo ${MAX_REVIEW_LENGTH} caracteres.`);
  }

  return { rating, review: text || null };
}

export const reviewsRouter = Router();

reviewsRouter.use(requireAuth);

reviewsRouter.get('/', async (req, res) => {
  res.json(await listReviews(requireUser(req).id));
});

// Retorna null quando o usuário ainda não avaliou o álbum.
reviewsRouter.get('/:albumId', async (req, res) => {
  const albumId = parseId(req.params.albumId, 'albumId');
  res.json(await findReviewForAlbum(requireUser(req).id, albumId));
});

reviewsRouter.post('/', async (req, res) => {
  const albumId = parseId(req.body?.albumId, 'albumId');
  const input = parseReviewInput(req.body);

  try {
    res.status(201).json(await createReview(requireUser(req).id, albumId, input));
  } catch (error) {
    if (isPgError(error, PG_UNIQUE_VIOLATION)) throw new HttpError(409, 'Você já avaliou este álbum.');
    if (isPgError(error, PG_FOREIGN_KEY_VIOLATION)) throw new HttpError(404, 'Álbum não encontrado.');
    throw error;
  }
});

reviewsRouter.put('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const review = await updateReview(requireUser(req).id, id, parseReviewInput(req.body));
  if (!review) throw new HttpError(404, 'Avaliação não encontrada.');

  res.json(review);
});
