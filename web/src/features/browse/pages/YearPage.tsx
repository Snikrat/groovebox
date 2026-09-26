import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { AlbumCard } from '../../../features/albums/components/AlbumCard';
import { AlbumGridSkeleton, EmptyState, ErrorState } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { getAlbumsByYear } from '../services/browseApi';

export function YearPage() {
  const { year = '' } = useParams();
  const albumsQuery = useQuery({
    queryKey: ['browse', 'year', year],
    queryFn: () => getAlbumsByYear(year),
  });

  return (
    <section className="section">
      <p className="eyebrow">Ano</p>
      <h1 className="page-title">{year}</h1>

      {albumsQuery.isPending ? (
        <AlbumGridSkeleton />
      ) : albumsQuery.isError ? (
        <ErrorState message={getErrorMessage(albumsQuery.error)} onRetry={() => albumsQuery.refetch()} />
      ) : albumsQuery.data.length === 0 ? (
        <EmptyState>
          Nenhum álbum de {year} por aqui ainda — só mostramos álbuns que já foram abertos no groovebox.
        </EmptyState>
      ) : (
        <div className="album-grid">
          {albumsQuery.data.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}
    </section>
  );
}
