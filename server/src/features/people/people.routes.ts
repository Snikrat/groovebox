import { Router } from 'express';
import { HttpError } from '../../shared/httpError.js';
import { listSuggestedPeople, searchPeople } from './people.repository.js';

const SUGGESTED_LIMIT = 10;

export const peopleRouter = Router();

peopleRouter.get('/search', async (req, res) => {
  const term = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!term) throw new HttpError(400, 'Informe um termo de pesquisa.');
  if (term.length > 100) throw new HttpError(400, 'Termo de pesquisa muito longo.');

  res.json(await searchPeople(term));
});

peopleRouter.get('/suggested', async (req, res) => {
  res.json(await listSuggestedPeople(req.user?.id ?? null, SUGGESTED_LIMIT));
});
