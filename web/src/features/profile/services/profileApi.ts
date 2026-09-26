import { api } from '../../../shared/services/api';
import type { ReviewWithAlbum } from '../../reviews/types/review';
import type { Favorite } from '../../favorites/types/favorite';
import type { FeaturedAlbum } from '../../featured/types/featured';
import type { PublicProfile } from '../types/profile';

export async function getPublicProfile(username: string): Promise<PublicProfile> {
  const { data } = await api.get<PublicProfile>(`/users/${username}`);
  return data;
}

export async function getPublicReviews(username: string): Promise<ReviewWithAlbum[]> {
  const { data } = await api.get<ReviewWithAlbum[]>(`/users/${username}/reviews`);
  return data;
}

export async function getPublicFavorites(username: string): Promise<Favorite[]> {
  const { data } = await api.get<Favorite[]>(`/users/${username}/favorites`);
  return data;
}

export async function getPublicFeatured(username: string): Promise<FeaturedAlbum[]> {
  const { data } = await api.get<FeaturedAlbum[]>(`/users/${username}/featured`);
  return data;
}
