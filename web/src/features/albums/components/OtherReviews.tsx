import { useQuery, useQueryClient } from '@tanstack/react-query';
import { EmptyState, ErrorState, Loading } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { ReviewCard } from '../../reviews/components/ReviewCard';
import { getAlbumReviews } from '../services/albumsApi';

export function OtherReviews({ musicbrainzId }: { musicbrainzId: string }) {
  const queryClient = useQueryClient();
  const reviewsQuery = useQuery({
    queryKey: ['albums', musicbrainzId, 'reviews'],
    queryFn: () => getAlbumReviews(musicbrainzId),
  });

  if (reviewsQuery.isPending) return <Loading label="Carregando avaliações…" />;
  if (reviewsQuery.isError) {
    return <ErrorState message={getErrorMessage(reviewsQuery.error)} onRetry={() => reviewsQuery.refetch()} />;
  }
  if (reviewsQuery.data.length === 0) return <EmptyState>Ninguém mais avaliou este álbum ainda.</EmptyState>;

  return (
    <div className="review-feed">
      {reviewsQuery.data.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          onChanged={() => queryClient.invalidateQueries({ queryKey: ['albums', musicbrainzId, 'reviews'] })}
        />
      ))}
    </div>
  );
}
