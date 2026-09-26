import { api } from '../../../shared/services/api';
import type { FeedPage } from '../types/feed';

export async function getFeed(offset = 0): Promise<FeedPage> {
  const { data } = await api.get<FeedPage>('/feed', { params: { offset } });
  return data;
}
