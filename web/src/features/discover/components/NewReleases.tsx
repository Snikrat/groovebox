import { useQuery } from '@tanstack/react-query';
import { AlbumCard } from '../../albums/components/AlbumCard';
import { formatPlainDate } from '../../../shared/utils/format';
import { getNewReleases } from '../services/discoverApi';

function releaseCaption(date: string | null): string | undefined {
  return date && date.length === 10 ? formatPlainDate(date) : (date ?? undefined);
}

/** Só para quem já avaliou algo — não mostra nada se não houver lançamentos recentes de artistas conhecidos. */
export function NewReleases() {
  const releasesQuery = useQuery({ queryKey: ['discover', 'new-releases'], queryFn: getNewReleases });

  if (!releasesQuery.data || releasesQuery.data.length === 0) return null;

  return (
    <section className="section">
      <h2 className="section__title">Lançamentos recentes de quem você já ouviu</h2>
      <div className="album-grid">
        {releasesQuery.data.map((release) => (
          <AlbumCard key={release.musicbrainzId} album={release} caption={releaseCaption(release.firstReleaseDate)} />
        ))}
      </div>
    </section>
  );
}
