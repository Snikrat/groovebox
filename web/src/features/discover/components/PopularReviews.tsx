import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ReviewCard } from '../../reviews/components/ReviewCard';
import { getPopularReviews } from '../services/discoverApi';

/** Não mostra nada enquanto carrega ou se ainda não há avaliações curtidas no app. */
export function PopularReviews() {
  const queryClient = useQueryClient();
  const popularQuery = useQuery({ queryKey: ['discover', 'reviews'], queryFn: getPopularReviews });

  if (!popularQuery.data || popularQuery.data.length === 0) return null;

  return (
    <section className="section">
      <h2 className="section__title">Avaliações em destaque</h2>
      <div className="review-feed">
        {popularQuery.data.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            showAlbum
            onChanged={() => queryClient.invalidateQueries({ queryKey: ['discover', 'reviews'] })}
          />
        ))}
      </div>
    </section>
  );
}
