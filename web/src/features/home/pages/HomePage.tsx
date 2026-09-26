import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { SearchForm } from '../../../shared/components/SearchForm';
import { AlbumGridSkeleton, EmptyState, ErrorState } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { AlbumCard } from '../../albums/components/AlbumCard';
import { LoginPrompt } from '../../auth/components/LoginPrompt';
import { useCurrentUser } from '../../auth/hooks/useCurrentUser';
import { NewReleases } from '../../discover/components/NewReleases';
import { PopularAlbums } from '../../discover/components/PopularAlbums';
import { PopularReviews } from '../../discover/components/PopularReviews';
import { listReviews } from '../../reviews/services/reviewsApi';

const RECENT_LIMIT = 6;

export function HomePage() {
  const { user, isPending } = useCurrentUser();

  return (
    <>
      <section className="hero">
        <h1 className="hero__title">O que você anda ouvindo?</h1>
        <p className="hero__subtitle">Encontre um álbum, dê sua nota e guarde seus favoritos.</p>
        <SearchForm size="large" autoFocus />
      </section>

      {isPending ? null : user ? (
        <>
          <RecentReviews />
          <NewReleases />
        </>
      ) : (
        <LoginPrompt message="Crie uma conta para avaliar álbuns e montar sua biblioteca." />
      )}

      <PopularAlbums />
      <PopularReviews />
    </>
  );
}

function RecentReviews() {
  const reviewsQuery = useQuery({ queryKey: ['reviews'], queryFn: listReviews });

  return (
    <section className="section">
      <div className="section__header">
        <h2 className="section__title">Avaliados recentemente</h2>
        {reviewsQuery.data && reviewsQuery.data.length > RECENT_LIMIT && (
          <Link to="/library" className="section__link">
            Ver todos
          </Link>
        )}
      </div>

      {reviewsQuery.isPending ? (
        <AlbumGridSkeleton count={RECENT_LIMIT} />
      ) : reviewsQuery.isError ? (
        <ErrorState message={getErrorMessage(reviewsQuery.error)} onRetry={() => reviewsQuery.refetch()} />
      ) : reviewsQuery.data.length === 0 ? (
        <EmptyState>Você ainda não avaliou nenhum álbum.</EmptyState>
      ) : (
        <div className="album-grid">
          {reviewsQuery.data.slice(0, RECENT_LIMIT).map((review) => (
            <AlbumCard key={review.id} album={review.album} rating={review.rating} />
          ))}
        </div>
      )}
    </section>
  );
}
