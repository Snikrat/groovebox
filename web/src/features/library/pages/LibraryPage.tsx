import { useQuery } from '@tanstack/react-query';
import { AlbumGridSkeleton, EmptyState, ErrorState } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { AlbumCard } from '../../albums/components/AlbumCard';
import { listFavorites } from '../../favorites/services/favoritesApi';
import { listReviews } from '../../reviews/services/reviewsApi';

export function LibraryPage() {
  const reviewsQuery = useQuery({ queryKey: ['reviews'], queryFn: listReviews });
  const favoritesQuery = useQuery({ queryKey: ['favorites'], queryFn: listFavorites });

  return (
    <>
      <h1 className="page-title">Minha biblioteca</h1>

      <section className="section">
        <div className="section__header">
          <h2 className="section__title">Avaliados</h2>
          {reviewsQuery.data && <span className="count">{reviewsQuery.data.length}</span>}
        </div>

        {reviewsQuery.isPending ? (
          <AlbumGridSkeleton />
        ) : reviewsQuery.isError ? (
          <ErrorState message={getErrorMessage(reviewsQuery.error)} onRetry={() => reviewsQuery.refetch()} />
        ) : reviewsQuery.data.length === 0 ? (
          <EmptyState>Você ainda não avaliou nenhum álbum.</EmptyState>
        ) : (
          <div className="album-grid">
            {reviewsQuery.data.map((review) => (
              <AlbumCard key={review.id} album={review.album} rating={review.rating} />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section__header">
          <h2 className="section__title">Favoritos</h2>
          {favoritesQuery.data && <span className="count">{favoritesQuery.data.length}</span>}
        </div>

        {favoritesQuery.isPending ? (
          <AlbumGridSkeleton />
        ) : favoritesQuery.isError ? (
          <ErrorState message={getErrorMessage(favoritesQuery.error)} onRetry={() => favoritesQuery.refetch()} />
        ) : favoritesQuery.data.length === 0 ? (
          <EmptyState>Você ainda não favoritou nenhum álbum.</EmptyState>
        ) : (
          <div className="album-grid">
            {favoritesQuery.data.map((favorite) => (
              <AlbumCard key={favorite.albumId} album={favorite.album} rating={favorite.rating} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
