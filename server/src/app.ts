import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { albumsRouter } from './features/albums/albums.routes.js';
import { loadUser } from './features/auth/auth.middleware.js';
import { authRouter } from './features/auth/auth.routes.js';
import { favoritesRouter } from './features/favorites/favorites.routes.js';
import { listensRouter } from './features/listens/listens.routes.js';
import { reviewsRouter } from './features/reviews/reviews.routes.js';
import { HttpError } from './shared/httpError.js';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(loadUser);

app.use('/api/auth', authRouter);
app.use('/api/albums', albumsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/listens', listensRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// O Express 5 encaminha para cá também os erros lançados em handlers async.
const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  if (error?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'JSON inválido.' });
    return;
  }

  console.error(error);
  res.status(500).json({ error: 'Erro interno do servidor.' });
};

app.use(errorHandler);
