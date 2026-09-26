import { api } from '../../../shared/services/api';
import type { Listen, ListenPage } from '../types/listen';

export async function listDiary(offset = 0): Promise<ListenPage> {
  const { data } = await api.get<ListenPage>('/listens', { params: { offset } });
  return data;
}

export async function listListensForAlbum(albumId: number): Promise<Listen[]> {
  const { data } = await api.get<Listen[]>('/listens', { params: { albumId } });
  return data;
}

export async function createListen(albumId: number, listenedOn: string, rating: number | null): Promise<Listen> {
  const { data } = await api.post<Listen>('/listens', { albumId, listenedOn, rating });
  return data;
}

export async function deleteListen(id: number): Promise<void> {
  await api.delete(`/listens/${id}`);
}
