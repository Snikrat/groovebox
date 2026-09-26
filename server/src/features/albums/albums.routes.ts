import { Router } from 'express';
import { HttpError } from '../../shared/httpError.js';
import { parseMbid } from '../../shared/validation.js';
import { getAlbumTracks, getOrImportAlbum, searchAlbums } from './albums.service.js';

export const albumsRouter = Router();

albumsRouter.get('/search', async (req, res) => {
  const term = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!term) throw new HttpError(400, 'Informe um termo de pesquisa.');
  if (term.length > 200) throw new HttpError(400, 'Termo de pesquisa muito longo.');

  res.json(await searchAlbums(term));
});

albumsRouter.get('/:musicbrainzId', async (req, res) => {
  res.json(await getOrImportAlbum(parseMbid(req.params.musicbrainzId)));
});

albumsRouter.get('/:musicbrainzId/tracks', async (req, res) => {
  res.json(await getAlbumTracks(parseMbid(req.params.musicbrainzId)));
});
