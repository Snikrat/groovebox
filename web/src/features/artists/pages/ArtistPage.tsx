import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { AlbumGridSkeleton, EmptyState, ErrorState } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { AlbumCard } from '../../albums/components/AlbumCard';
import { useCurrentUser } from '../../auth/hooks/useCurrentUser';
import { LogButton } from '../../log/components/LogButton';
import { listReviews } from '../../reviews/services/reviewsApi';
import { getArtist } from '../services/artistsApi';

export function ArtistPage() {
  const { musicbrainzId = '' } = useParams();
  const { user } = useCurrentUser();

  const artistQuery = useQuery({
    queryKey: ['artists', musicbrainzId],
    queryFn: () => getArtist(musicbrainzId),
  });

  // Sobrepõe a nota do usuário logado em cada álbum da discografia, quando existir.
  const reviewsQuery = useQuery({ queryKey: ['reviews'], queryFn: listReviews, enabled: Boolean(user) });
  const ratingsByAlbum = new Map(reviewsQuery.data?.map((review) => [review.album.musicbrainzId, review.rating]));

  if (artistQuery.isPending) return <AlbumGridSkeleton />;
  if (artistQuery.isError) {
    return <ErrorState message={getErrorMessage(artistQuery.error)} onRetry={() => artistQuery.refetch()} />;
  }

  const artist = artistQuery.data;

  return (
    <>
      <h1 className="page-title">{artist.name}</h1>

      <section className="section">
        <div className="section__header">
          <h2 className="section__title">Discografia</h2>
          <span className="count">{artist.albums.length}</span>
        </div>

        {artist.albums.length === 0 ? (
          <EmptyState>Nenhum álbum de estúdio encontrado para este artista.</EmptyState>
        ) : (
          <div className="album-grid">
            {artist.albums.map((album) => (
              <div key={album.musicbrainzId} className="album-tile">
                <AlbumCard album={{ ...album, artistName: artist.name }} rating={ratingsByAlbum.get(album.musicbrainzId)} />
                {user && <LogButton musicbrainzId={album.musicbrainzId} />}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
