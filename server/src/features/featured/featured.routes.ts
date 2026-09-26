import { Router } from 'express';
import { requireAuth, requireUser } from '../auth/auth.middleware.js';
import { HttpError } from '../../shared/httpError.js';
import { isPgError, PG_FOREIGN_KEY_VIOLATION } from '../../shared/pgErrors.js';
import { listFeatured, replaceFeatured } from './featured.repository.js';

const MAX_FEATURED = 4;

function parseAlbumIds(body: unknown): number[] {
  const albumIds = (body as Record<string, unknown> | undefined)?.albumIds;
  if (!Array.isArray(albumIds) || albumIds.length > MAX_FEATURED) {
    throw new HttpError(400, `Informe uma lista de até ${MAX_FEATURED} álbuns.`);
  }
  if (!albumIds.every((id) => Number.isInteger(id) && id > 0)) {
    throw new HttpError(400, 'Lista de álbuns inválida.');
  }
  if (new Set(albumIds).size !== albumIds.length) {
    throw new HttpError(400, 'Um álbum não pode aparecer duas vezes na lista.');
  }
  return albumIds as number[];
}

export const featuredRouter = Router();

featuredRouter.use(requireAuth);

featuredRouter.get('/', async (req, res) => {
  res.json(await listFeatured(requireUser(req).id));
});

featuredRouter.put('/', async (req, res) => {
  const albumIds = parseAlbumIds(req.body);

  try {
    res.json(await replaceFeatured(requireUser(req).id, albumIds));
  } catch (error) {
    if (isPgError(error, PG_FOREIGN_KEY_VIOLATION)) throw new HttpError(404, 'Álbum não encontrado.');
    throw error;
  }
});
