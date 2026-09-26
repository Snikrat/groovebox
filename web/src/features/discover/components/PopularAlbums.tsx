import { useQuery } from '@tanstack/react-query';
import { AlbumCard } from '../../albums/components/AlbumCard';
import { getPopularAlbums } from '../services/discoverApi';

/** Não mostra nada enquanto carrega ou se ainda não há avaliações suficientes no app. */
export function PopularAlbums() {
  const popularQuery = useQuery({ queryKey: ['discover', 'albums'], queryFn: getPopularAlbums });

  if (!popularQuery.data || popularQuery.data.length === 0) return null;

  return (
    <section className="section">
      <h2 className="section__title">Populares esta semana</h2>
      <div className="album-grid">
        {popularQuery.data.map((item) => (
          <AlbumCard key={item.album.id} album={item.album} />
        ))}
      </div>
    </section>
  );
}
