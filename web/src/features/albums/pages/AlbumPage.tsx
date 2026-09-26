import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { AlbumCover } from '../../../shared/components/AlbumCover';
import { Stars } from '../../../shared/components/Stars';
import { ErrorState, Loading } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { formatRating, getYear } from '../../../shared/utils/format';
import { LoginPrompt } from '../../auth/components/LoginPrompt';
import { useCurrentUser } from '../../auth/hooks/useCurrentUser';
import { FavoriteButton } from '../../favorites/components/FavoriteButton';
import { ListenLog } from '../../listens/components/ListenLog';
import { ReviewForm } from '../../reviews/components/ReviewForm';
import { TrackList } from '../components/TrackList';
import { getAlbum } from '../services/albumsApi';

const TYPE_LABELS: Record<string, string> = { Album: 'Álbum', EP: 'EP', Single: 'Single' };

export function AlbumPage() {
  const { musicbrainzId = '' } = useParams();
  const { user, isPending: isUserPending } = useCurrentUser();
  const albumQuery = useQuery({
    queryKey: ['albums', musicbrainzId],
    queryFn: () => getAlbum(musicbrainzId),
  });

  // Na primeira visita o backend importa o álbum do MusicBrainz, o que leva alguns segundos.
  if (albumQuery.isPending) return <Loading label="Carregando álbum…" />;
  if (albumQuery.isError) {
    return <ErrorState message={getErrorMessage(albumQuery.error)} onRetry={() => albumQuery.refetch()} />;
  }

  const album = albumQuery.data;
  const year = getYear(album.firstReleaseDate);

  return (
    <article className="album">
      <div className="album__hero">
        <div className="album__cover">
          <AlbumCover src={album.coverUrl} alt={`Capa de ${album.title}`} />
        </div>

        <div className="album__info">
          <p className="eyebrow">{TYPE_LABELS[album.primaryType ?? ''] ?? album.primaryType ?? 'Álbum'}</p>
          <h1 className="album__title">{album.title}</h1>
          <p className="album__artist">{album.artistName}</p>
          {year && <p className="album__year">{year}</p>}

          <div className="album__average">
            {album.averageRating !== null ? (
              <>
                <Stars rating={album.averageRating} />
                <span>
                  {formatRating(album.averageRating)} · {album.ratingsCount}{' '}
                  {album.ratingsCount === 1 ? 'avaliação' : 'avaliações'}
                </span>
              </>
            ) : (
              <span className="muted">Ainda sem avaliações</span>
            )}
          </div>

          {user ? (
            <>
              <FavoriteButton albumId={album.id} />
              <ReviewForm key={album.id} albumId={album.id} albumMusicbrainzId={album.musicbrainzId} />
              <ListenLog key={album.id} albumId={album.id} />
            </>
          ) : (
            !isUserPending && <LoginPrompt message="Entre para dar sua nota, escrever uma avaliação e favoritar." />
          )}
        </div>
      </div>

      <section className="section">
        <h2 className="section__title">Faixas</h2>
        <TrackList musicbrainzId={album.musicbrainzId} />
      </section>
    </article>
  );
}
