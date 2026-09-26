import { api } from '../../../shared/services/api';
import type { FollowedUser } from '../types/follow';

export async function listFollowing(): Promise<FollowedUser[]> {
  const { data } = await api.get<FollowedUser[]>('/follows/following');
  return data;
}

export async function follow(username: string): Promise<void> {
  await api.post(`/follows/${username}`);
}

export async function unfollow(username: string): Promise<void> {
  await api.delete(`/follows/${username}`);
}
