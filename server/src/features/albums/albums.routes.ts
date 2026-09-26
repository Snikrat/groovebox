import { Router } from 'express';
import { HttpError } from '../../shared/httpError.js';
import { parseMbid } from '../../shared/validation.js';
import { listPublicReviewsForAlbum } from '../reviews/reviews.repository.js';
import { getAlbumTracks, getOrImportAlbum, searchAlbums } from './albums.service.js';

export const albumsRouter = Router();

albumsRouter.get('/search', async (req, res) => {
  const term = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!term) throw new HttpError(400, 'Informe um termo de pesquisa.');
  if (term.length > 200) throw new HttpError(400, 'Termo de pesquisa muito longo.');

  const offset = req.query.offset === undefined ? 0 : Number(req.query.offset);
  if (!Number.isInteger(offset) || offset < 0) throw new HttpError(400, 'offset inválido.');

  res.json(await searchAlbums(term, offset));
});

albumsRouter.get('/:musicbrainzId', async (req, res) => {
  res.json(await getOrImportAlbum(parseMbid(req.params.musicbrainzId)));
});

albumsRouter.get('/:musicbrainzId/tracks', async (req, res) => {
  res.json(await getAlbumTracks(parseMbid(req.params.musicbrainzId)));
});

// Avaliações de outras pessoas para o álbum; pública. A do próprio usuário fica em /api/reviews/:albumId.
albumsRouter.get('/:musicbrainzId/reviews', async (req, res) => {
  const album = await getOrImportAlbum(parseMbid(req.params.musicbrainzId));
  res.json(await listPublicReviewsForAlbum(album.id, req.user?.id ?? null, req.user?.id ?? null));
});
