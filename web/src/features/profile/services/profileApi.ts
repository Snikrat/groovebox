import { api } from '../../../shared/services/api';
import type { ReviewWithAlbum } from '../../reviews/types/review';
import type { Favorite } from '../../favorites/types/favorite';
import type { FeaturedAlbum } from '../../featured/types/featured';
import type { ListSummary } from '../../lists/types/list';
import type { FollowedUser } from '../../follows/types/follow';
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

export async function getPublicLists(username: string): Promise<ListSummary[]> {
  const { data } = await api.get<ListSummary[]>(`/users/${username}/lists`);
  return data;
}

export async function getFollowers(username: string): Promise<FollowedUser[]> {
  const { data } = await api.get<FollowedUser[]>(`/users/${username}/followers`);
  return data;
}

export async function getFollowingOf(username: string): Promise<FollowedUser[]> {
  const { data } = await api.get<FollowedUser[]>(`/users/${username}/following`);
  return data;
}
