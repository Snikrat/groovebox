import { Router } from 'express';
import { HttpError } from '../../shared/httpError.js';
import { listAlbumsByGenre, listAlbumsByYear, listGenres } from './browse.repository.js';

const YEAR_REGEX = /^\d{4}$/;

export const browseRouter = Router();

browseRouter.get('/genres', async (_req, res) => {
  res.json(await listGenres());
});

browseRouter.get('/genres/:genre', async (req, res) => {
  res.json(await listAlbumsByGenre(req.params.genre.toLowerCase()));
});

browseRouter.get('/years/:year', async (req, res) => {
  if (!YEAR_REGEX.test(req.params.year)) throw new HttpError(400, 'Ano inválido.');
  res.json(await listAlbumsByYear(req.params.year));
});
