import { api } from '../../../shared/services/api';
import type { AlbumSummary } from '../../albums/types/album';
import type { GenreCount } from '../types/browse';

export async function listGenres(): Promise<GenreCount[]> {
  const { data } = await api.get<GenreCount[]>('/browse/genres');
  return data;
}

export async function getAlbumsByGenre(genre: string): Promise<AlbumSummary[]> {
  const { data } = await api.get<AlbumSummary[]>(`/browse/genres/${encodeURIComponent(genre)}`);
  return data;
}

export async function getAlbumsByYear(year: string): Promise<AlbumSummary[]> {
  const { data } = await api.get<AlbumSummary[]>(`/browse/years/${year}`);
  return data;
}
