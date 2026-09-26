import { api } from '../../../shared/services/api';
import type { Favorite } from '../types/favorite';

export async function listFavorites(): Promise<Favorite[]> {
  const { data } = await api.get<Favorite[]>('/favorites');
  return data;
}

export async function addFavorite(albumId: number): Promise<void> {
  await api.post(`/favorites/${albumId}`);
}

export async function removeFavorite(albumId: number): Promise<void> {
  await api.delete(`/favorites/${albumId}`);
}
