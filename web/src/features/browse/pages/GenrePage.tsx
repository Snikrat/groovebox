import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { AlbumCard } from '../../../features/albums/components/AlbumCard';
import { AlbumGridSkeleton, EmptyState, ErrorState } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { getAlbumsByGenre } from '../services/browseApi';

export function GenrePage() {
  const { genre = '' } = useParams();
  const albumsQuery = useQuery({
    queryKey: ['browse', 'genre', genre],
    queryFn: () => getAlbumsByGenre(genre),
  });

  return (
    <section className="section">
      <h1 className="page-title">{genre}</h1>
      {albumsQuery.data && (
        <p className="page-subtitle">
          {albumsQuery.data.length} {albumsQuery.data.length === 1 ? 'álbum' : 'álbuns'} no groovebox
        </p>
      )}

      {albumsQuery.isPending ? (
        <AlbumGridSkeleton />
      ) : albumsQuery.isError ? (
        <ErrorState message={getErrorMessage(albumsQuery.error)} onRetry={() => albumsQuery.refetch()} />
      ) : albumsQuery.data.length === 0 ? (
        <EmptyState>
          Nenhum álbum com esse gênero por aqui ainda — só mostramos álbuns que já foram abertos no groovebox.
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
