import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { AlbumGridSkeleton, EmptyState, ErrorState } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { AlbumCard } from '../components/AlbumCard';
import { searchAlbums } from '../services/albumsApi';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();

  const searchQuery = useQuery({
    queryKey: ['albums', 'search', query],
    queryFn: () => searchAlbums(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  if (!query) {
    return (
      <section className="section">
        <h1 className="page-title">Pesquisa</h1>
        <EmptyState>Digite o nome de um álbum ou artista para pesquisar.</EmptyState>
      </section>
    );
  }

  return (
    <section className="section">
      <h1 className="page-title">
        Resultados para <em>“{query}”</em>
      </h1>

      {searchQuery.isPending ? (
        <AlbumGridSkeleton count={12} />
      ) : searchQuery.isError ? (
        <ErrorState message={getErrorMessage(searchQuery.error)} onRetry={() => searchQuery.refetch()} />
      ) : searchQuery.data.length === 0 ? (
        <EmptyState>Nenhum álbum encontrado.</EmptyState>
      ) : (
        <div className="album-grid">
          {searchQuery.data.map((album) => (
            <AlbumCard key={album.musicbrainzId} album={album} />
          ))}
        </div>
      )}
    </section>
  );
}
