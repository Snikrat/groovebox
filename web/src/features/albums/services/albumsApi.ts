import { api } from '../../../shared/services/api';
import type { Album, AlbumSearchResult, Track } from '../types/album';

export async function searchAlbums(query: string): Promise<AlbumSearchResult[]> {
  const { data } = await api.get<AlbumSearchResult[]>('/albums/search', { params: { q: query } });
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
