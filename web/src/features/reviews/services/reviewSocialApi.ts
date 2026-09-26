import { api } from '../../../shared/services/api';
import type { ReviewComment } from '../types/review';

export async function likeReview(reviewId: number): Promise<void> {
  await api.post(`/review-social/${reviewId}/likes`);
}

export async function unlikeReview(reviewId: number): Promise<void> {
  await api.delete(`/review-social/${reviewId}/likes`);
}

export async function listComments(reviewId: number): Promise<ReviewComment[]> {
  const { data } = await api.get<ReviewComment[]>(`/review-social/${reviewId}/comments`);
  return data;
}

export async function addComment(reviewId: number, text: string): Promise<ReviewComment> {
  const { data } = await api.post<ReviewComment>(`/review-social/${reviewId}/comments`, { text });
  return data;
}

export async function deleteComment(reviewId: number, commentId: number): Promise<void> {
  await api.delete(`/review-social/${reviewId}/comments/${commentId}`);
}
