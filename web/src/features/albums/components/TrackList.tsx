import { useQuery } from '@tanstack/react-query';
import { EmptyState, ErrorState, Loading } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { formatDuration } from '../../../shared/utils/format';
import { getAlbumTracks } from '../services/albumsApi';

export function TrackList({ musicbrainzId }: { musicbrainzId: string }) {
  const tracksQuery = useQuery({
    queryKey: ['albums', musicbrainzId, 'tracks'],
    queryFn: () => getAlbumTracks(musicbrainzId),
  });

  if (tracksQuery.isPending) return <Loading label="Carregando faixas…" />;
  if (tracksQuery.isError) {
    return <ErrorState message={getErrorMessage(tracksQuery.error)} onRetry={() => tracksQuery.refetch()} />;
  }
  if (tracksQuery.data.length === 0) return <EmptyState>Tracklist indisponível para este álbum.</EmptyState>;

  return (
    <ol className="tracklist">
      {tracksQuery.data.map((track) => (
        <li key={track.id} className="tracklist__item">
          <span className="tracklist__position">{String(track.position).padStart(2, '0')}</span>
          <span className="tracklist__title">{track.title}</span>
          <span className="tracklist__duration">{formatDuration(track.durationMs)}</span>
        </li>
      ))}
    </ol>
  );
}
