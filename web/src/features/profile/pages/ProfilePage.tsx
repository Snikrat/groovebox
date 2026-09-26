import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { AlbumGridSkeleton, EmptyState, ErrorState } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { formatDate } from '../../../shared/utils/format';
import { AlbumCard } from '../../albums/components/AlbumCard';
import { useCurrentUser } from '../../auth/hooks/useCurrentUser';
import { FollowButton } from '../../follows/components/FollowButton';
import {
  getPublicFavorites,
  getPublicFeatured,
  getPublicLists,
  getPublicProfile,
  getPublicReviews,
} from '../services/profileApi';

export function ProfilePage() {
  const { username = '' } = useParams();
  const { user } = useCurrentUser();

  const profileQuery = useQuery({
    queryKey: ['profile', username],
    queryFn: () => getPublicProfile(username),
  });

  const reviewsQuery = useQuery({
    queryKey: ['profile', username, 'reviews'],
    queryFn: () => getPublicReviews(username),
    enabled: profileQuery.isSuccess,
  });

  const favoritesQuery = useQuery({
    queryKey: ['profile', username, 'favorites'],
    queryFn: () => getPublicFavorites(username),
    enabled: profileQuery.isSuccess,
  });

  const featuredQuery = useQuery({
    queryKey: ['profile', username, 'featured'],
    queryFn: () => getPublicFeatured(username),
    enabled: profileQuery.isSuccess,
  });

  const listsQuery = useQuery({
    queryKey: ['profile', username, 'lists'],
    queryFn: () => getPublicLists(username),
    enabled: profileQuery.isSuccess,
  });

  if (profileQuery.isPending) return <AlbumGridSkeleton />;
  if (profileQuery.isError) {
    return <ErrorState message={getErrorMessage(profileQuery.error)} onRetry={() => profileQuery.refetch()} />;
  }

  const profile = profileQuery.data;
  const isOwnProfile = user?.username === profile.username;

  return (
    <>
      <div className="profile-header">
        <h1 className="page-title">{profile.name}</h1>
        <p className="profile-header__username">@{profile.username}</p>
        <p className="profile-header__stats">
          <strong>{profile.followers}</strong> {profile.followers === 1 ? 'seguidor' : 'seguidores'} ·{' '}
          <strong>{profile.following}</strong> seguindo
        </p>

        {isOwnProfile ? (
          <p className="profile-header__note">
            Este é o seu perfil público. Para gerenciar suas avaliações e favoritos, vá até a{' '}
            <Link to="/library">sua biblioteca</Link>.
          </p>
        ) : (
          user && (
            <div className="profile-header__actions">
              <FollowButton username={profile.username} isFollowing={profile.isFollowedByMe} />
            </div>
          )
        )}
      </div>

      {featuredQuery.data && featuredQuery.data.length > 0 && (
        <section className="section">
          <h2 className="section__title">Favoritos de sempre</h2>
          <div className="album-grid">
            {featuredQuery.data.map((item) => (
              <AlbumCard key={item.album.id} album={item.album} />
            ))}
          </div>
        </section>
      )}

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
          <EmptyState>
            {isOwnProfile ? 'Você ainda não avaliou nenhum álbum.' : 'Este usuário ainda não avaliou nenhum álbum.'}
          </EmptyState>
        ) : (
          <div className="album-grid">
            {reviewsQuery.data.map((review) => (
              <AlbumCard
                key={review.id}
                album={review.album}
                rating={review.rating}
                caption={`Avaliado em ${formatDate(review.updatedAt)}`}
              />
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
          <EmptyState>
            {isOwnProfile ? 'Você ainda não favoritou nenhum álbum.' : 'Este usuário ainda não favoritou nenhum álbum.'}
          </EmptyState>
        ) : (
          <div className="album-grid">
            {favoritesQuery.data.map((favorite) => (
              <AlbumCard key={favorite.albumId} album={favorite.album} rating={favorite.rating} />
            ))}
          </div>
        )}
      </section>

      {listsQuery.data && listsQuery.data.length > 0 && (
        <section className="section">
          <div className="section__header">
            <h2 className="section__title">Listas</h2>
            <span className="count">{listsQuery.data.length}</span>
          </div>
          <ul className="lists-grid">
            {listsQuery.data.map((list) => (
              <li key={list.id} className="lists-grid__item">
                <Link to={`/list/${list.id}`}>
                  <strong>{list.title}</strong>
                  <span className="muted">
                    {list.itemCount} {list.itemCount === 1 ? 'álbum' : 'álbuns'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
