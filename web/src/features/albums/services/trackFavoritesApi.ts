import { api } from '../../../shared/services/api';

export async function listFavoriteTrackIds(albumId: number): Promise<number[]> {
  const { data } = await api.get<number[]>('/track-favorites', { params: { albumId } });
  return data;
}

export async function addTrackFavorite(trackId: number): Promise<void> {
  await api.post(`/track-favorites/${trackId}`);
}

export async function removeTrackFavorite(trackId: number): Promise<void> {
  await api.delete(`/track-favorites/${trackId}`);
}
