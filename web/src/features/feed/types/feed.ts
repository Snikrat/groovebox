import type { PublicReview } from '../../reviews/types/review';

export interface FeedPage {
  items: PublicReview[];
  hasMore: boolean;
}
