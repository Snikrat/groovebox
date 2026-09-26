import { Router } from 'express';
import { requireAuth, requireUser } from '../auth/auth.middleware.js';
import { HttpError } from '../../shared/httpError.js';
import { isPgError, PG_FOREIGN_KEY_VIOLATION } from '../../shared/pgErrors.js';
import { parseId } from '../../shared/validation.js';
import {
  addListItem,
  createList,
  deleteList,
  findListById,
  listListsByUser,
  removeListItem,
  updateList,
} from './lists.repository.js';

const MAX_TITLE_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 500;

function parseListInput(body: unknown): { title: string; description: string | null } {
  const { title, description } = (body ?? {}) as Record<string, unknown>;
  const trimmedTitle = typeof title === 'string' ? title.trim() : '';

  if (!trimmedTitle || trimmedTitle.length > MAX_TITLE_LENGTH) {
    throw new HttpError(400, `Informe um título com até ${MAX_TITLE_LENGTH} caracteres.`);
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    throw new HttpError(400, 'A descrição deve ser um texto.');
  }

  const trimmedDescription = typeof description === 'string' ? description.trim() : '';
  if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
    throw new HttpError(400, `A descrição pode ter no máximo ${MAX_DESCRIPTION_LENGTH} caracteres.`);
  }

  return { title: trimmedTitle, description: trimmedDescription || null };
}

export const listsRouter = Router();

listsRouter.get('/', requireAuth, async (req, res) => {
  res.json(await listListsByUser(requireUser(req).id));
});

listsRouter.post('/', requireAuth, async (req, res) => {
  const { title, description } = parseListInput(req.body);
  res.status(201).json(await createList(requireUser(req).id, title, description));
});

// Pública: qualquer pessoa pode ver uma lista pelo id.
listsRouter.get('/:id', async (req, res) => {
  const list = await findListById(parseId(req.params.id));
  if (!list) throw new HttpError(404, 'Lista não encontrada.');
  res.json(list);
});

listsRouter.put('/:id', requireAuth, async (req, res) => {
  const { title, description } = parseListInput(req.body);
  const list = await updateList(requireUser(req).id, parseId(req.params.id), title, description);
  if (!list) throw new HttpError(404, 'Lista não encontrada.');
  res.json(list);
});

listsRouter.delete('/:id', requireAuth, async (req, res) => {
  const deleted = await deleteList(requireUser(req).id, parseId(req.params.id));
  if (!deleted) throw new HttpError(404, 'Lista não encontrada.');
  res.status(204).end();
});

listsRouter.post('/:id/items', requireAuth, async (req, res) => {
  const listId = parseId(req.params.id);
  const albumId = parseId(req.body?.albumId, 'albumId');

  try {
    const added = await addListItem(requireUser(req).id, listId, albumId);
    if (!added) throw new HttpError(404, 'Lista não encontrada.');
  } catch (error) {
    if (isPgError(error, PG_FOREIGN_KEY_VIOLATION)) throw new HttpError(404, 'Álbum não encontrado.');
    throw error;
  }

  res.status(201).json({ listId, albumId });
});

listsRouter.delete('/:id/items/:albumId', requireAuth, async (req, res) => {
  const removed = await removeListItem(
    requireUser(req).id,
    parseId(req.params.id),
    parseId(req.params.albumId, 'albumId'),
  );
  if (!removed) throw new HttpError(404, 'Item não encontrado na lista.');
  res.status(204).end();
});
