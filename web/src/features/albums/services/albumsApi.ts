import { api } from '../../../shared/services/api';
import type { Album, AlbumSearchPage, Track } from '../types/album';

export async function searchAlbums(query: string, offset = 0): Promise<AlbumSearchPage> {
  const { data } = await api.get<AlbumSearchPage>('/albums/search', { params: { q: query, offset } });
  return data;
}

export async function getAlbum(musicbrainzId: string): Promise<Album> {
  const { data } = await api.get<Album>(`/albums/${musicbrainzId}`);
  return data;
}

export async function getAlbumTracks(musicbrainzId: string): Promise<Track[]> {
  const { data } = await api.get<Track[]>(`/albums/${musicbrainzId}/tracks`);
  return data;
}
