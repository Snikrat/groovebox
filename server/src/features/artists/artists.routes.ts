import { Router } from 'express';
import { parseMbid } from '../../shared/validation.js';
import { getArtistWithDiscography } from './artists.service.js';

export const artistsRouter = Router();

artistsRouter.get('/:musicbrainzId', async (req, res) => {
  res.json(await getArtistWithDiscography(parseMbid(req.params.musicbrainzId)));
});
