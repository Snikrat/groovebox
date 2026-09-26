import { api } from '../../../shared/services/api';
import type { Review, ReviewInput, ReviewWithAlbum } from '../types/review';

export async function listReviews(): Promise<ReviewWithAlbum[]> {
  const { data } = await api.get<ReviewWithAlbum[]>('/reviews');
  return data;
}

/** Retorna null quando o usuário ainda não avaliou o álbum. */
export async function getReviewForAlbum(albumId: number): Promise<Review | null> {
  const { data } = await api.get<Review | null>(`/reviews/${albumId}`);
  return data;
}

export async function createReview(albumId: number, input: ReviewInput): Promise<Review> {
  const { data } = await api.post<Review>('/reviews', { albumId, ...input });
  return data;
}

export async function updateReview(id: number, input: ReviewInput): Promise<Review> {
  const { data } = await api.put<Review>(`/reviews/${id}`, input);
  return data;
}
