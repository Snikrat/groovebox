import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, Loading } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { ReviewCard } from '../../reviews/components/ReviewCard';
import type { PublicReview } from '../../reviews/types/review';
import { getFeed } from '../services/feedApi';

export function FeedPage() {
  const queryClient = useQueryClient();
  const feedQuery = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) => getFeed(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.reduce((total, page) => total + page.items.length, 0) : undefined,
  });

  return (
    <section className="section">
      <h1 className="page-title">Feed</h1>

      {feedQuery.isPending ? (
        <Loading label="Carregando feed…" />
      ) : feedQuery.isLoadingError ? (
        <ErrorState message={getErrorMessage(feedQuery.error)} onRetry={() => feedQuery.refetch()} />
      ) : (
        <FeedList
          items={feedQuery.data.pages.flatMap((page) => page.items)}
          hasNextPage={feedQuery.hasNextPage}
          isFetchingNextPage={feedQuery.isFetchingNextPage}
          onLoadMore={() => feedQuery.fetchNextPage()}
          onChanged={() => queryClient.invalidateQueries({ queryKey: ['feed'] })}
        />
      )}
    </section>
  );
}

interface FeedListProps {
  items: PublicReview[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onChanged: () => void;
}

function FeedList({ items, hasNextPage, isFetchingNextPage, onLoadMore, onChanged }: FeedListProps) {
  if (items.length === 0) {
    return (
      <EmptyState>
        Seu feed está vazio. Para ver avaliações aqui, siga alguém — procure em{' '}
        <Link to="/people">Pessoas</Link> ou siga a partir do perfil de quem avaliou um álbum, em "Outras
        avaliações" na página do álbum.
      </EmptyState>
    );
  }

  return (
    <>
      <div className="review-feed">
        {items.map((review) => (
          <ReviewCard key={review.id} review={review} showAlbum onChanged={onChanged} />
        ))}
      </div>

      {hasNextPage && (
        <div className="load-more">
          <button type="button" className="button" onClick={onLoadMore} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Carregando…' : 'Carregar mais'}
          </button>
        </div>
      )}
    </>
  );
}
