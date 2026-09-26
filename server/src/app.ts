import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { albumsRouter } from './features/albums/albums.routes.js';
import { artistsRouter } from './features/artists/artists.routes.js';
import { browseRouter } from './features/browse/browse.routes.js';
import { loadUser } from './features/auth/auth.middleware.js';
import { authRouter } from './features/auth/auth.routes.js';
import { discoverRouter } from './features/discover/discover.routes.js';
import { favoritesRouter } from './features/favorites/favorites.routes.js';
import { feedRouter } from './features/feed/feed.routes.js';
import { featuredRouter } from './features/featured/featured.routes.js';
import { followsRouter } from './features/follows/follows.routes.js';
import { listensRouter } from './features/listens/listens.routes.js';
import { listsRouter } from './features/lists/lists.routes.js';
import { notificationsRouter } from './features/notifications/notifications.routes.js';
import { peopleRouter } from './features/people/people.routes.js';
import { profileRouter } from './features/profile/profile.routes.js';
import { reviewSocialRouter } from './features/reviews/reviewSocial.routes.js';
import { reviewsRouter } from './features/reviews/reviews.routes.js';
import { statsRouter } from './features/stats/stats.routes.js';
import { trackFavoritesRouter } from './features/track-favorites/trackFavorites.routes.js';
import { wishlistRouter } from './features/wishlist/wishlist.routes.js';
import { HttpError } from './shared/httpError.js';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(loadUser);

app.use('/api/auth', authRouter);
app.use('/api/albums', albumsRouter);
app.use('/api/artists', artistsRouter);
app.use('/api/browse', browseRouter);
app.use('/api/discover', discoverRouter);
app.use('/api/reviews', reviewsRouter);
// Router à parte (não sob reviewsRouter): ver comentários é público, mas
// reviewsRouter.use(requireAuth) bloquearia qualquer sub-rota antes de chegar aqui.
app.use('/api/review-social', reviewSocialRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/feed', feedRouter);
app.use('/api/featured', featuredRouter);
app.use('/api/follows', followsRouter);
app.use('/api/listens', listensRouter);
app.use('/api/lists', listsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/people', peopleRouter);
app.use('/api/users', profileRouter);
app.use('/api/track-favorites', trackFavoritesRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/stats', statsRouter);

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
