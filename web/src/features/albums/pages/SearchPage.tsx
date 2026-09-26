import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { AlbumGridSkeleton, EmptyState, ErrorState } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { AlbumCard } from '../components/AlbumCard';
import { searchAlbums } from '../services/albumsApi';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();

  const searchQuery = useInfiniteQuery({
    queryKey: ['albums', 'search', query],
    queryFn: ({ pageParam }) => searchAlbums(query, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.reduce((total, page) => total + page.items.length, 0) : undefined,
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

  const albums = searchQuery.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section className="section">
      <h1 className="page-title">
        Resultados para <em>“{query}”</em>
      </h1>

      {searchQuery.isPending ? (
        <AlbumGridSkeleton count={12} />
      ) : searchQuery.isLoadingError ? (
        <ErrorState message={getErrorMessage(searchQuery.error)} onRetry={() => searchQuery.refetch()} />
      ) : albums.length === 0 ? (
        <EmptyState>Nenhum álbum encontrado.</EmptyState>
      ) : (
        <>
          <div className="album-grid">
            {albums.map((album) => (
              <AlbumCard key={album.musicbrainzId} album={album} />
            ))}
          </div>

          {searchQuery.hasNextPage && (
            <div className="load-more">
              <button
                type="button"
                className="button"
                onClick={() => searchQuery.fetchNextPage()}
                disabled={searchQuery.isFetchingNextPage}
              >
                {searchQuery.isFetchingNextPage ? 'Carregando…' : 'Carregar mais'}
              </button>
              {searchQuery.isFetchNextPageError && (
                <span className="form-error" role="alert">
                  {getErrorMessage(searchQuery.error)}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
