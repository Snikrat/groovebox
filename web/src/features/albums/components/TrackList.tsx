import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EmptyState, ErrorState, Loading } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { formatDuration } from '../../../shared/utils/format';
import { useCurrentUser } from '../../auth/hooks/useCurrentUser';
import { getAlbumTracks } from '../services/albumsApi';
import { addTrackFavorite, listFavoriteTrackIds, removeTrackFavorite } from '../services/trackFavoritesApi';

interface TrackListProps {
  musicbrainzId: string;
  /** Id local do álbum; sem ele não é possível marcar faixas favoritas. */
  albumId?: number;
}

export function TrackList({ musicbrainzId, albumId }: TrackListProps) {
  const { user } = useCurrentUser();
  const tracksQuery = useQuery({
    queryKey: ['albums', musicbrainzId, 'tracks'],
    queryFn: () => getAlbumTracks(musicbrainzId),
  });

  if (tracksQuery.isPending) return <Loading label="Carregando faixas…" />;
  if (tracksQuery.isError) {
    return <ErrorState message={getErrorMessage(tracksQuery.error)} onRetry={() => tracksQuery.refetch()} />;
  }
  if (tracksQuery.data.length === 0) return <EmptyState>Tracklist indisponível para este álbum.</EmptyState>;

  const canFavoriteTracks = Boolean(user) && albumId !== undefined;

  return (
    <ol className="tracklist">
      {tracksQuery.data.map((track) => (
        <li key={track.id} className="tracklist__item">
          <span className="tracklist__position">{String(track.position).padStart(2, '0')}</span>
          <span className="tracklist__title">{track.title}</span>
          <span className="tracklist__duration">{formatDuration(track.durationMs)}</span>
          {canFavoriteTracks && <TrackFavoriteToggle albumId={albumId} trackId={track.id} />}
        </li>
      ))}
    </ol>
  );
}

function TrackFavoriteToggle({ albumId, trackId }: { albumId: number; trackId: number }) {
  const queryClient = useQueryClient();
  const favoritesQuery = useQuery({
    queryKey: ['track-favorites', albumId],
    queryFn: () => listFavoriteTrackIds(albumId),
  });
  const isFavorite = favoritesQuery.data?.includes(trackId) ?? false;

  const mutation = useMutation({
    mutationFn: () => (isFavorite ? removeTrackFavorite(trackId) : addTrackFavorite(trackId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['track-favorites', albumId] }),
  });

  return (
    <button
      type="button"
      className={`track-favorite${isFavorite ? ' is-active' : ''}`}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Remover dos favoritos' : 'Marcar como faixa favorita'}
      title={isFavorite ? 'Remover dos favoritos' : 'Marcar como faixa favorita'}
      disabled={favoritesQuery.isPending || mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.6-9.3-9.4C1.6 8 3.6 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.4 3.5 4.3 6.6-1.8 4.8-9.3 9.4-9.3 9.4z" />
      </svg>
    </button>
  );
}
