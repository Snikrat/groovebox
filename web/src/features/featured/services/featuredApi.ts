import { api } from '../../../shared/services/api';
import type { FeaturedAlbum } from '../types/featured';

export async function listFeatured(): Promise<FeaturedAlbum[]> {
  const { data } = await api.get<FeaturedAlbum[]>('/featured');
  return data;
}

export async function replaceFeatured(albumIds: number[]): Promise<FeaturedAlbum[]> {
  const { data } = await api.put<FeaturedAlbum[]>('/featured', { albumIds });
  return data;
}
