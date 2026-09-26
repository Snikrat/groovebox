import { coverUrlFor } from '../musicbrainz/coverArt.js';
import { browseReleaseGroupsByArtist, getArtist } from '../musicbrainz/musicbrainz.client.js';
import type { Artist } from './artists.types.js';

// Não importamos a discografia inteira do artista para o banco local (fora do escopo do MVP);
// só a consultamos no MusicBrainz e guardamos em cache por um tempo.
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { expiresAt: number; artist: Artist }>();

export async function getArtistWithDiscography(mbid: string): Promise<Artist> {
  const cached = cache.get(mbid);
  if (cached && cached.expiresAt > Date.now()) return cached.artist;

  const [artist, releaseGroups] = await Promise.all([getArtist(mbid), browseReleaseGroupsByArtist(mbid)]);

  // Discografia principal: álbuns de estúdio, sem ao vivo, coletâneas, trilhas sonoras etc.
  const albums = releaseGroups
    .filter((group) => group['primary-type'] === 'Album' && (group['secondary-types'] ?? []).length === 0)
    .sort((a, b) => (a['first-release-date'] || '9999').localeCompare(b['first-release-date'] || '9999'))
    .map((group) => ({
      musicbrainzId: group.id,
      title: group.title,
      firstReleaseDate: group['first-release-date'] || null,
      coverUrl: coverUrlFor(group.id, 250),
    }));

  const result: Artist = { musicbrainzId: artist.id, name: artist.name, albums };
  cache.set(mbid, { expiresAt: Date.now() + CACHE_TTL_MS, artist: result });
  return result;
}
