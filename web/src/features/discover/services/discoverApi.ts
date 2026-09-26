import { api } from '../../../shared/services/api';
import type { PublicReview } from '../../reviews/types/review';
import type { NewRelease, PopularAlbum } from '../types/discover';

export async function getPopularAlbums(): Promise<PopularAlbum[]> {
  const { data } = await api.get<PopularAlbum[]>('/discover/albums');
  return data;
}

export async function getPopularReviews(): Promise<PublicReview[]> {
  const { data } = await api.get<PublicReview[]>('/discover/reviews');
  return data;
}

export async function getNewReleases(): Promise<NewRelease[]> {
  const { data } = await api.get<NewRelease[]>('/discover/new-releases');
  return data;
}
