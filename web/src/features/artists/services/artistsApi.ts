import { api } from '../../../shared/services/api';
import type { Artist } from '../types/artist';

export async function getArtist(musicbrainzId: string): Promise<Artist> {
  const { data } = await api.get<Artist>(`/artists/${musicbrainzId}`);
  return data;
}
