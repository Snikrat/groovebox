import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AlbumCover } from '../../../shared/components/AlbumCover';
import { ErrorState, Loading } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import type { AlbumSummary } from '../../albums/types/album';
import { listFavorites } from '../../favorites/services/favoritesApi';
import { listReviews } from '../../reviews/services/reviewsApi';
import { listFeatured, replaceFeatured } from '../services/featuredApi';

const MAX_FEATURED = 4;

export function FeaturedEditor() {
  const featuredQuery = useQuery({ queryKey: ['featured'], queryFn: listFeatured });
  const reviewsQuery = useQuery({ queryKey: ['reviews'], queryFn: listReviews });
  const favoritesQuery = useQuery({ queryKey: ['favorites'], queryFn: listFavorites });

  if (featuredQuery.isPending || reviewsQuery.isPending || favoritesQuery.isPending) {
    return <Loading label="Carregando seus 4 favoritos…" />;
  }
  const error = featuredQuery.error ?? reviewsQuery.error ?? favoritesQuery.error;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={() => featuredQuery.refetch()} />;
  if (!featuredQuery.data || !reviewsQuery.data || !favoritesQuery.data) return null;

  // Só é possível destacar álbuns que já foram avaliados ou favoritados.
  const candidates = new Map<number, AlbumSummary>();
  for (const review of reviewsQuery.data) candidates.set(review.album.id, review.album);
  for (const favorite of favoritesQuery.data) candidates.set(favorite.albumId, favorite.album);

  return <FeaturedSlots featured={featuredQuery.data} candidates={[...candidates.values()]} />;
}

function FeaturedSlots({
  featured,
  candidates,
}: {
  featured: { position: number; album: AlbumSummary }[];
  candidates: AlbumSummary[];
}) {
  const queryClient = useQueryClient();
  const featuredIds = featured.map((item) => item.album.id);
  const availableCandidates = candidates.filter((album) => !featuredIds.includes(album.id));

  const mutation = useMutation({
    mutationFn: (albumIds: number[]) => replaceFeatured(albumIds),
    onSuccess: (data) => {
      queryClient.setQueryData(['featured'], data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  function addAlbum(albumId: number) {
    mutation.mutate([...featuredIds, albumId]);
  }

  function removeAlbum(albumId: number) {
    mutation.mutate(featuredIds.filter((id) => id !== albumId));
  }

  return (
    <div>
      <div className="featured-grid">
        {featured.map((item) => (
          <div key={item.album.id} className="featured-slot featured-slot--filled">
            <Link to={`/album/${item.album.musicbrainzId}`}>
              <AlbumCover src={item.album.coverUrl} alt={`Capa de ${item.album.title}`} />
            </Link>
            <button
              type="button"
              className="featured-slot__remove"
              onClick={() => removeAlbum(item.album.id)}
              disabled={mutation.isPending}
              aria-label={`Remover ${item.album.title} dos favoritos de sempre`}
            >
              Remover
            </button>
          </div>
        ))}

        {featured.length < MAX_FEATURED && (
          <div className="featured-slot featured-slot--empty">
            {availableCandidates.length === 0 ? (
              <span className="featured-slot__hint">
                {candidates.length === 0
                  ? 'Avalie ou favorite álbuns para poder destacá-los aqui.'
                  : 'Você já destacou todos os álbuns disponíveis.'}
              </span>
            ) : (
              <select
                className="featured-slot__select"
                value=""
                disabled={mutation.isPending}
                onChange={(event) => {
                  const albumId = Number(event.target.value);
                  if (albumId) addAlbum(albumId);
                }}
                aria-label="Adicionar álbum aos seus 4 favoritos"
              >
                <option value="">+ Adicionar álbum</option>
                {availableCandidates.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.title} — {album.artistName}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {mutation.isError && (
        <span className="form-error" role="alert">
          {getErrorMessage(mutation.error)}
        </span>
      )}
    </div>
  );
}
